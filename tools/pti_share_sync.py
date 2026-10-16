#!/usr/bin/env python3
"""Refresh the password-shared PTI data from MotherDuck.

Pulls the "PTI full export" ratings.csv and matches.csv from MotherDuck
(apta2.main.matches_unified), encrypts them the same way as
`tools/pti_share.py update` (or pti-share.mjs), and uploads them to the d/
folder of the site folder named by --out (the bucket root by default).
It reuses the data key in pti-share-secret.json, so every existing password
keeps working, and only the two data files and the manifest change.

    pip install duckdb boto3 cryptography
    export MOTHERDUCK_TOKEN=...
    export AWS_ACCESS_KEY_ID=...  AWS_SECRET_ACCESS_KEY=...   # Linode Object Storage key
    export LINODE_S3_ENDPOINT=https://us-east-1.linodeobjects.com
    python3 tools/pti_share_sync.py --secret ~/pti-share/pti-share-secret.json
    python3 tools/pti_share_sync.py --out staging --upload-keys   # a copy for /staging/, keys too
    python3 tools/pti_share_sync.py --keys-only --prune           # after add- or remove-password
    python3 tools/pti_share_sync.py --pools none                  # nothing masked, even with a pti-pools.json

Restricted pools: if pti-pools.json (next to the secret, or --pools FILE) defines
pools, their players get placeholder ids and names in both CSVs, and each pool's
real ids and names go in a file encrypted with that pool's key (see
tools/pti_pools.py). Pool keys a removed or revoked password held are replaced
here, and every key file is then re-sent.

Options:
    --secret FILE     pti-share secret (default pti-share-secret.json)
    --bucket NAME     default calc.platform.tennis
    --out FOLDER      site folder in the bucket that holds pti_interactive.html;
                      files go to FOLDER/d/ (default: the bucket root, so d/).
                      s3://bucket/folder works too.
    --upload-keys     also upload the password key files, from KEYS/d/
    --keys-from KEYS  folder pti_share.py wrote to (its --out, default share-out)
    --keys-only       just upload the key files; no export, data left as it is
    --pools FILE      restricted pools (default pti-pools.json next to the
                      secret); "none" masks nobody
    --prune           delete files in FOLDER/d/ that the secret no longer lists,
                      such as the key file of a removed password
    --from / --to     optional date range (YYYY-MM-DD, inclusive, US Eastern)
    --dry-run         query and encrypt, report sizes, upload nothing, change nothing
    --keep-csv DIR    also save the CSVs in DIR as uploaded, so with restricted
                      players masked (keep them private all the same)
    --database NAME   database to read (default md:, i.e. MotherDuck); a local
                      .duckdb file works too, for testing

Nothing secret is printed. The secret file is updated only after the upload
succeeds; old data files are deleted from the bucket last.
"""
import argparse
import datetime as dt
import gzip
import json
import re
import os
import secrets
import sys
import tempfile
from base64 import b64decode

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pti_pools  # noqa: E402

# Must match tools/pti_share.py, tools/pti-share.mjs and SHARE in pti_interactive.html
DIR = 'd'

BASE = r'''
SELECT
    timezone('America/New_York', timezone('UTC', decode("Date")::TIMESTAMP)) AS ts,
    TRY_CAST(decode(ScheduleID) AS BIGINT) AS sid, TRY_CAST(decode(LineNumber) AS INTEGER) AS ln,
    decode(Player1HID) AS p1, decode(Player2HID) AS p2, decode(Player1AID) AS p3, decode(Player2AID) AS p4,
    decode(Player1HName) AS n1, decode(Player2HName) AS n2, decode(Player1AName) AS n3, decode(Player2AName) AS n4,
    Player1HELOStart AS s1, Player2HELOStart AS s2, Player1AELOStart AS s3, Player2AELOStart AS s4,
    Player1HELOConfidence AS c1, Player2HELOConfidence AS c2, Player1AELOConfidence AS c3, Player2AELOConfidence AS c4,
    (Player1HELOStart IS NOT NULL AND Player2HELOStart IS NOT NULL
    AND Player1AELOStart IS NOT NULL AND Player2AELOStart IS NOT NULL
    AND Player1HELOConfidence IS NOT NULL AND Player2HELOConfidence IS NOT NULL
    AND Player1AELOConfidence IS NOT NULL AND Player2AELOConfidence IS NOT NULL) AS rated,
    concat_ws(', ',
      CASE WHEN coalesce(decode("Set1.Team1Score"), '0') || coalesce(decode("Set1.Team2Score"), '0') <> '00' THEN decode("Set1.Team1Score") || '-' || decode("Set1.Team2Score") END,
      CASE WHEN coalesce(decode("Set2.Team1Score"), '0') || coalesce(decode("Set2.Team2Score"), '0') <> '00' THEN decode("Set2.Team1Score") || '-' || decode("Set2.Team2Score") END,
      CASE WHEN coalesce(decode("Set3.Team1Score"), '0') || coalesce(decode("Set3.Team2Score"), '0') <> '00' THEN decode("Set3.Team1Score") || '-' || decode("Set3.Team2Score") END,
      CASE WHEN coalesce(decode("Set4.Team1Score"), '0') || coalesce(decode("Set4.Team2Score"), '0') <> '00' THEN decode("Set4.Team1Score") || '-' || decode("Set4.Team2Score") END,
      CASE WHEN coalesce(decode("Set5.Team1Score"), '0') || coalesce(decode("Set5.Team2Score"), '0') <> '00' THEN decode("Set5.Team1Score") || '-' || decode("Set5.Team2Score") END
    ) AS score
  FROM "apta2"."main"."matches_unified"
'''

