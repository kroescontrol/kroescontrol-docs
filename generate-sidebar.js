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
  
  // Check access voor andere modules - zowel _category_.json als enkele documenten
  if (fs.existsSync('docs-internal')) {
    const hasAccessToInternal = hasRealAccessToDirectory('./docs-internal');
    if (hasAccessToInternal) {
      dirs.push('docs-internal');
    } else {
      console.log('docs-internal detected but encrypted - skipping');
    }
  }
  
  if (fs.existsSync('docs-finance')) {
    const hasAccessToFinance = hasRealAccessToDirectory('./docs-finance');
    if (hasAccessToFinance) {
      dirs.push('docs-finance');
    } else {
      console.log('docs-finance detected but encrypted - skipping');
    }
  }
  
  if (fs.existsSync('docs-operation')) {
    const hasAccessToOperation = hasRealAccessToDirectory('./docs-operation');
    if (hasAccessToOperation) {
      dirs.push('docs-operation');
    } else {
      console.log('docs-operation detected but encrypted - skipping');
    }
  }
  
  console.log(`Available docs directories: ${dirs.join(', ')}`);
  return dirs;
}

// Helper functie om te controleren of we echt toegang hebben tot een directory
function hasRealAccessToDirectory(dirPath) {
  try {
    // Check _category_.json
    const categoryPath = path.join(dirPath, '_category_.json');
    if (isEncrypted(categoryPath)) {
      return false;
    }
    
    // Check een paar willekeurige .md bestanden in de directory
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    let checkedFiles = 0;
    const maxChecks = 3; // Check max 3 bestanden
    
    for (const entry of entries) {
      if (checkedFiles >= maxChecks) break;
      
      if (entry.name.endsWith('.md')) {
        const filePath = path.join(dirPath, entry.name);
        if (isEncrypted(filePath)) {
          return false;
        }
        checkedFiles++;
      } else if (entry.isDirectory()) {
        // Check ook subdirectories
        const subDirPath = path.join(dirPath, entry.name);
        const subCategoryPath = path.join(subDirPath, '_category_.json');
        if (fs.existsSync(subCategoryPath) && isEncrypted(subCategoryPath)) {
          return false;
        }
        
        // Check een .md bestand in subdirectory
        try {
          const subEntries = fs.readdirSync(subDirPath, { withFileTypes: true });
          for (const subEntry of subEntries) {
            if (subEntry.name.endsWith('.md')) {
              const subFilePath = path.join(subDirPath, subEntry.name);
              if (isEncrypted(subFilePath)) {
                return false;
              }
              checkedFiles++;
              break; // Stop na eerste bestand in subdirectory
            }
          }
        } catch (e) {
          // Als we subdirectory niet kunnen lezen, waarschijnlijk encrypted
          return false;
        }
      }
    }
    
    return true; // Als alle checks slagen, hebben we toegang
  } catch (e) {
    console.log(`Error checking access to ${dirPath}:`, e.message);
    return false;
  }
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

    if (entry.isDirectory() || entry.isSymbolicLink()) {
      // Check if symlink points to a directory
      let isDir = entry.isDirectory();
      if (entry.isSymbolicLink()) {
        try {
          const stat = fs.statSync(fullPath);
          isDir = stat.isDirectory();
        } catch (e) {
          console.log(`Warning: Could not stat symlink ${fullPath}: ${e.message}`);
          continue;
        }
      }
      
      if (isDir) {
        const subCategory = buildCategoryStructure(fullPath, rootDir);

        if (subCategory.items.length > 0) {
          // Ensure category has correct type
          subCategory.type = 'category';
          folders.push(subCategory);
        }
      }
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      // Check of bestand encrypted is
      if (isEncrypted(fullPath)) {
        console.log(`Skipping encrypted file: ${relativePath}`);
        continue;
      }
      
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
  // In normal mode, only generate sidebar for the public docs (main route)
  // Other modules (internal, finance, operation) use auto-generated sidebars
  console.log('Generating sidebar for public docs only (main route)');
  
  if (!fs.existsSync('docs-public')) {
    console.error('docs-public directory niet gevonden!');
    process.exit(1);
  }
  
  const structure = buildCategoryStructure('docs-public');
  
  const sidebarContent = `/**
 * Auto-gegenereerd door sidebar-generator.js
 * Laatste update: ${new Date().toISOString()}
 */
module.exports = {
  "docs": ${JSON.stringify(structure.items, null, 2)}
};`;

  fs.writeFileSync('./sidebars.js', sidebarContent);
  console.log('✅ Sidebar succesvol gegenereerd voor publieke docs!');
}