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
        "Add to \(.applicationName)",
        "Add item to \(.applicationName)",
        "Add item in \(.applicationName)",
        "Add an item to \(\.$list) list in \(.applicationName)",
        "Add an item to the \(\.$list) list in \(.applicationName)",
        "Add an item to the \(\.$list) list on \(.applicationName)",
        "Add something to the \(\.$list) list in \(.applicationName)",
        "Add to the \(\.$list) list in \(.applicationName)",
        "Put something on the \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Add to Pantry",
      systemImageName: "plus.circle"
    )
    AppShortcut(
      intent: IsItemOnListIntent(),
      phrases: [
        "Check list in \(.applicationName)",
        "Check \(.applicationName) for something",
        "Check \(.applicationName) for an item",
        "Check for item in \(.applicationName)",
        "Check for item on the \(\.$list) list in \(.applicationName)",
        "Check \(\.$list) list in \(.applicationName)",
        "Check the \(\.$list) list in \(.applicationName)",
        "Check if an item is on the \(\.$list) list in \(.applicationName)",
        "Is an item on the \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Check List",
      systemImageName: "checkmark.circle"
    )
    AppShortcut(
      intent: PurchaseItemIntent(),
      phrases: [
        "I bought something in \(.applicationName)",
        "Mark item purchased in \(.applicationName)",
        "Mark item as purchased in \(.applicationName)",
        "Check off an item in \(.applicationName)",
        "Mark item as purchased on the \(\.$list) list in \(.applicationName)",
        "I bought something on the \(\.$list) list in \(.applicationName)",
        "Purchase an item on the \(\.$list) list in \(.applicationName)",
        "Mark an item as purchased on the \(\.$list) list in \(.applicationName)",
        "Check off an item from the \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Purchase Item",
      systemImageName: "cart.fill"
    )
    AppShortcut(
      intent: RemoveItemFromListIntent(),
      phrases: [
        "Remove an item in \(.applicationName)",
        "Remove item from \(\.$list) list in \(.applicationName)",
        "Take item off of the \(\.$list) list in \(.applicationName)",
        "Remove an item from the \(\.$list) list in \(.applicationName)",
        "Remove something from \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Remove Item",
      systemImageName: "minus.circle"
    )
    AppShortcut(
      intent: MoveItemToCategoryIntent(),
      phrases: [
        "Move an item in \(.applicationName)",
        "Move an item to \(\.$category) in \(.applicationName)",
        "Move item on the \(\.$list) list in \(.applicationName)",
        "Move something on the \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Move Category",
      systemImageName: "folder"
    )
  }
}
