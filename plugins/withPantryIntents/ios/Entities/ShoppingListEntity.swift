import AppIntents
import CoreSpotlight
import Foundation

struct ShoppingListEntity: AppEntity, Identifiable {
  static var typeDisplayRepresentation: TypeDisplayRepresentation = TypeDisplayRepresentation(name: "Shopping List")
  static var defaultQuery = ListEntityQuery()

  var id: String
  var name: String
  var groupId: String?

  init(id: String, name: String, groupId: String?) {
    self.id = id
    self.name = name
    self.groupId = groupId
  }

  init(snapshot: IntentListSnapshot) {
    self.init(id: snapshot.id, name: snapshot.name, groupId: snapshot.groupId)
  }

  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(title: LocalizedStringResource(stringLiteral: name))
  }
}

@available(iOS 18.0, *)
extension ShoppingListEntity: IndexedEntity {
  var attributeSet: CSSearchableItemAttributeSet {
    let attributes = defaultAttributeSet
    attributes.displayName = name
    attributes.title = name
    attributes.kind = "Shopping List"
    return attributes
  }
}
