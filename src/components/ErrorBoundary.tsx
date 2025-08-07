import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
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
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center border-destructive/20">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-6" />
            
            <h2 className="font-crypto text-2xl font-bold mb-4 text-destructive">
              Något gick fel
            </h2>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Ett oväntat fel inträffade. Detta har rapporterats automatiskt och vårt team kommer att undersöka problemet.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-muted rounded-lg text-sm">
                <summary className="cursor-pointer font-medium text-destructive mb-2">
                  Teknisk information (endast synlig i utvecklingsmiljö)
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
                Försök igen
              </Button>
              
              <Button 
                onClick={this.handleReload}
                className="bg-gradient-primary flex items-center gap-2"
              >
                Ladda om sidan
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Om problemet kvarstår, kontakta oss via{' '}
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

export default ErrorBoundary;