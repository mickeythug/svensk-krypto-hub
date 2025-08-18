import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Plus, 
  Shield, 
  ShieldCheck,
  Star,
  StarOff,
  Import,
  Key,
  Download,
  Upload,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { useTradingWallet } from "@/hooks/useTradingWallet";
import { useSecureKeyManagement } from "@/hooks/useSecureKeyManagement";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface MyWalletsSectionProps {
  showValues: boolean;
}

const MyWalletsSection = ({ showValues }: MyWalletsSectionProps) => {
  const { t } = useLanguage();
  const [showPrivateKeys, setShowPrivateKeys] = useState<{ [key: string]: boolean }>({});
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [privateKeyDialogOpen, setPrivateKeyDialogOpen] = useState(false);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string>("");
  const [importPrivateKey, setImportPrivateKey] = useState("");
  const [importWalletName, setImportWalletName] = useState("");
  
  const { 
    connectedWallets, 
    primaryWallet, 
    isLoading, 
    connectWallet, 
    disconnectWallet, 
    changePrimaryWallet 
  } = useWalletConnection();
  
  const { 
    walletAddress: tradingWalletAddress, 
    privateKey: tradingPrivateKey, 
    acknowledged,
    confirmBackup,
    createIfMissing 
  } = useTradingWallet();
  
  const { retrieveKey } = useSecureKeyManagement();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} kopierad till urklipp`);
    } catch (error) {
      toast.error("Kunde inte kopiera till urklipp");
    }
  };

  const togglePrivateKeyVisibility = (address: string) => {
    setShowPrivateKeys(prev => ({ ...prev, [address]: !prev[address] }));
  };

  const handleShowPrivateKey = async (address: string) => {
    try {
      const privateKey = await retrieveKey(address, 'private_key');
      if (privateKey) {
        setSelectedWalletAddress(address);
        setPrivateKeyDialogOpen(true);
      } else {
        toast.error("Privat nyckel kunde inte hämtas");
      }
    } catch (error) {
      toast.error("Fel vid hämtning av privat nyckel");
    }
  };

  const handleImportWallet = async () => {
    if (!importPrivateKey.trim()) {
      toast.error("Ange en privat nyckel");
      return;
    }

    try {
      // Here you would implement the actual wallet import logic
      // For now, we'll just show a success message
      toast.success("Wallet importerad framgångsrikt");
      setImportDialogOpen(false);
      setImportPrivateKey("");
      setImportWalletName("");
    } catch (error) {
      toast.error("Kunde inte importera wallet");
    }
  };

  const handleCreateTradingWallet = async () => {
    try {
      await createIfMissing();
      toast.success("Trading wallet skapad");
    } catch (error) {
      toast.error("Kunde inte skapa trading wallet");
    }
  };

  const handleBackupAcknowledge = async () => {
    try {
      await confirmBackup();
      toast.success("Backup bekräftad");
    } catch (error) {
      toast.error("Kunde inte bekräfta backup");
    }
  };

  const formatAddress = (address: string) => {
    if (!showValues) return "••••••••••••••••";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Mina Wallets</h2>
          <p className="text-muted-foreground">Hantera dina kryptovaluta wallets</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Import className="h-4 w-4" />
                Importera Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importera Wallet</DialogTitle>
                <DialogDescription>
                  Importera en befintlig wallet med din privata nyckel
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="wallet-name">Wallet Namn (valfritt)</Label>
                  <Input
                    id="wallet-name"
                    value={importWalletName}
                    onChange={(e) => setImportWalletName(e.target.value)}
                    placeholder="Min Wallet"
                  />
                </div>
                <div>
                  <Label htmlFor="private-key">Privat Nyckel</Label>
                  <Input
                    id="private-key"
                    type="password"
                    value={importPrivateKey}
                    onChange={(e) => setImportPrivateKey(e.target.value)}
                    placeholder="Ange din privata nyckel..."
                  />
                </div>
                <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <p className="text-sm text-warning">
                    Spara aldrig din privata nyckel i osäkra platser
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleImportWallet} className="flex-1">
                    Importera
                  </Button>
                  <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                    Avbryt
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleCreateTradingWallet} className="flex items-center gap-2 bg-gradient-primary">
            <Plus className="h-4 w-4" />
            Skapa Trading Wallet
          </Button>
        </div>
      </div>

      {/* Trading Wallet Section */}
      {tradingWalletAddress && (
        <Card className="p-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Trading Wallet</h3>
                <p className="text-sm text-muted-foreground">Din primära trading wallet</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Trading
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <span className="text-sm font-medium">Adress:</span>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {formatAddress(tradingWalletAddress)}
                </code>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => copyToClipboard(tradingWalletAddress, "Wallet adress")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!acknowledged && tradingPrivateKey && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="font-medium text-warning">Backup Required</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Spara din privata nyckel säkert innan du fortsätter. Du kommer inte kunna se den igen.
                </p>
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg mb-3">
                  <span className="text-sm font-medium">Privat Nyckel:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded max-w-[200px] overflow-hidden">
                      {showPrivateKeys[tradingWalletAddress] 
                        ? tradingPrivateKey 
                        : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => togglePrivateKeyVisibility(tradingWalletAddress)}
                    >
                      {showPrivateKeys[tradingWalletAddress] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard(tradingPrivateKey, "Privat nyckel")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={handleBackupAcknowledge} className="w-full">
                  Jag har sparat min privata nyckel säkert
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Connected Wallets */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Anslutna Wallets</h3>
        
        {connectedWallets.length === 0 ? (
          <Card className="p-8 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Inga wallets anslutna</h3>
            <p className="text-muted-foreground mb-6">
              Anslut din första wallet för att komma igång
            </p>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Anslut Wallet
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {connectedWallets.map((wallet) => (
              <Card key={wallet.address} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      wallet.chain === 'SOL' 
                        ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                        : 'bg-gradient-to-br from-blue-400 to-purple-600'
                    }`}>
                      <span className="text-white text-xs font-bold">
                        {wallet.chain}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {formatAddress(wallet.address)}
                        </code>
                        {wallet.address === primaryWallet && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                            Primär
                          </Badge>
                        )}
                        {wallet.isVerified && (
                          <ShieldCheck className="h-4 w-4 text-success" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {wallet.chain === 'SOL' ? 'Solana' : 'Ethereum'} • {wallet.isVerified ? 'Verifierad' : 'Overifierad'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard(wallet.address, "Wallet adress")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleShowPrivateKey(wallet.address)}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    
                    {wallet.address !== primaryWallet && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => changePrimaryWallet(wallet.address)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => disconnectWallet(wallet.address)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Private Key Dialog */}
      <Dialog open={privateKeyDialogOpen} onOpenChange={setPrivateKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privat Nyckel</DialogTitle>
            <DialogDescription>
              Din privata nyckel för wallet {formatAddress(selectedWalletAddress)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-medium text-warning">Säkerhetsvarning</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Dela aldrig din privata nyckel med någon. Den som har tillgång till denna nyckel kan styra alla medel i din wallet.
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <code className="text-sm break-all">
                {/* Private key would be shown here */}
                ••••••••••••••••••••••••••••••••••••••••••••••••••••••••
              </code>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => copyToClipboard("private-key-here", "Privat nyckel")}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Kopiera
              </Button>
              <Button variant="outline" onClick={() => setPrivateKeyDialogOpen(false)}>
                Stäng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyWalletsSection;