import AppIntents
import Foundation

struct AddItemToListIntent: AppIntent, PredictableIntent {
  static var title: LocalizedStringResource = "Add Item to List"
  static var description = IntentDescription("Adds an item to a Pantry Plus shopping list")
  static var openAppWhenRun = false

  static var parameterSummary: some ParameterSummary {
    Summary("Add \(\.$itemName) to \(\.$list)") {
      \.$category
    }
  }

  static var predictionConfiguration: some IntentPredictionConfiguration {
    IntentPrediction(parameters: (\Self.$itemName, \Self.$list)) { itemName, list in
      DisplayRepresentation(
        title: "Add \(itemName) to \(list?.name ?? "a list")"
      )
    }
    IntentPrediction(parameters: (\Self.$list)) { list in
      DisplayRepresentation(
        title: "Add an item to \(list?.name ?? "a list")"
      )
    }
    IntentPrediction(parameters: (\Self.$itemName)) { itemName in
      DisplayRepresentation(
        title: "Add \(itemName) to a list"
      )
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

  /// Follow-up item names collected via `requestValue` during the "Anything else?" loop.
  @Parameter(title: "Next Item")
  var nextItem: String?

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

    let first = try await addOneItem(
      spokenName: trimmed,
      list: resolvedList,
      snapshot: snapshot,
      categoryMode: .promptIfNeeded
    )

    guard case .added(let firstName, _) = first else {
      if case .alreadyOnList(let dialog) = first {
        return .result(dialog: IntentDialog(LocalizedStringResource(stringLiteral: dialog)))
      }
      return .result(dialog: IntentDialog(LocalizedStringResource(stringLiteral: "All set.")))
    }

    var addedNames = [firstName]
    donateSticky(list: resolvedList, itemName: firstName)

    var nextPrompt =
      "Added \(firstName) to \(resolvedList.name). Anything else? Say an item name, or say all done."

    for _ in 0..<SpokenFollowUp.maxFollowUpTurns {
      let spoken: String
      do {
        spoken = try await $nextItem.requestValue(
          IntentDialog(LocalizedStringResource(stringLiteral: nextPrompt))
        )
      } catch {
        // User cancelled / session ended — close with summary of what we did add.
        break
      }

      if SpokenFollowUp.isStopPhrase(spoken) {
        break
      }

      let followUpName = TypeaheadMatcher.displayItemName(spoken)
      if followUpName.isEmpty {
        nextPrompt = "Anything else? Say an item name, or say all done."
        continue
      }

      let outcome = try await addOneItem(
        spokenName: followUpName,
        list: resolvedList,
        snapshot: snapshot,
        categoryMode: .hintOrUncategorized
      )

      switch outcome {
      case .alreadyOnList(let dialog):
        nextPrompt = "\(dialog). Anything else?"
      case .added(let name, _):
        addedNames.append(name)
        donateSticky(list: resolvedList, itemName: name)
        nextPrompt = "Added \(name). Anything else?"
      }
    }

    let summary = SpokenFollowUp.formatAddedSummary(itemNames: addedNames, listName: resolvedList.name)
    return .result(dialog: IntentDialog(LocalizedStringResource(stringLiteral: summary)))
  }

  private enum CategoryMode {
    /// First item: may use explicit category param and disambiguate when no household hint.
    case promptIfNeeded
    /// Follow-ups: ignore explicit category; use hint when known, otherwise uncategorized (no prompt).
    case hintOrUncategorized
  }

  private enum AddOutcome {
    case added(name: String, category: CategoryEntity?)
    case alreadyOnList(dialog: String)
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

  /// Resolve item → duplicate check → category → API write → roster upsert.
  private func addOneItem(
    spokenName: String,
    list: ShoppingListEntity,
    snapshot: IntentListSnapshot,
    categoryMode: CategoryMode
  ) async throws -> AddOutcome {
    let resolved = try await resolveItem(spokenName: spokenName)
    let candidate = catalogCandidate(from: resolved, spokenName: spokenName)

    var membership = ListMembershipChecker.bySpokenName(spokenName, listId: list.id)
    if !membership.onList {
      membership = await ListMembershipChecker.byItemId(itemId: candidate.id, listId: list.id)
    }
    if membership.onList {
      return .alreadyOnList(dialog: ListMembershipChecker.dialogAlreadyOnList(
        itemName: candidate.name,
        listName: list.name,
        membership: membership
      ))
    }

    let resolvedCategory = try await resolveCategory(
      for: snapshot,
      list: list,
      itemId: resolved.catalogId,
      mode: categoryMode
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

    let afterCreate = await ListMembershipChecker.byItemId(itemId: saved.id, listId: list.id)
    if afterCreate.onList {
      return .alreadyOnList(dialog: ListMembershipChecker.dialogAlreadyOnList(
        itemName: saved.name,
        listName: list.name,
        membership: afterCreate
      ))
    }

    do {
      if let resolvedCategory, resolvedCategory.id != CategoryEntity.uncategorizedId {
        try await PantryApiClient.shared.addItemToCategory(categoryId: resolvedCategory.id, itemId: saved.id)
      } else {
        try await PantryApiClient.shared.addItemToList(listId: list.id, itemId: saved.id)
      }
    } catch PantryApiError.needsAuthentication {
      throw PantryIntentError.needsAuthentication
    } catch {
      throw PantryIntentError.apiFailure
    }

    let categoryId = resolvedCategory?.id == CategoryEntity.uncategorizedId ? nil : resolvedCategory?.id
    let categoryName = resolvedCategory?.id == CategoryEntity.uncategorizedId ? nil : resolvedCategory?.name
    SharedIntentStore.upsertRosterItem(
      listId: list.id,
      item: IntentRosterItem(
        id: saved.id,
        name: saved.name,
        categoryId: categoryId,
        categoryName: categoryName
      )
    )

    return .added(name: saved.name, category: resolvedCategory)
  }

  private func donateSticky(list: ShoppingListEntity, itemName: String) {
    var donated = self
    donated.list = list
    donated.itemName = itemName
    donated.nextItem = nil
    Task {
      try? await donated.donate()
    }
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

  private func resolveItem(spokenName: String) async throws -> ResolvedSpokenItem {
    let corpus = SharedIntentStore.loadTypeaheadCorpus()
    switch TypeaheadMatcher.resolveSpokenItem(corpus, rawName: spokenName) {
    case .catalog(let entry):
      return .catalog(entry)
    case .ambiguous(let entries):
      let entities = entries.map { ItemSuggestionEntity(entry: $0) }
      let chosen = try await $suggestedItem.requestDisambiguation(among: entities, dialog: "Which item did you mean?")
      if let entry = corpus.first(where: { $0.id == chosen.id }) {
        return .catalog(entry)
      }
      return .catalog(
        IntentTypeaheadEntry(id: chosen.id, name: chosen.name, aliases: chosen.aliases, upc: chosen.upc)
      )
    case .newItem:
      return .newItem(name: spokenName)
    }
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
    itemId: String?,
    mode: CategoryMode
  ) async throws -> CategoryEntity? {
    if mode == .promptIfNeeded, let category {
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

    if mode == .hintOrUncategorized {
      return CategoryEntity.uncategorized(listId: list.id)
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
