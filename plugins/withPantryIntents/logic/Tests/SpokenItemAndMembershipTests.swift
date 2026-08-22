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

final class SpokenFollowUpTests: XCTestCase {
  func testStopPhrases() {
    XCTAssertTrue(SpokenFollowUp.isStopPhrase("all done"))
    XCTAssertTrue(SpokenFollowUp.isStopPhrase("That's All"))
    XCTAssertTrue(SpokenFollowUp.isStopPhrase("nothing else"))
    XCTAssertTrue(SpokenFollowUp.isStopPhrase("no"))
    XCTAssertTrue(SpokenFollowUp.isStopPhrase("stop"))
    XCTAssertTrue(SpokenFollowUp.isStopPhrase("  "))
    XCTAssertTrue(SpokenFollowUp.isStopPhrase("that's all for now"))
  }

  func testItemNamesAreNotStopPhrases() {
    XCTAssertFalse(SpokenFollowUp.isStopPhrase("eggs"))
    XCTAssertFalse(SpokenFollowUp.isStopPhrase("ground beef"))
    XCTAssertFalse(SpokenFollowUp.isStopPhrase("notebook"))
  }

  func testFormatAddedSummary() {
    XCTAssertEqual(
      SpokenFollowUp.formatAddedSummary(itemNames: ["bread"], listName: "Grocery"),
      "Added bread to Grocery. All set."
    )
    XCTAssertEqual(
      SpokenFollowUp.formatAddedSummary(itemNames: ["bread", "eggs"], listName: "Grocery"),
      "Added bread and eggs to Grocery. All set."
    )
    XCTAssertEqual(
      SpokenFollowUp.formatAddedSummary(itemNames: ["bread", "eggs", "ground beef"], listName: "Grocery"),
      "Added bread, eggs, and ground beef to Grocery. All set."
    )
  }
}

final class TypeaheadCorpusCanonicalTests: XCTestCase {
  func testFirstSeenNameIsTitleNotLongestAlias() {
    let corpus = TypeaheadMatcher.buildCorpus(items: [
      CatalogItem(id: "milk", name: "Milk", upc: nil),
      CatalogItem(id: "milk", name: "1 milk", upc: nil),
    ])
    XCTAssertEqual(corpus.count, 1)
    XCTAssertEqual(corpus[0].name, "Milk")
    XCTAssertEqual(corpus[0].aliases, ["1 milk"])
  }

  func testPreferredListNameOverridesFirstSeen() {
    let corpus = TypeaheadMatcher.buildCorpus(
      items: [
        CatalogItem(id: "milk", name: "Milk", upc: nil),
        CatalogItem(id: "milk", name: "1 milk", upc: nil),
      ],
      preferredNames: [(id: "milk", name: "Whole Milk")]
    )
    XCTAssertEqual(corpus[0].name, "Whole Milk")
    XCTAssertTrue(corpus[0].aliases.contains("Milk"))
    XCTAssertTrue(corpus[0].aliases.contains("1 milk"))
  }

  func testOldPurchaseNameStillMatchesSearch() {
    let corpus = TypeaheadMatcher.buildCorpus(items: [
      CatalogItem(id: "milk", name: "Milk", upc: nil),
      CatalogItem(id: "milk", name: "1 milk", upc: nil),
    ])
    let ranked = TypeaheadMatcher.search(corpus, rawQuery: "1 mil")
    XCTAssertFalse(ranked.isEmpty)
    XCTAssertEqual(ranked[0].entry.name, "Milk")
    XCTAssertEqual(ranked[0].matchedAlias, "1 milk")
  }
}

final class LocationFreshnessTests: XCTestCase {
  func testRecentLocationWithinWindow() {
    let now = Date(timeIntervalSince1970: 1_700_000_000)
    let selectedAtMs = (now.timeIntervalSince1970 - 10 * 60) * 1000
    let id = LocationFreshness.recentLocationId(
      selectedId: "store-1",
      selectedAtMs: selectedAtMs,
      now: now
    )
    XCTAssertEqual(id, "store-1")
  }

  func testStaleLocationRequiresDisambiguation() {
    let now = Date(timeIntervalSince1970: 1_700_000_000)
    let selectedAtMs = (now.timeIntervalSince1970 - 31 * 60) * 1000
    let id = LocationFreshness.recentLocationId(
      selectedId: "store-1",
      selectedAtMs: selectedAtMs,
      now: now
    )
    XCTAssertNil(id)
  }

  func testMissingSelectionIsNotRecent() {
    XCTAssertNil(LocationFreshness.recentLocationId(selectedId: nil, selectedAtMs: Date().timeIntervalSince1970 * 1000))
    XCTAssertNil(LocationFreshness.recentLocationId(selectedId: "store-1", selectedAtMs: nil))
  }
}
