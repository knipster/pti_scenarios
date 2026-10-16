#!/usr/bin/env python3
"""Password-protected sharing of ratings and matches CSVs for pti_interactive.html.

Python version of tools/pti-share.mjs, for machines without a recent Node.
Both write the same files and the same pti-share-secret.json, so you can mix them.

The CSVs are gzipped and encrypted (AES-256-GCM) with a random data key.
Each password gets a small key file that holds the data key, encrypted with a
key derived from the password (PBKDF2-SHA256). The key file's name is derived
from the password too, so nothing in the page or the bucket says where the
data is or how to read it. Everything is written to <out>/d/ for upload to
the site's d/ folder.

    python3 tools/pti_share.py init --ratings ratings.csv --matches matches.csv
    python3 tools/pti_share.py add-password --label alice            (makes up a passphrase)
    python3 tools/pti_share.py add-password --label bob "my own passphrase"
    python3 tools/pti_share.py list
    python3 tools/pti_share.py remove-password --label bob
    python3 tools/pti_share.py update --ratings ratings.csv --matches matches.csv

Options: --secret FILE (default pti-share-secret.json), --out DIR (default share-out),
--force (init over an existing secret).
Keep the secret file private and out of git: it holds the data key.
Needs: pip install cryptography
"""
import argparse
import base64
import datetime as dt
import gzip
import hashlib
import json
import os
import secrets
import sys
import unicodedata

# Must match the constants in pti_interactive.html (SHARE) and tools/pti-share.mjs
SALT, ITERATIONS, DIR = b'pti-share-v1', 600000, 'd'
BUCKET = 'calc.platform.tennis'


def fail(msg):
    print('Error: ' + msg, file=sys.stderr)
    sys.exit(1)


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')


def name():
    return secrets.token_hex(16)


def seal(key, data):
    """iv (12 bytes) || ciphertext || tag (16 bytes), the layout WebCrypto's AES-GCM uses."""
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    except ImportError:
        fail('this needs the cryptography package: python3 -m pip install cryptography')
    iv = secrets.token_bytes(12)
    return iv + AESGCM(key).encrypt(iv, data, None)


def from_password(pw):
    bits = hashlib.pbkdf2_hmac('sha256', unicodedata.normalize('NFKC', pw).strip().encode('utf-8'), SALT, ITERATIONS, 48)
    return bits[:16].hex(), bits[16:]


def js_json(obj):
    return json.dumps(obj, separators=(',', ':'), ensure_ascii=False).encode('utf-8')


class Share:
    def __init__(self, a):
        self.a = a
        self.secret, self.out = a.secret, a.out

    def write(self, file, data):
        p = os.path.join(self.out, DIR, file)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'wb') as fh:
            fh.write(data)
        return p

    def load(self):
        if not os.path.exists(self.secret):
            fail(self.secret + ' not found. Run init first (or pass --secret).')
        with open(self.secret) as fh:
            return json.load(fh)

    def save(self, s):
        tmp = self.secret + '.tmp'
        with open(os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600), 'w') as fh:
            json.dump(s, fh, indent=2)
            fh.write('\n')
        os.replace(tmp, self.secret)

    def read_csv(self, f, what):
        if not f:
            fail('--' + what + ' <file> is required')
        if not os.path.exists(f):
            fail(f + ' not found')
        with open(f, 'rb') as fh:
            return fh.read()

    # Encrypt both CSVs under new names and (re)write the manifest that points to them
    def write_data(self, s):
        key = base64.b64decode(s['dataKey'])
        r, m = self.read_csv(self.a.ratings, 'ratings'), self.read_csv(self.a.matches, 'matches')
        old = [f for f in (s.get('ratings'), s.get('matches')) if f]
        s['ratings'], s['matches'] = name(), name()
        self.write(s['ratings'], seal(key, gzip.compress(r, compresslevel=9, mtime=0)))
        self.write(s['matches'], seal(key, gzip.compress(m, compresslevel=9, mtime=0)))
        # Old data files go from the local upload folder too (they still need deleting from the bucket)
        for f in old:
            try:
                os.unlink(os.path.join(self.out, DIR, f))
            except OSError:
                pass
        self.write(s['manifest'], seal(key, js_json({'v': 1, 'ratings': s['ratings'], 'matches': s['matches'], 'updated': now()})))
        print('Encrypted {} ({:,} bytes) and {} ({:,} bytes).'.format(self.a.ratings, len(r), self.a.matches, len(m)))
        return old

    def upload_cmd(self):
        return ('aws s3 cp {o}/{d} s3://{b}/{d} --recursive --acl public-read --content-type application/octet-stream '
                '--cache-control "no-cache" --endpoint-url "$LINODE_S3_ENDPOINT"').format(o=self.out, d=DIR, b=BUCKET)

    def sync_cmd(self):
        here = os.path.dirname(sys.argv[0]) or '.'
        return 'python3 {} --keys-only --keys-from {} --secret {}'.format(os.path.join(here, 'pti_share_sync.py'), self.out, self.secret)

    def rm_cmd(self, files):
        return '\n'.join('aws s3 rm s3://{b}/{d}/{f} --endpoint-url "$LINODE_S3_ENDPOINT"'.format(b=BUCKET, d=DIR, f=f) for f in files)


