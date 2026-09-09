/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a self-contained server bundle so the Docker runtime stage stays small.
  output: 'standalone',
  reactStrictMode: true,
  images: {
    // Bottle / cocktail imagery is served from remote retailer + TheCocktailDB hosts.
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
