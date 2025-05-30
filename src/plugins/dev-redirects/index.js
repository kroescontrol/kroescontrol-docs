/**
 * Development Redirects Plugin
 * 
 * This plugin handles redirects in development mode since 
 * @docusaurus/plugin-client-redirects only works in production builds.
 * 
 * It specifically handles the i18n slug translation issue where
 * the locale dropdown creates /en/welkom instead of /en/welcome
 */

module.exports = function devRedirectsPlugin(context, options) {
  const { siteConfig } = context;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Only activate in development mode
  if (!isDevelopment) {
    return {
      name: 'dev-redirects',
    };
  }

  // Import centralized redirect configuration
  const redirectConfig = require('../../../config/redirects');
  
  // Convert array format to object format for easier lookup
  const redirects = {};
  redirectConfig.forEach(redirect => {
    redirects[redirect.from] = redirect.to;
  });

  return {
    name: 'dev-redirects',
    
    configureWebpack(config, isServer) {
      if (isServer) {
        return {};
      }
      
      return {
        devServer: {
          setupMiddlewares: (middlewares, devServer) => {
            // Add redirect middleware
            devServer.app.use((req, res, next) => {
              const requestPath = req.path;
              
              // Check if this path needs to be redirected
              if (redirects[requestPath]) {
                const redirectTo = redirects[requestPath];
                console.log(`[Dev Redirect] ${requestPath} → ${redirectTo}`);
                res.redirect(301, redirectTo);
                return;
              }
              
              // Also handle paths without trailing slash
              const pathWithoutSlash = requestPath.replace(/\/$/, '');
              if (pathWithoutSlash !== requestPath && redirects[pathWithoutSlash]) {
                const redirectTo = redirects[pathWithoutSlash];
                console.log(`[Dev Redirect] ${requestPath} → ${redirectTo}`);
                res.redirect(301, redirectTo);
                return;
              }
              
              next();
            });
            
            return middlewares;
          },
        },
      };
    },
  };
};