/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
    },
    // Optimize package imports for faster dev reload
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },
};

module.exports = nextConfig;
