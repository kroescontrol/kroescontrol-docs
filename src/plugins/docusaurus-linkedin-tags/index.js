/**
 * Custom Docusaurus plugin that adds LinkedIn compatible meta tags
 */

module.exports = function(context, options) {
  return {
    name: 'docusaurus-linkedin-tags',
    
    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'meta',
            attributes: {
              name: 'image',
              content: options.defaultImage || '/img/logo.svg',
            },
          },
        ],
      };
    },
  };
};