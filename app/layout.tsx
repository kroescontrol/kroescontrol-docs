import './globals.css'
import type { Metadata } from 'next'
import { Sidebar } from '../components/sidebar'

export const metadata: Metadata = {
  title: {
    template: '%s – Kroescontrol Docs',
    default: 'Kroescontrol Docs'
  },
  description: 'Documentatie voor Kroescontrol',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <head>
        <meta name="theme-color" content="#E4007C" />
      </head>
      <body>
        <Sidebar />
        <main style={{ marginLeft: '250px', padding: '20px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}