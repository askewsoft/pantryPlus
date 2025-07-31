module.exports = {
  // Device configurations for testing
  devices: {
    'iPhone 14': {
      width: 393,
      height: 852,
      devicePixelRatio: 3,
    },
    'iPhone 14 Pro': {
      width: 393,
      height: 852,
      devicePixelRatio: 3,
    },
    'iPhone 14 Pro Max': {
      width: 430,
      height: 932,
      devicePixelRatio: 3,
    },
    'iPhone 15': {
      width: 393,
      height: 852,
      devicePixelRatio: 3,
    },
    'iPhone 15 Pro': {
      width: 393,
      height: 852,
      devicePixelRatio: 3,
    },
    'iPhone 15 Pro Max': {
      width: 430,
      height: 932,
      devicePixelRatio: 3,
    },
    'iPhone 16': {
      width: 393,
      height: 852,
      devicePixelRatio: 3,
    },
    'iPhone 16 Pro': {
      width: 393,
      height: 852,
      devicePixelRatio: 3,
    },
    'iPhone 16 Pro Max': {
      width: 430,
      height: 932,
      devicePixelRatio: 3,
    },
  },
  
  // Default device to use
  defaultDevice: 'iPhone 14',
  
  // Screenshots directory
  screenshotsDir: './screenshots',
  
  // Baseline directory for reference images
  baselineDir: './screenshots/baseline',
  
  // Output directory for test results
  outputDir: './screenshots/output',
  
  // Threshold for visual difference detection (0-1)
  threshold: 0.1,
  
  // Ignore elements with this testID during visual comparison
  ignoreElements: [
    'owl-ignore'
  ],
  
  // Test scenarios
  scenarios: [
    {
      name: 'Home Screen - My Lists',
      description: 'Main lists screen showing user\'s shopping lists',
      testID: 'home-screen',
      device: 'iPhone 14',
    },
    {
      name: 'Shopping List - Empty State',
      description: 'Shopping list with no items',
      testID: 'shopping-list-empty',
      device: 'iPhone 14',
    },
    {
      name: 'Shopping List - With Items',
      description: 'Shopping list containing items',
      testID: 'shopping-list-items',
      device: 'iPhone 14',
    },
    {
      name: 'My Groups Screen',
      description: 'Groups tab showing user\'s groups',
      testID: 'groups-screen',
      device: 'iPhone 14',
    },
    {
      name: 'Group Invites Screen',
      description: 'Screen showing pending group invites',
      testID: 'invites-screen',
      device: 'iPhone 14',
    },
    {
      name: 'My Locations Screen',
      description: 'Locations tab showing saved locations',
      testID: 'locations-screen',
      device: 'iPhone 14',
    },
    {
      name: 'Settings Screen',
      description: 'Main settings screen',
      testID: 'settings-screen',
      device: 'iPhone 14',
    },
    {
      name: 'Profile Screen',
      description: 'User profile management screen',
      testID: 'profile-screen',
      device: 'iPhone 14',
    },
    {
      name: 'Permissions Screen',
      description: 'App permissions screen',
      testID: 'permissions-screen',
      device: 'iPhone 14',
    },
    {
      name: 'About Screen',
      description: 'App information screen',
      testID: 'about-screen',
      device: 'iPhone 14',
    },
    {
      name: 'Login Screen',
      description: 'User authentication login screen',
      testID: 'login-screen',
      device: 'iPhone 14',
    },
    {
      name: 'Sign Up Screen',
      description: 'User registration screen',
      testID: 'signup-screen',
      device: 'iPhone 14',
    },
  ],
}; 