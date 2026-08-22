import AppIntents
import Foundation

/// Moves a list item to a category, or to no category (uncategorized).
struct MoveItemToCategoryIntent: AppIntent {
  static var title: LocalizedStringResource = "Move Item to Category"
  static var description = IntentDescription("Moves an item to a category on a Pantry Plus list, or removes its category")
  static var openAppWhenRun = false

  static var parameterSummary: some ParameterSummary {
    Summary("Move \(\.$itemName) on \(\.$list) to \(\.$category)")
  }

  @Parameter(title: "Item")
  var itemName: String

  @Parameter(title: "List")
  var list: ShoppingListEntity?

  @Parameter(title: "Category")
  var category: CategoryEntity?

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
    let target = try await resolveCategory(snapshot: snapshot, list: resolvedList)

    let targetCategoryId: String? = target.id == CategoryEntity.uncategorizedId ? nil : target.id
    let currentCategoryId = item.categoryId

    let alreadyThere: Bool = {
      switch (currentCategoryId, targetCategoryId) {
      case (nil, nil): return true
      case let (current?, target?) where current.compare(target, options: .caseInsensitive) == .orderedSame:
        return true
      default: return false
      }
    }()

    let displayName = item.name.isEmpty ? trimmed : item.name
    if alreadyThere {
      if let name = targetCategoryId == nil ? nil : target.name {
        return .result(dialog: IntentDialog(LocalizedStringResource(stringLiteral: "\(displayName) is already in \(name).")))
      }
      return .result(dialog: IntentDialog(LocalizedStringResource(stringLiteral: "\(displayName) is already uncategorized.")))
    }

    do {
      if let currentCategoryId, !currentCategoryId.isEmpty {
        try await PantryApiClient.shared.unlinkItemFromCategory(
          categoryId: currentCategoryId,
          itemId: item.id
        )
      }
      if let targetCategoryId {
        try await PantryApiClient.shared.addItemToCategory(
          categoryId: targetCategoryId,
          itemId: item.id
        )
      }
    } catch PantryApiError.needsAuthentication {
      throw PantryIntentError.needsAuthentication
    } catch {
      throw PantryIntentError.apiFailure
    }

    SharedIntentStore.upsertRosterItem(
      listId: resolvedList.id,
      item: IntentRosterItem(
        id: item.id,
        name: item.name.isEmpty ? displayName : item.name,
        categoryId: targetCategoryId,
        categoryName: targetCategoryId == nil ? nil : target.name
      )
    )

    if let targetCategoryId {
      let dialog = "Moved \(displayName) to \(target.name) on \(resolvedList.name)."
      return .result(dialog: IntentDialog(LocalizedStringResource(stringLiteral: dialog)))
    }
    let dialog = "Removed \(displayName) from its category on \(resolvedList.name)."
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

  private func resolveCategory(
    snapshot: IntentListSnapshot,
    list: ShoppingListEntity
  ) async throws -> CategoryEntity {
    if let category {
      if category.id == CategoryEntity.uncategorizedId {
        return CategoryEntity.uncategorized(listId: list.id)
      }
      return category
    }

    var options = snapshot.categories.map { CategoryEntity(id: $0.id, name: $0.name, listId: list.id) }
    options.insert(CategoryEntity.uncategorized(listId: list.id), at: 0)
    if options.count == 1 {
      return options[0]
    }
    return try await $category.requestDisambiguation(among: options, dialog: "Which category?")
  }
}
