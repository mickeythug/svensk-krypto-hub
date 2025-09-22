import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1dc7be5a525148abb07304a86b171567',
  appName: 'velo',
  webDir: 'dist',
  server: {
    url: 'https://1dc7be5a-5251-48ab-b073-04a86b171567.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#0F172A',
      showSpinner: true,
      spinnerColor: '#3B82F6'
    }
  }
};

export default config;