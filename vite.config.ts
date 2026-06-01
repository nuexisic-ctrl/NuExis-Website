import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Plugin to copy dotfiles (like .htaccess) from public/ to dist/ after build
const copyDotfiles = () => ({
  name: 'copy-dotfiles',
  closeBundle() {
    const src = path.resolve(__dirname, 'public/.htaccess');
    const dest = path.resolve(__dirname, 'dist/.htaccess');
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log('✓ Copied .htaccess to dist/');
    }
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss(), copyDotfiles()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    base: './',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['framer-motion', 'lucide-react']
          }
        }
      }
    }
  };
});
