import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/mobile.css'
import '../styles/kroescontrol.css'

export default function App({ 
  Component, 
  pageProps 
}: AppProps) {
  return (
    <>
      <Head>
        {/* PWA manifest - werkt maar wordt niet opdringerig aangeboden */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#222b5b" />
        
        {/* Mobile optimalisaties */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KC Docs" />
        
        {/* Touch icons voor iOS - optioneel, geen prompt */}
        <link rel="apple-touch-icon" href="/img/KC-beeldmerk-gradientKLEUR.svg" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}