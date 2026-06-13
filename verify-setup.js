#!/usr/bin/env node
/**
 * DataInsight Pro - Verification Script
 * 
 * Run this script to verify the project is set up correctly:
 * node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 DataInsight Pro - Setup Verification\n');
console.log('=' .repeat(50));

let allGood = true;

// Check Node.js version
const nodeVersion = process.version.split('.')[0].slice(1);
console.log(`\n✓ Node.js: v${process.version}`);
if (parseInt(nodeVersion) < 18) {
  console.log('  ⚠️  Recommended: Node 18+');
  allGood = false;
}

// Check Python (basic check)
console.log('\n📦 Checking Files...\n');

const checks = [
  { name: 'backend/app.py', type: 'file', critical: true },
  { name: 'backend/requirements.txt', type: 'file', critical: true },
  { name: 'frontend/package.json', type: 'file', critical: true },
  { name: 'frontend/vite.config.js', type: 'file', critical: true },
  { name: 'frontend/tailwind.config.js', type: 'file', critical: false },
  { name: 'sample_data.csv', type: 'file', critical: false },
  { name: 'frontend/node_modules', type: 'dir', critical: false },
  { name: 'frontend/App-src.jsx', type: 'file', critical: false },
  { name: 'frontend/main-src.jsx', type: 'file', critical: false },
  { name: 'frontend/globals-src.css', type: 'file', critical: false },
];

checks.forEach(check => {
  const fullPath = path.join(__dirname, check.name);
  const exists = fs.existsSync(fullPath);
  const prefix = exists ? '✓' : (check.critical ? '✗' : '⚠');
  const status = exists ? 'found' : (check.critical ? 'MISSING' : 'optional');
  
  console.log(`${prefix} ${check.name.padEnd(30)} ${status}`);
  
  if (!exists && check.critical) {
    allGood = false;
  }
});

// Check backend setup
console.log('\n🐍 Backend Status...\n');

const backendAppPath = path.join(__dirname, 'backend', 'app.py');
if (fs.existsSync(backendAppPath)) {
  const content = fs.readFileSync(backendAppPath, 'utf8');
  const hasFlask = content.includes('Flask');
  const hasCORS = content.includes('CORS');
  const hasUpload = content.includes('/upload');
  
  console.log(`✓ Flask imports: ${hasFlask ? 'found' : 'NOT FOUND'}`);
  console.log(`✓ CORS configured: ${hasCORS ? 'yes' : 'no'}`);
  console.log(`✓ Upload endpoint: ${hasUpload ? 'found' : 'NOT FOUND'}`);
  
  if (!hasFlask || !hasUpload) {
    allGood = false;
  }
}

// Check frontend setup
console.log('\n⚛️  Frontend Status...\n');

const packageJsonPath = path.join(__dirname, 'frontend', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`✓ React version: ${pkg.dependencies?.react?.replace('^', '')}`);
    console.log(`✓ Vite version: ${pkg.devDependencies?.vite?.replace('^', '')}`);
    console.log(`✓ TailwindCSS version: ${pkg.devDependencies?.tailwindcss?.replace('^', '')}`);
    console.log(`✓ Chart.js version: ${pkg.dependencies?.['chart.js']?.replace('^', '')}`);
    
    const hasSetup = pkg.scripts?.dev?.includes('setup');
    console.log(`✓ Auto-setup enabled: ${hasSetup ? 'yes' : 'no'}`);
  } catch (e) {
    console.log('⚠  Could not parse package.json');
    allGood = false;
  }
}

// Check for temp files that need setup
console.log('\n📂 Frontend Files (Auto-Setup)...\n');

const tempFiles = [
  { temp: 'frontend/App-src.jsx', final: 'frontend/src/App.jsx', created: false },
  { temp: 'frontend/main-src.jsx', final: 'frontend/src/main.jsx', created: false },
  { temp: 'frontend/globals-src.css', final: 'frontend/src/styles/globals.css', created: false },
];

tempFiles.forEach(file => {
  const tempPath = path.join(__dirname, file.temp);
  const finalPath = path.join(__dirname, file.final);
  const tempExists = fs.existsSync(tempPath);
  const finalExists = fs.existsSync(finalPath);
  
  if (finalExists) {
    console.log(`✓ ${file.final.replace('frontend/', '')} (created)`);
  } else if (tempExists) {
    console.log(`⚠ ${file.temp.replace('frontend/', '')} (awaiting setup)`);
    console.log(`  → Run: npm run dev`);
  } else {
    console.log(`✗ ${file.temp.replace('frontend/', '')} (MISSING)`);
    allGood = false;
  }
});

// Summary
console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('\n✅ All checks passed! You\'re ready to go!\n');
  console.log('🚀 Quick Start:');
  console.log('  Terminal 1: cd backend && python app.py');
  console.log('  Terminal 2: cd frontend && npm run dev');
  console.log('  Browser: http://localhost:5173\n');
} else {
  console.log('\n⚠️  Some checks failed. See above for details.\n');
  console.log('💡 Suggestions:');
  console.log('  1. Run: npm install (in frontend/)');
  console.log('  2. Run: npm run setup (in frontend/)');
  console.log('  3. Check documentation: RUN_APPLICATION.md\n');
}

console.log('📚 Documentation:');
console.log('  - RUN_APPLICATION.md (detailed startup guide)');
console.log('  - FRONTEND_SETUP.md (frontend-specific)');
console.log('  - README.md (features & overview)');
console.log('  - STATUS.md (current status)\n');

process.exit(allGood ? 0 : 1);
