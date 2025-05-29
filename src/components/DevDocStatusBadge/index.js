import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './styles.module.css';

const DevDocStatusBadge = () => {
  // Tonen in development OF als we in een staging deployment zitten
  const isStaging = typeof window !== 'undefined' && (
    window.location.hostname.includes('staging') ||
    window.location.hostname.includes('vercel.app') ||
    (typeof process !== 'undefined' && process.env.VERCEL_GIT_COMMIT_REF && process.env.VERCEL_GIT_COMMIT_REF.includes('staging'))
  );
  
  if (process.env.NODE_ENV !== 'development' && !isStaging) {
    return null;
  }

  const location = useLocation();
  const [docData, setDocData] = useState({ docStatus: null, title: null });

  const [isVisible, setIsVisible] = useState(() => {
    const saved = localStorage.getItem('devDocStatusVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    // Listen voor storage changes
    const handleStorageChange = () => {
      const saved = localStorage.getItem('devDocStatusVisible');
      setIsVisible(saved !== null ? JSON.parse(saved) : true);
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Haal frontMatter data op uit plugin
  let frontMatterData = null;
  try {
    const pluginData = usePluginData('frontmatter-provider');
    frontMatterData = pluginData?.frontMatterMap || {};
    
    // Debug plugin data (in development of staging)
    if (process.env.NODE_ENV === 'development' || isStaging) {
      console.log('FrontMatter Plugin Data:', {
        totalDocuments: pluginData?.totalDocuments,
        availablePaths: Object.keys(frontMatterData),
        currentPath: location.pathname,
        currentPageData: frontMatterData[location.pathname],
        environment: process.env.NODE_ENV,
        isStaging: isStaging
      });
    }
  } catch (error) {
    console.warn('FrontMatter plugin data not available:', error);
    frontMatterData = {};
  }

  useEffect(() => {
    const pathname = location.pathname;
    
    // Probeer echte frontMatter data te gebruiken
    const realData = frontMatterData[pathname];
    
    let docData;
    if (realData && realData.docStatus) {
      // Gebruik echte data uit plugin
      docData = {
        docStatus: realData.docStatus,
        title: realData.title || 'Document',
        description: realData.description,
        tags: realData.tags,
        lastUpdate: realData.last_update,
        isRealData: true
      };
      console.log('📄 Using REAL frontMatter data:', docData);
    } else {
      // Fallback naar pathname-based logic
      let fallbackData = { docStatus: 'completed', title: 'Documentation' };
      
      if (pathname.includes('docstatus-ux-test')) {
        fallbackData = { docStatus: 'live', title: 'DocStatus UX Test Document' };
      } else if (pathname.includes('team-authorization')) {
        fallbackData = { docStatus: 'completed', title: 'Team Authorization Guide' };
      } else if (pathname.includes('git-crypt')) {
        fallbackData = { docStatus: 'completed', title: 'Git-Crypt Guide' };
      } else if (pathname.includes('claude-code')) {
        fallbackData = { docStatus: 'generated', title: 'Claude Code Structure' };
      }
      
      docData = { ...fallbackData, isRealData: false };
      console.log('📄 Using FALLBACK data:', docData);
    }
    
    setDocData(docData);
  }, [location, frontMatterData]);

  // Niet tonen als toggle uit staat
  if (!isVisible) {
    return null;
  }

  const { docStatus, title, description, tags, lastUpdate, isRealData } = docData;

  // Status configuratie
  const statusConfig = {
    templated: {
      label: 'Template',
      color: '#e74c3c',
      icon: '📄',
      description: 'Dit document is nog een template'
    },
    generated: {
      label: 'Gegenereerd',
      color: '#f39c12',
      icon: '🤖',
      description: 'Document is gegenereerd door AI'
    },
    completed: {
      label: 'Voltooid',
      color: '#27ae60',
      icon: '✅',
      description: 'Document is compleet en gereviewed'
    },
    live: {
      label: 'Live',
      color: '#2ecc71',
      icon: '🟢',
      description: 'Document is live en actueel'
    },
    locked: {
      label: 'Vergrendeld',
      color: '#95a5a6',
      icon: '🔒',
      description: 'Document is vergrendeld voor bewerking'
    }
  };

  const currentStatus = statusConfig[docStatus] || {
    label: docStatus || 'Onbekend',
    color: '#bdc3c7',
    icon: '❓',
    description: 'Status onbekend'
  };

  // Voor nu geen lastUpdated functionaliteit
  const editUrl = `https://github.com/kroescontrol/kroescontrol-docs/edit/staging-serge${location.pathname}.md`;

  return (
    <div className={styles.devStatusBadge}>
      <div className={styles.statusHeader}>
        <span 
          className={styles.statusBadge}
          style={{ backgroundColor: currentStatus.color }}
          title={currentStatus.description}
        >
          {currentStatus.icon} {currentStatus.label}
        </span>
        <div className={styles.headerLabels}>
          <span className={styles.devLabel}>
            {process.env.NODE_ENV === 'development' ? 'DEV' : isStaging ? 'STAGING' : 'DEBUG'}
          </span>
          <span 
            className={`${styles.dataSourceLabel} ${isRealData ? styles.realData : styles.fallbackData}`}
            title={isRealData ? 'Data uit echte frontMatter' : 'Fallback data (geen frontMatter gevonden)'}
          >
            {isRealData ? '📄 REAL' : '🔄 FALLBACK'}
          </span>
        </div>
      </div>
      
      <div className={styles.statusDetails}>
        <div className={styles.statusRow}>
          <strong>Titel:</strong> {title}
        </div>
        
        <div className={styles.statusRow}>
          <strong>Status:</strong> {currentStatus.description}
        </div>
        
        <div className={styles.statusRow}>
          <strong>Pad:</strong> {location.pathname}
        </div>
        
        {description && (
          <div className={styles.statusRow}>
            <strong>Beschrijving:</strong> {description}
          </div>
        )}
        
        {tags && tags.length > 0 && (
          <div className={styles.statusRow}>
            <strong>Tags:</strong> {tags.join(', ')}
          </div>
        )}
        
        {lastUpdate && (
          <div className={styles.statusRow}>
            <strong>Laatste update:</strong> {lastUpdate.date || lastUpdate}
            {lastUpdate.author && <span> door {lastUpdate.author}</span>}
          </div>
        )}
        
        <div className={styles.statusRow}>
          <a 
            href={editUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.editLink}
          >
            📝 Bewerk dit document
          </a>
        </div>
      </div>
    </div>
  );
};

export default DevDocStatusBadge;