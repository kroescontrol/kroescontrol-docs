/**
 * Status Indicator Component
 * 
 * Deze component toont een visuele indicator voor de docStatus van een document.
 * Het kan worden gebruikt in een swizzled DocItem component.
 */

// src/plugins/filter-docs-by-status/theme/DocStatusIndicator/index.js
import React from 'react';
import { usePluginData } from '@docusaurus/useGlobalData';

export default function DocStatusIndicator({ frontMatter }) {
  // Haal plugin data op
  const { pluginOptions } = usePluginData('filter-docs-by-status');
  
  // Als visuele indicators zijn uitgeschakeld, toon niets
  if (!pluginOptions.enableVisualIndicators) {
    return null;
  }
  
  // Haal docStatus op uit frontMatter
  const { docStatus } = frontMatter;
  
  // Als er geen docStatus is, toon niets
  if (!docStatus) {
    return null;
  }
  
  // Map voor labels per status
  const statusLabels = {
    templated: 'Template',
    generated: 'Gegenereerd',
    completed: 'Voltooid',
    live: 'Live',
    locked: 'Vergrendeld',
  };
  
  // Custom labels uit plugin opties gebruiken indien beschikbaar
  const labels = {
    ...statusLabels,
    ...(pluginOptions.statusLabels || {}),
  };
  
  // Label voor de huidige status
  const label = labels[docStatus] || docStatus;
  
  return (
    <span 
      className={`doc-status-indicator doc-status-${docStatus}`}
      title={`Document status: ${docStatus}`}
    >
      {label}
    </span>
  );
}

// Om deze component te gebruiken, swizzle de DocItem component:
// 
// // In een aangepaste DocItem component
// import DocStatusIndicator from '@theme/DocStatusIndicator';
// 
// function DocItem(props) {
//   const { content: DocContent } = props;
//   const { frontMatter, metadata } = DocContent;
//   
//   return (
//     <div>
//       <h1>
//         {metadata.title}
//         <DocStatusIndicator frontMatter={frontMatter} />
//       </h1>
//       <DocContent />
//     </div>
//   );
// }
