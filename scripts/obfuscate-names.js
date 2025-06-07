#!/usr/bin/env node

/**
 * Obfuscated Name Generator
 * 
 * Genereert random Nederlandse woordcombinaties voor directory en file obfuscation
 * Gebruikt: woord1-woord2 format (bijv: rood-huis, auto-boom)
 */

const fs = require('fs');
const path = require('path');

// Nederlandse woorden voor obfuscation (kort en neutraal)
const WOORDEN = {
  kleuren: ['rood', 'blauw', 'groen', 'geel', 'wit', 'zwart', 'grijs', 'roze'],
  dieren: ['hond', 'kat', 'vis', 'vogel', 'beer', 'wolf', 'haas', 'muis'],
  natuur: ['berg', 'meer', 'bos', 'veld', 'zee', 'rivier', 'pad', 'steen'],
  tijd: ['dag', 'nacht', 'zomer', 'winter', 'week', 'maand', 'jaar', 'uur'],
  basis: ['plan', 'werk', 'data', 'info', 'kern', 'basis', 'start', 'eind'],
  devops: ['kube', 'helm', 'docker', 'stack', 'pipeline', 'deploy', 'build', 'test'],
  cloud: ['aws', 'azure', 'gcp', 'lambda', 'bucket', 'cluster', 'node', 'edge'],
  linux: ['bash', 'grep', 'sudo', 'pipe', 'cron', 'ssh', 'git', 'vim']
};

// Alle woorden in een platte lijst
const ALLE_WOORDEN = Object.values(WOORDEN).flat();

/**
 * Genereer een random obfuscated naam
 */
function generateObfuscatedName() {
  const woord1 = ALLE_WOORDEN[Math.floor(Math.random() * ALLE_WOORDEN.length)];
  const woord2 = ALLE_WOORDEN[Math.floor(Math.random() * ALLE_WOORDEN.length)];
  
  // Voorkom dubbele woorden
  if (woord1 === woord2) {
    return generateObfuscatedName();
  }
  
  return `${woord1}-${woord2}`;
}

/**
 * Check of een naam al bestaat in de gegeven directory (recursief scan)
 */
