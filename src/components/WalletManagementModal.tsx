import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  EyeOff, 
  Copy, 
  QrCode, 
  Wallet, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTradingWallet } from "@/hooks/useTradingWallet";

interface WalletManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletManagementModal({ open, onOpenChange }: WalletManagementModalProps) {
  const { toast } = useToast();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  
  const { 
    walletAddress, 
    privateKey, 
    acknowledged, 
    confirmBackup, 
    loading 
  } = useTradingWallet();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopierat!",
        description: `${label} har kopierats till urklipp`,
      });
    } catch (err) {
      toast({
        title: "Fel",
        description: "Kunde inte kopiera till urklipp",
        variant: "destructive",
      });
    }
  };

  const generateQrCodeUrl = (address: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
  };

  const handleBackupConfirmed = async () => {
    const success = await confirmBackup();
    if (success) {
      toast({
        title: "Backup bekräftad",
        description: "Din private key är nu säkrad och dold",
      });
      setShowPrivateKey(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-4"></div>
            <span>Laddar wallet information...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-crypto">
            <Wallet className="h-6 w-6 text-primary" />
            MINA WALLETS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trading Wallet Card */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/20">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Trading Wallet</h3>
                  <p className="text-sm text-muted-foreground">Auto-genererad för plattformen</p>
                </div>
              </div>
              <Badge variant="default" className="bg-success/20 text-success border-success/30">
                Aktiv
              </Badge>
            </div>

            {/* Wallet Address */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 p-3 bg-secondary/30 rounded-lg font-mono text-sm break-all">
                    {walletAddress}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(walletAddress || '', 'Wallet address')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Private Key Section */}
              {!acknowledged && privateKey && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <h4 className="font-semibold text-destructive">Säkra din Private Key</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Din private key visas endast en gång. Spara den på ett säkert ställe och bekräfta sedan att du har säkrat den.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Private Key</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 p-3 bg-secondary/30 rounded-lg font-mono text-sm break-all">
                          {showPrivateKey ? privateKey : '•'.repeat(50)}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowPrivateKey(!showPrivateKey)}
                        >
                          {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        {showPrivateKey && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(privateKey, 'Private key')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <Button 
                      onClick={handleBackupConfirmed}
                      className="w-full bg-success hover:bg-success/90"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Bekräfta att jag har säkrat min private key
                    </Button>
                  </div>
                </div>
              )}

              {acknowledged && (
                <div className="bg-success/10 border border-success/30 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-success" />
                    <span className="text-success font-medium">Private key är säkrad och dold</span>
                  </div>
                </div>
              )}

              {/* QR Code and Fund Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    QR-kod för insättning
                  </h4>
                  {showQrCode ? (
                    <div className="text-center space-y-3">
                      <img 
                        src={generateQrCodeUrl(walletAddress || '')} 
                        alt="Wallet QR Code"
                        className="w-32 h-32 mx-auto border rounded-lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Skanna för att skicka SOL till denna wallet
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowQrCode(false)}
                      >
                        Dölj QR-kod
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowQrCode(true)}
                      variant="outline"
                      className="w-full"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Visa QR-kod
                    </Button>
                  )}
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Fyll på konto</h4>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Skicka SOL till denna adress för att fylla på din trading wallet
                    </p>
                    <div className="space-y-2">
                      <Button
                        onClick={() => copyToClipboard(walletAddress || '', 'Wallet address')}
                        variant="outline"
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Kopiera adress
                      </Button>
                      <Button
                        onClick={() => window.open(`https://phantom.app/`, '_blank')}
                        className="w-full bg-gradient-primary"
                      >
                        Öppna Phantom Wallet
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Security Notes */}
              <Card className="p-4 bg-muted/30">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Säkerhetsinfo
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Denna wallet är auto-genererad för plattformens trading-funktioner</li>
                  <li>• Spara alltid din private key på ett säkert ställe</li>
                  <li>• Dela aldrig din private key med någon</li>
                  <li>• Använd endast för testing och mindre belopp</li>
                </ul>
              </Card>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}