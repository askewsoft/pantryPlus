/**
 * Constants for sync and polling behavior
 * These values control how frequently the app syncs with the server
 * and how long to guard against race conditions
 */
export default {
  // How often to poll the server for updates when the shopping list is open (in milliseconds)
  pollIntervalMs: 5000, // 5 seconds

  // How long to guard against recently removed items reappearing during sync (in milliseconds)
  // This prevents race conditions where a user purchases an item but a sync request
  // that was already in flight returns before the purchase completes
  recentlyRemovedItemMaxAgeMs: 30000, // 30 seconds
} as const;
