import AppIntents
import Foundation

enum IntentListResolver {
  static func listSnapshot(for entity: ShoppingListEntity) -> IntentListSnapshot {
    if let snapshot = SharedIntentStore.loadLists().first(where: { $0.id == entity.id }) {
      return snapshot
    }
    return IntentListSnapshot(
      id: entity.id,
      name: entity.name,
      groupId: entity.groupId,
      ownerId: nil,
      categories: []
    )
  }

  static func ensureRoster(_ snapshot: IntentListSnapshot) async {
    if !SharedIntentStore.loadRoster(listId: snapshot.id).isEmpty { return }
    _ = try? await PantryApiClient.shared.refreshRoster(list: snapshot)
  }

  /// Resolve an item that must already be on the list (purchase / remove / move).
  static func resolveRosterItem(
    spokenName: String,
    listId: String
  ) async throws -> IntentRosterItem {
    var membership = ListMembershipChecker.bySpokenName(spokenName, listId: listId)
    if !membership.onList {
      let corpus = SharedIntentStore.loadTypeaheadCorpus()
      if let catalog = TypeaheadMatcher.matchExact(corpus, rawName: spokenName)
        ?? TypeaheadMatcher.search(corpus, rawQuery: spokenName, limit: 1).first(where: { $0.score >= 200 })?.entry {
        membership = await ListMembershipChecker.byItemId(itemId: catalog.id, listId: listId)
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

    guard membership.onList, let item = membership.item, !item.id.isEmpty else {
      throw PantryIntentError.itemNotOnList(itemName: spokenName)
    }
    return item
  }
}
