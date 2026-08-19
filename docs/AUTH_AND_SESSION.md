# Auth, Session & API Calls

How the mobile app authenticates, bootstraps the user, and calls the pantryPlus API.

## Startup sequence

```
SplashScreen + UpdateService.checkForUpdates()
        ↓
Amplify.configure + Authenticator (sign-in / sign-up)
        ↓
UserContext → domainStore.initUser()
        ↓
api.shopper.registerUser()  (Cognito attrs → createShopper)
        ↓
loadLists → loadGroups → getInvites → loadRecentLocations
        ↓
IntroScreen  or  AppWrapper (drawer)
```

**Key files**

| File | Role |
| --- | --- |
| `App.tsx` | Amplify config, Authenticator shell, intro vs main app gate |
| `src/screens/UserContext.tsx` | Post-auth domain bootstrap |
| `src/services/SessionService.ts` | Cognito access token → API client `Configuration` |
| `src/api/shopper.ts` | `registerUser` / shopper-scoped reads |
| `src/stores/DomainStore.ts` | `initUser`, list/group/location loads |

`Authenticator` blocks the tree until Cognito has a session. `UserContext` then registers the shopper with the API using Cognito `email`, `sub` (as shopper `id`), and `nickname`. Failures rethrow into `ErrorBoundary`.

Sign-out is handled via Amplify (`useAuthenticator` in Settings), not via DomainStore.

## API auth contract

Every generated client call gets a **Bearer access token** from Amplify (`SessionService.getApiConfiguration`). Most endpoints also require identity headers passed as the first OpenAPI parameters:

| Header / param | Value | When required |
| --- | --- | --- |
| `Authorization: Bearer …` | Cognito access token | All authenticated API calls |
| `xAuthUser` | `domainStore.user.email` | Nearly all CRUD (shopper, list, group, item, location) |
| `xAuthLocation` | `domainStore.selectedKnownLocationId` (or `''`) | Category load/reorder/rename, item purchase, and other location-scoped ops |

`appConfig.apiUrl` already includes the `/v3` suffix (`EXPO_PUBLIC_API_URL` + `/v3`). Prefer `pantryplus-api-client/v3` types only. Store 1.5.4 keeps calling `/v2`.

### Operations that need `xAuthLocation`

- Load / sync categories for a list
- Create / rename / reorder categories (ordinals are **per location**)
- Purchase an item

If no location is selected, purchase flows open `PickLocationPrompt` instead of calling the API (`useItemActions`).

### Pattern in code

```ts
const configuration = await getApiConfiguration(); // Bearer token
const listsApi = new ListsApi(configuration);
await listsApi.purchaseItem(xAuthUser, xAuthLocation, listId, itemId);
```

Screens and models should pass `domainStore.user.email` as `xAuthUser`. Do not invent a separate identity source.

## Client-generated UUIDs

Creates allocate IDs on the device with `expo-crypto` `randomUUID()` **before** the API call, then send that id to the server:

- Lists, groups, locations — `DomainStore`
- Categories, items — `List` / `Category` models

Optimistic local MST updates usually follow (or accompany) the API write. When adding a create path, generate the UUID first, persist via `api.*`, then push into the store with that same id.

## Bumping `pantryplus-api-client`

The app depends on a tagged GitHub package:

```json
"pantryplus-api-client": "github:askewsoft/pantryPlusApiClient#v2.0.0"
```

After API (OpenAPI) changes:

1. Regenerate and release a new client tag from `pantryPlusApiTs` / `pantryPlusApiClient` (see API repo README).
2. Point `package.json` at the new tag.
3. Run `npm install` and fix any TypeScript breakages in `src/api/` and stores.

Do not call the OpenAPI classes from screens; keep wrappers in `src/api/`.
