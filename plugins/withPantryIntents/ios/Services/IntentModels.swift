import Foundation

struct IntentSession: Codable {
  let accessToken: String
  let email: String
  let apiBaseUrl: String
  let shopperId: String?
}

struct IntentCategorySnapshot: Codable {
  let id: String
  let name: String
}

struct IntentListSnapshot: Codable {
  let id: String
  let name: String
  let groupId: String?
  let ownerId: String?
  let categories: [IntentCategorySnapshot]
}

struct IntentLocationSnapshot: Codable, Equatable {
  let id: String
  let name: String
}

struct IntentRosterItem: Codable, Equatable {
  let id: String
  let name: String
  let categoryId: String?
  let categoryName: String?
}

struct IntentTypeaheadEntry: Codable, Equatable {
  let id: String
  let name: String
  let aliases: [String]
  let upc: String?
}

struct IntentCache: Codable {
  var lists: [IntentListSnapshot]
  var rosters: [String: [IntentRosterItem]]
  var typeaheadCorpus: [IntentTypeaheadEntry]
  var lastUsedListId: String?
  var locations: [IntentLocationSnapshot]
  var selectedLocationId: String?
  /// Epoch milliseconds when `selectedLocationId` was last set.
  var selectedLocationAt: Double?

  init(
    lists: [IntentListSnapshot],
    rosters: [String: [IntentRosterItem]],
    typeaheadCorpus: [IntentTypeaheadEntry],
    lastUsedListId: String?,
    locations: [IntentLocationSnapshot] = [],
    selectedLocationId: String? = nil,
    selectedLocationAt: Double? = nil
  ) {
    self.lists = lists
    self.rosters = rosters
    self.typeaheadCorpus = typeaheadCorpus
    self.lastUsedListId = lastUsedListId
    self.locations = locations
    self.selectedLocationId = selectedLocationId
    self.selectedLocationAt = selectedLocationAt
  }

  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    lists = try container.decode([IntentListSnapshot].self, forKey: .lists)
    rosters = try container.decode([String: [IntentRosterItem]].self, forKey: .rosters)
    typeaheadCorpus = try container.decode([IntentTypeaheadEntry].self, forKey: .typeaheadCorpus)
    lastUsedListId = try container.decodeIfPresent(String.self, forKey: .lastUsedListId)
    locations = try container.decodeIfPresent([IntentLocationSnapshot].self, forKey: .locations) ?? []
    selectedLocationId = try container.decodeIfPresent(String.self, forKey: .selectedLocationId)
    selectedLocationAt = try container.decodeIfPresent(Double.self, forKey: .selectedLocationAt)
  }
}

struct CatalogItem: Codable, Equatable {
  let id: String
  let name: String
  let upc: String?
}

enum LocationFreshness {
  static let recentWindowSeconds: TimeInterval = 30 * 60

  /// Returns the selected location id when it was chosen within the recent window.
  static func recentLocationId(
    selectedId: String?,
    selectedAtMs: Double?,
    now: Date = Date()
  ) -> String? {
    guard let selectedId, !selectedId.isEmpty, let selectedAtMs else { return nil }
    let ageSeconds = now.timeIntervalSince1970 - (selectedAtMs / 1000.0)
    guard ageSeconds >= 0, ageSeconds <= recentWindowSeconds else { return nil }
    return selectedId
  }
}

enum PantryIntentsNotifications {
  static let cacheDidChange = Notification.Name("com.askewsoft.pantryplus.intents.cacheDidChange")
}
