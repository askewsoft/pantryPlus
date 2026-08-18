import AppIntents
import Foundation

struct AddItemToListIntent: AppIntent {
  static var title: LocalizedStringResource = "Add Item to List"
  static var description = IntentDescription("Adds an item to a Pantry Plus shopping list")
  static var openAppWhenRun = false

  static var parameterSummary: some ParameterSummary {
    Summary("Add \(\.$itemName) to \(\.$list)") {
      \.$category
    }
  }

  @Parameter(title: "Item")
  var itemName: String

  @Parameter(title: "List")
  var list: ShoppingListEntity?

  @Parameter(title: "Category")
  var category: CategoryEntity?

  @Parameter(title: "Suggested Item")
  var suggestedItem: ItemSuggestionEntity?

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
    try? await ensureRoster(snapshot)
    await ensureCorpus(cohortId: snapshot.groupId)

    let resolved = try await resolveItem(spokenName: trimmed)
    let candidate = catalogCandidate(from: resolved, spokenName: trimmed)

    var membership = ListMembershipChecker.bySpokenName(trimmed, listId: resolvedList.id)
    if !membership.onList {
      membership = await ListMembershipChecker.byItemId(itemId: candidate.id, listId: resolvedList.id)
    }
    if membership.onList {
      return .result(
        dialog: IntentDialog(LocalizedStringResource(stringLiteral: ListMembershipChecker.dialogAlreadyOnList(
          itemName: candidate.name,
          listName: resolvedList.name,
          membership: membership
        )))
      )
    }

    let resolvedCategory = try await resolveCategory(
      for: snapshot,
      list: resolvedList,
      itemId: resolved.catalogId
    )

    let saved: CatalogItem
    do {
      saved = try await PantryApiClient.shared.createItem(
        id: candidate.id,
        name: candidate.name,
        upc: candidate.upc
      )
    } catch PantryApiError.needsAuthentication {
      throw PantryIntentError.needsAuthentication
    } catch {
      throw PantryIntentError.apiFailure
    }

    let afterCreate = await ListMembershipChecker.byItemId(itemId: saved.id, listId: resolvedList.id)
    if afterCreate.onList {
      return .result(
        dialog: IntentDialog(LocalizedStringResource(stringLiteral: ListMembershipChecker.dialogAlreadyOnList(
          itemName: saved.name,
          listName: resolvedList.name,
          membership: afterCreate
        )))
      )
    }

    do {
      if let resolvedCategory, resolvedCategory.id != CategoryEntity.uncategorizedId {
        try await PantryApiClient.shared.addItemToCategory(categoryId: resolvedCategory.id, itemId: saved.id)
      } else {
        try await PantryApiClient.shared.addItemToList(listId: resolvedList.id, itemId: saved.id)
      }
    } catch PantryApiError.needsAuthentication {
      throw PantryIntentError.needsAuthentication
    } catch {
      throw PantryIntentError.apiFailure
    }

    SharedIntentStore.upsertRosterItem(
      listId: resolvedList.id,
      item: IntentRosterItem(
        id: saved.id,
        name: saved.name,
        categoryId: resolvedCategory?.id == CategoryEntity.uncategorizedId ? nil : resolvedCategory?.id,
        categoryName: resolvedCategory?.id == CategoryEntity.uncategorizedId ? nil : resolvedCategory?.name
      )
    )

    let dialog: String
    if let resolvedCategory, resolvedCategory.id != CategoryEntity.uncategorizedId {
      dialog = "Added \(saved.name) to \(resolvedCategory.name) on \(resolvedList.name)"
    } else {
      dialog = "Added \(saved.name) to \(resolvedList.name)"
    }
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

  private enum ResolvedSpokenItem {
    case catalog(IntentTypeaheadEntry)
    case newItem(name: String)

    var catalogId: String? {
      switch self {
      case .catalog(let entry): return entry.id
      case .newItem: return nil
      }
    }
  }

  private func resolveItem(spokenName: String) async throws -> ResolvedSpokenItem {
    let corpus = SharedIntentStore.loadTypeaheadCorpus()
    if let exact = TypeaheadMatcher.matchExact(corpus, rawName: spokenName) {
      return .catalog(exact)
    }

    let ranked = TypeaheadMatcher.search(corpus, rawQuery: spokenName, limit: 5)
    if let top = ranked.first, top.score >= 200, ranked.count == 1 || top.score - (ranked.dropFirst().first?.score ?? 0) >= 50 {
      return .catalog(top.entry)
    }

    let strong = ranked.filter { $0.score >= 100 }
    if strong.count == 1 {
      return .catalog(strong[0].entry)
    }
    if strong.count > 1 {
      let entities = strong.prefix(5).map { ItemSuggestionEntity(entry: $0.entry) }
      let chosen = try await $suggestedItem.requestDisambiguation(among: Array(entities), dialog: "Which item did you mean?")
      if let entry = corpus.first(where: { $0.id == chosen.id }) {
        return .catalog(entry)
      }
      return .catalog(
        IntentTypeaheadEntry(id: chosen.id, name: chosen.name, aliases: chosen.aliases, upc: chosen.upc)
      )
    }

    return .newItem(name: spokenName)
  }

  private func catalogCandidate(from resolved: ResolvedSpokenItem, spokenName: String) -> (id: String, name: String, upc: String?) {
    switch resolved {
    case .catalog(let entry):
      return (id: entry.id, name: entry.name, upc: entry.upc)
    case .newItem(let name):
      return (id: UUID().uuidString.lowercased(), name: name, upc: "")
    }
  }

  private func resolveCategory(
    for snapshot: IntentListSnapshot,
    list: ShoppingListEntity,
    itemId: String?
  ) async throws -> CategoryEntity? {
    if let category {
      return category
    }

    if let itemId, let hinted = TypeaheadMatcher.findCategoryId(itemId: itemId, currentList: snapshot) {
      if hinted.isEmpty {
        return CategoryEntity.uncategorized(listId: list.id)
      }
      if let match = snapshot.categories.first(where: { $0.id == hinted }) {
        return CategoryEntity(id: match.id, name: match.name, listId: list.id)
      }
    }

    if snapshot.categories.isEmpty {
      return CategoryEntity.uncategorized(listId: list.id)
    }

    var options = snapshot.categories.map { CategoryEntity(id: $0.id, name: $0.name, listId: list.id) }
    options.insert(CategoryEntity.uncategorized(listId: list.id), at: 0)
    return try await $category.requestDisambiguation(among: options, dialog: "Which category?")
  }

  private func listSnapshot(for entity: ShoppingListEntity) -> IntentListSnapshot {
    if let snapshot = SharedIntentStore.loadLists().first(where: { $0.id == entity.id }) {
      return snapshot
    }
    return IntentListSnapshot(id: entity.id, name: entity.name, groupId: entity.groupId, ownerId: nil, categories: [])
  }

  private func ensureRoster(_ snapshot: IntentListSnapshot) async throws {
    if !SharedIntentStore.loadRoster(listId: snapshot.id).isEmpty { return }
    _ = try? await PantryApiClient.shared.refreshRoster(list: snapshot)
  }

  private func ensureCorpus(cohortId: String?) async {
    if !SharedIntentStore.loadTypeaheadCorpus().isEmpty { return }
    guard let shopperId = SharedIntentStore.loadSession()?.shopperId, !shopperId.isEmpty else { return }
    guard let items = try? await PantryApiClient.shared.getPurchasedItems(shopperId: shopperId, cohortId: cohortId) else { return }
    SharedIntentStore.replaceTypeaheadCorpus(TypeaheadMatcher.buildCorpus(items: items))
  }
}
