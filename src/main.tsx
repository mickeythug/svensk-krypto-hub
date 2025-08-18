import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Web3Provider from '@/providers/Web3Provider'
import SolanaProvider from '@/providers/SolanaProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { useSecurityConfig } from './hooks/useSecurityConfig.ts'

// Initialize security configuration
const SecurityWrapper = ({ children }: { children: React.ReactNode }) => {
  useSecurityConfig();
  return <>{children}</>;
};

createRoot(document.getElementById("root")!).render(
  <SecurityWrapper>
    <LanguageProvider>
      <SolanaProvider>
        <Web3Provider>
          <App />
        </Web3Provider>
      </SolanaProvider>
    </LanguageProvider>
  </SecurityWrapper>
);
