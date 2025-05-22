// generate-sidebar.js
// Dit script genereert automatisch de sidebar.js voor Docusaurus op basis van de mapstructuur
// Speciale functionaliteit voor PUBLIC_ONLY modus:
//   - Filtert alleen publieke content
//   - Verwijdert de "Publieke Documentatie" hoofdcategorie en toont direct de subcategorieën
//   - Expandeert alle hoofdcategorieën standaard in de publieke versie
const fs = require('fs');
const path = require('path');

// Check of we in public-only modus zijn
const PUBLIC_ONLY = process.env.PUBLIC_ONLY === 'true';
console.log(`Sidebar generator - Public-only mode: ${PUBLIC_ONLY ? 'ENABLED' : 'DISABLED'}`);

// Structuur opbouwen op basis van mapstructuur
function buildCategoryStructure(dir, rootDir = dir) {
  const result = { items: [] };
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // Zoek naar _category_.json
  const categoryJsonPath = path.join(dir, '_category_.json');
  if (fs.existsSync(categoryJsonPath)) {
    try {
      const categoryData = JSON.parse(fs.readFileSync(categoryJsonPath, 'utf8'));
      result.label = categoryData.label;
      // Sla position op voor sortering, maar neem het niet op in eindresultaat
      result._position = categoryData.position;

      // Alle categorieën standaard gesloten
      result.collapsed = true;
    } catch (e) {
      console.error(`Fout bij lezen van ${categoryJsonPath}:`, e);
    }
  }

  // Als geen label gevonden, gebruik mapnaam
  if (!result.label) {
    result.label = path.basename(dir);
    // Eerste letter hoofdletter
    result.label = result.label.charAt(0).toUpperCase() + result.label.slice(1);
  }

  // Sorteer: eerst mappen, dan bestanden
  const folders = [];
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(rootDir, fullPath);

    // Negeer _category_.json en .meta directories
    if (entry.name === '_category_.json' || entry.name === '.meta') continue;

    // In public-only modus, sta alleen bepaalde paden toe
    if (PUBLIC_ONLY) {
      // Sta toe: /public map, /public/... paden, en index.md in de root
      const isPublicPath = entry.name === 'public' || fullPath.includes('/public/');
      const isRootIndex = entry.name === 'index.md' && dir === rootDir;
      const isAllowed = isPublicPath || isRootIndex;
      
      console.log(`PUBLIC_ONLY check for ${fullPath}: ${isAllowed ? 'ALLOWED' : 'FILTERED OUT'}`);
      
      if (!isAllowed) continue;
    }

    if (entry.isDirectory()) {
      const subCategory = buildCategoryStructure(fullPath, rootDir);

      if (subCategory.items.length > 0) {
        const categoryItem = {
          type: 'category',
          label: subCategory.label,
          items: subCategory.items,
        };

        if (subCategory.collapsed !== undefined) {
          categoryItem.collapsed = subCategory.collapsed;
        }

        // Sla positie tijdelijk op voor sortering
        if (subCategory._position !== undefined) {
          categoryItem._position = subCategory._position;
        }

        folders.push(categoryItem);
      }
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      const id = relativePath.replace(/\.(md|mdx)$/, '');

      // Lees frontmatter voor position
      let position;
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        if (match) {
          const frontmatter = match[1];
          const positionMatch = frontmatter.match(/sidebar_position:\s*(\d+)/);
          if (positionMatch) {
            position = parseInt(positionMatch[1], 10);
          }
        }
      } catch (e) {
        console.error(`Fout bij lezen van ${fullPath}:`, e);
      }

      const docItem = {
        type: 'doc',
        id,
      };

      // Tijdelijke position voor sortering
      if (position !== undefined) {
        docItem._position = position;
      }

      files.push(docItem);
    }
  }

  // Sorteer op position, dan op label/id
  const sortByPosition = (a, b) => {
    if (a._position !== undefined && b._position !== undefined) {
      return a._position - b._position;
    }
    if (a._position !== undefined) return -1;
    if (b._position !== undefined) return 1;

    const aLabel = a.label || a.id;
    const bLabel = b.label || b.id;
    return aLabel.localeCompare(bLabel);
  };

  folders.sort(sortByPosition);
  files.sort(sortByPosition);

  // Combineer folders en files
  result.items = [...folders, ...files];

  // Verwijder _position uit alle items (inclusief subcategories)
  const removePositionProp = (items) => {
    return items.map(item => {
      const newItem = { ...item };
      delete newItem._position;

      if (newItem.items) {
        newItem.items = removePositionProp(newItem.items);
      }

      return newItem;
    });
  };

  result.items = removePositionProp(result.items);

  return result;
}