MATCHES = '''
  SELECT strftime(ts, '%Y-%m-%d') AS date,
    p1 AS player1id, p2 AS player2id, p3 AS player3id, p4 AS player4id, score
  FROM f
  ORDER BY ts, sid, ln, p1, p2, p3, p4
'''

RATINGS = '''
  , slots AS (
    SELECT ts, sid, ln, p1 AS id, n1 AS name, s1 AS pti, c1 AS sigma FROM f
    UNION ALL SELECT ts, sid, ln, p2, n2, s2, c2 FROM f
    UNION ALL SELECT ts, sid, ln, p3, n3, s3, c3 FROM f
    UNION ALL SELECT ts, sid, ln, p4, n4, s4, c4 FROM f
  )
  SELECT id, name, pti, sigma
  FROM slots
  QUALIFY row_number() OVER (PARTITION BY id ORDER BY ts, sid, ln) = 1
  ORDER BY id
'''


def fail(msg):
    print('Error: ' + msg, file=sys.stderr)
    sys.exit(1)


def day(s, what):
    try:
        return dt.date.fromisoformat(s).isoformat()
    except ValueError:
        fail(f'--{what} must be YYYY-MM-DD')


def with_f(a):
    where = "rated AND score <> ''"
    if a.date_from:
        where += f" AND ts >= DATE '{day(a.date_from, 'from')}'"
    if a.date_to:
        where += f" AND ts < DATE '{day(a.date_to, 'to')}' + INTERVAL 1 DAY"
    return f'WITH b AS ({BASE}),\n  f AS (SELECT * FROM b WHERE {where})'


# Pool membership and real names come from the whole table, not just the exported date range
LEAGUES = '''
  SELECT decode(p) AS id, list(DISTINCT coalesce(decode(LeagueID), '')) AS leagues
  FROM "apta2"."main"."matches_unified", UNNEST([Player1HID, Player2HID, Player1AID, Player2AID]) AS t(p)
  WHERE p IS NOT NULL GROUP BY 1
'''
NAMES = '''
  SELECT DISTINCT decode(n) AS name
  FROM "apta2"."main"."matches_unified", UNNEST([Player1HName, Player2HName, Player1AName, Player2AName]) AS t(n)
  WHERE n IS NOT NULL
'''


def export(a, tmp, pools):
    import duckdb
    if a.database.startswith('md:') and not os.environ.get('MOTHERDUCK_TOKEN'):
        fail('set MOTHERDUCK_TOKEN')
    con = duckdb.connect(a.database, read_only=not a.database.startswith('md:'))
    out = {}
    for name, tail in (('matches', MATCHES), ('ratings', RATINGS)):
        path = os.path.join(tmp, name + '.csv')
        rel = con.sql(with_f(a) + '\n' + tail)
        rel.write_csv(path, header=True)
        out[name] = (path, rel.shape[0])
    extra = None
    if pools:
        extra = ({pid: set(lgs) for pid, lgs in con.sql(LEAGUES).fetchall()},
                 [n for (n,) in con.sql(NAMES).fetchall()])
    con.close()
    return out, extra


