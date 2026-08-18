// swift-tools-version: 5.9
import PackageDescription

let package = Package(
  name: "PantryIntentsLogic",
  platforms: [
    .macOS(.v13),
    .iOS(.v16),
  ],
  products: [
    .library(name: "PantryIntentsLogic", targets: ["PantryIntentsLogic"]),
  ],
  targets: [
    .target(
      name: "PantryIntentsLogic",
      path: "ios/Services",
      exclude: [
        "ListMembershipChecker.swift",
        "PantryApiClient.swift",
        "PantryIntentError.swift",
        "PantryIntentsConfig.swift",
        "PantryIntentsDiscovery.swift",
        "SharedIntentStore.swift",
      ],
      sources: [
        "IntentModels.swift",
        "TypeaheadMatcher.swift",
      ]
    ),
    .testTarget(
      name: "PantryIntentsLogicTests",
      dependencies: ["PantryIntentsLogic"],
      path: "logic/Tests"
    ),
  ]
)
