# Environment Variables & Secrets

Local Expo config and EAS build environments for pantryPlus.

## Required public env vars

These are read at runtime via `process.env.EXPO_PUBLIC_*`. Missing Cognito/API values throw early in `src/config/amplify.ts`.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | `src/config/app.ts` | API host **without** `/v2` (app appends `/v2`) |
| `EXPO_PUBLIC_USER_POOL_ID` | `src/config/cognito.ts` | Cognito user pool |
| `EXPO_PUBLIC_APP_CLIENT_ID` | `src/config/cognito.ts` | Cognito app client |
| `EXPO_PUBLIC_REGION` | `src/config/cognito.ts` | AWS region for the pool |
| `EXPO_PUBLIC_DEBUG` | `src/config/app.ts`, `App.tsx` | Optional; `'true'` enables extra logging |

Never commit real values. `.env` and `.env.*` are gitignored.

## Local development

1. Copy the example file:

   ```sh
   cp env.example .env
   ```

2. Fill in values for the environment you are targeting (often the same Cognito/API as preview).

3. Restart Metro after changing env vars (`npm start` / `npm run ios`). Expo inlines `EXPO_PUBLIC_*` at bundle time.

Optional: keep a separate `.env.preview` for scripts (see below). Expo’s default local load is `.env`.

## EAS Build environments

`eas.json` maps build profiles to EAS **environment** names:

| EAS profile | `environment` | Update channel | Typical use |
| --- | --- | --- | --- |
| `development` | `development` | (unused for OTA) | Dev client / simulator |
| `preview` | `preview` | `preview` | Internal TestFlight-style builds |
| `prod` | `production` | `published` | App Store / production OTA |

Set the same `EXPO_PUBLIC_*` keys in the [EAS dashboard](https://expo.dev) (or `eas env`) for each environment. Builds and OTA updates pick up the environment tied to the profile/channel.

Do not put Cognito secrets that must stay server-side into `EXPO_PUBLIC_*` — anything with that prefix is embedded in the client bundle.

## Scripts that need env files

`npm run gettoken` loads **`.env.preview`** (not `.env`) for Cognito region/pool/client, then authenticates with CLI username/password:

```sh
npm run gettoken <username> <password>
```

Ensure `.env.preview` contains at least `EXPO_PUBLIC_REGION`, `EXPO_PUBLIC_USER_POOL_ID`, and `EXPO_PUBLIC_APP_CLIENT_ID`.

## Checklist for a new developer

- [ ] `cp env.example .env` and fill Cognito + API URL
- [ ] Optional: `.env.preview` for `gettoken` / API curl workflows
- [ ] Confirm EAS project env vars for `development` / `preview` / `production` if you will run cloud builds
- [ ] Never commit `.env`, `.env.preview`, or credentials
