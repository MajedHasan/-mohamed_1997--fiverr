/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Handle undici module
    config.module.rules.push({
      test: /\/node_modules\/undici\/.*\.js$/,
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env"],
        plugins: [
          "@babel/plugin-proposal-private-methods",
          "@babel/plugin-proposal-class-properties",
        ],
      },
    });

    // Handle node modules
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    return config;
  },
  // Add this to support static export
  // output: "export", // Static export option
};

module.exports = nextConfig;
