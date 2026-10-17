/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        optimizePackageImports: ['@mantine/core', '@mantine/hooks', '@mantine/dates'],
    },
};

export default nextConfig;


