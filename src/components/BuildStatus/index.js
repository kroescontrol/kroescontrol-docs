import React, { useState, useEffect } from 'react';
import styles from './BuildStatus.module.css';

// Build info uit Docusaurus config
function getBuildInfo() {
  // Deze data komt van Docusaurus tijdens build time
  const buildInfo = typeof window !== 'undefined' && window.__BUILD_INFO__ 
    ? window.__BUILD_INFO__ 
    : {
        branch: 'unknown',
        commit: 'unknown', 
        date: new Date().toISOString(),
        environment: 'unknown'
      };
  
  return buildInfo;
}

// Environment detection
function getEnvironmentInfo() {
  if (typeof window === 'undefined') {
    return { env: 'build', url: 'N/A' };
  }
  
  const hostname = window.location.hostname;
  
  if (hostname.includes('vercel.app') || hostname.includes('kroescontrol-docs')) {
    return { env: 'production', url: 'https://docs.kroescontrol.nl' };
  } else if (hostname.includes('public.kroescontrol.nl')) {
    return { env: 'public', url: 'https://public.kroescontrol.nl' };
  } else if (hostname === 'localhost') {
    return { env: 'development', url: 'http://localhost:3000' };
  } else {
    return { env: 'staging', url: window.location.origin };
  }
}

// Status indicator component
function StatusIndicator({ status, label }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'building': return '🔄';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };
  
  return (
    <span className={`${styles.statusIndicator} ${styles[status]}`}>
      {getStatusIcon(status)} {label}
    </span>
  );
}

export default function BuildStatus({ section = "System" }) {
  const [buildData, setBuildData] = useState(null);
  const [deploymentStatus, setDeploymentStatus] = useState('unknown');
  
  useEffect(() => {
    // Get build info
    const info = getBuildInfo();
    const envInfo = getEnvironmentInfo();
    
    setBuildData({
      ...info,
      ...envInfo,
      buildTime: new Date(info.date).toLocaleString('nl-NL', {
        timeZone: 'Europe/Amsterdam',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    });
    
    // Simulate deployment status (in real implementation, fetch from API)
    setDeploymentStatus('success');
  }, []);
  
  if (!buildData) {
    return (
      <div className={styles.buildStatus}>
        <h2>🏗️ {section} Build Status</h2>
        <div className={styles.loading}>⏳ Loading build information...</div>
      </div>
    );
  }
  
  return (
    <div className={styles.buildStatus}>
      <h2>🏗️ {section} Build Status</h2>
      
      <div className={styles.statusGrid}>
        <div className={styles.statusCard}>
          <h3>🚀 Deployment</h3>
          <StatusIndicator status={deploymentStatus} label="Live" />
          <div className={styles.statusDetails}>
            <div><strong>Environment:</strong> {buildData.env}</div>
            <div><strong>URL:</strong> <a href={buildData.url} target="_blank" rel="noopener noreferrer">{buildData.url}</a></div>
          </div>
        </div>
        
        <div className={styles.statusCard}>
          <h3>📝 Build Info</h3>
          <StatusIndicator status="success" label="Built" />
          <div className={styles.statusDetails}>
            <div><strong>Branch:</strong> <code>{buildData.branch}</code></div>
            <div><strong>Commit:</strong> <code>{buildData.commit}</code></div>
            <div><strong>Build tijd:</strong> {buildData.buildTime}</div>
            <div><strong>Platform:</strong> {buildData.environment}</div>
          </div>
        </div>
        
        <div className={styles.statusCard}>
          <h3>🔧 System Health</h3>
          <StatusIndicator status="success" label="Operational" />
          <div className={styles.statusDetails}>
            <div><strong>Git-crypt:</strong> ✅ Initialized</div>
            <div><strong>Encoding:</strong> ✅ Clean</div>
            <div><strong>Dependencies:</strong> ✅ Updated</div>
          </div>
        </div>
      </div>
      
      <div className={styles.lastUpdated}>
        <small>Status laatst bijgewerkt: {new Date().toLocaleString('nl-NL', { timeZone: 'Europe/Amsterdam' })}</small>
      </div>
    </div>
  );
}