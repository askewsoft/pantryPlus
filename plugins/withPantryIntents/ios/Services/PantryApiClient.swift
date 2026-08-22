import Foundation

enum PantryApiError: Error {
  case needsAuthentication
  case invalidURL
  case httpStatus(Int, String)
  case decoding
}

struct PantryApiClient {
  static let shared = PantryApiClient()

  func createItem(id: String, name: String, upc: String?) async throws -> CatalogItem {
    let body: [String: String] = [
      "id": id.lowercased(),
      "name": name,
      "upc": upc ?? "",
    ]
    return try await send(
      method: "POST",
      path: "items",
      body: body,
      decode: CatalogItem.self
    )
  }

  func addItemToList(listId: String, itemId: String) async throws {
    try await sendVoid(
      method: "POST",
      path: "lists/\(listId.lowercased())/items/\(itemId.lowercased())"
    )
  }

  func addItemToCategory(categoryId: String, itemId: String) async throws {
    try await sendVoid(
      method: "POST",
      path: "categories/\(categoryId.lowercased())/items/\(itemId.lowercased())"
    )
  }

  /// Unlink from category only; item remains on the shopping list.
  func unlinkItemFromCategory(categoryId: String, itemId: String) async throws {
    try await sendVoid(
      method: "DELETE",
      path: "categories/\(categoryId.lowercased())/items/\(itemId.lowercased())/link"
    )
  }

  func removeItemFromList(listId: String, itemId: String) async throws {
    try await sendVoid(
      method: "DELETE",
      path: "lists/\(listId.lowercased())/items/\(itemId.lowercased())"
    )
  }

  /// Records a purchase at `locationId` and removes the item from the list (server-side).
  func purchaseItem(listId: String, itemId: String, locationId: String) async throws {
    try await sendVoid(
      method: "POST",
      path: "lists/\(listId.lowercased())/items/\(itemId.lowercased())/purchase",
      locationId: locationId
    )
  }

  func isOnList(listId: String, itemId: String) async throws -> Bool {
    struct OnListResponse: Codable { let onList: Bool }
    let response: OnListResponse = try await send(
      method: "GET",
      path: "lists/\(listId.lowercased())/items/\(itemId.lowercased())/onList",
      decode: OnListResponse.self
    )
    return response.onList
  }

  func getListItems(listId: String) async throws -> [CatalogItem] {
    try await send(
      method: "GET",
      path: "lists/\(listId.lowercased())/items",
      decode: [CatalogItem].self
    )
  }

  func getCategoryItems(categoryId: String) async throws -> [CatalogItem] {
    try await send(
      method: "GET",
      path: "categories/\(categoryId.lowercased())/items",
      decode: [CatalogItem].self
    )
  }

  func getPurchasedItems(shopperId: String, lookBackDays: Int = 365, cohortId: String?) async throws -> [CatalogItem] {
    var query = "lookBackDays=\(lookBackDays)"
    if let cohortId, !cohortId.isEmpty {
      query += "&cohortId=\(cohortId.lowercased())"
    }
    return try await send(
      method: "GET",
      path: "shoppers/\(shopperId.lowercased())/items?\(query)",
      decode: [CatalogItem].self
    )
  }

  func refreshRoster(list: IntentListSnapshot) async throws -> [IntentRosterItem] {
    var roster: [IntentRosterItem] = []
    let uncategorized = (try? await getListItems(listId: list.id)) ?? []
    for item in uncategorized {
      roster.append(IntentRosterItem(id: item.id, name: item.name, categoryId: nil, categoryName: nil))
    }
    for category in list.categories {
      let items = (try? await getCategoryItems(categoryId: category.id)) ?? []
      for item in items {
        roster.removeAll { $0.id.compare(item.id, options: .caseInsensitive) == .orderedSame }
        roster.append(
          IntentRosterItem(
            id: item.id,
            name: item.name,
            categoryId: category.id,
            categoryName: category.name
          )
        )
      }
    }
    SharedIntentStore.replaceRoster(listId: list.id, items: roster)
    return roster
  }

  private func makeRequest(
    method: String,
    path: String,
    body: Data? = nil,
    locationId: String? = nil
  ) throws -> URLRequest {
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
    if let locationId, !locationId.isEmpty {
      request.setValue(locationId.lowercased(), forHTTPHeaderField: "X-Auth-Location")
    }
    request.setValue("application/json", forHTTPHeaderField: "Accept")
    if let body {
      request.setValue("application/json", forHTTPHeaderField: "Content-Type")
      request.httpBody = body
    }
    return request
  }

  private func send<T: Decodable>(
    method: String,
    path: String,
    body: Encodable? = nil,
    locationId: String? = nil,
    decode: T.Type
  ) async throws -> T {
    let data = try await sendData(method: method, path: path, body: body, locationId: locationId)
    do {
      return try JSONDecoder().decode(T.self, from: data)
    } catch {
      throw PantryApiError.decoding
    }
  }

  private func sendVoid(
    method: String,
    path: String,
    body: Encodable? = nil,
    locationId: String? = nil
  ) async throws {
    _ = try await sendData(method: method, path: path, body: body, locationId: locationId)
  }

  private func sendData(
    method: String,
    path: String,
    body: Encodable?,
    locationId: String? = nil
  ) async throws -> Data {
    var payload: Data?
    if let body {
      payload = try JSONEncoder().encode(AnyEncodable(body))
    }
    let request = try makeRequest(method: method, path: path, body: payload, locationId: locationId)
    let (data, response) = try await URLSession.shared.data(for: request)
    let status = (response as? HTTPURLResponse)?.statusCode ?? 0
    guard (200...299).contains(status) else {
      let message = String(data: data, encoding: .utf8) ?? "Request failed"
      throw PantryApiError.httpStatus(status, message)
    }
    return data
  }
}

private struct AnyEncodable: Encodable {
  private let encodeClosure: (Encoder) throws -> Void

  init(_ value: Encodable) {
    encodeClosure = { encoder in
      try value.encode(to: encoder)
    }
  }

  func encode(to encoder: Encoder) throws {
    try encodeClosure(encoder)
  }
}
