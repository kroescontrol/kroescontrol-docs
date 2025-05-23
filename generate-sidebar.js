// generate-sidebar.js
// Dit script genereert automatisch de sidebar.js voor Docusaurus op basis van de mapstructuur
// Speciale functionaliteit voor PUBLIC_ONLY modus:
//   - Filtert alleen publieke content
//   - Verwijdert de "Publieke Documentatie" hoofdcategorie en toont direct de subcategorieën
//   - Expandeert alle hoofdcategorieën standaard in de publieke versie
const fs = require('fs');
const path = require('path');
const { isEncrypted } = require('./src/utils/encryption-utils');

// Check of we in public-only modus zijn
const PUBLIC_ONLY = process.env.PUBLIC_ONLY === 'true';
console.log(`Sidebar generator - Public-only mode: ${PUBLIC_ONLY ? 'ENABLED' : 'DISABLED'}`);

// Functie voor PUBLIC_ONLY modus (nieuwe structuur)
function generatePublicOnlySidebar() {
  console.log('Generating PUBLIC_ONLY sidebar using new docs-public structure');
  
  const docsPublicDir = './docs-public';
  if (!fs.existsSync(docsPublicDir)) {
    console.error('docs-public directory niet gevonden!');
    return;
  }
  
  // Gebruik de nieuwe structuur voor public-only
  const structure = buildCategoryStructure(docsPublicDir);
  
  // Flatten de structuur - alle items direct in root
  const allItems = [...structure.items];
  
  // Alle categorieën standaard open in public modus
  allItems.forEach(item => {
    if (item.type === 'category') {
      item.collapsed = false;
    }
  });
  
  const finalStructure = { items: allItems };
  console.log('Public-only sidebar structure created - all categories expanded');
  
  // Write sidebar
  const sidebarContent = `/**
 * Auto-gegenereerd door sidebar-generator.js
 * Laatste update: ${new Date().toISOString()}
 */
module.exports = {
  "docs": ${JSON.stringify(finalStructure.items, null, 2)}
};`;

  fs.writeFileSync('./sidebars.js', sidebarContent);
  console.log('✅ Sidebar succesvol gegenereerd!');
}

// Nieuwe functie om alle beschikbare docs directories te scannen
function getAvailableDocsDirs() {
  const dirs = [];
  
  // Altijd public
  if (fs.existsSync('docs-public')) dirs.push('docs-public');
  
  // Check access voor andere modules
  if (fs.existsSync('docs-internal') && !isEncrypted('./docs-internal/_category_.json')) {
    dirs.push('docs-internal');
  }
  if (fs.existsSync('docs-finance') && !isEncrypted('./docs-finance/_category_.json')) {
    dirs.push('docs-finance');
  }
  if (fs.existsSync('docs-operation') && !isEncrypted('./docs-operation/_category_.json')) {
    dirs.push('docs-operation');
  }
  
  console.log(`Available docs directories: ${dirs.join(', ')}`);
  return dirs;
}

// Structuur opbouwen op basis van mapstructuur
function buildCategoryStructure(dir, rootDir = dir) {
  const result = { items: [] };
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // Zoek naar _category_.json
  const categoryJsonPath = path.join(dir, '_category_.json');
  if (fs.existsSync(categoryJsonPath)) {
    try {
      if (isEncrypted(categoryJsonPath)) {
        console.log(`Skipping encrypted _category_.json: ${categoryJsonPath}`);
        // Gebruik mapnaam als fallback
        result.label = path.basename(dir);
        result.label = result.label.charAt(0).toUpperCase() + result.label.slice(1);
      } else {
        const categoryData = JSON.parse(fs.readFileSync(categoryJsonPath, 'utf8'));
        result.label = categoryData.label;
        // Sla position op voor sortering, maar neem het niet op in eindresultaat
        result._position = categoryData.position;

        // Alle categorieën standaard gesloten
        result.collapsed = true;
      }
    } catch (e) {
      console.error(`Fout bij lezen van ${categoryJsonPath}:`, e);
      // Gebruik mapnaam als fallback
      result.label = path.basename(dir);
      result.label = result.label.charAt(0).toUpperCase() + result.label.slice(1);
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

    // Check of directory encrypted is (als het een directory is en _category_.json encrypted is)
    if (entry.isDirectory()) {
      const categoryPath = path.join(fullPath, '_category_.json');
      if (isEncrypted(categoryPath)) {
        console.log(`Skipping encrypted directory: ${relativePath}`);
        continue; // Skip hele directory
      }
    }

    // In public-only modus met oude docs structuur, sta alleen bepaalde paden toe
    if (PUBLIC_ONLY && rootDir === './docs') {
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
        // Ensure category has correct type
        subCategory.type = 'category';
        folders.push(subCategory);
      }
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      // Maak document ID van relative path zonder extensie
      const docId = relativePath.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
      
      files.push({
        type: 'doc',
        id: docId
      });
    }
  }

  // Sorteer folders op position (als aanwezig) en dan op label
  folders.sort((a, b) => {
    if (a._position !== undefined && b._position !== undefined) {
      return a._position - b._position;
    }
    if (a._position !== undefined) return -1;
    if (b._position !== undefined) return 1;
    return a.label.localeCompare(b.label);
  });

  // Sorteer files op naam
  files.sort((a, b) => a.id.localeCompare(b.id));

  // Voeg items toe aan result
  result.items = [...folders, ...files];

  // Verwijder _position property voor clean output
  folders.forEach(folder => delete folder._position);

  return result;
}

