#!/usr/bin/env node

import { initCommand } from '../commands/init.js'; // include `.js` in ESM imports

const [, , command] = process.argv;

if (command === 'init') {
    await initCommand();
} else {
    console.log(`❓ Unknown command: ${command}`);
    console.log('Available commands:\n  init');
}
