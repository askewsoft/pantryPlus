import Foundation

enum PantryApiError: Error {
  case needsAuthentication
  case invalidURL
  case notImplemented(String)
}

/// v2 REST client for App Intents. Endpoint helpers land in phase 5b.
struct PantryApiClient {
  func makeRequest(method: String, path: String, body: Data? = nil) throws -> URLRequest {
    guard let session = SharedIntentStore.loadSession() else {
      throw PantryApiError.needsAuthentication
    }

    let base = session.apiBaseUrl.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    let suffix = path.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    guard let url = URL(string: "\(base)/\(suffix)") else {
      throw PantryApiError.invalidURL
    }

    var request = URLRequest(url: url)
    request.httpMethod = method
    request.setValue("Bearer \(session.accessToken)", forHTTPHeaderField: "Authorization")
    request.setValue(session.email, forHTTPHeaderField: "X-Auth-User")
    request.setValue("application/json", forHTTPHeaderField: "Accept")
    if let body {
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.httpBody = body
    }
    return request
  }
}
