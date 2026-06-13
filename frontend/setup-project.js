#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = __dirname;

// Create src and src/styles directories
const srcDir = path.join(frontendDir, 'src');
const stylesDir = path.join(srcDir, 'styles');

[srcDir, stylesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created: ${path.relative(frontendDir, dir)}`);
  }
});

// Move files if they exist as temp files
const moves = [
  { from: 'main-src.jsx', to: 'src/main.jsx' },
  { from: 'globals-src.css', to: 'src/styles/globals.css' },
  { from: 'App-src.jsx', to: 'src/App.jsx' },
];

moves.forEach(({ from, to }) => {
  const fromPath = path.join(frontendDir, from);
  const toPath = path.join(frontendDir, to);
  
  if (fs.existsSync(fromPath) && !fs.existsSync(toPath)) {
    try {
      fs.renameSync(fromPath, toPath);
      console.log(`✓ Moved: ${from} → ${to}`);
    } catch (e) {
      console.error(`✗ Failed to move ${from}:`, e.message);
    }
  }
});

console.log('\n✓ Setup complete!');
