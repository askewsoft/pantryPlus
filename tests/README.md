# Maestro Tests for pantryPlus

UI flows for the Expo / React Native app using [Maestro](https://maestro.dev/).

## Setup

1. Install the CLI:

   ```bash
   brew install maestro
   maestro --version
   ```

2. Run a **dev or preview build** of the app on a simulator/device (Maestro drives the installed app, not Metro alone).

3. Use a Cognito test account you are willing to mutate; some flows create lists/categories.

## Directory layout

```
tests/
├── auth/           # login.yaml, logout.yaml
├── lists/          # create-list.yaml, add-list-category.yaml
├── groups/         # (reserved; suite currently disabled in runner)
├── locations/      # (reserved; suite currently disabled in runner)
├── settings/       # (reserved)
├── cleanup/        # cleanup-test-data.yaml
└── README.md

scripts/
├── maestro-tests.sh
└── test-helpers/   # auth, list, location, group, cleanup, screenshots
```

Screenshots are written under gitignored screenshot dirs (`current` vs `baseline`) by the runner.

## Running tests

From the repo root:

```bash
# Default: current screenshots
npm run maestro

# Explicit current / baseline dirs + full suite
npm run maestro:current
npm run maestro:baseline

# Or call the script directly
./scripts/maestro-tests.sh --help
./scripts/maestro-tests.sh --screenshots current auth
./scripts/maestro-tests.sh --screenshots current lists
./scripts/maestro-tests.sh test tests/lists/create-list.yaml
```

**Enabled suites today:** auth, lists (and cleanup helpers). Location and group suites exist in helpers but are commented out in `run_all_tests` inside `scripts/maestro-tests.sh`.

## Screenshot workflow

1. Run with `--screenshots current` (or `npm run maestro:current`).
2. Review images under the current screenshot directory.
3. Compare to baseline (e.g. Kaleidoscope: `ksdiff` baseline vs current folders).
4. Promote approved shots with a baseline run / copy into the baseline dir when you intentionally accept UI changes.

## Adding a flow

1. Add a `.yaml` under the right `tests/<area>/` folder.
2. Prefer stable `testID`s on interactive elements when text is brittle.
3. Wire the file into the matching helper under `scripts/test-helpers/` if it should run in a suite.
4. Keep destructive tests paired with cleanup where possible (`tests/cleanup/`).

### Minimal example

```yaml
appId: pantryplus
name: Create list
---
- launchApp
- tapOn: "…"
- assertVisible: "…"
- takeScreenshot: "create-list"
```

Record interactively if helpful:

```bash
maestro record tests/lists/new-flow.yaml
```
