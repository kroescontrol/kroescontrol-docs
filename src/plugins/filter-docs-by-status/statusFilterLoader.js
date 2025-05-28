/**
 * Status Filter Loader
 * 
 * Deze webpack loader filtert markdown documenten op basis van hun docStatus.
 * Documenten met uitgesloten statussen worden vervangen door lege content.
 */

const matter = require('gray-matter');

module.exports = function(source) {
  const callback = this.async();
  const options = this.getOptions();
  
  try {
    // Parse frontmatter
    const { data, content } = matter(source);
    const { docStatus } = data;
    
    // Als docStatus niet is gedefinieerd, doe niets
    if (!docStatus) {
      return callback(null, source);
    }
    
    // Controleer of de status moet worden uitgesloten
    if (options.excludeStatuses && options.excludeStatuses.includes(docStatus)) {
      // Voor development builds, toon een placeholder bericht
      if (process.env.NODE_ENV === 'development') {
        const newContent = matter.stringify(
          `## Document Uitgesloten (Status: ${docStatus})

Dit document heeft status \`${docStatus}\` en wordt niet opgenomen in de productie build.

_Dit bericht wordt alleen getoond in de development omgeving._`,
          { ...data, title: `[${docStatus}] ${data.title || 'Document'}` }
        );
        return callback(null, newContent);
      } else {
        // Voor productie builds, maak een "leeg" document dat niet wordt gerenderd
        const emptyContent = matter.stringify(
          '', 
          { 
            draft: true, // Markeer als draft zodat het wordt uitgesloten
            title: `[EXCLUDED] ${data.title || 'Document'}`,
            id: `excluded-${Date.now()}` // Unieke ID om conflicten te voorkomen
          }
        );
        return callback(null, emptyContent);
      }
    }
    
    // Controleer of er custom gedrag is gedefinieerd voor deze status
    if (
      options.customStatusBehaviors && 
      options.customStatusBehaviors[docStatus]
    ) {
      const behavior = options.customStatusBehaviors[docStatus];
      
      // Voer custom transformatie uit indien gedefinieerd
      if (typeof behavior.transform === 'function') {
        const transformed = behavior.transform(data, content);
        return callback(null, transformed);
      }
    }
    
    // Als we hier komen, verwerk het document normaal
    return callback(null, source);
  } catch (error) {
    // Log de error en geef het originele document terug
    console.error('Error in statusFilterLoader:', error);
    return callback(null, source);
  }
};
