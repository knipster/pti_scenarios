# Sharing data with a password

The PTI History Explorer (`pti_interactive.html`) can open a ratings file and a matches file that only people with a password can read. The files are encrypted on your computer and uploaded to the `d/` folder next to the page. The page reads `d/` relative to its own address, so `/pti_interactive.html` reads `/d/` and `/staging/pti_interactive.html` reads `/staging/d/`. The page has no URLs or keys in it: the password gives both the file to fetch and the key that decrypts it.

People open the data with the **Password** button in the Data column, next to **Load sample data**. **Alt+Shift+P** (Option+Shift+P on a Mac) and a double-click on the small **v2.4** badge next to the page title also work. All three open a password box.

## What you need

- A copy of this repository, and either Python 3.6 or newer with the `cryptography` package (`python3 -m pip install cryptography`) for `tools/pti_share.py`, or Node.js 18 or newer for `tools/pti-share.mjs`. The two scripts do the same thing and share the same secret file, so use whichever runs on your machine. The commands below use Python; for Node, swap `python3 .../pti_share.py` for `node .../pti-share.mjs`.
- The bucket's Linode Object Storage access key. That's the same key as the `LINODE_S3_*` repository secrets. Uploads use `tools/pti_share_sync.py`, which needs Python 3.9 or newer and `python3 -m pip install boto3 cryptography` (plus `duckdb` to refresh from MotherDuck). The AWS CLI also works if you'd rather use it.
- Your `ratings.csv` and `matches.csv`, in the format the explorer already reads.

Set these once in your terminal:

```sh
export AWS_ACCESS_KEY_ID=...            # LINODE_S3_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=...        # LINODE_S3_SECRET_KEY
export LINODE_S3_ENDPOINT=https://us-east-1.linodeobjects.com   # your bucket's cluster
export AWS_DEFAULT_REGION=us-east-1     # only if you use the AWS CLI, which wants one
```

## First setup: the data and the first person

Run these from a private folder outside the repository, for example `~/pti-share`:

```sh
cd ~/pti-share
python3 /path/to/pti_scenarios/tools/pti_share.py init --ratings ratings.csv --matches matches.csv
python3 /path/to/pti_scenarios/tools/pti_share.py add-password --label first-user
```

- `init` gzips and encrypts both CSVs into `share-out/d/`. It also writes `pti-share-secret.json`, which holds the data key. Keep that file private and backed up. You need it to add passwords or update the data, and anyone who has it can decrypt the data.
- `add-password` prints a new passphrase, such as `xdbff-ef3ss-53mgp-46u8c`. Send it to that person privately. To choose your own passphrase instead, put it in quotes at the end of the command. It must be at least 12 characters, and four or more random words works well.

Then upload. The sync script reads the key files from `share-out/d/` and refreshes the data from MotherDuck in the same run:

```sh
python3 /path/to/pti_scenarios/tools/pti_share_sync.py --upload-keys
```

To upload the CSVs you encrypted with `init` instead of a MotherDuck export, use the AWS CLI command that `add-password` prints (`aws s3 cp share-out/d s3://calc.platform.tennis/d --recursive ...`).

Test it: open `calc.platform.tennis/pti_interactive.html`, press Alt+Shift+P, enter the passphrase, and check that the data loads.

## Later

| To | Run | Then |
|---|---|---|
| Add another person | `add-password --label name` | `pti_share_sync.py --keys-only` |
| Cut someone off | `remove-password --label name` | `pti_share_sync.py --keys-only --prune` |
| See who has a password | `list` | |
| Refresh the data from MotherDuck | | `pti_share_sync.py` (see below) |
| Replace the CSVs with your own | `update --ratings new.csv --matches new.csv` | Run the `aws s3` commands it prints. Existing passwords keep working. |

Add `--out staging` to any `pti_share_sync.py` command to do the same for the copy of the site in `staging/` (see below). Each site folder needs its own run.

## Refresh the data from MotherDuck

`tools/pti_share_sync.py` does the whole update in one step. It runs the "PTI full export" queries against `apta2.main.matches_unified` in MotherDuck, encrypts the two CSVs with the data key in your `pti-share-secret.json`, and uploads them to the bucket's `d/` folder (or another site folder's, with `--out`). Existing passwords keep working, and the old data files are deleted from the bucket afterwards.

