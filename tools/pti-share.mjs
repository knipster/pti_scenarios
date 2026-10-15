#!/usr/bin/env node
// Password-protected sharing of ratings and matches CSVs for pti_interactive.html.
//
// The CSVs are gzipped and encrypted (AES-256-GCM) with a random data key.
// Each password gets a small key file that holds the data key, encrypted with a
// key derived from the password (PBKDF2-SHA256). The key file's name is derived
// from the password too, so nothing in the page or the bucket says where the
// data is or how to read it. Everything is written to <out>/d/ for upload to
// the site's d/ folder.
//
//   node tools/pti-share.mjs init --ratings ratings.csv --matches matches.csv
//   node tools/pti-share.mjs add-password --label alice            (makes up a passphrase)
//   node tools/pti-share.mjs add-password --label bob "my own passphrase"
//   node tools/pti-share.mjs list
//   node tools/pti-share.mjs remove-password --label bob
//   node tools/pti-share.mjs update --ratings ratings.csv --matches matches.csv
//
// Options: --secret <file> (default pti-share-secret.json), --out <dir> (default share-out).
// Keep the secret file private and out of git: it holds the data key.
//
// Must match the constants in pti_interactive.html (SHARE).
import { createCipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const SALT = 'pti-share-v1', ITERATIONS = 600000, DIR = 'd';

function args(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const next = argv[i + 1];
    out[a.slice(2)] = next === undefined || next.startsWith('--') ? true : argv[++i];
  }
  return out;
}
const A = args(process.argv.slice(2));
const cmd = A._.shift();
const SECRET = A.secret || 'pti-share-secret.json', OUT = A.out || 'share-out';

function fail(msg) { console.error('Error: ' + msg); process.exit(1); }
function name() { return randomBytes(16).toString('hex'); }
// iv (12 bytes) || ciphertext || tag (16 bytes), the layout WebCrypto's AES-GCM uses
function seal(key, data) {
  const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', key, iv);
  return Buffer.concat([iv, c.update(data), c.final(), c.getAuthTag()]);
}
function fromPassword(pass) {
  const bits = pbkdf2Sync(Buffer.from(pass.normalize('NFKC').trim(), 'utf8'), Buffer.from(SALT, 'utf8'), ITERATIONS, 48, 'sha256');
  return { file: bits.subarray(0, 16).toString('hex'), key: bits.subarray(16) };
}
function write(file, data) {
  const p = path.join(OUT, DIR, file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, data);
  return p;
}
function loadSecret() {
  if (!fs.existsSync(SECRET)) fail(SECRET + ' not found. Run init first (or pass --secret).');
  return JSON.parse(fs.readFileSync(SECRET, 'utf8'));
}
function saveSecret(s) { fs.writeFileSync(SECRET, JSON.stringify(s, null, 2) + '\n', { mode: 0o600 }); }
function readCsv(f, what) {
  if (!f) fail('--' + what + ' <file> is required');
  if (!fs.existsSync(f)) fail(f + ' not found');
  return fs.readFileSync(f);
}
// Encrypt both CSVs under new names and (re)write the manifest that points to them
function writeData(s, ratingsFile, matchesFile) {
  const key = Buffer.from(s.dataKey, 'base64');
  const r = readCsv(ratingsFile, 'ratings'), m = readCsv(matchesFile, 'matches');
  const old = [s.ratings, s.matches].filter(Boolean);
  s.ratings = name(); s.matches = name();
  write(s.ratings, seal(key, gzipSync(r, { level: 9 })));
  write(s.matches, seal(key, gzipSync(m, { level: 9 })));
  // Old data files go from the local upload folder too (they still need deleting from the bucket)
  old.forEach(f => { try { fs.unlinkSync(path.join(OUT, DIR, f)); } catch (e) {} });
  write(s.manifest, seal(key, Buffer.from(JSON.stringify({ v: 1, ratings: s.ratings, matches: s.matches, updated: new Date().toISOString() }))));
  console.log(`Encrypted ${ratingsFile} (${r.length.toLocaleString()} bytes) and ${matchesFile} (${m.length.toLocaleString()} bytes).`);
  return old;
}
// 4 groups of 5 letters/digits (no look-alikes): about 100 bits
function passphrase() {
  const abc = 'abcdefghjkmnpqrstuvwxyz23456789', b = randomBytes(20);
  let s = '';
  for (let i = 0; i < 20; i++) s += (i && i % 5 === 0 ? '-' : '') + abc[b[i] % abc.length];
  return s;
}
const UPLOAD = `aws s3 cp ${OUT}/${DIR} s3://calc.platform.tennis/${DIR} --recursive --acl public-read --content-type application/octet-stream --cache-control "no-cache" --endpoint-url "$LINODE_S3_ENDPOINT"`;
function rm(files) { return files.map(f => `aws s3 rm s3://calc.platform.tennis/${DIR}/${f} --endpoint-url "$LINODE_S3_ENDPOINT"`).join('\n'); }

switch (cmd) {
  case 'init': {
    if (fs.existsSync(SECRET) && !A.force) fail(SECRET + ' already exists. Use update to replace the data, or --force to start over.');
    const s = { v: 1, dataKey: randomBytes(32).toString('base64'), manifest: name(), ratings: null, matches: null, passwords: [] };
    writeData(s, A.ratings, A.matches);
    saveSecret(s);
    console.log(`\nSaved ${SECRET}. Keep it private: it can decrypt the data.\nNext: node tools/pti-share.mjs add-password --label <who>`);
    break;
  }
  case 'update': {
    const s = loadSecret(), old = writeData(s, A.ratings, A.matches);
    saveSecret(s);
    console.log(`\nUpload the new files (existing passwords keep working):\n${UPLOAD}\n\nThen delete the old data files:\n${rm(old)}`);
    break;
  }
  case 'add-password': {
    const s = loadSecret(), label = A.label || 'password ' + (s.passwords.length + 1);
    if (s.passwords.some(p => p.label === label)) fail('a password labelled "' + label + '" already exists');
    const pass = A._[0] || passphrase();
    if (pass.trim().length < 12) fail('use at least 12 characters');
    const d = fromPassword(pass);
    if (s.passwords.some(p => p.file === d.file)) fail('that password is already in use');
    write(d.file, seal(d.key, Buffer.from(JSON.stringify({ v: 1, key: s.dataKey, m: s.manifest }))));
    s.passwords.push({ label, file: d.file, added: new Date().toISOString() });
    saveSecret(s);
    console.log(`Password for "${label}": ${pass}\n\nUpload:\n${UPLOAD}`);
    break;
  }
  case 'remove-password': {
    const s = loadSecret();
    const file = A.label ? (s.passwords.find(p => p.label === A.label) || {}).file : A._[0] ? fromPassword(A._[0]).file : null;
    if (!file) fail('give --label <label> or the password');
    s.passwords = s.passwords.filter(p => p.file !== file);
    saveSecret(s);
    try { fs.unlinkSync(path.join(OUT, DIR, file)); } catch (e) {}
    console.log(`Removed. Delete its key file from the bucket:\n${rm([file])}`);
    break;
  }
  case 'list': {
    const s = loadSecret();
    console.log(s.passwords.length ? s.passwords.map(p => `${p.label}\t${p.added.slice(0, 10)}\t${DIR}/${p.file}`).join('\n') : 'No passwords yet.');
    break;
  }
  default:
    console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 20).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
}
