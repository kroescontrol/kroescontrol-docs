/**
 * FrontMatter Provider Plugin
 * 
 * Deze plugin extraheert frontMatter data van alle documenten en maakt deze
 * beschikbaar via useGlobalData voor gebruik in React components.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

function frontMatterProviderPlugin(context, options) {
  return {
    name: 'frontmatter-provider',
    
    async loadContent() {
      const { siteDir } = context;
      const frontMatterMap = {};
      
      // Zoek alle markdown bestanden in docs directories
      const docDirectories = [
        'docs-public',
        'docs-internal', 
        'docs-finance',
        'docs-operation',
        'docs-test-auth'
      ];
      
      for (const docDir of docDirectories) {
        const dirPath = path.join(siteDir, docDir);
        
        // Check of directory bestaat
        if (!fs.existsSync(dirPath)) {
          continue;
        }
        
        // Vind alle markdown bestanden
        const pattern = path.join(dirPath, '**/*.{md,mdx}');
        const files = glob.sync(pattern);
        
        for (const file of files) {
          try {
            const content = fs.readFileSync(file, 'utf8');
            const { data: frontMatter } = matter(content);
            
            // Converteer bestandspad naar URL pad
            const relativePath = path.relative(dirPath, file);
            const urlPath = convertToUrlPath(relativePath, docDir);
            
            // Sla relevante frontMatter data op
            frontMatterMap[urlPath] = {
              docStatus: frontMatter.docStatus,
              title: frontMatter.title,
              description: frontMatter.description,
              tags: frontMatter.tags,
              keywords: frontMatter.keywords,
              last_update: frontMatter.last_update,
              sidebar_position: frontMatter.sidebar_position,
              // Voeg andere relevante velden toe indien nodig
            };
            
          } catch (error) {
            console.warn(`Warning: Could not parse frontMatter for ${file}:`, error.message);
          }
        }
      }
      
      return frontMatterMap;
    },
    
    async contentLoaded({ content, actions }) {
      const { setGlobalData } = actions;
      
      // Maak frontMatter data globaal beschikbaar
      setGlobalData({
        frontMatterMap: content,
        totalDocuments: Object.keys(content).length,
        lastUpdated: new Date().toISOString(),
      });
      
      // Log statistieken in development
      if (process.env.NODE_ENV === 'development') {
        const statusCounts = {};
        Object.values(content).forEach(doc => {
          const status = doc.docStatus || 'undefined';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        console.log('📄 FrontMatter Provider Plugin loaded:');
        console.log(`   📊 Total documents: ${Object.keys(content).length}`);
        console.log('   📋 Status distribution:', statusCounts);
      }
    },
  };
}

/**
 * Converteer bestandspad naar URL pad
 * @param {string} relativePath - Relatief bestandspad (bijv. 'tools/git/index.md')
 * @param {string} docDir - Document directory naam (bijv. 'docs-internal')
 * @returns {string} URL pad (bijv. '/internal/tools/git')
 */
function convertToUrlPath(relativePath, docDir) {
  // Verwijder bestandsextensie
  let urlPath = relativePath.replace(/\.(md|mdx)$/, '');
  
  // Verwijder 'index' van het einde
  urlPath = urlPath.replace(/\/index$/, '');
  
  // Map document directories naar URL prefixes
  const dirMapping = {
    'docs-public': '',
    'docs-internal': '/internal',
    'docs-finance': '/finance', 
    'docs-operation': '/operation',
    'docs-test-auth': '/test-auth'
  };
  
  const prefix = dirMapping[docDir] || '';
  const fullPath = prefix + (urlPath ? '/' + urlPath : '');
  
  // Zorg ervoor dat pad begint met /
  return fullPath || '/';
}

module.exports = frontMatterProviderPlugin;