It needs Python 3.9 or newer and three packages:

```sh
python3 -m pip install duckdb boto3 cryptography
```

Set your MotherDuck token next to the bucket key from above (the script reads the same `AWS_*` and `LINODE_S3_ENDPOINT` variables):

```sh
export MOTHERDUCK_TOKEN=...             # app.motherduck.com > Settings > Access tokens
```

Then run it from the folder that holds `pti-share-secret.json`:

```sh
cd ~/pti-share
python3 /path/to/pti_scenarios/tools/pti_share_sync.py --dry-run   # export and encrypt only, report the counts
python3 /path/to/pti_scenarios/tools/pti_share_sync.py             # export, encrypt and upload
```

It prints the match and player counts (about 745,000 matches and 69,000 players for the whole table) and never prints the token, the keys or the passwords. Other options:

- `--secret FILE` if the secret file is somewhere else.
- `--out FOLDER` for a copy of the site in a folder of the bucket. The files go to `FOLDER/d/`, next to that folder's `pti_interactive.html`. For example, `--out staging` uploads to `staging/d/`. The default is the bucket root (`d/`). `s3://bucket/folder` works too.
- `--upload-keys` to also upload a key file for each password in the secret, from `share-out/d/`. Key files can't be remade without the passwords, so they come from the folder `pti_share.py` wrote them to. Use `--keys-from DIR` if you gave `pti_share.py` a different `--out`.
- `--keys-only` to upload just the key files, with no MotherDuck export. Use it after `add-password`.
- `--prune` to delete files in the `d/` folder that the secret no longer lists, such as the key file of a removed password. It refuses to run on a folder whose data wasn't made with your secret. Try it with `--dry-run` first to see how many files it would delete.
- `--dry-run` to export and encrypt only, and report what would change.
- `--from 2025-01-01 --to 2025-12-31` to share only a date range (inclusive, US Eastern), as in the dive.
- `--keep-csv DIR` to also keep the plain CSVs. Keep them private.

The upload goes data files first, then the manifest that points to them, so nobody opening the data mid-update gets a broken set. If the upload fails, the shared data and the secret file stay as they were. The script updates the file names in `pti-share-secret.json`, so keep using that same file for `add-password` and later runs. `init` still has to be run once (with either script) before the first sync.

### A staging copy

The staging site in `staging/` uses the same secret and the same passwords as the live site, but its own copy of the encrypted files. Set it up once, and refresh it whenever you like:

```sh
python3 /path/to/pti_scenarios/tools/pti_share_sync.py --out staging --upload-keys
```

When you add or remove a password, run the `--keys-only` command once for each folder, with and without `--out staging`. Refreshing one folder never touches the other's files.

## Player groups (the Groups filter)

Next to the CSVs, the shared data can carry a third, optional file, `groups.csv`, that says which groups each player belongs to. The explorer then shows a filter (funnel) button in the Players panel that limits the list to players in the groups you pick. A group is any set of players; `type` says what kind (`league`, `club`, `team`, `city`, `region`), so new kinds need no change to the page.

```csv
player,type,group,label
1001,league,517,NJWPTL
1001,club,ace,Ace Racquet Club
```

- `pti_share_sync.py` builds it from MotherDuck with one row per player and league they played in, over the whole table (not just the exported dates). The label is the table's `LeagueName` column if it has one, otherwise the league id. Pass `--no-groups` to leave it out.
- `pti_share.py` and `pti-share.mjs` take `--groups groups.csv` on `init` and `update`.
- The file is encrypted and listed in the manifest like the other two. Old shared data without it still opens; the filter button just doesn't appear.
- Players in a restricted pool (below) get no group rows, so a placeholder is never tied to a league beyond what the pool says.

## Restricted player pools

Some leagues don't want their players' ratings visible to everyone with a password. A restricted pool is a group of players who appear in the shared data under a placeholder, such as "Avery H." with a 🔒 next to it in the explorer, and a placeholder id starting with `x-`. A password granted that pool shows their real names and ids instead. Ratings and matches stay in the data either way; only who the players are is hidden.