def mask(s, pools, csvs, leagues, real_names):
    """Swap restricted players for placeholders in both CSVs (in place).
    Returns {pool: {placeholder id: [real id, real name]}}."""
    import csv
    member = pti_pools.members(pools, leagues)
    ph = pti_pools.Placeholders(pti_pools.placeholder_key(s), real_names)
    swap, lists = {}, {n: {} for n in pools}
    path = csvs['ratings'][0]
    with open(path, newline='', encoding='utf-8') as fh:
        rows = list(csv.reader(fh))
    head, rows = rows[0], rows[1:]
    i_id, i_name = head.index('id'), head.index('name')
    for r in sorted(rows, key=lambda r: r[i_id]):
        mine = [n for n in pools if r[i_id] in member[n]]
        if not mine:
            continue
        pid, pname = ph.make(r[i_id], pools[mine[0]].get('names', 'any'))
        for n in mine:
            lists[n][pid] = [r[i_id], r[i_name]]
        swap[r[i_id]] = (pid, pname)
    with open(path, 'w', newline='', encoding='utf-8') as fh:
        w = csv.writer(fh, lineterminator='\n')
        w.writerow(head)
        for r in rows:
            if r[i_id] in swap:
                r[i_id], r[i_name] = swap[r[i_id]]
            w.writerow(r)
    path = csvs['matches'][0]
    with open(path, newline='', encoding='utf-8') as src, open(path + '.tmp', 'w', newline='', encoding='utf-8') as dst:
        rows, w = csv.reader(src), csv.writer(dst, lineterminator='\n')
        head = next(rows)
        cols = [head.index(c) for c in ('player1id', 'player2id', 'player3id', 'player4id')]
        w.writerow(head)
        for r in rows:
            for c in cols:
                if r[c] in swap:
                    r[c] = swap[r[c]][0]
            w.writerow(r)
    os.replace(path + '.tmp', path)
    return lists


def reconcile(s, pools):
    """Give every configured pool a key: new pools and pools marked for rotation get a
    fresh one, pools no longer configured are dropped. True if any key changed."""
    have, changed = s.setdefault('pools', {}), False
    for n in [n for n in have if n not in pools]:
        del have[n]
        changed = True
    for n in pools:
        if n not in have or have[n].get('rotate'):
            have[n] = {'key': pti_pools.b64(secrets.token_bytes(32))}
            changed = True
    return changed


def seal(key, data):
    """iv (12 bytes) || ciphertext || tag (16 bytes), as WebCrypto's AES-GCM and pti_share.py use."""
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    iv = secrets.token_bytes(12)
    return iv + AESGCM(key).encrypt(iv, data, None)


def unseal(key, blob):
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    return AESGCM(key).decrypt(blob[:12], blob[12:], None)


def s3_client():
    import boto3
    endpoint = os.environ.get('LINODE_S3_ENDPOINT')
    if not endpoint:
        fail('set LINODE_S3_ENDPOINT (e.g. https://us-east-1.linodeobjects.com)')
    if not (os.environ.get('AWS_ACCESS_KEY_ID') and os.environ.get('AWS_SECRET_ACCESS_KEY')):
        fail('set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to the Linode Object Storage key')
    region = os.environ.get('AWS_DEFAULT_REGION') or endpoint.split('//')[-1].split('.')[0]
    return boto3.client('s3', endpoint_url=endpoint, region_name=region)




def missing(e):
    code = getattr(e, 'response', {}).get('Error', {}).get('Code', '')
    return code in ('NoSuchKey', '404', 'NotFound')


def deployed(s3, bucket, folder, s, key):
    """The data files the manifest in folder/ points to now: None if there is no
    manifest there, False if it wasn't made with this secret's data key."""
    try:
        blob = s3.get_object(Bucket=bucket, Key=f'{folder}/{s["manifest"]}')['Body'].read()
    except Exception as e:
        if missing(e):
            return None
        fail(f'could not read s3://{bucket}/{folder}/ ({e})')
    try:
        m = json.loads(unseal(key, blob))
        return [m['ratings'], m['matches']] + list(m.get('pools', {}).values())
    except Exception:
        return False


def listed(s3, bucket, folder):
    names = []
    for page in s3.get_paginator('list_objects_v2').paginate(Bucket=bucket, Prefix=folder + '/'):
        names += [o['Key'][len(folder) + 1:] for o in page.get('Contents', [])]
    return [n for n in names if n and '/' not in n]


