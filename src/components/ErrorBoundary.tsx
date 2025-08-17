import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  t: (key: string) => string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryInner extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Here you could send error to monitoring service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    const { t } = this.props;
    
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center border-destructive/20">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
            
            <h2 className="font-crypto text-2xl font-bold mb-4 text-destructive">
              {t('error.title')}
            </h2>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t('error.description')}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-muted rounded-lg text-sm">
                <summary className="cursor-pointer font-medium text-destructive mb-2">
                  {t('error.technicalInfo')}
                </summary>
                <pre className="whitespace-pre-wrap break-words text-xs">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={this.handleRetry}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t('error.tryAgain')}
              </Button>
              
              <Button 
                onClick={this.handleReload}
                className="bg-gradient-primary flex items-center gap-2"
              >
                {t('error.reloadPage')}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              {t('error.contactUs')}{' '}
              <a 
                href="https://t.me/cryptonetworksweden" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Telegram
              </a>
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide translations
import { useLanguage } from '@/contexts/LanguageContext';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  const { t } = useLanguage();
  
  return (
    <ErrorBoundaryInner t={t} fallback={fallback}>
      {children}
    </ErrorBoundaryInner>
  );
};

export default ErrorBoundary;