# 4 groups of 5 letters/digits (no look-alikes): about 100 bits
def passphrase():
    abc, b = 'abcdefghjkmnpqrstuvwxyz23456789', secrets.token_bytes(20)
    return ''.join(('-' if i and i % 5 == 0 else '') + abc[b[i] % len(abc)] for i in range(20))


def main():
    p = argparse.ArgumentParser(description='Password-protected sharing for pti_interactive.html')
    p.add_argument('cmd', choices=['init', 'update', 'add-password', 'remove-password', 'list'])
    p.add_argument('password', nargs='?')
    p.add_argument('--ratings')
    p.add_argument('--matches')
    p.add_argument('--label')
    p.add_argument('--secret', default='pti-share-secret.json')
    p.add_argument('--out', default='share-out')
    p.add_argument('--force', action='store_true')
    # Older Pythons (before 3.13) don't match the password if it comes after the options
    a, extra = p.parse_known_args()
    if extra and not a.password and len(extra) == 1 and not extra[0].startswith('-'):
        a.password = extra[0]
    elif extra:
        p.error('unrecognized arguments: ' + ' '.join(extra))
    sh = Share(a)

    if a.cmd == 'init':
        if os.path.exists(a.secret) and not a.force:
            fail(a.secret + ' already exists. Use update to replace the data, or --force to start over.')
        s = {'v': 1, 'dataKey': base64.b64encode(secrets.token_bytes(32)).decode(), 'manifest': name(),
             'ratings': None, 'matches': None, 'passwords': []}
        sh.write_data(s)
        sh.save(s)
        print('\nSaved {}. Keep it private: it can decrypt the data.\nNext: python3 {} add-password --label <who>'.format(a.secret, sys.argv[0]))

    elif a.cmd == 'update':
        s = sh.load()
        old = sh.write_data(s)
        sh.save(s)
        print('\nUpload the new files (existing passwords keep working):\n{}\n\nThen delete the old data files:\n{}'.format(sh.upload_cmd(), sh.rm_cmd(old)))

    elif a.cmd == 'add-password':
        s = sh.load()
        label = a.label or 'password {}'.format(len(s['passwords']) + 1)
        if any(x['label'] == label for x in s['passwords']):
            fail('a password labelled "{}" already exists'.format(label))
        pw = a.password or passphrase()
        if len(pw.strip()) < 12:
            fail('use at least 12 characters')
        file, key = from_password(pw)
        if any(x['file'] == file for x in s['passwords']):
            fail('that password is already in use')
        sh.write(file, seal(key, js_json({'v': 1, 'key': s['dataKey'], 'm': s['manifest']})))
        s['passwords'].append({'label': label, 'file': file, 'added': now()})
        sh.save(s)
        print('Password for "{}": {}\n\nUpload:\n{}\n\nor, without the AWS CLI:\n{}'.format(label, pw, sh.upload_cmd(), sh.sync_cmd()))

    elif a.cmd == 'remove-password':
        s = sh.load()
        if a.label:
            file = next((x['file'] for x in s['passwords'] if x['label'] == a.label), None)
        elif a.password:
            file = from_password(a.password)[0]
        else:
            file = None
        if not file:
            fail('give --label <label> or the password')
        s['passwords'] = [x for x in s['passwords'] if x['file'] != file]
        sh.save(s)
        try:
            os.unlink(os.path.join(a.out, DIR, file))
        except OSError:
            pass
        print('Removed. Delete its key file from the bucket:\n{}\n\nor, without the AWS CLI:\n{} --prune'.format(sh.rm_cmd([file]), sh.sync_cmd()))

    elif a.cmd == 'list':
        s = sh.load()
        print('\n'.join('{}\t{}\t{}/{}'.format(x['label'], x['added'][:10], DIR, x['file']) for x in s['passwords'])
              if s['passwords'] else 'No passwords yet.')


if __name__ == '__main__':
    main()
