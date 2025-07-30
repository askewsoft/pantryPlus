module.exports = {
  // Percy configuration for pantryPlus React Native app
  version: '1.0.0',
  
  // Default viewport sizes for mobile testing
  viewportWidths: [375, 414], // iPhone SE, iPhone 12 Pro Max
  
  // Default device pixel ratios
  devicePixelRatios: [2, 3], // Standard and high-DPI displays
  
  // Minimum height for screenshots
  minHeight: 667, // iPhone SE height
  
  // Maximum height for screenshots  
  maxHeight: 896, // iPhone 12 Pro Max height
  
  // Screenshot naming convention
  naming: {
    prefix: 'pantryPlus',
    suffix: 'mobile'
  },
  
  // Ignore common dynamic elements that shouldn't affect visual testing
  ignore: [
    // Timestamps and dates
    '[data-testid="timestamp"]',
    '[data-testid="date"]',
    '[data-testid="time"]',
    
    // Loading states
    '[data-testid="loading"]',
    '[data-testid="skeleton"]',
    '[data-testid="spinner"]',
    
    // User-specific content
    '[data-testid="user-avatar"]',
    '[data-testid="user-name"]',
    '[data-testid="user-email"]',
    
    // Dynamic content from database
    '[data-testid="list-name"]',
    '[data-testid="category-name"]',
    '[data-testid="item-name"]',
    '[data-testid="item-quantity"]',
    '[data-testid="item-price"]',
    '[data-testid="location-name"]',
    '[data-testid="group-name"]',
    '[data-testid="member-name"]',
    
    // Dynamic IDs and counts
    '[data-testid*="dynamic-id"]',
    '[data-testid*="count"]',
    '[data-testid*="total"]',
    
    // Network-dependent content
    '[data-testid="last-updated"]',
    '[data-testid="sync-status"]'
  ],
  
  // Custom CSS for consistent rendering
  customCSS: `
    /* Ensure consistent font rendering */
    * {
      font-smooth: never;
      -webkit-font-smoothing: none;
    }
    
    /* Hide any development-only elements */
    [data-testid="dev-only"] {
      display: none !important;
    }
  `
}; 