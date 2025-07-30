#!/usr/bin/env node

/**
 * iOS Simulator Device Detection Script
 * 
 * Detects the currently running iOS simulator and maps it to device specifications
 */

const { execSync } = require('child_process');

// Device mapping based on simulator names
// Order matters - more specific devices should come first to avoid partial matches
const DEVICE_MAPPING = {
  'iPhone 16 Pro Max': 'iPhone 16 Pro Max',
  'iPhone 16 Plus': 'iPhone 16 Plus',
  'iPhone 16 Pro': 'iPhone 16 Pro', // Maps to Pro specs
  'iPhone 16': 'iPhone 16',
  'iPhone 15 Pro Max': 'iPhone 15 Pro Max',
  'iPhone 15 Pro': 'iPhone 15 Pro', // Maps to Pro specs
  'iPhone 15': 'iPhone 15',
  'iPhone 14 Pro Max': 'iPhone 14 Pro Max',
  'iPhone 14 Pro': 'iPhone 14 Pro', // Maps to Pro specs
  'iPhone 14': 'iPhone 14',
  'iPhone 13 Pro Max': 'iPhone 14 Pro Max', // Fallback
  'iPhone 13': 'iPhone 14', // Fallback
  'iPhone 12 Pro Max': 'iPhone 12 Pro Max',
  'iPhone 12 Pro': 'iPhone 12 Pro', // Maps to Pro specs
  'iPhone 12': 'iPhone 12',
  'iPhone 11 Pro Max': 'iPhone 12 Pro Max', // Fallback
  'iPhone 11': 'iPhone 12', // Fallback
  'iPhone XS Max': 'iPhone 12 Pro Max', // Fallback
  'iPhone XS': 'iPhone 12', // Fallback
  'iPhone XR': 'iPhone 12', // Fallback
  'iPhone X': 'iPhone 12', // Fallback
  'iPhone SE (3rd generation)': 'iPhone SE',
  'iPhone SE (2nd generation)': 'iPhone SE', // Fallback
  'iPhone SE (1st generation)': 'iPhone SE', // Fallback
  'iPhone 8 Plus': 'iPhone SE', // Fallback
  'iPhone 8': 'iPhone SE', // Fallback
};

function detectSimulator() {
  try {
    // Get list of running simulators
    const output = execSync('xcrun simctl list devices | grep "Booted"', { encoding: 'utf8' });
    
    if (!output.trim()) {
      console.log('No running simulators detected');
      return null;
    }

    console.log('Raw simulator output:', output.trim());

    // Parse the output to find device name
    const lines = output.trim().split('\n');
    for (const line of lines) {
      console.log('Processing line:', line);
      
      // Extract device name from the line
      // Try quoted format first, then unquoted format
      let match = line.match(/"(.*?)"/);
      let deviceName;
      
      if (match) {
        deviceName = match[1];
      } else {
        // Try to extract device name without quotes (format: "iPhone 15 Pro (UUID) (Booted)")
        match = line.match(/^(\s*)([^(]+)/);
        if (match) {
          deviceName = match[2].trim();
        }
      }
      
      if (deviceName) {
        console.log('Extracted device name:', deviceName);
        
        // Find the best match in our mapping
        for (const [simulatorName, mappedDevice] of Object.entries(DEVICE_MAPPING)) {
          if (deviceName === simulatorName) {
            console.log(`✅ Exact match found: ${deviceName} -> ${mappedDevice}`);
            return mappedDevice;
          }
        }
        
        // If no exact match, try partial matching
        for (const [simulatorName, mappedDevice] of Object.entries(DEVICE_MAPPING)) {
          if (deviceName.includes(simulatorName) || simulatorName.includes(deviceName)) {
            console.log(`✅ Partial match found: ${deviceName} -> ${mappedDevice}`);
            return mappedDevice;
          }
        }
        
        // If no exact match, try partial matching
        for (const [simulatorName, mappedDevice] of Object.entries(DEVICE_MAPPING)) {
          const simulatorWords = simulatorName.toLowerCase().split(' ');
          const deviceWords = deviceName.toLowerCase().split(' ');
          
          const hasCommonWords = simulatorWords.some(word => 
            deviceWords.some(deviceWord => deviceWord.includes(word) || word.includes(deviceWord))
          );
          
          if (hasCommonWords) {
            console.log(`✅ Partial match found: ${deviceName} -> ${mappedDevice}`);
            return mappedDevice;
          }
        }
        
        console.log(`❌ No match found for device: ${deviceName}`);
        console.log('Available mappings:', Object.keys(DEVICE_MAPPING));
      } else {
        console.log('❌ Could not extract device name from line');
      }
    }
    
    console.log('Could not determine device type from running simulator');
    return null;
    
  } catch (error) {
    console.log('Error detecting simulator:', error.message);
    return null;
  }
}

function getDeviceSpecs(deviceName) {
  const config = require('../percy-config.json');
  return config.deviceSpecs[deviceName] || config.deviceSpecs[config.defaultDevice];
}

// Run if called directly
if (require.main === module) {
  const detectedDevice = detectSimulator();
  if (detectedDevice) {
    const specs = getDeviceSpecs(detectedDevice);
    console.log('Device specifications:', specs);
  } else {
    console.log('Using default device specifications');
    const config = require('../percy-config.json');
    const specs = getDeviceSpecs(config.defaultDevice);
    console.log('Default device specifications:', specs);
  }
}

module.exports = { detectSimulator, getDeviceSpecs }; 