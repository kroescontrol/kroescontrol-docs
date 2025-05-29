module.exports = function(context, options) {
  return {
    name: 'inject-build-info',
    
    injectHtmlTags() {
      const { buildInfo } = options;
      
      return {
        headTags: [
          {
            tagName: 'script',
            innerHTML: `
              window.__BUILD_INFO__ = ${JSON.stringify(buildInfo)};
            `
          }
        ]
      };
    }
  };
};