### Set up the pools

Copy `tools/pti-pools.example.json` to `pti-pools.json` in the folder that holds `pti-share-secret.json`, and edit it:

- `leagues`: the league ids in the pool.
- `rule`: `"only"` takes players whose every match is in those leagues; `"ever"` takes anyone with at least one match in them. Both are worked out over the whole MotherDuck table, not just the dates being exported.
- `names`: `"female"`, `"male"` or `"any"`, the first names placeholders are drawn from.
- `include` and `exclude`: player ids to add to or leave out of the pool by hand.

Keep `pti-pools.json` private and out of git (`.gitignore` already skips it), since the exception lists name players.

Once shared data is open, the explorer shows a chip per pool next to the v2.4 badge: 🔓 for pools the password unlocks, 🔒 for the rest. Every password holder sees the pool names this way.

A player in any pool gets a placeholder. Each pool's key shows exactly its own players, so a player in two pools shows to a password holding either one. Placeholder names never share a first name and last initial with any real player in the table.

Every sync picks new placeholders, so "Avery H." in one refresh is someone else, or nobody, in the next. Nobody can follow a restricted player across refreshes. The cost is that anything saved with a placeholder id stops matching after the next sync: a shared view link drops those players and their matches (the page says how many items it skipped), and a downloaded starting-ratings CSV won't line up for them. Players with real ids aren't affected.

### Give passwords access

```sh
python3 /path/to/pti_scenarios/tools/pti_share.py add-password --label alice --pools all
python3 /path/to/pti_scenarios/tools/pti_share.py add-password --label bob --pools NJWPTL-only
python3 /path/to/pti_scenarios/tools/pti_share.py grant --label bob --pools FCWPTL
python3 /path/to/pti_scenarios/tools/pti_share.py revoke --label bob --pools FCWPTL
python3 /path/to/pti_scenarios/tools/pti_share.py list
```

- `--pools all` covers every pool, including ones added later.
- Passwords without `--pools` see placeholders for every restricted player.
- Passwords made before pools existed need their passphrase once to be granted a pool: `grant --label dave --pools FCWPTL "dave's passphrase"`.
- After `add-password`, `grant` or `revoke`, upload the key files as usual, or run `pti_share_sync.py --keys-only`.

When a password loses a pool (`revoke`, or `remove-password` on a password that had pools), the next full sync replaces that pool's key and re-sends every key file, so someone who kept a copy of the old key can't open the new data.

### Refresh with pools

`pti_share_sync.py` reads `pti-pools.json` next to the secret and masks the restricted players in both CSVs before encrypting them. It prints how many players each pool masked. `--keep-csv` saves the masked CSVs.

- `--pools other.json` uses another pools file.
- `--pools none`, or an empty or missing `pti-pools.json`, masks nobody: the CSVs are the same as before pools existed.
- To add or remove a pool, edit `pti-pools.json` and run the sync. Removing a pool shows its players' real names to everyone, unless another pool still covers them.
- `pti_share.py update` refuses to run while pools are set up, since it would publish the CSVs unmasked. The Node `pti-share.mjs` doesn't know about pools, so use the Python tools for this.

## Good to know

- Anyone with a passphrase can pass it on, or save the data once it's open. Cutting someone off only stops new downloads.
- Make sure the bucket can't be listed publicly. Objects should be public-read, but the bucket itself should not be. Check with `aws s3api get-bucket-acl --bucket calc.platform.tennis --endpoint-url "$LINODE_S3_ENDPOINT"`: there should be no `AllUsers` READ grant on the bucket.
- Delete any plain copies of the CSVs you have hosted before, since their URLs are known.
- Over HTTPS the browser's built-in crypto is used and unlocking takes under a second. Over plain HTTP the page loads a bundled copy of the same algorithms (`vendor/noble-crypto.min.js`), and unlocking takes a few seconds.
- The site deploy (`.github/workflows/deploy-linode.yml`) skips `d/`, so a deploy never overwrites or deletes the shared files. A deploy to `staging/` needs to skip `staging/d/` the same way. `.gitignore` keeps `share-out/`, `d/` and the secret file out of git.
