import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run setup before Vite starts
const runSetup = () => {
  const srcDir = path.join(__dirname, 'src');
  const stylesDir = path.join(srcDir, 'styles');

  // Create directories
  [srcDir, stylesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Move temp files
  const moves = [
    { from: 'main-src.jsx', to: 'src/main.jsx' },
    { from: 'globals-src.css', to: 'src/styles/globals.css' },
    { from: 'App-src.jsx', to: 'src/App.jsx' },
  ];

  moves.forEach(({ from, to }) => {
    const fromPath = path.join(__dirname, from);
    const toPath = path.join(__dirname, to);
    
    if (fs.existsSync(fromPath) && !fs.existsSync(toPath)) {
      try {
        fs.renameSync(fromPath, toPath);
      } catch (e) {
        // Silently fail if file is already there
      }
    }
  });
};

try {
  runSetup();
} catch (e) {
  console.warn('Setup note:', e.message);
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
