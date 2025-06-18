// Configuration helpers for conditional content

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Features that should only be visible in development
export const showDevelopmentContent = isDevelopment || process.env.SHOW_DEV_CONTENT === 'true';

// Specific feature flags
// Freelancecontrol temporarily removed - will be added back later