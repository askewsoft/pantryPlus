#!/usr/bin/env node

/**
 * Screen Discovery Script for Percy Configuration
 * 
 * This script analyzes the codebase to discover screens and components
 * that should be included in visual testing. It can be used with AI agents
 * to automatically update the percy-config.json file.
 */

const fs = require('fs');
const path = require('path');

// Screen discovery patterns
const SCREEN_PATTERNS = {
  // Navigation screens
  navigation: {
    pattern: /Screen\s+name="([^"]+)"/g,
    description: 'Navigation screen'
  },
  // Component files
  components: {
    pattern: /export\s+default\s+(\w+)/g,
    description: 'React component'
  },
  // Screen files in screens directory
  screenFiles: {
    pattern: /\.tsx?$/,
    description: 'Screen file'
  }
};

// Discover screens from source code
function discoverScreens() {
  const screens = [];
  const srcPath = path.join(__dirname, '../src');
  
  // Discover navigation screens
  const navigationFiles = [
    'src/screens/AppWrapper.tsx',
    'src/screens/ListsNavigation/index.tsx',
    'src/screens/GroupsNavigation/index.tsx',
    'src/screens/LocationsNavigation/index.tsx',
    'src/screens/SettingsNavigation/index.tsx'
  ];
  
  navigationFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.matchAll(SCREEN_PATTERNS.navigation.pattern);
      
      for (const match of matches) {
        const screenName = match[1];
        screens.push({
          id: screenName.toLowerCase().replace(/\s+/g, '-'),
          name: `${screenName} Screen`,
          description: `${screenName} navigation screen`,
          prompt: `Navigate to the ${screenName} screen`,
          category: 'navigation',
          source: filePath
        });
      }
    }
  });
  
  // Discover screen files
  const screensDir = path.join(srcPath, 'screens');
  if (fs.existsSync(screensDir)) {
    discoverScreenFiles(screensDir, screens);
  }
  
  return screens;
}

// Recursively discover screen files
function discoverScreenFiles(dir, screens, category = 'screens') {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Check for index files in subdirectories
      const indexPath = path.join(itemPath, 'index.tsx');
      if (fs.existsSync(indexPath)) {
        const screenName = item.charAt(0).toUpperCase() + item.slice(1);
        screens.push({
          id: item.toLowerCase().replace(/\s+/g, '-'),
          name: `${screenName} Screen`,
          description: `${screenName} screen component`,
          prompt: `Navigate to the ${screenName} screen`,
          category: category,
          source: indexPath
        });
      }
      
      // Recursively check subdirectories
      discoverScreenFiles(itemPath, screens, item);
    } else if (item.match(SCREEN_PATTERNS.screenFiles.pattern) && item !== 'index.tsx') {
      // Individual screen files
      const screenName = item.replace(/\.(tsx?|jsx?)$/, '').replace(/([A-Z])/g, ' $1').trim();
      screens.push({
        id: screenName.toLowerCase().replace(/\s+/g, '-'),
        name: `${screenName} Screen`,
        description: `${screenName} screen component`,
        prompt: `Navigate to the ${screenName} screen`,
        category: category,
        source: itemPath
      });
    }
  });
}

// Generate configuration template
function generateConfigTemplate(screens) {
  const config = {
    screens: screens.map(screen => ({
      id: screen.id,
      name: screen.name,
      description: screen.description,
      prompt: screen.prompt,
      category: screen.category
    })),
    deviceSpecs: {
      "iPhone SE": {
        "width": 375,
        "height": 667,
        "devicePixelRatio": 2
      },
      "iPhone 12": {
        "width": 390,
        "height": 844,
        "devicePixelRatio": 3
      },
      "iPhone 12 Pro Max": {
        "width": 428,
        "height": 926,
        "devicePixelRatio": 3
      },
      "iPhone 14": {
        "width": 390,
        "height": 844,
        "devicePixelRatio": 3
      },
      "iPhone 14 Pro Max": {
        "width": 430,
        "height": 932,
        "devicePixelRatio": 3
      },
      "iPhone 15": {
        "width": 393,
        "height": 852,
        "devicePixelRatio": 3
      },
      "iPhone 15 Pro Max": {
        "width": 430,
        "height": 932,
        "devicePixelRatio": 3
      }
    },
    defaultDevice: "iPhone 14",
    percyDashboardUrl: "https://percy.io/your-project-url"
  };
  
  return config;
}

// Update configuration file
function updateConfigFile(screens) {
  const configPath = path.join(__dirname, '../percy-config.json');
  const config = generateConfigTemplate(screens);
  
  // Read existing config to preserve customizations
  let existingConfig = {};
  if (fs.existsSync(configPath)) {
    existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  
  // Merge with existing config, preserving customizations
  const mergedConfig = {
    ...config,
    screens: config.screens.map(newScreen => {
      const existingScreen = existingConfig.screens?.find(s => s.id === newScreen.id);
      return existingScreen ? { ...newScreen, ...existingScreen } : newScreen;
    }),
    deviceSpecs: { ...config.deviceSpecs, ...existingConfig.deviceSpecs },
    defaultDevice: existingConfig.defaultDevice || config.defaultDevice,
    percyDashboardUrl: existingConfig.percyDashboardUrl || config.percyDashboardUrl
  };
  
  // Write updated config
  fs.writeFileSync(configPath, JSON.stringify(mergedConfig, null, 2));
  console.log(`✅ Updated ${configPath} with ${screens.length} discovered screens`);
}

// Main function
function main() {
  console.log('🔍 Discovering screens in codebase...');
  
  const screens = discoverScreens();
  
  console.log(`📋 Found ${screens.length} screens:`);
  screens.forEach(screen => {
    console.log(`   - ${screen.name} (${screen.category})`);
  });
  
  if (screens.length > 0) {
    updateConfigFile(screens);
  } else {
    console.log('❌ No screens discovered');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { discoverScreens, generateConfigTemplate, updateConfigFile }; 