/**
 * Docusaurus docStatus Plugin
 * 
 * Deze plugin filtert documenten op basis van hun docStatus frontmatter property.
 * Documenten met specifieke statussen kunnen worden uitgesloten van de build.
 */

// src/plugins/filter-docs-by-status/index.js
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');
const glob = require('glob');

module.exports = function(context, options) {
  const {
    siteDir,
    generatedFilesDir,
    baseUrl,
    siteConfig,
  } = context;
  
  // Default opties
  const defaultOptions = {
    excludeStatuses: ['template', 'dev'],
    hideFromSidebar: ['staging'], // Nieuwe optie: verberg uit sidebar maar genereer wel pagina
    enableVisualIndicators: false,
    customStatusBehaviors: {},
  };
  
  // Combineer default opties met gebruiker-gedefinieerde opties
  const pluginOptions = {...defaultOptions, ...options};

  /**
   * Genereert exclude patterns voor docs plugin configuratie
   */
  function generateExcludePatterns() {
    const patterns = [];
    const docsDirectories = [
      path.join(siteDir, 'docs-public'),
      path.join(siteDir, 'docs-internal'),
      path.join(siteDir, 'docs-finance'),
      path.join(siteDir, 'docs-operation'),
      path.join(siteDir, 'docs-test-auth'),
    ];

    for (const docsDir of docsDirectories) {
      if (!fs.existsSync(docsDir)) continue;
      
      const files = glob.sync(`${docsDir}/**/*.{md,mdx}`);
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const { data } = matter(content);
          
          // Behandel 'locked' als alias voor 'production'
          let effectiveStatus = data.docStatus;
          if (effectiveStatus === 'locked') {
            effectiveStatus = 'production';
          }
          
          if (effectiveStatus && pluginOptions.excludeStatuses.includes(effectiveStatus)) {
            // Maak relatief pad voor exclude pattern
            const relativePath = path.relative(docsDir, file);
            patterns.push(relativePath);
          }
        } catch (error) {
          // Skip bestanden die niet gelezen kunnen worden
        }
      }
    }
    
    return patterns;
  }

  return {
    name: 'filter-docs-by-status',
    
    // Hook om andere plugins te configureren voordat ze worden geladen
    configurePostCss(postcssOptions) {
      return postcssOptions;
    },

    // Hook om exclude patterns toe te voegen aan docs plugins
    async loadContent() {
      // Deze functie wordt geroepen voordat content wordt geladen
      // We gebruiken dit om exclude patterns te genereren
      return {
        excludePatterns: generateExcludePatterns(),
      };
    },

    // Configureer webpack voor sidebar filtering (alleen voor 'completed' status)
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
              .doc-status-template {
                background-color: #f0f0f0;
                color: #666;
              }
              .doc-status-dev {
                background-color: #e6f7ff;
                color: #0088cc;
              }
              .doc-status-staging {
                background-color: #d9f7be;
                color: #52c41a;
              }
              .doc-status-production {
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
