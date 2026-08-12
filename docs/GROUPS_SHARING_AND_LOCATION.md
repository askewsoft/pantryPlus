# Groups, Sharing & Locations

Domain concepts that often surprise new contributors.

## Groups & invites

A **group** is a sharing cohort. Members can access lists shared to that group.

| Concept | Meaning |
| --- | --- |
| Owner | Shopper who created the group; can invite/remove and manage the group |
| Shopper (member) | Accepted member of the group |
| Invitee | Email invited but not yet accepted |

**Invite lifecycle**

1. Group owner invites by email (`api.group.addInviteeToGroup`).
2. Invitee sees pending invites on their user (`getInvites`).
3. Accept / decline via `User.acceptInvite` / `declineInvite`.
4. Accept triggers DomainStore `onAction` → `loadLists()` so newly shared lists appear.

UI surfaces: `GroupsNavigation` (My Groups, My Invites), `Invite` / `Invitee` / `GroupMembers` components.

## List sharing

Sharing is **not** a separate share entity. A list is shared by setting `list.groupId` to a group id (or `null` to unshare):

- `ShareListModal` — pick a group, unshare, or jump to create a group
- `List.updateList({ name, groupId, xAuthUser })` → `api.list.updateList`

Creating a group from the share flow sets `uiStore.groupCreationOrigin` to `'Lists'` so navigation can return appropriately after `AddGroupModal`.

Owned lists without a `groupId` are private to the owner (subject to API authorization).

## Locations

Two related ideas:

| Concept | Source | Role |
| --- | --- | --- |
| **Recent / known locations** | API (`loadRecentLocations` / location CRUD) | Stores the user has used; shown under Locations |
| **Nearest / selected known location** | GPS + `api.location.getNearestStore`, or manual select | Drives `selectedKnownLocationId` for purchases and category order |

### Tracking

`LocationService` (`src/services/LocationService.ts`):

- Gated by OS permission and `domainStore.locationEnabled` / `locationExplicitlyDisabled`
- Watches position using intervals in `src/config/locationSubscription.ts` (high accuracy, ~5 min / 100 m, **500 m** nearest-store radius)
- On match, sets `nearestKnownLocation` and `selectedKnownLocationId` if the nearest store id changed
- Started/stopped from `AppWrapper` when location is enabled and the user is ready

Manual selection: tap a location in the Locations UI (`LocationElement`) to select/deselect `selectedKnownLocationId`.

### Why location matters for lists

- **Category ordinals are location-scoped.** Loading and reordering categories pass `xAuthLocation`. Empty location is allowed for some reads (`''`) but reorder/purchase expect a real id.
- **Purchase** requires a selected location; otherwise `PickLocationPrompt` is shown (`useItemActions`).
- Changing `selectedKnownLocationId` reloads category order on the open shopping list.

## Gotchas

- Profile nickname/email updates in Settings may not fully persist to Cognito/API yet — check live code before assuming they do.
- Location delete paths may be incomplete/commented in UI.
- Amplify config may allow guest access flags that are unused by the Authenticator-gated app shell — auth still expects a signed-in Cognito user for API use.
