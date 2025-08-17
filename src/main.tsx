import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
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
