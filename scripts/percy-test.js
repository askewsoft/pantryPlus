#!/usr/bin/env node

/**
 * Percy Visual Testing Script for pantryPlus
 * 
 * Interactive script that guides users through capturing screenshots
 * of all app screens for visual regression testing.
 */

const { execSync } = require('child_process');
const readline = require('readline');
const { detectSimulator, getDeviceSpecs } = require('./detect-simulator');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Load configuration
const config = require('../percy-config.json');

// Execute Percy command
function runPercyCommand(command) {
  try {
    console.log(`📸 Capturing screenshot...`);
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Screenshot captured successfully\n');
  } catch (error) {
    console.error('❌ Failed to capture screenshot:', error.message);
    process.exit(1);
  }
}

// Capture screenshot with device specifications
function captureScreenshot(name, deviceSpecs) {
  const command = `percy screenshot --name "${name}" --width ${deviceSpecs.width} --height ${deviceSpecs.height}`;
  runPercyCommand(command);
}

// Ask user a question and return their response
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Main function
async function main() {
  console.log('🎯 Percy Visual Testing for pantryPlus\n');
  
  // Check if Percy token is set
  if (!process.env.PERCY_TOKEN) {
    console.error('❌ PERCY_TOKEN environment variable is not set');
    console.log('Please set your Percy token: export PERCY_TOKEN=your_token_here');
    process.exit(1);
  }
  
  // Detect device specifications
  console.log('🔍 Detecting iOS Simulator...');
  const detectedDevice = detectSimulator();
  let deviceSpecs;
  
  if (detectedDevice) {
    deviceSpecs = getDeviceSpecs(detectedDevice);
    console.log(`📱 Using device: ${detectedDevice} (${deviceSpecs.width}x${deviceSpecs.height})\n`);
  } else {
    console.log('⚠️  Could not detect simulator, using default device\n');
    deviceSpecs = getDeviceSpecs(config.defaultDevice);
    
    // Ask user to confirm device
    const deviceChoice = await askQuestion(
      `No simulator detected. Available devices:\n` +
      Object.keys(config.deviceSpecs).map((device, index) => `${index + 1}. ${device}`).join('\n') +
      `\n\nSelect device (1-${Object.keys(config.deviceSpecs).length}) or press Enter for default (${config.defaultDevice}): `
    );
    
    if (deviceChoice && !isNaN(deviceChoice)) {
      const deviceIndex = parseInt(deviceChoice) - 1;
      const deviceNames = Object.keys(config.deviceSpecs);
      if (deviceIndex >= 0 && deviceIndex < deviceNames.length) {
        const selectedDevice = deviceNames[deviceIndex];
        deviceSpecs = getDeviceSpecs(selectedDevice);
        console.log(`📱 Using device: ${selectedDevice} (${deviceSpecs.width}x${deviceSpecs.height})\n`);
      }
    }
  }
  
  // Confirm app is running
  console.log('📱 Make sure your app is running in the iOS Simulator');
  console.log('   Start with: npm start\n');
  
  const ready = await askQuestion('Is your app running and ready for testing? (y/N): ');
  if (ready.toLowerCase() !== 'y' && ready.toLowerCase() !== 'yes') {
    console.log('❌ Please start your app first and run this script again');
    process.exit(0);
  }
  
  console.log('\n🚀 Starting visual testing...\n');
  
  // Capture screenshots for each configured screen
  for (const screen of config.screens) {
    console.log(`\n📋 ${screen.name}`);
    console.log(`   ${screen.description}`);
    console.log(`\n   ${screen.prompt}`);
    
    const proceed = await askQuestion('\nPress Enter when ready to capture this screen (or "skip" to skip): ');
    
    if (proceed.toLowerCase() === 'skip') {
      console.log('⏭️  Skipping this screen\n');
      continue;
    }
    
    captureScreenshot(screen.name, deviceSpecs);
  }
  
  // Show completion message
  console.log('\n🎉 Visual testing complete!');
  console.log(`📊 View results at: ${config.percyDashboardUrl}`);
  console.log('\n💡 Tips:');
  console.log('   - Review screenshots in the Percy dashboard');
  console.log('   - Approve intentional changes, reject regressions');
  console.log('   - Run this script regularly to catch visual bugs early');
  
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

module.exports = { captureScreenshot }; 