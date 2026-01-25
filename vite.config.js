import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

// Function to fetch dynamic routes from the live API
const getDynamicRoutes = async () => {
  try {
    const response = await fetch('https://choicehotspot.online/nashie/api/products?limit=1000');
    const result = await response.json();
    if (result.success && result.data && result.data.products) {
      return result.data.products.map(product => `/products/${product.id}`);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch dynamic routes for sitemap:', error);
    return [];
  }
};

// https://vite.dev/config/
export default defineConfig(async () => {
  const dynamicRoutes = await getDynamicRoutes();

  return {
    plugins: [
      react(),
      sitemap({
        hostname: 'https://nashiecom-technologies.web.app',
        dynamicRoutes,
        exclude: ['/admin', '/admin/**'],
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
  }
})
