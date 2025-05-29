/**
 * Document Status Management Scripts
 * 
 * Deze scripts bieden functionaliteit voor het beheren van document statussen:
 * - Scannen van documenten op basis van status
 * - Bijwerken van document statussen
 * - Verwerken van documenten op basis van status
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

/**
 * Vindt alle documenten met een specifieke status
 * @param {string} docsDir - Het pad naar de docs directory
 * @param {string|string[]} status - De status of statussen om op te filteren
 * @returns {Array} Een array van objecten met documentinformatie
 */
function getDocumentsByStatus(docsDir, status) {
  const statuses = Array.isArray(status) ? status : [status];
  const docs = [];
  
  // Zoek alle markdown bestanden
  const files = glob.sync(`${docsDir}/**/*.{md,mdx}`);
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const { data } = matter(content);
      
      // Als het document een van de gezochte statussen heeft, voeg toe aan resultaat
      if (data.docStatus && statuses.includes(data.docStatus)) {
        docs.push({
          path: file,
          relativePath: path.relative(docsDir, file),
          frontmatter: data,
          status: data.docStatus,
        });
      }
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }
  
  return docs;
}

/**
 * Werkt de status van een document bij
 * @param {string|object} doc - Het pad naar het document of een document object
 * @param {string} newStatus - De nieuwe status
 * @returns {boolean} True als de update succesvol was, anders false
 */
function upgradeDocStatus(doc, newStatus) {
  const filePath = typeof doc === 'string' ? doc : doc.path;
  
  try {
    // Lees het bestand
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: docContent } = matter(content);
    
    // Sla de oude status op voor logging
    const oldStatus = data.docStatus;
    
    // Update de status
    data.docStatus = newStatus;
    
    // Schrijf terug naar bestand
    const newContent = matter.stringify(docContent, data);
    fs.writeFileSync(filePath, newContent);
    
    console.log(`Updated ${filePath} from ${oldStatus || 'undefined'} to ${newStatus}`);
    return true;
  } catch (error) {
    console.error(`Error updating status for ${filePath}:`, error);
    return false;
  }
}

/**
 * Verwerkt documenten op basis van hun huidige status
 * @param {string} docsDir - Het pad naar de docs directory
 * @param {object} options - Opties voor verwerking
 * @returns {object} Resultaten van de verwerking
 */
async function processDocsByStatus(docsDir, options = {}) {
  const results = {
    processed: 0,
    errors: 0,
    skipped: 0,
    details: [],
  };
  
  // Default opties
  const defaultOptions = {
    processTemplated: true,
    processGenerated: true,
    upgradeTemplated: true,
    upgradeGenerated: false,
    dryRun: false,
  };
  
  // Combineer default opties met gebruiker-gedefinieerde opties
  const processOptions = { ...defaultOptions, ...options };
  
  // Verzamel te verwerken documenten
  const docsToProcess = [];
  
  // Verzamel templated documenten indien nodig
  if (processOptions.processTemplated) {
    const templatedDocs = getDocumentsByStatus(docsDir, 'templated');
    docsToProcess.push(...templatedDocs.map(doc => ({ ...doc, targetStatus: 'generated' })));
  }
  
  // Verzamel generated documenten indien nodig
  if (processOptions.processGenerated) {
    const generatedDocs = getDocumentsByStatus(docsDir, 'generated');
    docsToProcess.push(...generatedDocs.map(doc => ({ ...doc, targetStatus: 'completed' })));
  }
  
  // Verwerk elk document
  for (const doc of docsToProcess) {
    try {
      // Implementeer hier je documentverwerking
      // Bijvoorbeeld: content generatie, validatie, etc.
      
      // Voorbeeld: Log welk document wordt verwerkt
      console.log(`Processing ${doc.relativePath} (${doc.status} -> ${doc.targetStatus})`);
      
      // Voeg hier je verwerkingslogica toe
      // ...
      
      // Bepaal of de status moet worden bijgewerkt
      let shouldUpgrade = false;
      if (doc.status === 'templated' && processOptions.upgradeTemplated) {
        shouldUpgrade = true;
      } else if (doc.status === 'generated' && processOptions.upgradeGenerated) {
        shouldUpgrade = true;
      }
      
      // Werk de status bij indien nodig (tenzij dry run)
      if (shouldUpgrade && !processOptions.dryRun) {
        const upgraded = upgradeDocStatus(doc, doc.targetStatus);
        if (!upgraded) {
          results.errors++;
          results.details.push({
            path: doc.relativePath,
            status: 'error',
            message: 'Failed to upgrade status',
          });
          continue;
        }
      }
      
      // Document succesvol verwerkt
      results.processed++;
      results.details.push({
        path: doc.relativePath,
        status: 'processed',
        fromStatus: doc.status,
        toStatus: shouldUpgrade ? doc.targetStatus : doc.status,
      });
    } catch (error) {
      console.error(`Error processing ${doc.relativePath}:`, error);
      results.errors++;
      results.details.push({
        path: doc.relativePath,
        status: 'error',
        message: error.message,
      });
    }
  }
  
  // Geef resultaten terug
  results.total = docsToProcess.length;
  return results;
}

/**
 * Genereert een statusrapport voor documenten
 * @param {string} docsDir - Het pad naar de docs directory
 * @returns {object} Rapport met statistieken per status
 */
function generateStatusReport(docsDir) {
  // Zoek alle markdown bestanden
  const files = glob.sync(`${docsDir}/**/*.{md,mdx}`);
  
  // Statistieken initialiseren
  const stats = {
    total: files.length,
    byStatus: {},
    noStatus: 0,
    byDirectory: {},
  };
  
  // Verwerk elk bestand
  for (const file of files) {
    try {
      // Lees het bestand
      const content = fs.readFileSync(file, 'utf8');
      const { data } = matter(content);
      
      // Bepaal status
      const status = data.docStatus || 'undefined';
      
      // Update status statistieken
      if (!stats.byStatus[status]) {
        stats.byStatus[status] = 0;
      }
      stats.byStatus[status]++;
      
      // Update no-status telling
      if (!data.docStatus) {
        stats.noStatus++;
      }
      
      // Update directory statistieken
      const directory = path.dirname(path.relative(docsDir, file));
      if (!stats.byDirectory[directory]) {
        stats.byDirectory[directory] = {
          total: 0,
          byStatus: {},
        };
      }
      stats.byDirectory[directory].total++;
      if (!stats.byDirectory[directory].byStatus[status]) {
        stats.byDirectory[directory].byStatus[status] = 0;
      }
      stats.byDirectory[directory].byStatus[status]++;
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }
  
  return stats;
}

module.exports = {
  getDocumentsByStatus,
  upgradeDocStatus,
  processDocsByStatus,
  generateStatusReport,
};

// Voorbeeld gebruik:
// 
// // Import de functies
// const { 
//   getDocumentsByStatus,
//   upgradeDocStatus,
//   processDocsByStatus,
//   generateStatusReport
// } = require('./docStatusScripts');
// 
// // Zoek alle templated documenten
// const templatedDocs = getDocumentsByStatus('./docs', 'templated');
// console.log(`Found ${templatedDocs.length} templated documents`);
// 
// // Werk een status bij
// upgradeDocStatus('./docs/intro.md', 'generated');
// 
// // Verwerk documenten
// processDocsByStatus('./docs', {
//   processTemplated: true,
//   upgradeTemplated: true,
//   dryRun: false,
// }).then(results => {
//   console.log(`Processed ${results.processed} documents with ${results.errors} errors`);
// });
// 
// // Genereer een rapport
// const report = generateStatusReport('./docs');
// console.log(report);