def main():
    p = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    p.add_argument('--secret', default='pti-share-secret.json')
    p.add_argument('--bucket', default='calc.platform.tennis')
    p.add_argument('--out', default='')
    p.add_argument('--upload-keys', action='store_true')
    p.add_argument('--keys-from', default='share-out')
    p.add_argument('--keys-only', action='store_true')
    p.add_argument('--prune', action='store_true')
    p.add_argument('--from', dest='date_from')
    p.add_argument('--to', dest='date_to')
    p.add_argument('--dry-run', action='store_true')
    p.add_argument('--keep-csv')
    p.add_argument('--database', default='md:')
    p.add_argument('--pools')
    a = p.parse_args()

    out = a.out.strip()
    if out.startswith('s3://'):
        a.bucket, _, out = out[5:].partition('/')
    out = out.strip('/')
    if '..' in out.split('/') or not re.fullmatch(r'[A-Za-z0-9._/-]*', out):
        fail('--out must be a folder in the bucket, such as staging')
    folder = f'{out}/{DIR}' if out else DIR
    where = f's3://{a.bucket}/{folder}/'

    if not os.path.exists(a.secret):
        fail(a.secret + ' not found (pass --secret). Run `python3 tools/pti_share.py init` once first.')
    with open(a.secret) as fh:
        s = json.load(fh)
    key = b64decode(s['dataKey'])
    if len(key) != 32 or not s.get('manifest'):
        fail(a.secret + " doesn't look like a pti-share secret file")
    try:
        pools = None if a.pools == 'none' else pti_pools.load_config(pti_pools.pools_path(a.secret, a.pools))
    except ValueError as e:
        fail(str(e))
    if a.pools and a.pools != 'none' and not os.path.exists(a.pools):
        fail(a.pools + ' not found')

    # Key files of passwords from before restricted pools can't be remade without the
    # password, so they come from the folder pti_share.py wrote. The rest are remade here.
    keys = {}
    if a.upload_keys or a.keys_only:
        lost = []
        for x in s.get('passwords', []):
            if x.get('wrap'):
                continue
            path = os.path.join(a.keys_from, DIR, x['file'])
            if os.path.exists(path):
                with open(path, 'rb') as fh:
                    keys[x['file']] = fh.read()
            else:
                lost.append(x['label'])
        if lost:
            fail(f'no key file in {os.path.join(a.keys_from, DIR)} for: {", ".join(lost)}. '
                 'Pass --keys-from with the --out folder pti_share.py used.')
        if not s.get('passwords'):
            fail('the secret has no passwords yet. Run `python3 tools/pti_share.py add-password` first.')
    s3 = None if a.dry_run and not a.prune else s3_client()

    # What the folder serves now: its data files, and whether --prune is safe there
    now = deployed(s3, a.bucket, folder, s, key) if s3 else None
    if now is False:
        fail(f'the manifest in {where} was not made with {a.secret}. Nothing changed.')
    if a.prune and now is None and listed(s3, a.bucket, folder):
        fail(f'{where} has files but no manifest from {a.secret}, so --prune would not know what to keep. Nothing changed.')

    blobs, names, pool_files, rekey = {}, {}, {}, False
    if not a.keys_only:
        with tempfile.TemporaryDirectory() as tmp:
            print('Exporting from ' + ('MotherDuck' if a.database.startswith('md:') else a.database) + ' ...', flush=True)
            csvs, extra = export(a, tmp, pools)
            nm, nr = csvs['matches'][1], csvs['ratings'][1]
            print(f'  matches.csv: {nm:,} matches\n  ratings.csv: {nr:,} players')
            if not nm or not nr:
                fail('the export is empty; nothing uploaded')
            if pools:
                try:
                    lists = mask(s, pools, csvs, *extra)
                except RuntimeError as e:
                    fail(str(e))
                rekey = reconcile(s, pools)
                for n, entries in lists.items():
                    pool_files[n] = secrets.token_hex(16)
                    body = json.dumps(entries, separators=(',', ':'), ensure_ascii=False).encode()
                    blobs[pool_files[n]] = seal(b64decode(s['pools'][n]['key']), gzip.compress(body, compresslevel=9, mtime=0))
                masked = len(set().union(*(set(e) for e in lists.values()))) if lists else 0
                print(f'  masked {masked:,} players: ' + ', '.join(f'{n} {len(e):,}' for n, e in lists.items()))
            elif s.get('pools'):
                print('  no restricted pools in use: nobody is masked')
            if a.keep_csv:
                os.makedirs(a.keep_csv, exist_ok=True)
                for name, (path, _) in csvs.items():
                    with open(path, 'rb') as src, open(os.path.join(a.keep_csv, name + '.csv'), 'wb') as dst:
                        dst.write(src.read())

            names = {'ratings': secrets.token_hex(16), 'matches': secrets.token_hex(16)}
            for name, (path, _) in csvs.items():
                with open(path, 'rb') as fh:
                    raw = fh.read()
                blobs[names[name]] = seal(key, gzip.compress(raw, compresslevel=9, mtime=0))
                print(f'  encrypted {name}.csv: {len(raw):,} bytes -> {len(blobs[names[name]]):,}')
            manifest = {'v': 2 if pool_files else 1, 'ratings': names['ratings'], 'matches': names['matches'],
                        'updated': dt.datetime.now(dt.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')}
            if pool_files:
                manifest['pools'] = pool_files
            blobs[s['manifest']] = seal(key, json.dumps(manifest, separators=(',', ':')).encode())
    elif now is None:
        print(f'Note: {where} has no data yet. Run without --keys-only to upload it.')
    # New pool keys reach people through their key files, so those go out whenever a key changed
    if a.upload_keys or a.keys_only or rekey:
        for x in s.get('passwords', []):
            if x.get('wrap'):
                keys[x['file']] = seal(b64decode(x['wrap']), pti_pools.key_file(s, x))
        if rekey and not (a.upload_keys or a.keys_only):
            legacy = [x['label'] for x in s.get('passwords', []) if not x.get('wrap')]
            if legacy:
                print('  (pool keys changed; key files of passwords without pools stay as they are: ' + ', '.join(legacy) + ')')
    if keys:
        print(f'  {len(keys)} key file(s)')

    # Files the folder should hold afterwards; --prune deletes the rest
    data = [names['ratings'], names['matches']] + list(pool_files.values()) if names else (now or [])
    keep = set(data) | {s['manifest']} | {x['file'] for x in s.get('passwords', [])}
    stale = [f for f in listed(s3, a.bucket, folder) if f not in keep] if a.prune else []

    if a.dry_run:
        if a.prune:
            print(f'Would delete {len(stale)} file(s) from {where} that the secret no longer lists.')
        print(f'\nDry run for {where}: nothing uploaded, secret file unchanged.')
        return

    def put(name, body):
        s3.put_object(Bucket=a.bucket, Key=f'{folder}/{name}', Body=body, ACL='public-read',
                      ContentType='application/octet-stream', CacheControl='no-cache')

    # Data files first, then the manifest that points to them, so readers never see a half update.
    # Key files go last: they only point to the manifest.
    try:
        if names:
            for name in [names['ratings'], names['matches']] + list(pool_files.values()) + [s['manifest']]:
                put(name, blobs[name])
        for name, body in keys.items():
            put(name, body)
    except Exception as e:
        fail(f'upload to {where} failed ({e}). The secret file is unchanged.')
    print(f'\nUploaded to {where}: ' + ', '.join(
        (['new data files and manifest'] if names else []) + ([f'{len(keys)} key file(s)'] if keys else [])) + '.')

    old = []
    if names:
        # Old data files: the ones this folder served, or the secret's last ones if it had none
        old = [f for f in (now or [s.get('ratings'), s.get('matches')] + s.get('poolFiles', [])) if f and f not in keep]
        s['ratings'], s['matches'] = names['ratings'], names['matches']
        s['poolFiles'] = list(pool_files.values())
        tmp_secret = a.secret + '.tmp'
        with open(os.open(tmp_secret, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600), 'w') as fh:
            json.dump(s, fh, indent=2)
            fh.write('\n')
        os.replace(tmp_secret, a.secret)

    gone = 0
    for f in sorted(set(old) | set(stale)):
        try:
            s3.delete_object(Bucket=a.bucket, Key=f'{folder}/{f}')
            gone += 1
        except Exception as e:  # the new files are live either way
            print(f'  could not delete {folder}/{f}: {e}', file=sys.stderr)
    if names or gone:
        print(f'Removed {gone} old file(s) from {where}.' + (' Existing passwords keep working.' if names else ''))


if __name__ == '__main__':
    main()
