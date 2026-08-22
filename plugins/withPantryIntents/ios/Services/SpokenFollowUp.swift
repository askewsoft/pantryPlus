import Foundation

enum SpokenFollowUp {
  /// Max follow-up turns after the first successful add (guards against runaway sessions).
  static let maxFollowUpTurns = 10

  private static let stopPhrases: Set<String> = [
    "all done",
    "all set",
    "that's all",
    "thats all",
    "that is all",
    "nothing else",
    "nothing more",
    "no more",
    "no thanks",
    "no thank you",
    "i'm done",
    "im done",
    "i am done",
    "done",
    "stop",
    "cancel",
    "never mind",
    "nevermind",
    "no",
    "nope",
    "nah",
  ]

  static func isStopPhrase(_ raw: String) -> Bool {
    let normalized = TypeaheadMatcher.normalizeItemName(raw)
    guard !normalized.isEmpty else { return true }
    if stopPhrases.contains(normalized) { return true }
    // Soft matches: "that's all for now", "nothing else thanks"
    if normalized.hasPrefix("that's all") || normalized.hasPrefix("thats all") { return true }
    if normalized.hasPrefix("nothing else") || normalized.hasPrefix("nothing more") { return true }
    if normalized.hasPrefix("all done") || normalized.hasPrefix("all set") { return true }
    return false
  }

  /// e.g. "Added bread, eggs, and ground beef to Grocery. All set."
  static func formatAddedSummary(itemNames: [String], listName: String) -> String {
    let names = itemNames.map { TypeaheadMatcher.displayItemName($0) }.filter { !$0.isEmpty }
    guard !names.isEmpty else {
      return "All set."
    }
    let joined = joinNames(names)
    return "Added \(joined) to \(listName). All set."
  }

  static func joinNames(_ names: [String]) -> String {
    switch names.count {
    case 0:
      return ""
    case 1:
      return names[0]
    case 2:
      return "\(names[0]) and \(names[1])"
    default:
      let head = names.dropLast().joined(separator: ", ")
      return "\(head), and \(names[names.count - 1])"
    }
  }
}
