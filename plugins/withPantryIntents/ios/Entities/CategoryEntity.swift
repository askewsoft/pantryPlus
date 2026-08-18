import AppIntents
import Foundation

struct CategoryEntity: AppEntity, Identifiable {
  static var typeDisplayRepresentation: TypeDisplayRepresentation = TypeDisplayRepresentation(name: "Category")
  static var defaultQuery = CategoryEntityQuery()

  var id: String
  var name: String
  var listId: String

  init(id: String, name: String, listId: String) {
    self.id = id
    self.name = name
    self.listId = listId
  }

  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(title: LocalizedStringResource(stringLiteral: name))
  }
}
