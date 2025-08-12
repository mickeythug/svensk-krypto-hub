import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { formatUsd } from '@/lib/utils';

interface Transaction {
  id: string;
  date: string;
  type: 'Buy' | 'Sell';
  usd: number;
  tokenAmount: number;
  solAmount: number;
  price: number;
  maker: string;
  txHash: string;
}

interface TransactionsTableProps {
  tokenSymbol: string;
}

export const TransactionsTable = ({ tokenSymbol }: TransactionsTableProps) => {
  // Mock transaction data - in real app this would come from API
  const transactions: Transaction[] = [
    {
      id: '1',
      date: 'Aug 12 05:47:20 PM',
      type: 'Buy',
      usd: 394.32,
      tokenAmount: 837746,
      solAmount: 2.17,
      price: 0.0004741,
      maker: 'vTvBkZ',
      txHash: '5x7g2h3j4k'
    },
    {
      id: '2',
      date: 'Aug 12 05:47:19 PM',
      type: 'Sell',
      usd: 195.94,
      tokenAmount: 420416,
      solAmount: 1.080,
      price: 0.0004649,
      maker: 'CrekIn',
      txHash: '9x8d5f6g7h'
    },
    {
      id: '3',
      date: 'Aug 12 05:47:16 PM',
      type: 'Buy',
      usd: 26.88,
      tokenAmount: 57157,
      solAmount: 0.1485,
      price: 0.0004695,
      maker: 'tx09dB',
      txHash: '3x2w4e5r6t'
    },
    {
      id: '4',
      date: 'Aug 12 05:47:10 PM',
      type: 'Sell',
      usd: 10.06,
      tokenAmount: 21516,
      solAmount: 0.05559,
      price: 0.0004688,
      maker: 'B1Et9f',
      txHash: '7x5g8h9j0k'
    },
    {
      id: '5',
      date: 'Aug 12 05:47:10 PM',
      type: 'Buy',
      usd: 335.91,
      tokenAmount: 720260,
      solAmount: 1.85,
      price: 0.0004691,
      maker: 'HirL6D',
      txHash: '1x4d7f8g9h'
    },
    {
      id: '6',
      date: 'Aug 12 05:47:00 PM',
      type: 'Buy',
      usd: 19.94,
      tokenAmount: 43141,
      solAmount: 0.1101,
      price: 0.0004613,
      maker: 'wtOLKr',
      txHash: '8x6j9k0l1m'
    },
    {
      id: '7',
      date: 'Aug 12 05:46:58 PM',
      type: 'Sell',
      usd: 0.31,
      tokenAmount: 686.24,
      solAmount: 0.001742,
      price: 0.0004605,
      maker: 'L83vnA',
      txHash: '2x5r8t9y0u'
    },
    {
      id: '8',
      date: 'Aug 12 05:46:56 PM',
      type: 'Buy',
      usd: 57.40,
      tokenAmount: 124517,
      solAmount: 0.3173,
      price: 0.0004605,
      maker: 'iDAeHp',
      txHash: '6x3e8r9t0y'
    },
    {
      id: '9',
      date: 'Aug 12 05:46:54 PM',
      type: 'Sell',
      usd: 190.67,
      tokenAmount: 414261,
      solAmount: 1.050,
      price: 0.0004592,
      maker: 'iXi7CB',
      txHash: '9x7u4i5o6p'
    },
    {
      id: '10',
      date: 'Aug 12 05:46:53 PM',
      type: 'Sell',
      usd: 18.99,
      tokenAmount: 41044,
      solAmount: 0.1049,
      price: 0.0004636,
      maker: 'kU3vbz',
      txHash: '4x8i9o0p1a'
    }
  ];

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(0)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toLocaleString();
  };

  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...`;
  };

  return (
    <Card className="bg-background/95 backdrop-blur-xl border border-border/30 shadow-2xl overflow-hidden rounded-2xl">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-foreground mb-2">Live Transactions</h3>
          <p className="text-sm text-muted-foreground">Real-time {tokenSymbol} trading activity</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-2 text-muted-foreground font-semibold">DATE</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-semibold">TYPE</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-semibold">USD</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-semibold">{tokenSymbol}</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-semibold">SOL</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-semibold">PRICE</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-semibold">MAKER</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-semibold">TXN</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-2 text-muted-foreground text-xs">{tx.date}</td>
                  <td className="py-3 px-2">
                    <Badge 
                      variant={tx.type === 'Buy' ? 'default' : 'destructive'}
                      className={`font-semibold ${
                        tx.type === 'Buy' 
                          ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                          : 'bg-red-500/20 text-red-500 border-red-500/30'
                      }`}
                    >
                      {tx.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-foreground">
                    {formatUsd(tx.usd)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-foreground">
                    {formatLargeNumber(tx.tokenAmount)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-foreground">
                    {tx.solAmount.toFixed(4)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono text-foreground">
                    {formatUsd(tx.price)}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-primary-foreground"></div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {truncateAddress(tx.maker)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-muted/50"
                      onClick={() => window.open(`https://solscan.io/tx/${tx.txHash}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" className="text-xs">
            Load More Transactions
          </Button>
        </div>
      </div>
    </Card>
  );
};