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

struct IntentRosterItem: Codable {
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
}

struct CatalogItem: Codable, Equatable {
  let id: String
  let name: String
  let upc: String?
}

enum PantryIntentsNotifications {
  static let cacheDidChange = Notification.Name("com.askewsoft.pantryplus.intents.cacheDidChange")
}
