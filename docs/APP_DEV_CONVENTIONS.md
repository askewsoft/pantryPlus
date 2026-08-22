# pantryPlus App Dev Conventions

Conventions for the React Native / Expo mobile app. Prefer live code under `src/` when this doc and the codebase disagree.

## Technology Stack

| Technology | Purpose |
| --- | --- |
| **MobX State Tree (MST)** | Typed, observable domain and UI state. Stores are MST models that aggregate other MST model instances (`DomainStore`, `UIStore`, and models under `src/stores/models/`). |
| **mst-persist** | Persists selected store state to device storage (`AsyncStorage`) so UI preferences and domain snapshots survive app restarts. Wired in `DomainStore` (`pantryPlusDomain`) and `UIStore` (`pantryPlusUI`). |
| **Expo / `@expo/vector-icons`** | Expo manages the native toolchain, OTA updates, and device APIs. `@expo/vector-icons` (e.g. MaterialIcons) supplies iconography for drawer items, buttons, and chrome. |
| **AWS Amplify** | Cognito authentication only (sign-in / sign-up UI and session tokens). Not used as a general backend. Config lives in `src/config/amplify.ts` and `src/config/cognito.ts`. |
| **React Navigation** | App navigation: drawer for top-level sections and stacks within each section. Create/edit “modals” are mostly React Native `<Modal>` components driven by `UIStore` flags (not React Navigation modal screens). Route param types live under `src/types/`. |

Related stack pieces (already covered in the root README): React Native, TypeScript, EAS Build / Updates, Cognito.

## Further reading

- [Auth, Session & API Calls](./AUTH_AND_SESSION.md)
- [Environment Variables & Secrets](./ENV_AND_SECRETS.md)
- [Sync & Persist](./SYNC_AND_PERSIST.md)
- [Groups, Sharing & Locations](./GROUPS_SHARING_AND_LOCATION.md)

## Code Structure

```
src/
├── api/                 # Thin wrappers around pantryplus-api-client (v2)
├── components/          # Reusable UI building blocks
├── config/              # Amplify, Cognito, app, and feature config
├── consts/              # Shared constants (colors, fonts, nav options, themes)
├── hooks/               # Shared React hooks
├── screens/             # Top-level screens, section navigators, and modals
├── services/            # Cross-cutting runtime services (session, location, updates)
├── stores/              # MST stores + models + store utilities
└── types/               # Navigation and shared TypeScript types
```

### `api` & `services`

- **`src/api/`** — Domain-oriented wrappers around the generated `pantryplus-api-client/v3` client (`list`, `item`, `category`, `group`, `location`, `shopper`). Screens and stores call `api.*`; they do not instantiate OpenAPI clients directly.
- **`src/api/index.ts`** — Aggregates domain modules into a single `api` export.
- **`src/services/`** — Runtime helpers that are not CRUD:
  - `SessionService` — builds authenticated API `Configuration` from the Amplify session token
  - `LocationService` — device location tracking
  - `UpdateService` — EAS OTA update checks

**Flow:** Amplify session → `SessionService` → `api.*` → MST stores → screens/components.

### `components`

Reusable, composable UI used across screens: list/item rows, buttons, context menus, auth field helpers, badges, error boundary, etc. Prefer putting presentation that is shared by more than one screen here; keep screen-specific layout in `screens/`.

### `config`

Environment-backed and app-level configuration:

- `amplify.ts` / `cognito.ts` — Auth pool and Amplify Auth setup
- `app.ts` — API URL and app settings
- `authAutofill.ts`, `locationSubscription.ts` — feature-specific config

Required public env vars are validated early (e.g. `EXPO_PUBLIC_USER_POOL_ID`, `EXPO_PUBLIC_APP_CLIENT_ID`, `EXPO_PUBLIC_REGION`, `EXPO_PUBLIC_API_URL`). See [Environment Variables & Secrets](./ENV_AND_SECRETS.md) and `env.example`.

### `consts`

Stable shared values: brand colors, fonts, Amplify auth theme overrides, icon button sizes, tooltip keys, sync timings, and default stack/tab navigator options. Prefer consts over magic strings/numbers in screens and components.

### `screens` & modals

Screens are the major functional surfaces of the app. Section folders own a navigator plus child screens:

| Area | Role |
| --- | --- |
| `AppWrapper.tsx` | Authenticated drawer shell (Lists, Groups, Locations, Settings) |
| `UserContext.tsx` | Auth gate / user initialization |
| `IntroScreen/` | Pre-auth / intro experience |
| `ListsNavigation/` | Shopping lists, categories, items (+ `modals/`) |
| `GroupsNavigation/` | Groups and invites (+ `modals/`) |
| `LocationsNavigation/` | Known locations (+ `modals/`) |
| `SettingsNavigation/` | Profile, permissions, about, updates |

Modals live under each section’s `modals/` folder and are typically React Native `<Modal>`s toggled via `UIStore` (e.g. `addListModalVisible`, `shareModalVisible`), not stack “modal” presentation. Keep navigation param lists typed in `src/types/*NavTypes.ts`.

`uiStore.lastViewedSection === 'IntroScreen'` gates the intro experience in `App.tsx`; after that, `AppWrapper` restores the last drawer section from persisted UI state.

### `stores` & `models`

- **`DomainStore`** — App-scoped source of truth for user, lists, groups, and locations. Loads/mutates domain data via `api` and MST model actions.
- **`UIStore`** — Ephemeral and persisted UI state (modal visibility, selected list/location, last viewed section, tooltips, load flags).
- **`stores/models/`** — MST models for entities (`User`, `List`, `Item`, `Category`, `Group`, `Shopper`, `Invitee`, `Location`).
- **`stores/utils/`** — Pure helpers used by stores (sorting, date formatting).

Both `domainStore` and `uiStore` use **mst-persist** with AsyncStorage. Treat persisted shape changes carefully across OTA updates.

### `types`

TypeScript types that do not belong inside a single component or store file—especially React Navigation param lists (`AppNavTypes`, `ListNavTypes`, `GroupNavTypes`, `LocationNavTypes`, `SettingsNavTypes`, `HelpNavTypes`), MST navigation enums (`NavMSTTypes`), and shared function argument types.

## Practical Guidelines

1. Prefer **v2** API client types and endpoints; do not extend deprecated v1 paths.
1. Put network CRUD in **`api/`**, auth/token wiring in **`services/`**, and mutable app state in **MST stores**.
1. Use **React Navigation** typed navigators; avoid ad-hoc navigation state in domain models.
1. Use **`@expo/vector-icons`** for icons unless a custom asset is required.
1. Keep Amplify limited to authentication; backend data goes through the pantryPlus API.
1. Pass **`xAuthUser`** (email) and, when needed, **`xAuthLocation`** on API calls — see [Auth, Session & API Calls](./AUTH_AND_SESSION.md).
1. Assume **online-first** sync; see [Sync & Persist](./SYNC_AND_PERSIST.md).
