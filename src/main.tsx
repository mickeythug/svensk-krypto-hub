import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@fontsource/orbit/400.css'
import '@fontsource/orbit/500.css'
import '@fontsource/orbit/600.css'
import '@fontsource/orbit/700.css'
import '@fontsource/orbit/800.css'
import '@fontsource/orbit/900.css'
import Web3Provider from '@/providers/Web3Provider'
import SolanaProvider from '@/providers/SolanaProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <SolanaProvider>
      <Web3Provider>
        <App />
      </Web3Provider>
    </SolanaProvider>
  </LanguageProvider>
);