function generateSidebar() {
  const docsDir = path.join(__dirname, 'docs');
  const rootCategory = buildCategoryStructure(docsDir);
  let sidebar = { docs: rootCategory.items };

  // In PUBLIC_ONLY mode, filter sidebar to only include public docs
  if (PUBLIC_ONLY) {
    console.log('In PUBLIC_ONLY mode - filtering sidebar to only include public docs');
    // Filter sidebar to only include public items and root index
    if (rootCategory.items) {
      // Filter to keep only public-related items
      rootCategory.items = rootCategory.items.filter(item => {
        // Keep the item if it's a doc with id 'index' or containing 'public'
        if (item.type === 'doc') {
          return item.id === 'index' || item.id.includes('public');
        }
        // For categories, check if it's the public category or has public in its items
        if (item.type === 'category') {
          // Only keep categories that have 'public' in their label or have items with 'public' in their IDs
          const hasPublicItems = item.items && item.items.some(subItem => {
            if (subItem.type === 'doc') {
              return subItem.id.includes('public');
            }
            if (subItem.type === 'category') {
              return subItem.label.toLowerCase().includes('public');
            }
            return false;
          });
          
          return item.label.toLowerCase().includes('public') || hasPublicItems;
        }
        return false;
      });
      
      // For PUBLIC_ONLY mode, find the "Publieke Documentatie" category and replace the entire sidebar with its contents
      const publicCategory = rootCategory.items.find(item => 
        item.type === 'category' && 
        (item.label === 'Publieke Documentatie' || item.label.toLowerCase().includes('public'))
      );
      
      if (publicCategory && publicCategory.items) {
        console.log('Found public category, flattening hierarchy...');
        // Replace the entire rootCategory.items with the contents of the public category
        sidebar = { docs: [...publicCategory.items] };
        
        // In PUBLIC_ONLY mode, make all top-level categories expanded by default
        sidebar.docs.forEach(item => {
          if (item.type === 'category') {
            item.collapsed = false;
          }
        });
        
        // In PUBLIC_ONLY mode willen we alleen de publieke index toevoegen als welkomstpagina
        // Zoek de publieke index
        let publicIndexItem = rootCategory.items.find(item => item.type === 'doc' && item.id === 'public/index');
        
        // Check ook of het niet al in de subcategorie items zit
        if (!publicIndexItem) {
          console.log('Zoeken naar public/index in alle items...');
          // Zoek in alle items (platte lijst)
          publicIndexItem = { type: 'doc', id: 'public/index' };
        }
        
        // Verwijder de public/index items als ze in de lijst zitten
        sidebar.docs = sidebar.docs.filter(item => !(item.type === 'doc' && item.id === 'public/index'));
        
        // Plaats alleen de publieke index bovenaan (geen root index in publieke versie)
        if (publicIndexItem) {
          console.log('Public index toegevoegd als eerste item');
          sidebar.docs.unshift(publicIndexItem); // Voeg publieke index toe bovenaan
        } else {
          console.log('Public index niet gevonden!');
        }
        
        // We voegen de root index niet toe in de publieke versie
        
        console.log('Public sidebar structure created - top-level categories expanded by default');
      }
    }
    
    // Check if we have any items in PUBLIC_ONLY mode and create a fallback if needed
    if (!rootCategory.items || rootCategory.items.length === 0) {
    console.log('No public documents found! Creating a placeholder...');
    
    // Create placeholder landing page if it doesn't exist
    const publicIndexPath = path.join(docsDir, 'public', 'index.md');
    const publicDir = path.join(docsDir, 'public');
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    if (!fs.existsSync(publicIndexPath)) {
      const content = `---
title: "Kroescontrol Documentation"
slug: /
sidebar_position: 1
---

# Kroescontrol Documentation

Welcome to the Kroescontrol public documentation portal.
`;
      fs.writeFileSync(publicIndexPath, content);
    }
    
    // Create a minimal sidebar with the landing page
    sidebar = {
      docs: [
        {
          type: 'doc',
          id: 'public/index'
        }
      ]
    };
    }
  }

  // Schrijf naar bestand
  const sidebarContent = `/**
 * Auto-gegenereerd door sidebar-generator.js
 * Laatste update: ${new Date().toISOString()}
 */
module.exports = ${JSON.stringify(sidebar, null, 2)};`;

  fs.writeFileSync(path.join(__dirname, 'sidebars.js'), sidebarContent);
  console.log('✅ Sidebar succesvol gegenereerd!');
}

generateSidebar();
