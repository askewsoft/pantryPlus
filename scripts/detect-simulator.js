#!/usr/bin/env node

/**
 * Device Detection Script for React Native Owl
 * Detects the currently running iOS simulator and maps it to device specifications
 */

const { execSync } = require('child_process');

// Device specifications for React Native Owl
const DEVICE_SPECS = {
  'iPhone 15 Pro': {
    width: 393,
    height: 852,
    devicePixelRatio: 3
  },
  'iPhone 15 Pro Max': {
    width: 430,
    height: 932,
    devicePixelRatio: 3
  },
  'iPhone 15': {
    width: 393,
    height: 852,
    devicePixelRatio: 3
  },
  'iPhone 15 Plus': {
    width: 430,
    height: 932,
    devicePixelRatio: 3
  },
  'iPhone 14 Pro': {
    width: 393,
    height: 852,
    devicePixelRatio: 3
  },
  'iPhone 14 Pro Max': {
    width: 430,
    height: 932,
    devicePixelRatio: 3
  },
  'iPhone 14': {
    width: 390,
    height: 844,
    devicePixelRatio: 3
  },
  'iPhone 14 Plus': {
    width: 428,
    height: 926,
    devicePixelRatio: 3
  },
  'iPhone 13 Pro': {
    width: 390,
    height: 844,
    devicePixelRatio: 3
  },
  'iPhone 13 Pro Max': {
    width: 428,
    height: 926,
    devicePixelRatio: 3
  },
  'iPhone 13': {
    width: 390,
    height: 844,
    devicePixelRatio: 3
  },
  'iPhone 13 mini': {
    width: 375,
    height: 812,
    devicePixelRatio: 3
  },
  'iPhone 12 Pro': {
    width: 390,
    height: 844,
    devicePixelRatio: 3
  },
  'iPhone 12 Pro Max': {
    width: 428,
    height: 926,
    devicePixelRatio: 3
  },
  'iPhone 12': {
    width: 390,
    height: 844,
    devicePixelRatio: 3
  },
  'iPhone 12 mini': {
    width: 375,
    height: 812,
    devicePixelRatio: 3
  },
  'iPhone 16': {
    width: 393,
    height: 852,
    devicePixelRatio: 3
  },
  'iPhone 16 Pro': {
    width: 393,
    height: 852,
    devicePixelRatio: 3
  },
  'iPhone 16 Pro Max': {
    width: 430,
    height: 932,
    devicePixelRatio: 3
  },
  'iPhone 16 Plus': {
    width: 430,
    height: 932,
    devicePixelRatio: 3
  }
};

// Device name mapping (handles variations in simulator naming)
const DEVICE_MAPPING = {
  // iPhone 15 series
  'iPhone 15 Pro': 'iPhone 15 Pro',
  'iPhone 15 Pro Max': 'iPhone 15 Pro Max',
  'iPhone 15': 'iPhone 15',
  'iPhone 15 Plus': 'iPhone 15 Plus',

  // iPhone 14 series
  'iPhone 14 Pro': 'iPhone 14 Pro',
  'iPhone 14 Pro Max': 'iPhone 14 Pro Max',
  'iPhone 14': 'iPhone 14',
  'iPhone 14 Plus': 'iPhone 14 Plus',

  // iPhone 13 series
  'iPhone 13 Pro': 'iPhone 13 Pro',
  'iPhone 13 Pro Max': 'iPhone 13 Pro Max',
  'iPhone 13': 'iPhone 13',
  'iPhone 13 mini': 'iPhone 13 mini',

  // iPhone 12 series
  'iPhone 12 Pro': 'iPhone 12 Pro',
  'iPhone 12 Pro Max': 'iPhone 12 Pro Max',
  'iPhone 12': 'iPhone 12',
  'iPhone 12 mini': 'iPhone 12 mini',

  // iPhone 16 series
  'iPhone 16': 'iPhone 16',
  'iPhone 16 Pro': 'iPhone 16 Pro',
  'iPhone 16 Pro Max': 'iPhone 16 Pro Max',
  'iPhone 16 Plus': 'iPhone 16 Plus'
};

function detectSimulator() {
  try {
    console.log('🔍 Detecting iOS Simulator...');

    // Get list of booted devices
    const output = execSync('xcrun simctl list devices | grep "Booted"', { encoding: 'utf8' });
    console.log('Raw simulator output:', output.trim());

    // Parse the output to extract device name
    const lines = output.trim().split('\n');

    for (const line of lines) {
      console.log('Processing line:', line);

      // Extract device name from the line
      // Format: "iPhone 15 Pro (C1E4EC38-1446-40CD-80A5-13B5D648BBDC) (Booted)"
      const match = line.match(/^(.+?)\s+\([A-F0-9-]+\)\s+\(Booted\)$/);

      if (match) {
        const deviceName = match[1].trim();
        console.log('Extracted device name:', deviceName);

        // Find the best match in our device mapping
        let bestMatch = null;
        let bestMatchScore = 0;

        for (const [key, value] of Object.entries(DEVICE_MAPPING)) {
          if (deviceName === key) {
            bestMatch = value;
            bestMatchScore = 100; // Exact match
            break;
          } else if (deviceName.includes(key)) {
            const score = key.length; // Partial match score
            if (score > bestMatchScore) {
              bestMatch = value;
              bestMatchScore = score;
            }
          }
        }

        if (bestMatch) {
          console.log(`✅ Best match found: ${deviceName} -> ${bestMatch}`);
          return bestMatch;
        } else {
          console.log(`❌ No match found for: ${deviceName}`);
        }
      }
    }

    console.log('❌ Could not determine device type from running simulator');
    return null;

  } catch (error) {
    console.error('❌ Error detecting simulator:', error.message);
    return null;
  }
}

function getDeviceSpecs(deviceName) {
  return DEVICE_SPECS[deviceName] || null;
}

function main() {
  const detectedDevice = detectSimulator();

  if (detectedDevice) {
    const specs = getDeviceSpecs(detectedDevice);

    if (specs) {
      console.log(`📱 Detected device: ${detectedDevice}`);
      console.log(`📐 Dimensions: ${specs.width}x${specs.height}`);
      console.log(`🔍 Device pixel ratio: ${specs.devicePixelRatio}`);
      console.log('');
      console.log('Device specification for owl.config.js:');
      console.log(JSON.stringify({
        name: detectedDevice,
        ...specs
      }, null, 2));

      // Export for use in other scripts
      module.exports = {
        device: detectedDevice,
        specs: specs
      };

      return { device: detectedDevice, specs: specs };
    } else {
      console.log(`❌ No specifications found for device: ${detectedDevice}`);
      return null;
    }
  } else {
    console.log('❌ Could not determine device type from running simulator');
    console.log('Using default device specifications');

    const defaultDevice = 'iPhone 15 Pro';
    const defaultSpecs = DEVICE_SPECS[defaultDevice];

    console.log(`Default device specifications:`, defaultSpecs);

    return { device: defaultDevice, specs: defaultSpecs };
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { detectSimulator, getDeviceSpecs, DEVICE_SPECS, DEVICE_MAPPING };
