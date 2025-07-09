#!/usr/bin/env node

const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function error(message) {
  console.error(`${colors.red}${message}${colors.reset}`);
}

function success(message) {
  console.log(`${colors.green}${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.blue}${message}${colors.reset}`);
}

function publishUpdate(channel, message) {
  const channelName = channel === 'preview' ? 'preview' : 'published';
  
  info(`Publishing update to ${channelName} channel...`);
  info(`Message: ${message}`);
  
  try {
    const command = `eas update --branch ${channelName} --message "${message}" --platform ios`;
    execSync(command, { stdio: 'inherit' });
    success(`✅ Update published successfully to ${channelName} channel!`);
    info(`Users will receive this update automatically when they open the app.`);
  } catch (err) {
    error(`❌ Failed to publish update: ${err.message}`);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const message = args[1];

if (!command) {
  error('Usage: node update.js <command> <message>');
  error('');
  error('Commands:');
  error('  preview <message>  - Publish update to preview channel');
  error('  prod <message>     - Publish update to production channel');
  error('');
  error('Examples:');
  error('  node update.js preview "Fix shopping list sorting bug"');
  error('  node update.js prod "Add dark mode support"');
  process.exit(1);
}

if (!message) {
  error('Please provide a message for the update');
  error('Example: node update.js preview "Fix shopping list bug"');
  process.exit(1);
}

switch (command) {
  case 'preview':
    publishUpdate('preview', message);
    break;
    
  case 'prod':
    publishUpdate('prod', message);
    break;
    
  default:
    error(`Unknown command: ${command}`);
    process.exit(1);
} 