import AppIntents
import Foundation

struct PantryAppShortcuts: AppShortcutsProvider {
  // Must use App Shortcuts *builder* syntax only (no `return`, arrays, or other statements).
  // Side effects here break App Intents metadata export and fail EAS/Xcode builds.
  //
  // Apple rules for App Shortcut phrases (Siri voice triggers):
  // - Every phrase needs \(.applicationName) (synonyms like “Pantry” count).
  // - At most ONE AppEntity/AppEnum parameter per phrase.
  // - String parameters (itemName) are not allowed in phrases — Siri asks “What item?” after match.
  // Put static “list” after \(\.$list) — list names are not “Grocery list”, just “Grocery”.
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: AddItemToListIntent(),
      phrases: [
        "Add an item to \(\.$list) list with \(.applicationName)",
        "Add something to \(\.$list) list in \(.applicationName)",
        "Put something on \(\.$list) list with \(.applicationName)",
        "Add an item with \(.applicationName)",
      ],
      shortTitle: "Add to Pantry",
      systemImageName: "plus.circle"
    )
    AppShortcut(
      intent: IsItemOnListIntent(),
      phrases: [
        "Is an item on \(\.$list) list in \(.applicationName)",
        "Check \(\.$list) list with \(.applicationName)",
        "Check my list in \(.applicationName)",
      ],
      shortTitle: "Check List",
      systemImageName: "checkmark.circle"
    )
    AppShortcut(
      intent: PurchaseItemIntent(),
      phrases: [
        "I bought something with \(.applicationName)",
        "Purchase an item from \(\.$list) list with \(.applicationName)",
        "I bought something on \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Purchase Item",
      systemImageName: "cart.fill"
    )
    AppShortcut(
      intent: RemoveItemFromListIntent(),
      phrases: [
        "Remove an item from \(\.$list) list with \(.applicationName)",
        "Remove something from \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Remove Item",
      systemImageName: "minus.circle"
    )
    AppShortcut(
      intent: MoveItemToCategoryIntent(),
      phrases: [
        "Move an item to \(\.$category) with \(.applicationName)",
        "Move something on \(\.$list) list with \(.applicationName)",
      ],
      shortTitle: "Move Category",
      systemImageName: "folder"
    )
  }
}
