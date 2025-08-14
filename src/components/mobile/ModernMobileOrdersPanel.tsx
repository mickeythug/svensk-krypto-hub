import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Receipt, 
  Wallet, 
  History,
  TrendingUp,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { formatUsd } from "@/lib/utils";
import { useWallet } from '@solana/wallet-adapter-react';

interface ModernMobileOrdersPanelProps {
  symbol: string;
  currentPrice: number;
}

// Mock data - replace with real data from hooks
const mockOpenOrders = [
  {
    id: "1",
    symbol: "BTC/USDT",
    type: "limit",
    side: "buy",
    amount: "0.001",
    price: "65000",
    filled: "0",
    status: "open",
    timestamp: "2024-01-10T10:30:00Z"
  },
  {
    id: "2", 
    symbol: "ETH/USDT",
    type: "limit",
    side: "sell",
    amount: "0.5",
    price: "3500",
    filled: "0.2",
    status: "partial",
    timestamp: "2024-01-10T09:15:00Z"
  }
];

const mockOrderHistory = [
  {
    id: "h1",
    symbol: "BTC/USDT",
    type: "market",
    side: "buy",
    amount: "0.002",
    price: "64500",
    status: "filled",
    timestamp: "2024-01-09T14:22:00Z",
    fee: "0.129"
  },
  {
    id: "h2",
    symbol: "ETH/USDT", 
    type: "limit",
    side: "sell",
    amount: "1.0",
    price: "3400",
    status: "cancelled",
    timestamp: "2024-01-08T11:45:00Z",
    fee: "0"
  }
];

const mockPositions = [
  {
    symbol: "BTC",
    amount: "0.05234",
    value: "3380.50",
    profit: "+125.30",
    profitPercent: "+3.85"
  },
  {
    symbol: "ETH",
    amount: "2.4567",
    value: "8567.45",
    profit: "-89.20",
    profitPercent: "-1.03"
  }
];

const mockBalances = [
  { symbol: "USDT", amount: "2,450.67", usdValue: "2,450.67" },
  { symbol: "BTC", amount: "0.05234", usdValue: "3,380.50" },
  { symbol: "ETH", amount: "2.4567", usdValue: "8,567.45" },
  { symbol: "BNB", amount: "15.2341", usdValue: "4,891.23" }
];

const ModernMobileOrdersPanel = ({ symbol, currentPrice }: ModernMobileOrdersPanelProps) => {
  const [activeTab, setActiveTab] = useState("positions");
  const { connected } = useWallet();

  const cancelOrder = (orderId: string) => {
    console.log("Cancel order:", orderId);
    // Implement cancel order logic
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('sv-SE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "partial":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "filled":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: { variant: "outline", class: "border-blue-500/50 text-blue-500" },
      partial: { variant: "outline", class: "border-yellow-500/50 text-yellow-500" },
      filled: { variant: "outline", class: "border-green-500/50 text-green-500" },
      cancelled: { variant: "outline", class: "border-red-500/50 text-red-500" }
    };
    
    return variants[status] || variants.open;
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <Wallet className="h-16 w-16 text-muted-foreground/50" />
        <h3 className="text-xl font-semibold">Anslut din plånbok</h3>
        <p className="text-muted-foreground max-w-sm">
          Connect your wallet to see your positions, orders and trading history.
        </p>
        <Button className="mt-4">
          Anslut plånbok
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* PORTFOLIO OVERVIEW */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Portföljöversikt
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Totalt värde</div>
            <div className="text-2xl font-bold">$19,289.85</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">24h förändring</div>
            <div className="text-2xl font-bold text-green-500">+$234.12</div>
          </div>
        </div>
      </Card>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="positions" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Positioner
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs">
            <Receipt className="h-3 w-3 mr-1" />
            Ordrar
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            <History className="h-3 w-3 mr-1" />
            Historik
          </TabsTrigger>
          <TabsTrigger value="balances" className="text-xs">
            <Wallet className="h-3 w-3 mr-1" />
            Saldon
          </TabsTrigger>
        </TabsList>

        {/* POSITIONS TAB */}
        <TabsContent value="positions" className="space-y-3 mt-4">
          {mockPositions.map((position, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">{position.symbol}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{position.symbol}</div>
                    <div className="text-sm text-muted-foreground">{position.amount}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${position.value}</div>
                  <div className={`text-sm ${position.profit.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {position.profit} ({position.profitPercent})
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* OPEN ORDERS TAB */}
        <TabsContent value="orders" className="space-y-3 mt-4">
          {mockOpenOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Inga öppna ordrar</p>
            </div>
          ) : (
            mockOpenOrders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <div>
                      <div className="font-semibold text-sm">{order.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(order.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge {...getStatusBadge(order.status)} className="text-xs">
                      {order.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelOrder(order.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Typ: </span>
                    <span className="font-medium capitalize">{order.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sida: </span>
                    <span className={`font-medium ${order.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                      {order.side === 'buy' ? 'KÖP' : 'SÄLJ'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Belopp: </span>
                    <span className="font-mono">{order.amount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price: </span>
                    <span className="font-mono">${order.price}</span>
                  </div>
                </div>
                
                {order.filled !== "0" && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Fylld: </span>
                      <span className="font-mono">{order.filled}/{order.amount}</span>
                      <span className="text-muted-foreground ml-2">
                        ({((parseFloat(order.filled) / parseFloat(order.amount)) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        {/* ORDER HISTORY TAB */}
        <TabsContent value="history" className="space-y-3 mt-4">
          {mockOrderHistory.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <div>
                    <div className="font-semibold text-sm">{order.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(order.timestamp)}
                    </div>
                  </div>
                </div>
                <Badge {...getStatusBadge(order.status)} className="text-xs">
                  {order.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Typ: </span>
                  <span className="font-medium capitalize">{order.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Sida: </span>
                  <span className={`font-medium ${order.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                    {order.side === 'buy' ? 'KÖP' : 'SÄLJ'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Belopp: </span>
                  <span className="font-mono">{order.amount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price: </span>
                  <span className="font-mono">${order.price}</span>
                </div>
              </div>
              
              {order.fee !== "0" && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Avgift: </span>
                    <span className="font-mono">${order.fee}</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* BALANCES TAB */}
        <TabsContent value="balances" className="space-y-3 mt-4">
          {mockBalances.map((balance, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{balance.symbol}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{balance.symbol}</div>
                    <div className="text-sm text-muted-foreground font-mono">{balance.amount}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">${balance.usdValue}</div>
                  <div className="text-sm text-muted-foreground">USD värde</div>
                </div>
              </div>
            </Card>
          ))}
          
          <Card className="p-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total balans</span>
              <span className="text-xl font-bold">$19,289.85</span>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModernMobileOrdersPanel;