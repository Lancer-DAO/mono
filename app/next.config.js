/** @type {import('next').NextConfig} */
const withFonts = require('next-fonts');
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },optimization: {
    minimize: false
},
  env: {
    AUTH0_BASE_URL: process.env.VERCEL_URL || 'http://localhost:3000'
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
      assert: false,
      process: false,
      util: false,
      encoding: false,
      stream: false,
    };
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.oneOf instanceof Array) {
        rule.oneOf[rule.oneOf.length - 1].exclude = [
          /\.(js|mjs|jsx|cjs|ts|tsx)$/,
          /\.html$/,
          /\.json$/,
        ];
      }
      return rule;
    });
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          stream: require.resolve("stream-browserify"),
          zlib: require.resolve("browserify-zlib"),
          http: require.resolve("http-browserify"),
          https: require.resolve("https-browserify")
        },
      },
    };
  },
};

module.exports = withFonts(nextConfig)
