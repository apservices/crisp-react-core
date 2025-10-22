/**
 * Supabase deployment configuration utilities
 * Handles environment variables and auth redirects for all domains
 */

export const SUPABASE_CONFIG = {
  url: "https://xmjwutsmvshcfnowarnf.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhtand1dHNtdnNoY2Zub3dhcm5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjM3MDMsImV4cCI6MjA2Nzk5OTcwM30.17EBIdAuF4GPG01-WJjZ8gHY_qui-YPlW_yE0aswK8w"
} as const;

/**
 * Get current domain and determine if it's a preview or production environment
 */
export function getEnvironmentInfo() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const port = typeof window !== 'undefined' ? window.location.port : '';
  
  const isLovable = hostname.includes('lovable.app');
  const isPreview = hostname.includes('preview') || hostname.includes('staging');
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  const baseUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  
  return {
    hostname,
    baseUrl,
    isLovable,
    isPreview,
    isLocalhost,
    isProd: !isPreview && !isLocalhost
  };
}

/**
 * Generate auth redirect URLs for Supabase configuration
 * Supports Lovable domains, custom domains, and localhost
 */
export function getAuthRedirectUrls() {
  const env = getEnvironmentInfo();
  
  const urls = [
    `${env.baseUrl}/auth/callback`,
    `${env.baseUrl}/login`,
  ];
  
  // Add common development URLs
  if (env.isLocalhost) {
    urls.push(
      'http://localhost:3000/auth/callback',
      'http://localhost:8080/auth/callback',
      'http://127.0.0.1:3000/auth/callback',
      'http://127.0.0.1:8080/auth/callback'
    );
  }
  
  // Add Lovable preview URLs pattern
  if (env.isLovable) {
    const projectId = env.hostname.split('.')[0];
    urls.push(
      `https://${projectId}.lovable.app/auth/callback`,
      `https://${projectId}.preview.lovable.app/auth/callback`
    );
  }
  
  return [...new Set(urls)]; // Remove duplicates
}

/**
 * Configuration instructions for Supabase dashboard
 */
export function getSupabaseConfigInstructions() {
  const env = getEnvironmentInfo();
  const redirectUrls = getAuthRedirectUrls();
  
  return {
    siteUrl: env.baseUrl,
    redirectUrls,
    instructions: [
      "1. Go to Supabase Dashboard → Authentication → URL Configuration",
      `2. Set Site URL to: ${env.baseUrl}`,
      "3. Add these Redirect URLs:",
      ...redirectUrls.map(url => `   - ${url}`),
      "4. Save the configuration",
      "5. Test authentication flow"
    ]
  };
}

/**
 * Validate Storage RLS for media processing
 */
export function getStorageRLSConfig() {
  return {
    bucketsNeeded: ['tracks', 'processed', 'stems', 'masters'],
    policies: [
      {
        name: 'User can upload own tracks',
        table: 'storage.objects',
        operation: 'INSERT',
        check: "bucket_id = 'tracks' AND auth.uid()::text = (storage.foldername(name))[1]"
      },
      {
        name: 'User can read own files',
        table: 'storage.objects', 
        operation: 'SELECT',
        using: "auth.uid()::text = (storage.foldername(name))[1]"
      },
      {
        name: 'System can process files',
        table: 'storage.objects',
        operation: 'SELECT',
        using: "bucket_id IN ('tracks', 'processed', 'stems', 'masters')"
      }
    ]
  };
}

/**
 * Environment variable template for deployment
 */
export const ENV_TEMPLATE = `
# Supabase Configuration (Required)
VITE_SUPABASE_URL=${SUPABASE_CONFIG.url}
VITE_SUPABASE_ANON_KEY=${SUPABASE_CONFIG.anonKey}

# Optional: Custom Domain Configuration
# VITE_CUSTOM_DOMAIN=yourdomain.com
# VITE_SITE_URL=https://yourdomain.com

# Production Build Configuration
NODE_ENV=production
VITE_APP_ENV=production
`;

export default {
  SUPABASE_CONFIG,
  getEnvironmentInfo,
  getAuthRedirectUrls,
  getSupabaseConfigInstructions,
  getStorageRLSConfig,
  ENV_TEMPLATE
};