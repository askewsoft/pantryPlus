import Foundation
import Security

enum SharedIntentStore {
  private static let decoder: JSONDecoder = {
    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .useDefaultKeys
    return decoder
  }()

  private static let encoder: JSONEncoder = {
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys]
    return encoder
  }()

  static func loadSession() -> IntentSession? {
    guard let data = readKeychain() else { return nil }
    return try? decoder.decode(IntentSession.self, from: data)
  }

  static func saveSession(_ session: IntentSession) {
    guard let data = try? encoder.encode(session) else { return }
    writeKeychain(data)
  }

  static func clearSession() {
    deleteKeychain()
  }

  static func loadCache() -> IntentCache {
    guard
      let url = cacheURL(),
      let data = try? Data(contentsOf: url),
      let cache = try? decoder.decode(IntentCache.self, from: data)
    else {
      return IntentCache(
        lists: [],
        rosters: [:],
        typeaheadCorpus: [],
        lastUsedListId: nil,
        locations: [],
        selectedLocationId: nil,
        selectedLocationAt: nil
      )
    }
    return cache
  }

  static func saveCache(_ cache: IntentCache) {
    guard let url = cacheURL(), let data = try? encoder.encode(cache) else { return }
    try? FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
    try? data.write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    NotificationCenter.default.post(name: PantryIntentsNotifications.cacheDidChange, object: nil)
  }

  static func saveCache(jsonData: Data) {
    guard let url = cacheURL() else { return }
    try? FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
    try? jsonData.write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    NotificationCenter.default.post(name: PantryIntentsNotifications.cacheDidChange, object: nil)
  }

  static func clearCache() {
    guard let url = cacheURL() else { return }
    try? FileManager.default.removeItem(at: url)
    NotificationCenter.default.post(name: PantryIntentsNotifications.cacheDidChange, object: nil)
  }

  static func loadLists() -> [IntentListSnapshot] {
    loadCache().lists
  }

  static func loadLastUsedListId() -> String? {
    loadCache().lastUsedListId
  }

  static func loadRoster(listId: String) -> [IntentRosterItem] {
    loadCache().rosters[listId] ?? []
  }

  static func loadTypeaheadCorpus() -> [IntentTypeaheadEntry] {
    loadCache().typeaheadCorpus
  }

  static func loadLocations() -> [IntentLocationSnapshot] {
    loadCache().locations
  }

  static func loadSelectedLocation() -> (id: String?, atMs: Double?) {
    let cache = loadCache()
    return (cache.selectedLocationId, cache.selectedLocationAt)
  }

  static func replaceRoster(listId: String, items: [IntentRosterItem]) {
    var cache = loadCache()
    cache.rosters[listId] = items
    saveCache(cache)
  }

  static func upsertRosterItem(listId: String, item: IntentRosterItem) {
    var cache = loadCache()
    var roster = cache.rosters[listId] ?? []
    roster.removeAll { $0.id.compare(item.id, options: .caseInsensitive) == .orderedSame }
    roster.append(item)
    cache.rosters[listId] = roster
    saveCache(cache)
  }

  static func removeRosterItem(listId: String, itemId: String) {
    var cache = loadCache()
    var roster = cache.rosters[listId] ?? []
    roster.removeAll { $0.id.compare(itemId, options: .caseInsensitive) == .orderedSame }
    cache.rosters[listId] = roster
    saveCache(cache)
  }

  static func replaceTypeaheadCorpus(_ corpus: [IntentTypeaheadEntry]) {
    var cache = loadCache()
    cache.typeaheadCorpus = corpus
    saveCache(cache)
  }

  private static func cacheURL() -> URL? {
    FileManager.default
      .containerURL(forSecurityApplicationGroupIdentifier: PantryIntentsConfig.appGroupId)?
      .appendingPathComponent(PantryIntentsConfig.cacheFileName)
  }

  private static func baseKeychainQuery(includeAccessGroup: Bool) -> [String: Any] {
    var query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: PantryIntentsConfig.keychainService,
      kSecAttrAccount as String: PantryIntentsConfig.keychainAccount,
    ]
    if includeAccessGroup, !PantryIntentsConfig.keychainAccessGroup.isEmpty {
      query[kSecAttrAccessGroup as String] = PantryIntentsConfig.keychainAccessGroup
    }
    return query
  }

  private static func readKeychain() -> Data? {
    for includeAccessGroup in [true, false] {
      if let data = readKeychain(includeAccessGroup: includeAccessGroup) {
        return data
      }
    }
    return nil
  }

  private static func readKeychain(includeAccessGroup: Bool) -> Data? {
    var query = baseKeychainQuery(includeAccessGroup: includeAccessGroup)
    query[kSecReturnData as String] = true
    query[kSecMatchLimit as String] = kSecMatchLimitOne
    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    guard status == errSecSuccess else { return nil }
    return item as? Data
  }

  private static func writeKeychain(_ data: Data) {
    deleteKeychain()
    var query = baseKeychainQuery(includeAccessGroup: true)
    query[kSecValueData as String] = data
    query[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    let status = SecItemAdd(query as CFDictionary, nil)
    if status == errSecSuccess { return }

    var fallback = baseKeychainQuery(includeAccessGroup: false)
    fallback[kSecValueData as String] = data
    fallback[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    SecItemAdd(fallback as CFDictionary, nil)
  }

  private static func deleteKeychain() {
    SecItemDelete(baseKeychainQuery(includeAccessGroup: true) as CFDictionary)
    SecItemDelete(baseKeychainQuery(includeAccessGroup: false) as CFDictionary)
  }
}

extension TypeaheadMatcher {
  /// First household match wins. `""` means uncategorized; `nil` means not found.
  static func findCategoryId(itemId: String, currentList: IntentListSnapshot) -> String? {
    findCategoryId(
      itemId: itemId,
      currentList: currentList,
      allLists: SharedIntentStore.loadLists(),
      rosters: SharedIntentStore.loadCache().rosters
    )
  }
}
