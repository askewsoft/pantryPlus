import AppIntents
import Foundation

struct PantryAppShortcuts: AppShortcutsProvider {
  // Must use App Shortcuts *builder* syntax only (no `return`, arrays, or other statements).
  // Side effects here break App Intents metadata export and fail EAS/Xcode builds.
  static var appShortcuts: [AppShortcut] {
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
    )
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
    )
  }
}
