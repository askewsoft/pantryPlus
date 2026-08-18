import AppIntents
import Foundation

struct ItemSuggestionEntity: AppEntity, Identifiable {
  static var typeDisplayRepresentation: TypeDisplayRepresentation = TypeDisplayRepresentation(name: "Item")
  static var defaultQuery = ItemSuggestionEntityQuery()

  var id: String
  var name: String
  var aliases: [String]
  var upc: String?

  init(id: String, name: String, aliases: [String], upc: String?) {
    self.id = id
    self.name = name
    self.aliases = aliases
    self.upc = upc
  }

  init(entry: IntentTypeaheadEntry) {
    self.init(id: entry.id, name: entry.name, aliases: entry.aliases, upc: entry.upc)
  }

  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(title: LocalizedStringResource(stringLiteral: name))
  }
}
