import AppIntents
import CoreSpotlight
import Foundation

/// Keeps Siri / Shortcuts parameter pickers and Spotlight in sync with the App Group cache.
/// Started from `AppDelegate` via the config plugin (not from `AppShortcutsProvider` —
/// that property must stay pure builder syntax for App Intents metadata export).
///
/// `RelevantEntities` (WWDC 2026) currently documents `AppEntityContext` for media/workout
/// suggestions (e.g. playlists during a run), not shopping lists. Last-used list relevance
/// is `ListEntityQuery.suggestedEntities()` (last-used first) plus `updateAppShortcutParameters()`.
enum PantryIntentsDiscovery {
  static let shared = PantryIntentsDiscoveryBootstrap()

  static func start() {
    _ = shared
  }
}

final class PantryIntentsDiscoveryBootstrap {
  private var observer: NSObjectProtocol?

  init() {
    observer = NotificationCenter.default.addObserver(
      forName: PantryIntentsNotifications.cacheDidChange,
      object: nil,
      queue: .main
    ) { _ in
      PantryIntentsDiscoveryBootstrap.refresh()
    }
    PantryIntentsDiscoveryBootstrap.refresh()
  }

  deinit {
    if let observer {
      NotificationCenter.default.removeObserver(observer)
    }
  }

  static func refresh() {
    PantryAppShortcuts.updateAppShortcutParameters()
    Task {
      await indexShoppingLists()
    }
  }

  private static func indexShoppingLists() async {
    let lists = SharedIntentStore.loadLists().map(ShoppingListEntity.init(snapshot:))
    guard #available(iOS 18.0, *) else { return }
    do {
      let index = CSSearchableIndex(name: "pantryplus.shopping-lists")
      try await index.deleteAppEntities(ofType: ShoppingListEntity.self)
      if !lists.isEmpty {
        try await index.indexAppEntities(lists)
      }
    } catch {
      // Spotlight is best-effort; intents still run from the App Group cache.
    }
  }
}