function checkNameExists(basePath, name, scanRecursive = true) {
  if (!fs.existsSync(basePath)) {
    return false;
  }
  
  const items = fs.readdirSync(basePath, { withFileTypes: true });
  
  for (const item of items) {
    const itemName = item.name;
    
    // Check directe matches
    if (itemName === name || 
        itemName === `${name}.md` || 
        itemName.startsWith(`${name}-`) ||
        itemName.startsWith(`${name}.`)) {
      return true;
    }
    
    // Recursief scan subdirectories indien gewenst
    if (scanRecursive && item.isDirectory()) {
      const subPath = path.join(basePath, itemName);
      if (checkNameExists(subPath, name, false)) { // Niet verder recursief
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Scan alle relevante docs directories voor bestaande namen
 */
function scanAllDocsDirectories(name) {
  const docsDirectories = [
    'docs-public',
    'docs-internal', 
    'docs-finance',
    'docs-operation'
  ];
  
  for (const dir of docsDirectories) {
    if (fs.existsSync(dir) && checkNameExists(dir, name, true)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Genereer unieke naam voor een specifieke locatie
 */
function generateUniqueName(basePath, type = 'dir', globalScan = false) {
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    const name = generateObfuscatedName();
    
    // Check lokaal of globaal
    const exists = globalScan ? 
      scanAllDocsDirectories(name) : 
      checkNameExists(basePath, name);
    
    if (!exists) {
      console.log(`✅ Generated unique ${type}: ${name} (${attempts + 1} attempts)`);
      return name;
    }
    
    attempts++;
    console.log(`🔄 ${name} already exists, trying again... (attempt ${attempts})`);
  }
  
  // Fallback met timestamp als we geen unieke naam kunnen vinden
  const timestamp = Date.now().toString(36);
  const fallbackName = `${generateObfuscatedName()}-${timestamp}`;
  console.log(`⚠️  Using fallback name: ${fallbackName} (after ${maxAttempts} attempts)`);
  return fallbackName;
}

/**
 * Genereer globaal unieke naam (scant alle docs directories)
 */
function generateGloballyUniqueName(type = 'dir') {
  return generateUniqueName('.', type, true);
}

/**
 * Genereer mapping voor directory structuur
 */
function generateDirectoryMapping(basePath, realPaths) {
  const mapping = {};
  
  for (const realPath of realPaths) {
    const obfuscatedName = generateUniqueName(basePath);
    mapping[realPath] = obfuscatedName;
  }
  
  return mapping;
}

/**
 * Save mapping to JSON file
 */
function saveMappingToFile(mapping, filePath) {
  const mappingData = {
    generated: new Date().toISOString(),
    version: '1.0',
    mapping: mapping,
    reverseMapping: {}
  };
  
  // Maak ook reverse mapping voor snelle lookups
  for (const [real, obfuscated] of Object.entries(mapping)) {
    mappingData.reverseMapping[obfuscated] = real;
  }
  
  fs.writeFileSync(filePath, JSON.stringify(mappingData, null, 2));
  console.log(`✅ Mapping opgeslagen in: ${filePath}`);
}

/**
 * Load existing mapping
 */
function loadMapping(filePath) {
  if (!fs.existsSync(filePath)) {
    return { mapping: {}, reverseMapping: {} };
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
  } catch (error) {
    console.warn(`⚠️  Kon mapping niet laden: ${error.message}`);
    return { mapping: {}, reverseMapping: {} };
  }
}

/**
 * CLI Commands
 */
function showHelp() {
  console.log(`
🎭 Obfuscated Name Generator

Usage:
  node scripts/obfuscate-names.js <command> [options]

Commands:
  generate [type]           - Genereer globaal unieke naam (DEFAULT: scant alle docs dirs)
  unique <path> [type]      - Genereer unieke naam voor specifieke directory  
  random [type]             - Genereer random naam zonder conflict check
  check <path> <name>       - Check of naam al bestaat in path
  mapping <paths...>        - Genereer mapping voor meerdere paths
  save-mapping <file>       - Sla huidige mapping op
  load-mapping <file>       - Laad bestaande mapping

Types:
  dir                       - Voor directory naam (default)
  file                      - Voor bestand naam

Examples:
  node scripts/obfuscate-names.js generate           # Globaal unieke naam
  node scripts/obfuscate-names.js random             # Random naam (sneller)
  node scripts/obfuscate-names.js unique docs-finance # Lokaal uniek
  node scripts/obfuscate-names.js check docs-finance rood-huis
  node scripts/obfuscate-names.js mapping finance-reports operations-budget
  
Woorden database: ${ALLE_WOORDEN.length} woorden in ${Object.keys(WOORDEN).length} categorieën
  `);
}

/**
 * Main CLI handler
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'generate':
      const type = args[1] || 'dir';
      console.log('🔍 Scanning all docs directories for conflicts...');
      const name = generateGloballyUniqueName(type);
      break;
      
    case 'check':
      const checkPath = args[1];
      const checkName = args[2];
      if (!checkPath || !checkName) {
        console.error('❌ Usage: check <path> <name>');
        process.exit(1);
      }
      const exists = checkNameExists(checkPath, checkName);
      console.log(`📁 ${checkName} in ${checkPath}: ${exists ? '❌ EXISTS' : '✅ AVAILABLE'}`);
      break;
      
    case 'unique':
      const uniquePath = args[1];
      const uniqueType = args[2] || 'dir';
      if (!uniquePath) {
        console.error('❌ Usage: unique <path> [type]');
        process.exit(1);
      }
      const uniqueName = generateUniqueName(uniquePath, uniqueType);
      break;
      
    case 'random':
      const randomType = args[1] || 'dir';
      const randomName = generateObfuscatedName();
      console.log(`🎯 Random ${randomType}: ${randomName}`);
      break;
      
    case 'mapping':
      const realPaths = args.slice(1);
      if (realPaths.length === 0) {
        console.error('❌ Usage: mapping <paths...>');
        process.exit(1);
      }
      const basePath = './docs-internal'; // Default base path
      const mapping = generateDirectoryMapping(basePath, realPaths);
      console.log('🗺️  Generated mapping:');
      for (const [real, obfuscated] of Object.entries(mapping)) {
        console.log(`  ${real} → ${obfuscated}`);
      }
      break;
      
    case 'save-mapping':
      // TODO: Implement save functionality
      console.log('💾 Save mapping feature - not implemented yet');
      break;
      
    case 'load-mapping':
      // TODO: Implement load functionality  
      console.log('📂 Load mapping feature - not implemented yet');
      break;
      
    case 'stats':
      console.log(`📊 Obfuscation Statistics:
      
Total woorden: ${ALLE_WOORDEN.length}
Categorieën: ${Object.keys(WOORDEN).length}
Mogelijke combinaties: ${ALLE_WOORDEN.length * (ALLE_WOORDEN.length - 1)}

Per categorie:`);
      for (const [cat, woorden] of Object.entries(WOORDEN)) {
        console.log(`  ${cat}: ${woorden.length} woorden`);
      }
      break;
      
    case 'help':
    case '--help':
    case '-h':
    default:
      showHelp();
      break;
  }
}

// Export voor gebruik als module
module.exports = {
  generateObfuscatedName,
  generateUniqueName,
  generateGloballyUniqueName,
  checkNameExists,
  scanAllDocsDirectories,
  generateDirectoryMapping,
  saveMappingToFile,
  loadMapping,
  WOORDEN,
  ALLE_WOORDEN
};

// Run CLI als dit script direct wordt uitgevoerd
if (require.main === module) {
  main();
}