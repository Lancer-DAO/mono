/** @type {import('next').NextConfig} */
const withFonts = require("next-fonts");
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        esmExternals: false,
    },
    images: {
        unoptimized: true,
    },
    env: {
        AUTH0_BASE_URL: process.env.VERCEL_URL || "http://localhost:3000",
    },
    async redirects() {
        return [{
            source: "/",
            destination: "/welcome",
            permanent: true,
        }, ];
    },
    webpack: (config) => {
        config.watchOptions = {
            poll: 5000,
            aggregateTimeout: 300,
        };
        config.resolve.fallback = {
            fs: false,
            path: false,
            os: false,
            crypto: require.resolve("crypto-browserify"),
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
                    https: require.resolve("https-browserify"),
                },
            },
        };
    },
};

module.exports = withFonts(nextConfig);

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
    module.exports, {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        // Suppresses source map uploading logs during build
        silent: true,

        org: "lancer-works-co",
        project: "javascript-nextjs",
        
    }, {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,

        // Transpiles SDK to be compatible with IE11 (increases bundle size)
        transpileClientSDK: true,

        // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
        tunnelRoute: "/monitoring",

        // Hides source maps from generated client bundles
        hideSourceMaps: true,

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,
    }
);