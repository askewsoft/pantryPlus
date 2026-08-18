import Foundation
import Security

enum PantryIntentsModuleConfig {
  static let appGroupId = "group.com.askewsoft.pantryplus"
  static let keychainAccessGroup = "QCCN3A2ZNS.group.com.askewsoft.pantryplus"
  static let keychainService = "com.askewsoft.pantryplus.intents"
  static let keychainAccount = "session"
  static let cacheFileName = "intent-cache.json"
}

enum IntentModuleStore {
  static func saveSession(accessToken: String, email: String, apiBaseUrl: String) throws {
    let payload: [String: String] = [
      "accessToken": accessToken,
      "email": email,
      "apiBaseUrl": apiBaseUrl,
    ]
    let data = try JSONSerialization.data(withJSONObject: payload, options: [.sortedKeys])
    writeKeychain(data)
  }

  static func clearSession() {
    SecItemDelete(baseKeychainQuery(includeAccessGroup: true) as CFDictionary)
    SecItemDelete(baseKeychainQuery(includeAccessGroup: false) as CFDictionary)
  }

  static func saveCache(json: String) throws {
    guard let url = cacheURL() else {
      throw IntentModuleStoreError.appGroupUnavailable
    }
    guard let data = json.data(using: .utf8) else {
      throw IntentModuleStoreError.invalidCacheJSON
    }
    try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
    try data.write(to: url, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
  }

  static func clearCache() {
    guard let url = cacheURL() else { return }
    try? FileManager.default.removeItem(at: url)
  }

  private static func cacheURL() -> URL? {
    FileManager.default
      .containerURL(forSecurityApplicationGroupIdentifier: PantryIntentsModuleConfig.appGroupId)?
      .appendingPathComponent(PantryIntentsModuleConfig.cacheFileName)
  }

  private static func baseKeychainQuery(includeAccessGroup: Bool) -> [String: Any] {
    var query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: PantryIntentsModuleConfig.keychainService,
      kSecAttrAccount as String: PantryIntentsModuleConfig.keychainAccount,
    ]
    if includeAccessGroup {
      query[kSecAttrAccessGroup as String] = PantryIntentsModuleConfig.keychainAccessGroup
    }
    return query
  }

  private static func writeKeychain(_ data: Data) {
    clearSession()
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
}

enum IntentModuleStoreError: Error {
  case appGroupUnavailable
  case invalidCacheJSON
}
