/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/ssr'],
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  // Disable static optimization for pages that use Supabase
  trailingSlash: false,
  // Ensure proper handling of environment variables
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@supabase/ssr')
    }
    return config
  }
}

module.exports = nextConfig