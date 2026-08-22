import AppIntents
import Foundation

/// Marks an item purchased at a store and removes it from the list (same as in-app check-off).
struct PurchaseItemIntent: AppIntent {
  static var title: LocalizedStringResource = "Purchase Item"
  static var description = IntentDescription("Marks an item as purchased at a store and removes it from a Pantry Plus list")
  static var openAppWhenRun = false

  static var parameterSummary: some ParameterSummary {
    Summary("Purchase \(\.$itemName) from \(\.$list)") {
      \.$store
    }
  }

  @Parameter(title: "Item")
  var itemName: String

  @Parameter(title: "List")
  var list: ShoppingListEntity?

  @Parameter(title: "Store")
  var store: StoreLocationEntity?

  func perform() async throws -> some IntentResult & ProvidesDialog {
    guard SharedIntentStore.loadSession() != nil else {
      throw PantryIntentError.needsAuthentication
    }

    let trimmed = TypeaheadMatcher.displayItemName(itemName)
    if trimmed.isEmpty {
      throw PantryIntentError.noItemName
    }

    let resolvedList = try await resolveList()
    let snapshot = IntentListResolver.listSnapshot(for: resolvedList)
    await IntentListResolver.ensureRoster(snapshot)

    let item = try await IntentListResolver.resolveRosterItem(spokenName: trimmed, listId: resolvedList.id)
    let resolvedStore = try await resolveStore()

    do {
      try await PantryApiClient.shared.purchaseItem(
        listId: resolvedList.id,
        itemId: item.id,
        locationId: resolvedStore.id
      )
    } catch PantryApiError.needsAuthentication {
      throw PantryIntentError.needsAuthentication
    } catch {
      throw PantryIntentError.apiFailure
    }

    SharedIntentStore.removeRosterItem(listId: resolvedList.id, itemId: item.id)

    let displayName = item.name.isEmpty ? trimmed : item.name
    let dialog = "Purchased \(displayName) at \(resolvedStore.name). Removed from \(resolvedList.name)."
    return .result(dialog: IntentDialog(LocalizedStringResource(stringLiteral: dialog)))
  }

  private func resolveList() async throws -> ShoppingListEntity {
    if let list { return list }
    let options = try await ListEntityQuery().suggestedEntities()
    if options.isEmpty { throw PantryIntentError.noLists }
    if options.count == 1 { return options[0] }
    if let lastId = SharedIntentStore.loadLastUsedListId(),
       let last = options.first(where: { $0.id == lastId }) {
      return last
    }
    return try await $list.requestDisambiguation(among: options, dialog: "Which list?")
  }

  private func resolveStore() async throws -> StoreLocationEntity {
    if let store { return store }

    let selected = SharedIntentStore.loadSelectedLocation()
    if let recentId = LocationFreshness.recentLocationId(
      selectedId: selected.id,
      selectedAtMs: selected.atMs
    ),
       let match = SharedIntentStore.loadLocations().first(where: {
         $0.id.compare(recentId, options: .caseInsensitive) == .orderedSame
       }) {
      return StoreLocationEntity(snapshot: match)
    }

    let options = SharedIntentStore.loadLocations().map { StoreLocationEntity(snapshot: $0) }
    if options.isEmpty { throw PantryIntentError.noLocations }
    if options.count == 1 { return options[0] }
    return try await $store.requestDisambiguation(among: options, dialog: "Which store?")
  }
}