// In PUBLIC_ONLY mode, generate sidebar for flattened public structure
if (PUBLIC_ONLY) {
  generatePublicOnlySidebar();
} else {
  // Genereer sidebar voor multiple docs directories  
  function generateSidebar() {
    const availableDirs = getAvailableDocsDirs();
    
    if (availableDirs.length === 0) {
      console.warn('Geen toegankelijke docs directories gevonden! Falling back to public-only...');
      // Fallback naar alleen public als geen access tot andere modules
      if (fs.existsSync('docs-public')) {
        const structure = buildCategoryStructure('docs-public');
        const sidebarContent = `/**
 * Auto-gegenereerd door sidebar-generator.js (fallback mode)
 * Laatste update: ${new Date().toISOString()}
 */
module.exports = {
  "docs": ${JSON.stringify(structure.items, null, 2)}
};`;
        fs.writeFileSync('./sidebars.js', sidebarContent);
        console.log('✅ Sidebar succesvol gegenereerd (public-only fallback)!');
        return;
      } else {
        console.error('Geen docs directories beschikbaar!');
        return;
      }
    }
    
    // Combineer alle beschikbare directories
    const allItems = [];
    const nonPublicDirs = availableDirs.filter(dir => dir !== 'docs-public');
    
    // Als er maar 1 totale module is (alleen public), flatten de structuur
    if (availableDirs.length === 1 && availableDirs[0] === 'docs-public') {
      console.log('Only public docs available - flattening structure');
      const structure = buildCategoryStructure('docs-public');
      allItems.push(...structure.items);
    }
    // Als er maar 1 extra module is naast public, flatten die module
    else if (nonPublicDirs.length === 1) {
      console.log(`Only one additional module (${nonPublicDirs[0]}) - flattening structure`);
      
      // Voeg eerst public items toe
      const publicStructure = buildCategoryStructure('docs-public');
      allItems.push(...publicStructure.items);
      
      // Voeg items van de ene extra module direct toe (niet in wrapper category)
      const moduleStructure = buildCategoryStructure(nonPublicDirs[0]);
      allItems.push(...moduleStructure.items);
    }
    // Anders, gebruik category wrappers voor duidelijkheid
    else {
      console.log(`Multiple modules available - using category structure`);
      
      for (const dir of availableDirs) {
        const structure = buildCategoryStructure(dir);
        
        // Voor docs-public: voeg items direct toe (root level)
        if (dir === 'docs-public') {
          allItems.push(...structure.items);
        } else {
          // Voor andere modules: voeg toe als category met module naam
          const moduleName = dir.replace('docs-', '').charAt(0).toUpperCase() + dir.replace('docs-', '').slice(1);
          allItems.push({
            type: 'category',
            label: moduleName,
            items: structure.items,
            collapsed: true
          });
        }
      }
    }
    
    const structure = { items: allItems };
    console.log('Gegenereerde gecombineerde structuur:', JSON.stringify(structure, null, 2));
    
    // Write sidebar
    const sidebarContent = `/**
   * Auto-gegenereerd door sidebar-generator.js
   * Laatste update: ${new Date().toISOString()}
   */
  module.exports = {
    "docs": ${JSON.stringify(structure.items, null, 2)}
  };`;

    fs.writeFileSync('./sidebars.js', sidebarContent);
    console.log('✅ Sidebar succesvol gegenereerd!');
  }

  generateSidebar();
}