/**
 * Content Generatie Script met docStatus Ondersteuning
 * 
 * Dit script maakt gebruik van Claude API om documentatie te genereren
 * en bij te werken op basis van de docStatus frontmatter property.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const axios = require('axios');
const { program } = require('commander');
const { 
  getDocumentsByStatus,
  upgradeDocStatus,
  processDocsByStatus,
  generateStatusReport
} = require('./docStatusScripts');

// Claude API configuratie
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-7-sonnet-20250219';

/**
 * Genereert een Claude prompt voor documentatie generatie
 * @param {string} filePath - Pad naar het te genereren/updaten document
 * @param {string} action - Gewenste actie ('create', 'update', 'refine')
 * @param {object} details - Details over het document
 * @returns {string} De gegenereerde prompt
 */
function generateDocumentationPrompt(filePath, action, details) {
  let currentStatus = 'n/a';
  let currentContent = '';
  
  // Controleer of het bestand bestaat
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    currentStatus = data.docStatus || 'unknown';
    currentContent = fileContent;
  }
  
  // Basis prompt template
  const promptTemplate = `
Je bent een documentatie-expert die technische documentatie schrijft voor ons bedrijf. Je taak is om ${details.description} uit te voeren volgens onze standaarden.

## Document Status Systeem

We gebruiken een document status systeem met de volgende statussen in onze frontmatter:

- \`templated\`: Initieel bestand dat automatisch is aangemaakt. Dit document is nog leeg of bevat alleen een basisstructuur.
- \`generated\`: Document met automatisch gegenereerde content die nog niet is gevalideerd.
- \`completed\`: Document dat is gevalideerd en als compleet wordt beschouwd.
- \`live\`: Document dat actief wordt gebruikt in productie. Wijzigingen moeten zorgvuldig worden doorgevoerd.
- \`locked\`: Kritiek document dat niet mag worden gewijzigd zonder expliciete goedkeuring.

## Instructies voor Generatie

1. Als je een **nieuw document** genereert:
   - Gebruik \`docStatus: templated\` in de frontmatter
   - Creëer een basisstructuur met minimaal de secties: Inleiding, Functionaliteit, Gebruik, en Voorbeelden

2. Als je content genereert voor een **bestaand templated document**:
   - Update de frontmatter naar \`docStatus: generated\`
   - Behoud bestaande structuur en vul deze aan met gedetailleerde informatie
   - Voeg extra secties toe indien nodig

3. Als je een **generated document** verfijnt:
   - Behoud de \`docStatus: generated\`
   - Verbeter de inhoud op basis van de feedback of aanvullende informatie
   - Zorg voor consistentie in terminologie en stijl

4. Bij het genereren van content, zorg altijd voor:
   - Duidelijke koppen en subkoppen
   - Codevoorbeelden waar relevant
   - Uitleg van concepten voordat ze worden gebruikt
   - Consistente terminologie

## Te Genereren Document

${details.topic}

${currentContent ? `## Huidige Document\n\n\`\`\`markdown\n${currentContent}\n\`\`\`` : ''}

## Huidige Status

De huidige status van dit document is: \`${currentStatus}\`

## Actie

${getActionDescription(action, currentStatus)}
  `;
  
  return promptTemplate.trim();
}

/**
 * Bepaalt de beschrijving voor de actie op basis van de huidige status
 */
function getActionDescription(action, currentStatus) {
  switch (action) {
    case 'create':
      return 'Genereer een nieuw document met de juiste frontmatter en basisstructuur.';
    case 'update':
      if (currentStatus === 'templated') {
        return 'Genereer volledige content voor dit document en update de status naar `generated`.';
      } else {
        return 'Update de bestaande content met nieuwe informatie maar behoud de huidige status.';
      }
    case 'refine':
      return 'Verfijn de bestaande content, verbeter de kwaliteit en helderheid, maar behoud de huidige status.';
    default:
      return 'Genereer passende content voor dit document.';
  }
}

/**
 * Genereert content met Claude API
 * @param {string} prompt - De prompt voor Claude
 * @returns {Promise<string>} De gegenereerde content
 */
async function generateWithClaude(prompt) {
  try {
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: CLAUDE_MODEL,
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      }
    );
    
    return response.data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error.response?.data || error.message);
    throw new Error('Failed to generate content with Claude');
  }
}

/**
 * Verwerkt een document met Claude
 * @param {string} filePath - Pad naar het document
 * @param {string} action - Actie ('create', 'update', 'refine')
 * @param {object} details - Details voor de prompt
 * @returns {Promise<boolean>} True als succesvol, anders false
 */
