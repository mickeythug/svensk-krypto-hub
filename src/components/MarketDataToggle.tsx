import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Activity } from 'lucide-react';

interface MarketDataToggleProps {
  activeTab: 'market' | 'transactions';
  onToggle: (tab: 'market' | 'transactions') => void;
}

export const MarketDataToggle = ({ activeTab, onToggle }: MarketDataToggleProps) => {
  return (
    <Card className="bg-background/95 backdrop-blur-xl border border-border/30 shadow-2xl overflow-hidden rounded-2xl mb-6">
      <div className="p-2">
        <div className="flex gap-1">
          <Button
            variant={activeTab === 'market' ? 'default' : 'ghost'}
            onClick={() => onToggle('market')}
            className={`flex-1 flex items-center gap-2 h-10 rounded-lg font-semibold transition-all ${
              activeTab === 'market'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Market Info
          </Button>
          <Button
            variant={activeTab === 'transactions' ? 'default' : 'ghost'}
            onClick={() => onToggle('transactions')}
            className={`flex-1 flex items-center gap-2 h-10 rounded-lg font-semibold transition-all ${
              activeTab === 'transactions'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Activity className="h-4 w-4" />
            Transactions
          </Button>
        </div>
      </div>
    </Card>
  );
};