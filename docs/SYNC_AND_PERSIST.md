# Sync & Persist Assumptions

pantryPlus is an **online-first** app with light local caching. It is not a full offline-capable client.

## mst-persist

| Store | AsyncStorage key | Behavior |
| --- | --- | --- |
| `domainStore` | `pantryPlusDomain` | Full store snapshot (user, lists, groups, locations, location flags) |
| `uiStore` | `pantryPlusUI` | UI prefs with a **blacklist** (modals, load flags, ephemeral maps, etc.) |

On cold start, persisted UI state (last section, selected list, location toggles, etc.) can rehydrate before network calls finish. Domain data is **not** trusted as the long-term source of truth after login.

### Clear on init

`domainStore.initUser()` clears in-memory user/lists/groups/locations, then registers the shopper and reloads from the API. `initialize()` also removes the `pantryPlusDomain` AsyncStorage key (used for a hard reset path).

Treat OTA schema changes to persisted MST models carefully — persisted shapes can break hydration after an update.

## Shopping list sync

When a shopping list screen is focused and the app is foregrounded (`ShoppingList.tsx`):

1. **Initial / pull-to-refresh** — `loadCategories` + `loadListItems` (full replace).
2. **Polling** — every `syncConstants.pollIntervalMs` (5s) runs `syncCategories` + `syncListItems` (incremental, less flicker).
3. **Focus / AppState active** — immediate sync; polling stops in background.

Category sync is skipped while the reorder modal is open or a category-order save is in progress, so polls do not overwrite in-flight ordinals.

### Race guards

- Only one sync at a time (`syncInProgressRef`).
- `uiStore.recentlyRemovedItems` (max age `recentlyRemovedItemMaxAgeMs`, 30s) prevents purchased/removed items from reappearing when an in-flight sync returns stale data.
- Sync errors are logged quietly; pull-to-refresh can show a network alert.

Constants live in `src/consts/sync.ts`.

## What works offline vs not

| Works without network | Does not |
| --- | --- |
| Viewing last rehydrated UI chrome / cached MST snapshot briefly | Creating/updating lists, items, categories, groups |
| Local checkbox UI before purchase completes | Purchase, reorder, share, invites |
| | Reliable multi-device consistency without polling / refresh |

There is no offline write queue or retry layer. Failed API calls generally log and leave the UI to refresh later.

## Practical guidelines

1. Assume the server wins after `initUser` and list sync.
2. When mutating items during an open list, keep race guards in mind (or extend `recentlyRemovedItems` for similar cases).
3. Do not rely on persisted domain data across auth changes without clearing.
4. Prefer adjusting `consts/sync.ts` over hardcoding poll intervals in screens.
