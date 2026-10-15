#!/usr/bin/env python3
"""Refresh the password-shared PTI data from MotherDuck.

Pulls the "PTI full export" ratings.csv and matches.csv from MotherDuck
(apta2.main.matches_unified), encrypts them the same way as
`tools/pti_share.py update` (or pti-share.mjs), and uploads them to the bucket's d/ folder.
It reuses the data key in pti-share-secret.json, so every existing password
keeps working, and only the two data files and the manifest change.

    pip install duckdb boto3 cryptography
    export MOTHERDUCK_TOKEN=...
    export AWS_ACCESS_KEY_ID=...  AWS_SECRET_ACCESS_KEY=...   # Linode Object Storage key
    export LINODE_S3_ENDPOINT=https://us-east-1.linodeobjects.com
    python3 tools/pti_share_sync.py --secret ~/pti-share/pti-share-secret.json

Options:
    --secret FILE     pti-share secret (default pti-share-secret.json)
    --bucket NAME     default calc.platform.tennis
    --from / --to     optional date range (YYYY-MM-DD, inclusive, US Eastern)
    --dry-run         query and encrypt, report sizes, upload nothing, change nothing
    --keep-csv DIR    also save the plain CSVs in DIR (keep them private)
    --database NAME   database to read (default md:, i.e. MotherDuck); a local
                      .duckdb file works too, for testing

Nothing secret is printed. The secret file is updated only after the upload
succeeds; old data files are deleted from the bucket last.
"""
import argparse
import datetime as dt
import gzip
import json
import os
import secrets
import sys
import tempfile
from base64 import b64decode

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


def export(a, tmp):
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
    con.close()
    return out


def seal(key, data):
    """iv (12 bytes) || ciphertext || tag (16 bytes), as WebCrypto's AES-GCM and pti_share.py use."""
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    iv = secrets.token_bytes(12)
    return iv + AESGCM(key).encrypt(iv, data, None)


def s3_client():
    import boto3
    endpoint = os.environ.get('LINODE_S3_ENDPOINT')
    if not endpoint:
        fail('set LINODE_S3_ENDPOINT (e.g. https://us-east-1.linodeobjects.com)')
    if not (os.environ.get('AWS_ACCESS_KEY_ID') and os.environ.get('AWS_SECRET_ACCESS_KEY')):
        fail('set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to the Linode Object Storage key')
    region = os.environ.get('AWS_DEFAULT_REGION') or endpoint.split('//')[-1].split('.')[0]
    return boto3.client('s3', endpoint_url=endpoint, region_name=region)


def main():
    p = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    p.add_argument('--secret', default='pti-share-secret.json')
    p.add_argument('--bucket', default='calc.platform.tennis')
    p.add_argument('--from', dest='date_from')
    p.add_argument('--to', dest='date_to')
    p.add_argument('--dry-run', action='store_true')
    p.add_argument('--keep-csv')
    p.add_argument('--database', default='md:')
    a = p.parse_args()

    if not os.path.exists(a.secret):
        fail(a.secret + ' not found (pass --secret). Run `python3 tools/pti_share.py init` once first.')
    with open(a.secret) as fh:
        s = json.load(fh)
    key = b64decode(s['dataKey'])
    if len(key) != 32 or not s.get('manifest'):
        fail(a.secret + " doesn't look like a pti-share secret file")
    s3 = None if a.dry_run else s3_client()

    with tempfile.TemporaryDirectory() as tmp:
        print('Exporting from ' + ('MotherDuck' if a.database.startswith('md:') else a.database) + ' ...', flush=True)
        csvs = export(a, tmp)
        nm, nr = csvs['matches'][1], csvs['ratings'][1]
        print(f'  matches.csv: {nm:,} matches\n  ratings.csv: {nr:,} players')
        if not nm or not nr:
            fail('the export is empty; nothing uploaded')
        if a.keep_csv:
            os.makedirs(a.keep_csv, exist_ok=True)
            for name, (path, _) in csvs.items():
                with open(path, 'rb') as src, open(os.path.join(a.keep_csv, name + '.csv'), 'wb') as dst:
                    dst.write(src.read())

        names = {'ratings': secrets.token_hex(16), 'matches': secrets.token_hex(16)}
        blobs = {}
        for name, (path, _) in csvs.items():
            with open(path, 'rb') as fh:
                raw = fh.read()
            blobs[names[name]] = seal(key, gzip.compress(raw, compresslevel=9, mtime=0))
            print(f'  encrypted {name}.csv: {len(raw):,} bytes -> {len(blobs[names[name]]):,}')
        manifest = {'v': 1, 'ratings': names['ratings'], 'matches': names['matches'],
                    'updated': dt.datetime.now(dt.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')}
        blobs[s['manifest']] = seal(key, json.dumps(manifest, separators=(',', ':')).encode())

    if a.dry_run:
        print('\nDry run: nothing uploaded, secret file unchanged.')
        return

    def put(name):
        s3.put_object(Bucket=a.bucket, Key=f'{DIR}/{name}', Body=blobs[name], ACL='public-read',
                      ContentType='application/octet-stream', CacheControl='no-cache')

    # Data files first, then the manifest that points to them, so readers never see a half update
    try:
        for name in (names['ratings'], names['matches'], s['manifest']):
            put(name)
    except Exception as e:
        fail(f'upload to s3://{a.bucket}/{DIR}/ failed ({e}). The shared data and the secret file are unchanged.')
    print(f'\nUploaded to s3://{a.bucket}/{DIR}/ (new data files and manifest).')

    old = [f for f in (s.get('ratings'), s.get('matches')) if f]
    s['ratings'], s['matches'] = names['ratings'], names['matches']
    tmp_secret = a.secret + '.tmp'
    with open(os.open(tmp_secret, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600), 'w') as fh:
        json.dump(s, fh, indent=2)
        fh.write('\n')
    os.replace(tmp_secret, a.secret)

    for f in old:
        try:
            s3.delete_object(Bucket=a.bucket, Key=f'{DIR}/{f}')
        except Exception as e:  # the new data is live either way
            print(f'  could not delete old file {DIR}/{f}: {e}', file=sys.stderr)
    print(f'Removed {len(old)} old data file(s). Existing passwords keep working.')


if __name__ == '__main__':
    main()
