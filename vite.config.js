import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

// Function to fetch dynamic routes from the live API
const getDynamicRoutes = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch('https://choicehotspot.online/nashie/api/products?limit=1000', {
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await response.json();

    if (result.success && result.data && result.data.products) {
      return result.data.products.map(product => `/products/${product.id}`);
    }
    return [];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn('Sitemap dynamic route fetch timed out (3s). Proceeding with static routes only.');
    } else {
      console.error('Failed to fetch dynamic routes for sitemap:', error.message);
    }
    return [];
  }
};

// https://vite.dev/config/
export default defineConfig(async () => {
  const staticRoutes = [
    '/',
    '/products',
    '/cart',
    '/about',
    '/contact',
    '/login',
    '/signup',
  ];
  const dynamicRoutes = await getDynamicRoutes();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  return {
    plugins: [
      react(),
      sitemap({
        hostname: 'https://nashiecom-technologies.web.app',
        dynamicRoutes: allRoutes,
        exclude: [
          '/admin',
          '/admin/**',
          '/checkout',
          '/my-orders',
          '/notifications',
          '/profile',
          '/google5a511d6db9a1d9f0'
        ],
        readable: true,
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
  };
})
