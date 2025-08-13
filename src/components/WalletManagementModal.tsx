import { useState, useEffect } from "react";
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
  Plus,
  Download,
  Key,
  ExternalLink,
  Smartphone,
  Monitor
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTradingWallet } from "@/hooks/useTradingWallet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWallet } from "@solana/wallet-adapter-react";
import { MobileWalletManagement } from "./MobileWalletManagement";
import QRCode from 'qrcode';

interface WalletManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletManagementModal({ open, onOpenChange }: WalletManagementModalProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  
  // Solana wallet connection (för autherisering)
  const { publicKey: authWalletKey, connected: authConnected } = useWallet();
  const authWalletAddress = authWalletKey?.toBase58();
  
  // Trading wallet (auto-genererad)
  const { 
    walletAddress: tradingWalletAddress, 
    privateKey, 
    acknowledged, 
    confirmBackup, 
    loading,
    createIfMissing 
  } = useTradingWallet();

  // Generate QR code for trading wallet when available
  useEffect(() => {
    if (tradingWalletAddress) {
      QRCode.toDataURL(tradingWalletAddress, {
        width: isMobile ? 250 : 320,
        margin: 3,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [tradingWalletAddress, isMobile]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopierat",
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

  const downloadQrCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `wallet-qr-${tradingWalletAddress?.slice(0, 8)}.png`;
      link.click();
    }
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

  const handleCreateWallet = async () => {
    try {
      await createIfMissing();
      toast({
        title: "Wallet skapad",
        description: "Din trading wallet har skapats framgångsrikt",
      });
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skapa trading wallet",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
              <Wallet className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Laddar Wallet</h3>
              <p className="text-muted-foreground">Hämtar din wallet-information...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isMobile) {
    return <MobileWalletManagement 
      open={open} 
      onOpenChange={onOpenChange}
      authWalletAddress={authWalletAddress}
      authConnected={authConnected}
      tradingWalletAddress={tradingWalletAddress}
      privateKey={privateKey}
      acknowledged={acknowledged}
      loading={loading}
      showPrivateKey={showPrivateKey}
      setShowPrivateKey={setShowPrivateKey}
      showQrCode={showQrCode}
      setShowQrCode={setShowQrCode}
      qrCodeDataUrl={qrCodeDataUrl}
      copyToClipboard={copyToClipboard}
      downloadQrCode={downloadQrCode}
      handleBackupConfirmed={handleBackupConfirmed}
      handleCreateWallet={handleCreateWallet}
    />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-[100]">
        <DialogHeader className="pb-6 border-b">
          <DialogTitle className="flex items-center gap-3 text-2xl font-semibold">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            Wallet Management
          </DialogTitle>
          <p className="text-muted-foreground">
            Hantera dina trading wallets och säkerhetsinställningar
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Autheriserings Wallet Card */}
          {authConnected && authWalletAddress && (
            <Card className="overflow-hidden border border-primary/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Shield className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Autheriserings Wallet</h3>
                      <p className="text-muted-foreground">Ansluten via Phantom</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                    Ansluten
                  </Badge>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Wallet Address (Public Key)
                  </label>
                  <div className="relative group">
                    <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all min-h-[50px] flex items-center">
                      {authWalletAddress}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(authWalletAddress || '', 'Autheriserings wallet address')}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Trading Wallet Card */}
          {tradingWalletAddress && (
            <Card className="overflow-hidden border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Trading Wallet</h3>
                      <p className="text-muted-foreground">Auto-genererad för trading</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1">
                    Aktiv
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Trading Wallet Address
                      </label>
                      <div className="relative group">
                        <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all min-h-[50px] flex items-center">
                          {tradingWalletAddress}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(tradingWalletAddress || '', 'Trading wallet address')}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {!acknowledged && privateKey && (
                      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          <div>
                            <h4 className="font-semibold text-destructive">Säkra din Private Key</h4>
                            <p className="text-sm text-muted-foreground">Kritiskt viktigt för wallet-säkerhet</p>
                          </div>
                        </div>
                        
                        <div className="bg-background rounded-lg p-3 border">
                          <p className="text-sm text-muted-foreground">
                            <strong>Din private key visas endast en gång.</strong> Spara den på ett säkert ställe och bekräfta sedan att du har säkrat den.
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium flex items-center gap-2 mb-2">
                              <Key className="h-4 w-4" />
                              Private Key
                            </label>
                            <div className="relative group">
                              <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all min-h-[50px] flex items-center">
                                {showPrivateKey ? privateKey : '•'.repeat(64)}
                              </div>
                              <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                          </div>

                          <Button 
                            onClick={handleBackupConfirmed}
                            className="w-full"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Bekräfta att jag har säkrat min private key
                          </Button>
                        </div>
                      </div>
                    )}

                    {acknowledged && (
                      <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-success" />
                          <div>
                            <span className="text-success font-semibold">Private Key Säkrad</span>
                            <p className="text-sm text-muted-foreground">Din private key är dold och skyddad</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {acknowledged && (
                      <Card className="p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Private Key Åtkomst
                        </h4>
                        <div className="space-y-3">
                          {showPrivateKey ? (
                            <div className="space-y-3">
                              <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                                {privateKey || 'Private key ej tillgänglig'}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowPrivateKey(false)}
                                  className="flex-1"
                                >
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Dölj
                                </Button>
                                {privateKey && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(privateKey, 'Private key')}
                                    className="flex-1"
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Kopiera
                                  </Button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setShowPrivateKey(true)}
                              variant="outline"
                              className="w-full"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visa Private Key
                            </Button>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-6">
                    <Card className="p-4">
                      <h4 className="font-medium mb-4 flex items-center gap-2">
                        <QrCode className="h-4 w-4" />
                        QR-kod för Insättning
                      </h4>
                      {showQrCode && qrCodeDataUrl ? (
                        <div className="text-center space-y-4">
                          <div className="inline-block p-4 bg-white rounded-lg border mx-auto">
                            <img 
                              src={qrCodeDataUrl} 
                              alt="Wallet QR Code"
                              className="w-80 h-80 mx-auto"
                            />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Skanna med din wallet för att skicka SOL till trading wallet
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {tradingWalletAddress?.slice(0, 20)}...{tradingWalletAddress?.slice(-10)}
                            </p>
                          </div>
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowQrCode(false)}
                            >
                              <EyeOff className="h-4 w-4 mr-2" />
                              Dölj
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={downloadQrCode}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Ladda ner
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowQrCode(true)}
                          variant="outline"
                          className="w-full h-14"
                        >
                          <QrCode className="h-5 w-5 mr-2" />
                          Visa QR-kod
                        </Button>
                      )}
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-4">Fyll på Konto</h4>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Skicka SOL till denna adress för att fylla på din trading wallet och börja handla.
                        </p>
                        <div className="space-y-2">
                          <Button
                            onClick={() => copyToClipboard(tradingWalletAddress || '', 'Trading wallet address')}
                            variant="outline"
                            className="w-full"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Kopiera Trading Wallet Address
                          </Button>
                          <Button
                            onClick={() => window.open(`https://phantom.app/`, '_blank')}
                            className="w-full"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Öppna Phantom Wallet
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <Card className="mt-6 p-4 bg-muted/20">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Säkerhetsinfo
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Denna wallet är auto-genererad för plattformens trading-funktioner</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Spara alltid din private key på ett säkert ställe</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Dela aldrig din private key med någon</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Använd endast för testing och mindre belopp</span>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {/* No wallet states */}
          {!authConnected && !tradingWalletAddress && (
            <Card className="p-8 text-center">
              <div className="space-y-4 max-w-md mx-auto">
                <div className="p-4 rounded-lg bg-muted/20 w-fit mx-auto">
                  <Wallet className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Ingen Wallet Ansluten</h3>
                  <p className="text-muted-foreground">
                    Anslut din Phantom wallet för att börja använda plattformen.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {authConnected && !tradingWalletAddress && (
            <Card className="p-8 text-center">
              <div className="space-y-4 max-w-md mx-auto">
                <div className="p-4 rounded-lg bg-muted/20 w-fit mx-auto">
                  <Wallet className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Skapa Trading Wallet</h3>
                  <p className="text-muted-foreground">
                    Du har ingen trading wallet ännu. Skapa en för att börja handla på plattformen.
                  </p>
                </div>
                <Button 
                  onClick={handleCreateWallet}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                      Skapar wallet...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Skapa Trading Wallet
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}