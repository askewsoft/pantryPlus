import XCTest
@testable import PantryIntentsLogic

final class SpokenItemResolutionTests: XCTestCase {
  private let milk = IntentTypeaheadEntry(id: "milk", name: "Milk", aliases: ["2% milk"], upc: nil)
  private let almond = IntentTypeaheadEntry(id: "almond", name: "Almond Milk", aliases: [], upc: nil)
  private let bread = IntentTypeaheadEntry(id: "bread", name: "Light Wheat Bread", aliases: [], upc: nil)
  private let oat = IntentTypeaheadEntry(id: "oat", name: "Oat Milk", aliases: [], upc: nil)

  private var corpus: [IntentTypeaheadEntry] {
    [milk, almond, bread, oat]
  }

  func testExactNameDoesNotDisambiguate() {
    let result = TypeaheadMatcher.resolveSpokenItem(corpus, rawName: "milk")
    XCTAssertEqual(result, .catalog(milk))
  }

  func testExactAliasDoesNotDisambiguate() {
    let result = TypeaheadMatcher.resolveSpokenItem(corpus, rawName: "2% milk")
    XCTAssertEqual(result, .catalog(milk))
  }

  func testUniquePrefixMatch() {
    let result = TypeaheadMatcher.resolveSpokenItem(corpus, rawName: "light wheat")
    XCTAssertEqual(result, .catalog(bread))
  }

  func testAmbiguousNearDuplicatesNeedDisambiguation() {
    let nearDuplicates = [almond, oat]
    let result = TypeaheadMatcher.resolveSpokenItem(nearDuplicates, rawName: "milk")
    guard case .ambiguous(let entries) = result else {
      return XCTFail("Expected disambiguation for 'milk' across Almond Milk / Oat Milk, got \(result)")
    }
    XCTAssertEqual(Set(entries.map(\.id)), ["almond", "oat"])
  }

  func testUnknownNameIsNewItem() {
    let result = TypeaheadMatcher.resolveSpokenItem(corpus, rawName: "unicorn flour")
    XCTAssertEqual(result, .newItem)
  }
}

final class InformAndSkipTests: XCTestCase {
  private let roster: [IntentRosterItem] = [
    IntentRosterItem(id: "milk", name: "Milk", categoryId: "dairy", categoryName: "Dairy"),
    IntentRosterItem(id: "bread", name: "Light Wheat Bread", categoryId: nil, categoryName: nil),
  ]

  func testExactRosterMatchIsOnList() {
    let hit = TypeaheadMatcher.matchRoster(roster, rawName: "milk")
    XCTAssertEqual(hit?.id, "milk")
    XCTAssertEqual(hit?.categoryName, "Dairy")
  }

  func testUnknownItemIsNotOnList() {
    XCTAssertNil(TypeaheadMatcher.matchRoster(roster, rawName: "ground beef"))
  }

  func testFuzzyUniqueRosterMatchIsOnList() {
    let hit = TypeaheadMatcher.matchRoster(roster, rawName: "light wheat")
    XCTAssertEqual(hit?.id, "bread")
  }
}

final class HouseholdCategoryHintTests: XCTestCase {
  func testFirstHouseholdListWins() {
    let grocery = IntentListSnapshot(
      id: "grocery",
      name: "Grocery",
      groupId: "house",
      ownerId: "me",
      categories: [IntentCategorySnapshot(id: "produce", name: "Produce")]
    )
    let costco = IntentListSnapshot(
      id: "costco",
      name: "Costco",
      groupId: "house",
      ownerId: "me",
      categories: [IntentCategorySnapshot(id: "bulk", name: "Bulk")]
    )
    let rosters: [String: [IntentRosterItem]] = [
      "grocery": [
        IntentRosterItem(id: "milk", name: "Milk", categoryId: "produce", categoryName: "Produce"),
      ],
      "costco": [
        IntentRosterItem(id: "milk", name: "Milk", categoryId: "bulk", categoryName: "Bulk"),
      ],
    ]

    let hinted = TypeaheadMatcher.findCategoryId(
      itemId: "milk",
      currentList: grocery,
      allLists: [grocery, costco],
      rosters: rosters
    )
    XCTAssertEqual(hinted, "produce")
  }

  func testUngroupedCohortUsesOwnerId() {
    let grocery = IntentListSnapshot(id: "g", name: "G", groupId: nil, ownerId: "me", categories: [])
    let other = IntentListSnapshot(id: "o", name: "O", groupId: nil, ownerId: "me", categories: [])
    let stranger = IntentListSnapshot(id: "s", name: "S", groupId: nil, ownerId: "them", categories: [])
    let household = TypeaheadMatcher.householdLists(current: grocery, all: [grocery, other, stranger])
    XCTAssertEqual(household.map(\.id), ["g", "o"])
  }
}
