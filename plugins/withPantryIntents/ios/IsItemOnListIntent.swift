import AppIntents
import Foundation

struct IsItemOnListIntent: AppIntent {
  static var title: LocalizedStringResource = "Is Item on List"
  static var description = IntentDescription("Checks whether an item is already on a Pantry Plus shopping list")
  static var openAppWhenRun = false

  static var parameterSummary: some ParameterSummary {
    Summary("Is \(\.$itemName) on \(\.$list)?")
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
    let snapshot = listSnapshot(for: resolvedList)
    if SharedIntentStore.loadRoster(listId: resolvedList.id).isEmpty {
      _ = try? await PantryApiClient.shared.refreshRoster(list: snapshot)
    }

    var membership = ListMembershipChecker.bySpokenName(trimmed, listId: resolvedList.id)
    if !membership.onList {
      let corpus = SharedIntentStore.loadTypeaheadCorpus()
      if let catalog = TypeaheadMatcher.matchExact(corpus, rawName: trimmed)
        ?? TypeaheadMatcher.search(corpus, rawQuery: trimmed, limit: 1).first(where: { $0.score >= 200 })?.entry {
        membership = await ListMembershipChecker.byItemId(itemId: catalog.id, listId: resolvedList.id)
        if membership.onList {
          let existing = membership.item
          membership = ListMembership(
            onList: true,
            item: IntentRosterItem(
              id: catalog.id,
              name: (existing?.name.isEmpty == false ? existing?.name : catalog.name) ?? catalog.name,
              categoryId: existing?.categoryId,
              categoryName: existing?.categoryName
            )
          )
        }
      }
    }

    let dialog = membership.onList
      ? ListMembershipChecker.dialogOnList(itemName: trimmed, listName: resolvedList.name, membership: membership)
      : ListMembershipChecker.dialogNotOnList(itemName: trimmed, listName: resolvedList.name)
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

  private func listSnapshot(for entity: ShoppingListEntity) -> IntentListSnapshot {
    if let snapshot = SharedIntentStore.loadLists().first(where: { $0.id == entity.id }) {
      return snapshot
    }
    return IntentListSnapshot(id: entity.id, name: entity.name, groupId: entity.groupId, ownerId: nil, categories: [])
  }
}
