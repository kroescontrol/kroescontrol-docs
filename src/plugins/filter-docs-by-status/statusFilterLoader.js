/**
 * Status Filter Loader
 * 
 * Deze webpack loader filtert markdown documenten op basis van hun docStatus.
 * - Documenten met uitgesloten statussen worden volledig uitgesloten (via build-exclusion-utils)
 * - Documenten met 'completed' status worden uit sidebar verborgen maar wel als pagina gegenereerd
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
    
    // Controleer of dit document uit sidebar verborgen moet worden (maar wel pagina genereren)
    if (options.hideFromSidebar && options.hideFromSidebar.includes(docStatus)) {
      // In productie: verberg uit sidebar door sidebar_position op null te zetten
      if (process.env.NODE_ENV === 'production') {
        const hiddenFromSidebarData = {
          ...data,
          sidebar_position: null, // Verberg uit sidebar
          sidebar_class_name: 'hidden-from-sidebar', // CSS class voor styling
        };
        
        const newContent = matter.stringify(content, hiddenFromSidebarData);
        return callback(null, newContent);
      }
      
      // In development: toon normaal met indicator
      const devData = {
        ...data,
        sidebar_class_name: 'dev-hidden-in-production', // CSS class voor development indicator
      };
      
      const devContent = matter.stringify(content, devData);
      return callback(null, devContent);
    }
    
    // Controleer of de status moet worden uitgesloten (deze check is nu redundant omdat build-exclusion-utils dit al doet)
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
