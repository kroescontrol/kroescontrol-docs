const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { isEncrypted } = require('./encryption-utils');

/**
 * Build types en hun toegestane content directories
 */
const BUILD_TYPES = {
  // Alleen publieke content
  'public': {
    includeDirs: ['docs-public'],
    excludeDirs: ['docs-internal', 'docs-operation', 'docs-finance'],
    allowDrafts: false,
    description: 'Publieke documentatie voor externe gebruikers'
  },
  
  // Standaard interne build (meeste gevallen)
  'internal': {
    includeDirs: ['docs-public', 'docs-internal'],
    excludeDirs: ['docs-operation', 'docs-finance'],
    allowDrafts: false,
    description: 'Publieke + interne documentatie voor medewerkers'
  },
  
  // Operationele build (inclusief management content)
  'operational': {
    includeDirs: ['docs-public', 'docs-internal', 'docs-operation'],
    excludeDirs: ['docs-finance'],
    allowDrafts: false,
    description: 'Publieke + interne + operationele documentatie'
  },
  
  // Volledige build (alles, inclusief finance)
  'full': {
    includeDirs: ['docs-public', 'docs-internal', 'docs-operation', 'docs-finance'],
    excludeDirs: [],
    allowDrafts: false,
    description: 'Alle documentatie inclusief financiële content'
  },
  
  // Development build (alles inclusief drafts)
  'dev': {
    includeDirs: ['docs-public', 'docs-internal', 'docs-operation', 'docs-finance'],
    excludeDirs: [],
    allowDrafts: true,
    description: 'Development build met alle content inclusief drafts'
  }
};

/**
 * Detecteer automatisch het hoogste beschikbare build type op basis van toegankelijke directories
 */
function detectAvailableBuildType() {
  const dirs = ['docs-finance', 'docs-operation', 'docs-internal', 'docs-public'];
  const available = [];
  
  for (const dir of dirs) {
    const indexPath = path.join(dir, 'index.md');
    if (fs.existsSync(indexPath) && !isEncrypted(indexPath)) {
      available.push(dir);
      console.log(`✅ Available: ${dir}`);
    } else {
      console.log(`🔒 Encrypted/Missing: ${dir}`);
    }
  }
  
  // Bepaal build type op basis van hoogste beschikbare level
  if (available.includes('docs-finance')) return 'full';
  if (available.includes('docs-operation')) return 'operational'; 
  if (available.includes('docs-internal')) return 'internal';
  return 'public';
}

/**
 * Krijg de huidige build type op basis van environment variabelen of auto-detectie
 */
function getBuildType() {
  // Expliciete BUILD_TYPE heeft voorrang (voor backwards compatibility)
  if (process.env.BUILD_TYPE) {
    const buildType = process.env.BUILD_TYPE;
    if (!BUILD_TYPES[buildType]) {
      console.warn(`Unknown BUILD_TYPE: ${buildType}, falling back to auto-detection`);
      return detectAvailableBuildType();
    }
    console.log(`🎯 Using explicit BUILD_TYPE: ${buildType}`);
    return buildType;
  }
  
  // Auto-detectie
  const detected = detectAvailableBuildType();
  console.log(`🔍 Auto-detected BUILD_TYPE: ${detected}`);
  return detected;
}

/**
 * Krijg build configuratie voor het huidige build type
 */
function getBuildConfig() {
  const buildType = getBuildType();
  const config = BUILD_TYPES[buildType];
  
  console.log(`🔧 Build Type: ${buildType} - ${config.description}`);
  console.log(`📁 Include: ${config.includeDirs.join(', ')}`);
  console.log(`🚫 Exclude: ${config.excludeDirs.join(', ') || 'none'}`);
  console.log(`📝 Drafts: ${config.allowDrafts ? 'ALLOWED' : 'EXCLUDED'}`);
  
  return config;
}

/**
 * Check of een directory toegestaan is voor het huidige build type
 */
function shouldIncludeDirectory(dirPath) {
  const config = getBuildConfig();
  const dirName = path.basename(dirPath);
  
  // Check of directory expliciet uitgesloten is
  if (config.excludeDirs.includes(dirName)) {
    return false;
  }
  
  // Check of directory in de include lijst staat
  if (config.includeDirs.length > 0) {
    return config.includeDirs.includes(dirName);
  }
  
  return true;
}

/**
 * Check of een bestand een draft is op basis van frontmatter
 */
function isDraftDocument(filePath) {
  try {
    if (!fs.existsSync(filePath) || !filePath.endsWith('.md')) {
      return false;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter } = matter(fileContent);
    
    // Check verschillende draft indicatoren
    return frontmatter.status === 'draft' ||
           frontmatter.draft === true ||
           frontmatter.published === false;
           
  } catch (error) {
    console.warn(`Could not parse frontmatter for ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Check of een bestand moet worden uitgesloten
 */
function shouldExcludeFile(filePath) {
  const config = getBuildConfig();
  
  // Check draft status
  if (!config.allowDrafts && isDraftDocument(filePath)) {
    return true;
  }
  
  // Check directory exclusion
  const dirPath = path.dirname(filePath);
  if (!shouldIncludeDirectory(dirPath)) {
    return true;
  }
  
  return false;
}

/**
 * Genereer exclude patterns voor Docusaurus plugin configuratie
 */
function generateExcludePatterns() {
  const config = getBuildConfig();
  const patterns = [];
  
  // Exclude directories
  for (const excludeDir of config.excludeDirs) {
    patterns.push(`${excludeDir}/**`);
  }
  
  // Exclude drafts (alleen als drafts niet toegestaan zijn)
  if (!config.allowDrafts) {
    // We kunnen niet direct op frontmatter filteren in Docusaurus exclude patterns
    // Dit wordt afgehandeld door een custom plugin/preprocessor
    patterns.push('**/_drafts/**'); // Conventionele draft directory
  }
  
  return patterns;
}

/**
 * Filter functie voor gebruik in Docusaurus plugin configuratie
 */
function createDocumentFilter() {
  return (filePath) => {
    const shouldExclude = shouldExcludeFile(filePath);
    
    if (shouldExclude) {
      console.log(`🚫 Excluding: ${filePath}`);
    }
    
    return !shouldExclude;
  };
}

/**
 * Debug functie om build configuratie te tonen
 */
function debugBuildConfig() {
  const buildType = getBuildType();
  const config = getBuildConfig();
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 BUILD CONFIGURATION');
  console.log('='.repeat(60));
  console.log(`Build Type: ${buildType}`);
  console.log(`Description: ${config.description}`);
  console.log(`Include Directories: ${config.includeDirs.join(', ')}`);
  console.log(`Exclude Directories: ${config.excludeDirs.join(', ') || 'none'}`);
  console.log(`Allow Drafts: ${config.allowDrafts ? 'YES' : 'NO'}`);
  console.log(`Exclude Patterns: ${generateExcludePatterns().join(', ') || 'none'}`);
  console.log('='.repeat(60) + '\n');
}

module.exports = {
  BUILD_TYPES,
  getBuildType,
  getBuildConfig,
  detectAvailableBuildType,
  shouldIncludeDirectory,
  isDraftDocument,
  shouldExcludeFile,
  generateExcludePatterns,
  createDocumentFilter,
  debugBuildConfig
};