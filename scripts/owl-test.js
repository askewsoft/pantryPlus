#!/usr/bin/env node

/**
 * React Native Owl Visual Testing Script for pantryPlus
 * 
 * Interactive script that guides users through capturing screenshots
 * of all app screens for visual regression testing.
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load configuration
const config = require('../owl.config.js');

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Create directories if they don't exist
function ensureDirectories() {
  const dirs = [
    config.screenshotsDir,
    config.baselineDir,
    config.outputDir
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

// Capture screenshot using React Native Owl
function captureScreenshot(scenario) {
  try {
    console.log(`📸 Capturing screenshot: ${scenario.name}`);
    console.log(`📱 Device: ${scenario.device}`);
    console.log(`🏷️  Test ID: ${scenario.testID}`);
    
    // React Native Owl command
    const command = `npx react-native-owl capture --test-id ${scenario.testID} --device ${scenario.device} --output ${config.screenshotsDir}`;
    
    console.log(`🔧 Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ Screenshot captured successfully\n');
  } catch (error) {
    console.error('❌ Failed to capture screenshot:', error.message);
    console.log('💡 Make sure your app is running and the screen is visible');
  }
}

// Run visual regression tests
function runVisualTests() {
  try {
    console.log('🔍 Running visual regression tests...');
    
    const command = `npx react-native-owl test --baseline ${config.baselineDir} --output ${config.outputDir} --threshold ${config.threshold}`;
    
    console.log(`🔧 Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ Visual regression tests completed');
  } catch (error) {
    console.error('❌ Visual regression tests failed:', error.message);
  }
}

// Main function
async function main() {
  console.log('🦉 React Native Owl Visual Testing for pantryPlus\n');
  
  // Ensure directories exist
  ensureDirectories();
  
  // Confirm app is running
  console.log('📱 Make sure your app is running in the iOS Simulator');
  console.log('   Start with: npm start\n');
  
  const ready = await askQuestion('Is your app running and ready for testing? (y/N): ');
  if (ready.toLowerCase() !== 'y' && ready.toLowerCase() !== 'yes') {
    console.log('❌ Please start your app first and run this script again');
    process.exit(0);
  }
  
  console.log('\n🚀 Starting visual testing...\n');
  
  // Ask user what they want to do
  console.log('What would you like to do?');
  console.log('1. Capture baseline screenshots (for new screens or after UI changes)');
  console.log('2. Run visual regression tests (compare against baseline)');
  console.log('3. Both capture and test');
  
  const choice = await askQuestion('\nSelect option (1-3): ');
  
  if (choice === '1' || choice === '3') {
    // Capture screenshots for each configured screen
    for (const scenario of config.scenarios) {
      console.log(`\n📋 ${scenario.name}`);
      console.log(`   ${scenario.description}`);
      console.log(`   Test ID: ${scenario.testID}`);
      
      const proceed = await askQuestion('\nPress Enter when ready to capture this screen (or "skip" to skip): ');
      
      if (proceed.toLowerCase() === 'skip') {
        console.log('⏭️  Skipping this screen\n');
        continue;
      }
      
      captureScreenshot(scenario);
    }
  }
  
  if (choice === '2' || choice === '3') {
    // Run visual regression tests
    console.log('\n🔍 Running visual regression tests...\n');
    runVisualTests();
  }
  
  // Show completion message
  console.log('\n🎉 Visual testing complete!');
  console.log(`📁 Screenshots saved to: ${config.screenshotsDir}`);
  console.log(`📊 Test results saved to: ${config.outputDir}`);
  
  console.log('\n💡 Next Steps:');
  console.log('   - Review captured screenshots in the screenshots directory');
  console.log('   - Check test results for any visual differences');
  console.log('   - Update baseline images if changes are intentional');
  console.log('   - Add testID attributes to your components for better targeting');
  
  rl.close();
}

// Handle script interruption
process.on('SIGINT', () => {
  console.log('\n\n❌ Testing interrupted');
  rl.close();
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  });
}

module.exports = { captureScreenshot, runVisualTests }; 