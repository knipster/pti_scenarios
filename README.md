# PTI Scenarios

Web Version of a Google Sheet created by Neil Terry.

Useful for players to examine the possible outcomes of a PTI rated match

Check this out at http://calc.platform.tennis
The PTI History Explorer (`pti_interactive.html`) replays match history and lets you edit starting ratings, breaks and linked ids. See [EXPLORER_GUIDE.md](EXPLORER_GUIDE.md) for how to use it.

## Deploying

- **`main`** deploys to the staging copy at http://calc.platform.tennis/staging/ on every push.
- **`release`** deploys to the live site at http://calc.platform.tennis on every push.

To release, open a pull request from `main` into `release` and merge it. For an urgent fix to the live site, fix it on `release`, then merge `release` back into `main`.

Neither deploy touches the encrypted shared data in `d/` and `staging/d/`, and the live deploy never touches `staging/`. Upload the shared data to each one with `tools/pti_share_sync.py` (add `--out staging` for staging); see [tools/SHARING.md](tools/SHARING.md).
