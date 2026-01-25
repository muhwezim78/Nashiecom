import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
import { products } from './src/data/products.js'

// Extract product IDs and create route paths
const productRoutes = products.map(product => `/products/${product.id}`)
const dynamicRoutes = [
  ...productRoutes,
  // Add other dynamic categories or pages if needed
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://nashiecom-technologies.web.app', // Update with your actual domain
      dynamicRoutes,
      exclude: ['/admin', '/admin/**'], // Exclude admin pages from sitemap
    }),
  ],

  build: {
    chunkSizeWarningLimit: 3500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
