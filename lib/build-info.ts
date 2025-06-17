// Build time constants - deze worden tijdens build tijd bepaald
// Voor development gebruiken we een vaste tijd om hydration errors te voorkomen
const isDevelopment = process.env.NODE_ENV === 'development'
const STATIC_BUILD_TIME = '2025-06-17T20:00:00.000Z' // Vaste tijd voor development

export const BUILD_INFO = {
  id: process.env.NEXT_PUBLIC_BUILD_ID || 'dev',
  commit: process.env.NEXT_PUBLIC_GIT_COMMIT || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',
  branch: process.env.NEXT_PUBLIC_GIT_BRANCH || 
          process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 
          (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 'production' : 'local'),
  buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || (isDevelopment ? STATIC_BUILD_TIME : new Date().toISOString()),
  environment: process.env.NEXT_PUBLIC_BUILD_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  deploymentUrl: process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL || 'local'
} as const

// Format build time in Dutch timezone
export function formatBuildTime(isoTime: string): string {
  const date = new Date(isoTime)
  return date.toLocaleString('nl-NL', {
    day: 'numeric',
    month: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Amsterdam'
  })
}

// Get short commit hash
export function getShortCommit(fullCommit: string): string {
  return fullCommit.substring(0, 7)
}