async function processDocumentWithClaude(filePath, action, details) {
  try {
    // Genereer de prompt
    const prompt = generateDocumentationPrompt(filePath, action, details);
    
    // Log de prompt voor debugging
    console.log(`\nGenerating content for ${filePath} with action ${action}...`);
    
    // Genereer content met Claude
    const generatedContent = await generateWithClaude(prompt);
    
    // Bepaal de nieuwe status op basis van de actie en huidige status
    let newStatus;
    if (action === 'create') {
      newStatus = 'templated';
    } else if (action === 'update') {
      // Als het bestand bestaat, lees de huidige status
      if (fs.existsSync(filePath)) {
        const { data } = matter(fs.readFileSync(filePath, 'utf8'));
        if (data.docStatus === 'templated') {
          newStatus = 'generated';
        } else {
          newStatus = data.docStatus; // Behoud huidige status
        }
      } else {
        newStatus = 'generated';
      }
    } else {
      // Voor refine, behoud de huidige status
      if (fs.existsSync(filePath)) {
        const { data } = matter(fs.readFileSync(filePath, 'utf8'));
        newStatus = data.docStatus;
      } else {
        newStatus = 'generated';
      }
    }
    
    // Zorg ervoor dat de directory bestaat
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Schrijf het gegenereerde content naar het bestand
    fs.writeFileSync(filePath, generatedContent);
    
    console.log(`Content generated and saved to ${filePath}`);
    
    // Als de actie 'update' is en het huidige document heeft status 'templated',
    // werk de status bij naar 'generated'
    if (action === 'update' && fs.existsSync(filePath)) {
      const { data } = matter(fs.readFileSync(filePath, 'utf8'));
      if (data.docStatus === 'templated') {
        upgradeDocStatus(filePath, 'generated');
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error processing document ${filePath}:`, error);
    return false;
  }
}

/**
 * Verwerkt alle documenten met een specifieke status
 * @param {string} docsDir - Pad naar de docs directory
 * @param {string} status - De status om te verwerken
 * @param {object} details - Details voor de prompt
 * @returns {Promise<object>} Resultaten van de verwerking
 */
async function processAllDocumentsByStatus(docsDir, status, details) {
  // Zoek alle documenten met de gegeven status
  const documents = getDocumentsByStatus(docsDir, status);
  
  console.log(`Found ${documents.length} documents with status ${status}`);
  
  const results = {
    total: documents.length,
    processed: 0,
    errors: 0,
    details: [],
  };
  
  // Bepaal de actie op basis van status
  let action;
  if (status === 'templated') {
    action = 'update';
  } else if (status === 'generated') {
    action = 'refine';
  } else {
    action = 'update';
  }
  
  // Verwerk elk document
  for (const doc of documents) {
    console.log(`Processing ${doc.relativePath}...`);
    
    try {
      const success = await processDocumentWithClaude(
        doc.path,
        action,
        {
          ...details,
          description: `de content voor ${doc.relativePath} bij te werken`,
        }
      );
      
      if (success) {
        results.processed++;
        results.details.push({
          path: doc.relativePath,
          status: 'success',
        });
      } else {
        results.errors++;
        results.details.push({
          path: doc.relativePath,
          status: 'error',
        });
      }
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
  
  return results;
}

// CLI commando's instellen
program
  .version('1.0.0')
  .description('Documentatie generatie tool met docStatus ondersteuning');

// Commando voor het genereren van een nieuw document
program
  .command('create <filePath>')
  .description('Genereer een nieuw document')
  .option('-t, --topic <topic>', 'Onderwerp van het document')
  .option('-d, --description <description>', 'Beschrijving van de taak')
  .action(async (filePath, options) => {
    try {
      const success = await processDocumentWithClaude(
        filePath,
        'create',
        {
          topic: options.topic || 'Documentatie over dit onderwerp',
          description: options.description || 'een nieuw document te creëren',
        }
      );
      
      if (success) {
        console.log(`✅ Document succesvol gegenereerd: ${filePath}`);
      } else {
        console.error(`❌ Fout bij het genereren van document: ${filePath}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Commando voor het updaten van een bestaand document
program
  .command('update <filePath>')
  .description('Update een bestaand document')
  .option('-t, --topic <topic>', 'Onderwerp van het document')
  .option('-d, --description <description>', 'Beschrijving van de taak')
  .action(async (filePath, options) => {
    try {
      const success = await processDocumentWithClaude(
        filePath,
        'update',
        {
          topic: options.topic || 'Update de content van dit document',
          description: options.description || 'een bestaand document bij te werken',
        }
      );
      
      if (success) {
        console.log(`✅ Document succesvol geüpdatet: ${filePath}`);
      } else {
        console.error(`❌ Fout bij het updaten van document: ${filePath}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Commando voor het verwerken van alle documenten met een specifieke status
program
  .command('process-status <docsDir> <status>')
  .description('Verwerk alle documenten met een specifieke status')
  .option('-t, --topic <topic>', 'Algemeen onderwerp voor alle documenten')
  .option('-d, --description <description>', 'Algemene beschrijving van de taak')
  .action(async (docsDir, status, options) => {
    try {
      const results = await processAllDocumentsByStatus(
        docsDir,
        status,
        {
          topic: options.topic || `Update documenten met status ${status}`,
          description: options.description || `documenten met status ${status} bij te werken`,
        }
      );
      
      console.log(`✅ Verwerking voltooid: ${results.processed}/${results.total} documenten verwerkt, ${results.errors} fouten`);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Commando voor het genereren van een statusrapport
program
  .command('report <docsDir>')
  .description('Genereer een statusrapport voor documenten')
  .action((docsDir) => {
    try {
      const report = generateStatusReport(docsDir);
      console.log(JSON.stringify(report, null, 2));
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Commando voor het bijwerken van een document status
program
  .command('set-status <filePath> <newStatus>')
  .description('Werk de status van een document bij')
  .action((filePath, newStatus) => {
    try {
      const validStatuses = ['templated', 'generated', 'completed', 'live', 'locked'];
      
      if (!validStatuses.includes(newStatus)) {
        console.error(`Ongeldige status: ${newStatus}. Geldige statussen zijn: ${validStatuses.join(', ')}`);
        process.exit(1);
      }
      
      const success = upgradeDocStatus(filePath, newStatus);
      
      if (success) {
        console.log(`✅ Status succesvol bijgewerkt naar ${newStatus}: ${filePath}`);
      } else {
        console.error(`❌ Fout bij het bijwerken van status: ${filePath}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Parse de commando's
program.parse(process.argv);

// Als er geen commando is opgegeven, toon help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}