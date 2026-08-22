import AppIntents
import Foundation

struct StoreLocationEntity: AppEntity, Identifiable {
  static var typeDisplayRepresentation: TypeDisplayRepresentation = TypeDisplayRepresentation(name: "Store")
  static var defaultQuery = StoreLocationEntityQuery()

  var id: String
  var name: String

  init(id: String, name: String) {
    self.id = id
    self.name = name
  }

  init(snapshot: IntentLocationSnapshot) {
    self.init(id: snapshot.id, name: snapshot.name)
  }

  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(title: LocalizedStringResource(stringLiteral: name))
  }
}
