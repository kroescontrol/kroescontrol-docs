import React from 'react';

interface DraftBannerProps {
  message?: string;
}

export const DraftBanner: React.FC<DraftBannerProps> = ({ 
  message = "Deze pagina is nog in ontwikkeling" 
}) => {
  if (process.env.NODE_ENV === 'production') {
    return (
      <div style={{
        padding: '1rem',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        marginBottom: '2rem',
        color: '#856404'
      }}>
        <strong>⚠️ Concept</strong> - {message}
      </div>
    );
  }
  
  return (
    <div style={{
      padding: '1rem',
      background: '#d1ecf1',
      border: '1px solid #bee5eb',
      borderRadius: '4px',
      marginBottom: '2rem',
      color: '#0c5460'
    }}>
      <strong>📝 Draft Mode</strong> - {message} (alleen zichtbaar in development)
    </div>
  );
};