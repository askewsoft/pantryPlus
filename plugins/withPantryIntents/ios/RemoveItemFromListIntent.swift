import AppIntents
import Foundation

/// Removes an item from a list without recording a purchase.
struct RemoveItemFromListIntent: AppIntent {
  static var title: LocalizedStringResource = "Remove Item from List"
  static var description = IntentDescription("Removes an item from a Pantry Plus shopping list without recording a purchase")
  static var openAppWhenRun = false

  static var parameterSummary: some ParameterSummary {
    Summary("Remove \(\.$itemName) from \(\.$list)")
  }

  @Parameter(title: "Item")
  var itemName: String

  @Parameter(title: "List")
  var list: ShoppingListEntity?

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

    do {
      try await PantryApiClient.shared.removeItemFromList(listId: resolvedList.id, itemId: item.id)
    } catch PantryApiError.needsAuthentication {
      throw PantryIntentError.needsAuthentication
    } catch {
      throw PantryIntentError.apiFailure
    }

    SharedIntentStore.removeRosterItem(listId: resolvedList.id, itemId: item.id)

    let displayName = item.name.isEmpty ? trimmed : item.name
    let dialog = "Removed \(displayName) from \(resolvedList.name)."
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
}
