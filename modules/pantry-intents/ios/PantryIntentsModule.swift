import ExpoModulesCore

public class PantryIntentsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PantryIntents")

    AsyncFunction("syncIntentSession") { (accessToken: String, email: String, apiBaseUrl: String) in
      try IntentModuleStore.saveSession(
        accessToken: accessToken,
        email: email,
        apiBaseUrl: apiBaseUrl
      )
    }

    AsyncFunction("clearIntentSession") {
      IntentModuleStore.clearSession()
      IntentModuleStore.clearCache()
    }

    AsyncFunction("syncIntentCache") { (json: String) in
      try IntentModuleStore.saveCache(json: json)
    }
  }
}
