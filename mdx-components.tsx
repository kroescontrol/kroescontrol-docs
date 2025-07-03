import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // Provide stub components that Nextra expects
    // These will not be used since the MDX files use inline styled divs
    Callout: ({ children, type }: any) => {
      const styles = {
        warning: {
          backgroundColor: '#fff3cd',
          borderColor: '#ffeeba',
          color: '#856404',
          icon: '⚠️'
        },
        info: {
          backgroundColor: '#e3f2fd',
          borderColor: '#90caf9',
          color: '#1565c0',
          icon: 'ℹ️'
        },
        error: {
          backgroundColor: '#ffebee',
          borderColor: '#ffcdd2',
          color: '#c62828',
          icon: '❌'
        },
        success: {
          backgroundColor: '#e8f5e9',
          borderColor: '#a5d6a7',
          color: '#2e7d32',
          icon: '✅'
        },
        default: {
          backgroundColor: '#f5f5f5',
          borderColor: '#e0e0e0',
          color: '#424242',
          icon: '📌'
        }
      };
      
      const style = styles[type as keyof typeof styles] || styles.default;
      
      return (
        <div style={{
          backgroundColor: style.backgroundColor,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          border: `1px solid ${style.borderColor}`,
          color: style.color
        }}>
          {style.icon} {children}
        </div>
      );
    },
    Cards: ({ children }: any) => (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px',
        marginBottom: '30px'
      }}>
        {children}
      </div>
    ),
    Card: ({ title, href, children }: any) => (
      <a href={href || '#'} style={{
        display: 'block',
        padding: '20px',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s'
      }}>
        <h3 style={{margin: '0 0 8px 0'}}>{title}</h3>
        <p style={{margin: 0, color: '#6b7280'}}>{children}</p>
      </a>
    ),
    Tabs: ({ children }: any) => (
      <div style={{marginTop: '20px', marginBottom: '20px'}}>
        <div style={{borderBottom: '1px solid #e5e7eb', marginBottom: '20px'}}>
          {/* Tab navigation would go here */}
        </div>
        {children}
      </div>
    ),
    Tab: ({ children }: any) => (
      <div style={{padding: '20px 0'}}>
        {children}
      </div>
    ),
    Steps: ({ children }: any) => (
      <ol style={{
        counterReset: 'step-counter',
        listStyle: 'none',
        paddingLeft: '0',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        {children}
      </ol>
    ),
    FileTree: ({ children }: any) => (
      <pre style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        overflow: 'auto',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        {children}
      </pre>
    ),
    // Additional UI components used in platform documentation
    CardHeader: ({ children }: any) => (
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {children}
      </div>
    ),
    CardTitle: ({ children, className }: any) => (
      <h3 style={{
        margin: 0,
        fontSize: '18px',
        fontWeight: 600
      }} className={className}>
        {children}
      </h3>
    ),
    CardContent: ({ children }: any) => (
      <div style={{
        padding: '16px'
      }}>
        {children}
      </div>
    ),
  }
}