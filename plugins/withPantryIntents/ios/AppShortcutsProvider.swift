import AppIntents
import Foundation

struct PantryAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: AddItemToListIntent(),
      phrases: [
        "Add an item to \(\.$list) list in \(.applicationName)",
        "Add something to \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Add Item",
      systemImageName: "plus.circle"
    )
    AppShortcut(
      intent: IsItemOnListIntent(),
      phrases: [
        "Is an item on \(\.$list) list in \(.applicationName)",
        "Check \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Check List",
      systemImageName: "checkmark.circle"
    )
  }
}
