import AppIntents
import Foundation

struct PantryAppShortcuts: AppShortcutsProvider {
  // Must use App Shortcuts *builder* syntax only (no `return`, arrays, or other statements).
  // Side effects here break App Intents metadata export and fail EAS/Xcode builds.
  //
  // Apple requires \(.applicationName) in every phrase (synonyms like “Pantry” count).
  // Put static “list” after \(\.$list) — list names are not “Grocery list”, just “Grocery”.
  // Include \(\.$itemName) so the spoken product is more likely to survive routing.
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: AddItemToListIntent(),
      phrases: [
        "Add \(\.$itemName) to \(\.$list) list with \(.applicationName)",
        "Add \(\.$itemName) to \(\.$list) list in \(.applicationName)",
        "Put \(\.$itemName) on \(\.$list) list with \(.applicationName)",
        "Add \(\.$itemName) with \(.applicationName)",
      ],
      shortTitle: "Add to Pantry",
      systemImageName: "plus.circle"
    )
    AppShortcut(
      intent: IsItemOnListIntent(),
      phrases: [
        "Is \(\.$itemName) on \(\.$list) list in \(.applicationName)",
        "Is \(\.$itemName) on \(\.$list) list with \(.applicationName)",
        "Check if \(\.$itemName) is on \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Check List",
      systemImageName: "checkmark.circle"
    )
    AppShortcut(
      intent: PurchaseItemIntent(),
      phrases: [
        "I bought \(\.$itemName) with \(.applicationName)",
        "Purchase \(\.$itemName) from \(\.$list) list with \(.applicationName)",
        "I bought \(\.$itemName) on \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Purchase Item",
      systemImageName: "cart.fill"
    )
    AppShortcut(
      intent: RemoveItemFromListIntent(),
      phrases: [
        "Remove \(\.$itemName) from \(\.$list) list with \(.applicationName)",
        "Remove \(\.$itemName) from \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Remove Item",
      systemImageName: "minus.circle"
    )
    AppShortcut(
      intent: MoveItemToCategoryIntent(),
      phrases: [
        "Move \(\.$itemName) to \(\.$category) with \(.applicationName)",
        "Move \(\.$itemName) to \(\.$category) on \(\.$list) list with \(.applicationName)",
      ],
      shortTitle: "Move Category",
      systemImageName: "folder"
    )
  }
}
