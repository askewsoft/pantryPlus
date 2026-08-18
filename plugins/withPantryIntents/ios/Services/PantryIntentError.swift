import Foundation

enum PantryIntentError: Error, CustomLocalizedStringResourceConvertible {
  case needsAuthentication
  case noLists
  case noItemName
  case apiFailure

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
    }
  }
}
