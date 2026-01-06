import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimisations de performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  serverExternalPackages: ['pdfkit'],
  
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
      // SOLUTION DÉFINITIVE : Externaliser PDFKit et swissqrbill
      // Cela empêche Next.js de bundler ces packages et leurs fichiers .afm
      config.externals = config.externals || [];
      
      // Externaliser pdfkit (CommonJS) et swissqrbill (ESM)
      if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = [
          originalExternals,
          ({ request }: { request?: string }, callback: (err?: unknown, result?: string) => void) => {
            // PDFKit: CommonJS
            if (request === 'pdfkit' || request?.includes('pdfkit')) {
              return callback(null, `commonjs ${request}`);
            }
            // swissqrbill: Laisser Next.js gérer l'import ESM
            // Ne PAS forcer commonjs car c'est un module ESM pur
            callback();
          },
        ];
      } else if (Array.isArray(config.externals)) {
        // Externaliser pdfkit uniquement
        config.externals.push(({ request }: { request?: string }, callback: (err?: unknown, result?: string) => void) => {
          // PDFKit: CommonJS
          if (request === 'pdfkit' || request?.includes('pdfkit')) {
            return callback(null, `commonjs ${request}`);
          }
          // swissqrbill: Laisser Next.js gérer l'import ESM
          callback();
        });
      }

      // Désactiver les warnings critiques pour les fichiers dynamiques
      config.module = {
        ...config.module,
        exprContextCritical: false,
      };
    }

    // Ignorer les warnings PDFKit
    config.ignoreWarnings = [
      { module: /node_modules\/pdfkit/ },
      /Critical dependency/,
    ];


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

  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
