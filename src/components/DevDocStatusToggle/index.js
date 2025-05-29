import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const DevDocStatusToggle = () => {
  // Tonen in development OF als we in een staging deployment zitten
  const isStaging = typeof window !== 'undefined' && (
    window.location.hostname.includes('staging') ||
    window.location.hostname.includes('vercel.app') ||
    (typeof process !== 'undefined' && process.env.VERCEL_GIT_COMMIT_REF && process.env.VERCEL_GIT_COMMIT_REF.includes('staging'))
  );
  
  if (process.env.NODE_ENV !== 'development' && !isStaging) {
    return null;
  }

  const [isVisible, setIsVisible] = useState(() => {
    // Check localStorage voor persistente voorkeur
    const saved = localStorage.getItem('devDocStatusVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    // Persisteer de voorkeur
    localStorage.setItem('devDocStatusVisible', JSON.stringify(isVisible));
    
    // Voeg CSS class toe aan body voor global styling
    if (isVisible) {
      document.body.classList.add('dev-docstatus-visible');
      document.body.classList.remove('dev-docstatus-hidden');
    } else {
      document.body.classList.add('dev-docstatus-hidden');
      document.body.classList.remove('dev-docstatus-visible');
    }
  }, [isVisible]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <button
      className={styles.toggleButton}
      onClick={toggleVisibility}
      title={`${isVisible ? 'Verberg' : 'Toon'} docStatus badges`}
    >
      {isVisible ? '👁️' : '👁️‍🗨️'} docStatus
    </button>
  );
};

export default DevDocStatusToggle;