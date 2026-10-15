# Sharing data with a password

The PTI History Explorer (`pti_interactive.html`) can open a ratings file and a matches file that only people with a password can read. The files are encrypted on your computer and uploaded to the site's `d/` folder. The page has no URLs or keys in it: the password gives both the file to fetch and the key that decrypts it.

People open the data with **Alt+Shift+P** (Option+Shift+P on a Mac), or by double-clicking the small **v2.4** badge next to the page title. Both open a password box.

## What you need

- Node.js 18 or newer, and a copy of this repository (for `tools/pti-share.mjs`).
- The AWS CLI with the bucket's Linode Object Storage access key. That's the same key as the `LINODE_S3_*` repository secrets.
- Your `ratings.csv` and `matches.csv`, in the format the explorer already reads.

Set these once in your terminal:

```sh
export AWS_ACCESS_KEY_ID=...            # LINODE_S3_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=...        # LINODE_S3_SECRET_KEY
export AWS_DEFAULT_REGION=us-east-1     # Linode ignores it; the CLI wants one
export LINODE_S3_ENDPOINT=https://us-east-1.linodeobjects.com   # your bucket's cluster
```

## First setup: the data and the first person

Run these from a private folder outside the repository, for example `~/pti-share`:

```sh
cd ~/pti-share
node /path/to/pti_scenarios/tools/pti-share.mjs init --ratings ratings.csv --matches matches.csv
node /path/to/pti_scenarios/tools/pti-share.mjs add-password --label first-user
```

- `init` gzips and encrypts both CSVs into `share-out/d/`. It also writes `pti-share-secret.json`, which holds the data key. Keep that file private and backed up. You need it to add passwords or update the data, and anyone who has it can decrypt the data.
- `add-password` prints a new passphrase, such as `xdbff-ef3ss-53mgp-46u8c`. Send it to that person privately. To choose your own passphrase instead, put it in quotes at the end of the command. It must be at least 12 characters, and four or more random words works well.

Then upload what the script printed:

```sh
aws s3 cp share-out/d s3://calc.platform.tennis/d --recursive --acl public-read \
  --content-type application/octet-stream --cache-control "no-cache" --endpoint-url "$LINODE_S3_ENDPOINT"
```

Test it: open `calc.platform.tennis/pti_interactive.html`, press Alt+Shift+P, enter the passphrase, and check that the data loads.

## Later

| To | Run | Then |
|---|---|---|
| Add another person | `add-password --label name` | Upload `share-out/d` again |
| Cut someone off | `remove-password --label name` | Run the `aws s3 rm` it prints |
| See who has a password | `list` | |
| Replace the CSVs | `update --ratings new.csv --matches new.csv` | Upload, then run the `aws s3 rm` lines it prints for the old files. Existing passwords keep working. |

## Good to know

- Anyone with a passphrase can pass it on, or save the data once it's open. Cutting someone off only stops new downloads.
- Make sure the bucket can't be listed publicly. Objects should be public-read, but the bucket itself should not be. Check with `aws s3api get-bucket-acl --bucket calc.platform.tennis --endpoint-url "$LINODE_S3_ENDPOINT"`: there should be no `AllUsers` READ grant on the bucket.
- Delete any plain copies of the CSVs you have hosted before, since their URLs are known.
- Over HTTPS the browser's built-in crypto is used and unlocking takes under a second. Over plain HTTP the page loads a bundled copy of the same algorithms (`vendor/noble-crypto.min.js`), and unlocking takes a few seconds.
- The site deploy (`.github/workflows/deploy-linode.yml`) skips `d/`, so a deploy never overwrites or deletes the shared files. `.gitignore` keeps `share-out/`, `d/` and the secret file out of git.
