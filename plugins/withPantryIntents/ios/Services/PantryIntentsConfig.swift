import Foundation

/// Compile-time defaults; prebuild overwrites this file with team-id-specific values.
enum PantryIntentsConfig {
  static let appGroupId = "group.com.askewsoft.pantryplus"
  static let keychainAccessGroup = "QCCN3A2ZNS.group.com.askewsoft.pantryplus"
  static let keychainService = "com.askewsoft.pantryplus.intents"
  static let keychainAccount = "session"
  static let cacheFileName = "intent-cache.json"
}
