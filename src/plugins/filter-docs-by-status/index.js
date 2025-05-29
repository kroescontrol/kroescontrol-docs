/**
 * Docusaurus docStatus Plugin
 * 
 * Deze plugin filtert documenten op basis van hun docStatus frontmatter property.
 * Documenten met specifieke statussen kunnen worden uitgesloten van de build.
 */

// src/plugins/filter-docs-by-status/index.js
const path = require('path');

module.exports = function(context, options) {
  const {
    siteDir,
    generatedFilesDir,
    baseUrl,
    siteConfig,
  } = context;
  
  // Default opties
  const defaultOptions = {
    excludeStatuses: ['templated', 'generated'],
    enableVisualIndicators: false,
    customStatusBehaviors: {},
  };
  
  // Combineer default opties met gebruiker-gedefinieerde opties
  const pluginOptions = {...defaultOptions, ...options};
  
  return {
    name: 'filter-docs-by-status',
    
    // Configureer webpack om de statusFilterLoader toe te voegen
    configureWebpack(config, isServer, utils) {
      return {
        module: {
          rules: [
            {
              test: /\.mdx?$/,
              include: [
                // Alle document directories filteren
                path.resolve(siteDir, 'docs-public'),
                path.resolve(siteDir, 'docs-internal'), 
                path.resolve(siteDir, 'docs-finance'),
                path.resolve(siteDir, 'docs-operation'),
                path.resolve(siteDir, 'docs-test-auth'),
              ],
              use: [
                {
                  loader: path.resolve(__dirname, './statusFilterLoader.js'),
                  options: pluginOptions,
                },
              ],
            },
          ],
        },
      };
    },
    
    // Injecteer CSS voor status indicators indien ingeschakeld
    injectHtmlTags() {
      if (!pluginOptions.enableVisualIndicators) {
        return {};
      }
      
      return {
        headTags: [
          {
            tagName: 'style',
            attributes: {
              type: 'text/css',
            },
            innerHTML: `
              .doc-status-indicator {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                margin-left: 8px;
              }
              .doc-status-templated {
                background-color: #f0f0f0;
                color: #666;
              }
              .doc-status-generated {
                background-color: #e6f7ff;
                color: #0088cc;
              }
              .doc-status-completed {
                background-color: #d9f7be;
                color: #52c41a;
              }
              .doc-status-live {
                background-color: #fff1b8;
                color: #fa8c16;
              }
              .doc-status-locked {
                background-color: #ffccc7;
                color: #f5222d;
              }
            `,
          },
        ],
      };
    },
    
    // Voeg docStatus info toe aan de MDX data
    async contentLoaded({content, actions}) {
      const {setGlobalData} = actions;
      
      // Sla de plugin opties op in globalData voor gebruik in componenten
      setGlobalData({
        pluginOptions,
      });
    },
    
    // Theme components tijdelijk uitgeschakeld voor eerste test
    // getThemePath() {
    //   if (!pluginOptions.enableVisualIndicators) {
    //     return undefined;
    //   }
    //   
    //   return path.resolve(__dirname, './theme');
    // },
  };
};
