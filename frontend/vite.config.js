import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'serve-backend-uploads',
      configureServer(server) {
        server.middlewares.use('/uploads', (req, res, next) => {
          const relativePath = req.url.startsWith('/') ? req.url.slice(1) : req.url;
          const rootDir = import.meta.dirname || process.cwd();
          const filePath = path.resolve(rootDir, '../e commerce project/uploads', decodeURIComponent(relativePath));
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'image/jpeg';
            if (ext === '.png') contentType = 'image/png';
            if (ext === '.webp') contentType = 'image/webp';
            res.setHeader('Content-Type', contentType);
            return fs.createReadStream(filePath).pipe(res);
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
