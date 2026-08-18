import AppIntents
import Foundation

struct PantryAppShortcuts: AppShortcutsProvider {
  private static let discovery: Void = {
    _ = PantryIntentsDiscovery.shared
  }()

  static var appShortcuts: [AppShortcut] {
    _ = discovery
    return [
    AppShortcut(
      intent: AddItemToListIntent(),
      phrases: [
        "Add an item in \(.applicationName)",
        "Add something with \(.applicationName)",
        "Add an item to \(\.$list) list in \(.applicationName)",
        "Add something to \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Add Item",
      systemImageName: "plus.circle"
    ),
    AppShortcut(
      intent: IsItemOnListIntent(),
      phrases: [
        "Check my list in \(.applicationName)",
        "Is an item on my list in \(.applicationName)",
        "Is an item on \(\.$list) list in \(.applicationName)",
        "Check \(\.$list) list in \(.applicationName)",
      ],
      shortTitle: "Check List",
      systemImageName: "checkmark.circle"
    ),
    ]
  }
}
