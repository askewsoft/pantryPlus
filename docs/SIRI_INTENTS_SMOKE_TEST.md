# Siri App Intents — manual smoke test

Manual test matrix for Phase 5 add/check intents ([#168](https://github.com/askewsoft/pantryPlus/issues/168), [#169](https://github.com/askewsoft/pantryPlus/issues/169)). Parent epic: [#93](https://github.com/askewsoft/pantryPlus/issues/93).

Related docs:

- Architecture, HomePod routing, and user setup: [SIRI_AND_HOMEPOD.md](./SIRI_AND_HOMEPOD.md)
- Implementation plan: [plans/phase-5-siri-app-intents.md](./plans/phase-5-siri-app-intents.md)

Logic tests (disambiguation + inform-and-skip, no Simulator): `npm run test:intents`.

## What you are verifying

| Test | Intent | Pass criteria |
| --- | --- | --- |
| Add new item | `AddItemToListIntent` | Success dialog; item appears once on the list in the app |
| Add duplicate | `AddItemToListIntent` | “Already on …” dialog; **no** second list row |
| Check on list | `IsItemOnListIntent` | “Yes, … is on …” (with category when known) |
| Check off list | `IsItemOnListIntent` | “No, … is not on …” |

Shortcuts app on **iOS Simulator or a physical device** is the fastest path. Siri voice is optional follow-up testing.

**Where Shortcuts runs:** App Intents register on the device where Pantry Plus is installed. Use the **Shortcuts app inside the iOS Simulator** (or on your iPhone with the dev build). The **Mac desktop Shortcuts app does not show Pantry Plus actions** when the app runs only in Simulator — that is expected.

---

## Before you test (one-time setup)

1. **Sign in** to Pantry Plus.
2. **Open a shopping list** and wait for items to load. This mirrors auth, list metadata, and roster into the App Group (required for intents).
3. **Confirm the API is reachable** from the device (same `EXPO_PUBLIC_API_URL` as normal app use). The optional `GET /v2/lists/{listId}/items/{itemId}/onList` route must be deployed if you want the id-based roster fallback to work when cache is stale.
4. **Pick a test list** by name (e.g. “Grocery”). Note whether it has **categories** — new items may trigger “Which category?” unless auto-hint applies.

Tip: use a list **without categories** for the first add test to keep the flow simple.

---

## Open the intents in Shortcuts

### Option A — App Shortcuts (if they appear)

1. Open **Shortcuts on the Simulator** (or on the iPhone where Pantry Plus is installed).
2. Search **Pantry Plus**, **Add Item**, or **Check List**.
3. Tap a shortcut to run it, or add it to **My Shortcuts**.

Donated phrases look like “Add an item to {list} list in Pantry Plus” (list entity only; item name is entered at run time).

### Option B — Build a test shortcut (most reliable)

1. Shortcuts → **+** → **Add Action**.
2. Search **Pantry Plus** (or **Add Item to List** / **Is Item on List**).
3. Add the action. Shortcuts shows **Item**, **List**, and optional **Category**.
4. Tap **List** and pick your test list.
5. Name the shortcut (e.g. “PP Add Item Test”) and save.

Repeat for **Is Item on List** (second shortcut).

Shortcuts provides a form UI — no Siri voice required. That is ideal for smoke testing.

---

## Test 1 — Add a new item

1. Run **Add Item to List**.
2. Set **Item** to something unique, e.g. `SmokeTest Bread`.
3. Set **List** to your test list.
4. Leave **Category** empty unless you are testing category picking.
5. Run.

**Pass if:**

- Shortcuts shows a success message like **“Added SmokeTest Bread to Grocery”** (or with category if you picked one).
- In Pantry Plus, open that list — the item appears **once**.

If **“Which category?”** appears, pick a category or **No Category**. That is expected for new items on lists that have categories and no household category hint.

---

## Test 2 — Add duplicate (inform only, no re-add)

1. Run the **same** shortcut again with the **same item name** and **same list**.

**Pass if:**

- Message like **“SmokeTest Bread is already on Grocery …”** (with category name or “uncategorized”).
- **No second row** in Pantry Plus for that item.
- Intent completes without an API failure dialog.

---

## Test 3 — Check item on list

1. Run **Is Item on List**.
2. **Item:** `SmokeTest Bread` (from Test 1).
3. **List:** same test list.

**Pass if:**

- **“Yes, SmokeTest Bread is on Grocery …”** (category included when known).

---

## Test 4 — Check item not on list

1. Run **Is Item on List** again.
2. **Item:** something not on that list, e.g. `SmokeTest Unicorn Flour`.
3. **List:** same test list.

**Pass if:**

- **“No, SmokeTest Unicorn Flour is not on Grocery”**.

---

## Quick checklist

| Step | Action | Expected |
| --- | --- | --- |
| 1 | Add `SmokeTest Bread` | Added … |
| 2 | Add `SmokeTest Bread` again | Already on …; no duplicate row |
| 3 | Check `SmokeTest Bread` | Yes, … is on … |
| 4 | Check `SmokeTest Unicorn Flour` | No, … is not on … |

---

## Troubleshooting

| Symptom | Likely fix |
| --- | --- |
| **“Open Pantry Plus to sign in”** | Open the app while signed in; browse a list; run the shortcut again. |
| **List picker empty** | Open the app and wait for lists to load; retry. |
| **“Open Pantry Plus to create a shopping list”** | Create or open a list in the app first. |
| **“I couldn’t update your list”** | API or network issue; confirm API is up and the session token is valid. |
| **Item missing in app but shortcut succeeded** | Pull to refresh or reopen the list; the intent writes via API but the UI cache may lag briefly. |
| **Pantry Plus not in Shortcuts (Mac)** | Use Shortcuts **in the Simulator or on iPhone**, not Mac desktop Shortcuts. |
| **Pantry Plus not in Shortcuts (Simulator)** | Open the app once after install; use **Add Action** and search **Pantry Plus**. |
| **Category prompt on every new item** | Expected on categorized lists without a household category hint for that catalog item. |

---

## Optional — Siri voice (Simulator or device)

After Shortcuts passes, try voice (lower priority):

1. Enable Siri in **Settings → Apple Intelligence & Siri**.
2. Example: *“Hey Siri, add smoke test bread to the Grocery list in Pantry Plus”*

Voice is flakier than Shortcuts forms. **Shortcuts success is sufficient for #168.**

---

## Device matrix (#169)

Run after a **native** rebuild (App Intents are not OTA). Open Pantry Plus once while signed in so lists sync.

| Surface | What to try | Pass |
| --- | --- | --- |
| **Simulator Shortcuts** | Tests 1–4 above | Add / duplicate inform / check on / check off |
| **iPhone Shortcuts** | Same as Simulator | Same dialogs; list picker includes recently used list first |
| **iPhone Siri** | “Add milk to the Grocery list in Pantry Plus”; “Is milk on the Grocery list in Pantry Plus?” | Item added or yes/no with category |
| **Siri disambiguation** | Two lists, omit the list name; or two similar item names (“almond milk” vs “oat milk”) | Siri asks which list / which item |
| **Signed out** | Sign out, run add or check | “Open Pantry Plus to sign in.” |
| **HomePod Mini** | Personal Requests on, same Wi‑Fi, Recognize My Voice; then the add/check phrases | Spoken result on HomePod; list updated on the routed iPhone |

HomePod setup: [SIRI_AND_HOMEPOD.md](./SIRI_AND_HOMEPOD.md#setup-checklist-homepod).

**Not claimed done until you run it:** iPhone Siri voice and HomePod Mini. Simulator Shortcuts covers the intent logic.

---

## Cleanup

Remove test items (`SmokeTest Bread`, etc.) from the list in the app when finished.
