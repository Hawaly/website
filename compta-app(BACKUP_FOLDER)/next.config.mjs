/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // SOLUTION DÉFINITIVE : Externaliser PDFKit et swissqrbill
      // Cela empêche Next.js de bundler ces packages et leurs fichiers .afm
      config.externals = config.externals || [];
      
      // Externaliser pdfkit complètement (utilise require() au runtime)
      if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = [
          originalExternals,
          ({ request }, callback) => {
            if (request === 'pdfkit' || request === 'swissqrbill' || request?.includes('pdfkit')) {
              return callback(null, `commonjs ${request}`);
            }
            callback();
          },
        ];
      } else if (Array.isArray(config.externals)) {
        // Externaliser pdfkit et swissqrbill
        config.externals.push(({ request }, callback) => {
          if (request === 'pdfkit' || request === 'swissqrbill' || request?.includes('pdfkit')) {
            return callback(null, `commonjs ${request}`);
          }
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

    return config;
  },
};

export default nextConfig;
