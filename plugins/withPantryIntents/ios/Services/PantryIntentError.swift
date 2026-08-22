import Foundation

enum PantryIntentError: Error, CustomLocalizedStringResourceConvertible {
  case needsAuthentication
  case noLists
  case noItemName
  case apiFailure
  case noLocations
  case itemNotOnList(itemName: String)

  var localizedStringResource: LocalizedStringResource {
    switch self {
    case .needsAuthentication:
      return "Open Pantry Plus to sign in."
    case .noLists:
      return "Open Pantry Plus to create a shopping list."
    case .noItemName:
      return "What item?"
    case .apiFailure:
      return "I couldn't update your list. Try again in a moment."
    case .noLocations:
      return "Open Pantry Plus and pick a store first."
    case .itemNotOnList(let itemName):
      return LocalizedStringResource(stringLiteral: "\(itemName) is not on that list.")
    }
  }
}
