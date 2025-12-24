import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations de performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Optimisation du bundle
  webpack: (config, { dev, isServer }) => {
    // Externaliser pdfkit et swissqrbill pour le serveur
    // Cela permet à PDFKit de charger ses fichiers .afm depuis node_modules
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('pdfkit', 'swissqrbill');
    }

    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for react/react-dom
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Commons chunk for shared code
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
            // Lib chunk for other npm packages
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Compression
  compress: true,

  // Power off x-powered-by header
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,
};

export default nextConfig;
