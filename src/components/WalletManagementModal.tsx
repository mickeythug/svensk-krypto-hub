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
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTradingWallet } from "@/hooks/useTradingWallet";
import QRCode from 'qrcode';

interface WalletManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletManagementModal({ open, onOpenChange }: WalletManagementModalProps) {
  const { toast } = useToast();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  
  const { 
    walletAddress, 
    privateKey, 
    acknowledged, 
    confirmBackup, 
    loading,
    createIfMissing 
  } = useTradingWallet();

  // Generate QR code when wallet address is available
  useEffect(() => {
    if (walletAddress) {
      QRCode.toDataURL(walletAddress, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [walletAddress]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "✅ Kopierat!",
        description: `${label} har kopierats till urklipp`,
      });
    } catch (err) {
      toast({
        title: "❌ Fel",
        description: "Kunde inte kopiera till urklipp",
        variant: "destructive",
      });
    }
  };

  const downloadQrCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `wallet-qr-${walletAddress?.slice(0, 8)}.png`;
      link.click();
    }
  };

  const handleBackupConfirmed = async () => {
    const success = await confirmBackup();
    if (success) {
      toast({
        title: "🔒 Backup bekräftad",
        description: "Din private key är nu säkrad och dold",
      });
      setShowPrivateKey(false);
    }
  };

  const handleCreateWallet = async () => {
    try {
      await createIfMissing();
      toast({
        title: "🎉 Wallet skapad!",
        description: "Din trading wallet har skapats framgångsrikt",
      });
    } catch (error) {
      toast({
        title: "❌ Fel",
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
              <h3 className="font-crypto text-lg font-semibold mb-2">Laddar Wallet</h3>
              <p className="text-muted-foreground">Hämtar din wallet-information...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader className="pb-6 border-b border-border/50">
          <DialogTitle className="flex items-center gap-3 text-3xl font-crypto tracking-wider">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MINA WALLETS
            </span>
          </DialogTitle>
          <p className="text-muted-foreground text-lg mt-2">
            Hantera dina trading wallets och säkerhetsinställningar
          </p>
        </DialogHeader>

        <div className="space-y-8 pt-6">
          {/* Trading Wallet Card */}
          {walletAddress ? (
            <Card className="overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 shadow-2xl">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 ring-2 ring-primary/10">
                      <Wallet className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-crypto font-bold text-foreground">Trading Wallet</h3>
                      <p className="text-muted-foreground text-lg">Auto-genererad för plattformen</p>
                    </div>
                  </div>
                  <Badge 
                    variant="default" 
                    className="bg-gradient-to-r from-success to-success/80 text-white border-none px-4 py-2 text-sm font-semibold shadow-lg"
                  >
                    ✨ AKTIV
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Address & Private Key */}
                  <div className="space-y-6">
                    {/* Wallet Address */}
                    <div className="space-y-3">
                      <label className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Wallet Address
                      </label>
                      <div className="relative group">
                        <div className="p-4 bg-secondary/30 hover:bg-secondary/40 transition-colors rounded-xl border border-border/50 font-mono text-sm break-all leading-relaxed min-h-[60px] flex items-center">
                          {walletAddress}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(walletAddress || '', 'Wallet address')}
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Private Key Section */}
                    {!acknowledged && privateKey && (
                      <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/30 rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-destructive/20">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                          </div>
                          <div>
                            <h4 className="font-crypto text-lg font-bold text-destructive">🔐 Säkra din Private Key</h4>
                            <p className="text-sm text-muted-foreground">Kritiskt viktigt för wallet-säkerhet</p>
                          </div>
                        </div>
                        
                        <div className="bg-background/50 rounded-lg p-4 border border-destructive/20">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            ⚠️ <strong>Din private key visas endast en gång.</strong> Spara den på ett säkert ställe och bekräfta sedan att du har säkrat den.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
                              <Key className="h-4 w-4" />
                              Private Key
                            </label>
                            <div className="relative group">
                              <div className="p-4 bg-secondary/30 hover:bg-secondary/40 transition-colors rounded-xl border border-border/50 font-mono text-sm break-all leading-relaxed min-h-[60px] flex items-center">
                                {showPrivateKey ? privateKey : '•'.repeat(64)}
                              </div>
                              <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                                  className="bg-background/80 backdrop-blur-sm"
                                >
                                  {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                {showPrivateKey && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(privateKey, 'Private key')}
                                    className="bg-background/80 backdrop-blur-sm"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>

                          <Button 
                            onClick={handleBackupConfirmed}
                            className="w-full bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white font-semibold py-3 text-base shadow-lg"
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            ✅ Bekräfta att jag har säkrat min private key
                          </Button>
                        </div>
                      </div>
                    )}

                    {acknowledged && (
                      <div className="bg-gradient-to-r from-success/10 to-success/5 border border-success/30 rounded-xl p-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-success/20">
                            <Shield className="h-6 w-6 text-success" />
                          </div>
                          <div>
                            <span className="text-success font-crypto text-lg font-bold">🔒 Private Key Säkrad</span>
                            <p className="text-sm text-muted-foreground">Din private key är dold och skyddad</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show Private Key Button (after acknowledgment) */}
                    {acknowledged && (
                      <Card className="p-4 bg-muted/30">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Private Key Åtkomst
                        </h4>
                        <div className="space-y-3">
                          {showPrivateKey ? (
                            <div className="space-y-3">
                              <div className="p-4 bg-secondary/30 rounded-xl border border-border/50 font-mono text-sm break-all leading-relaxed">
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
                              className="w-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visa Private Key
                            </Button>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Right Column - QR Code & Funding */}
                  <div className="space-y-6">
                    {/* QR Code Section */}
                    <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                      <h4 className="font-crypto text-xl font-bold mb-4 flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        📱 QR-kod för Insättning
                      </h4>
                      {showQrCode && qrCodeDataUrl ? (
                        <div className="text-center space-y-4">
                          <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
                            <img 
                              src={qrCodeDataUrl} 
                              alt="Wallet QR Code"
                              className="w-60 h-60 mx-auto"
                            />
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              📱 Skanna med din wallet för att skicka SOL
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {walletAddress?.slice(0, 20)}...{walletAddress?.slice(-10)}
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
                          className="w-full h-16 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-base"
                        >
                          <QrCode className="h-6 w-6 mr-2" />
                          Visa QR-kod
                        </Button>
                      )}
                    </Card>

                    {/* Funding Section */}
                    <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                      <h4 className="font-crypto text-xl font-bold mb-4">💰 Fyll på Konto</h4>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Skicka SOL till denna adress för att fylla på din trading wallet och börja handla.
                        </p>
                        <div className="space-y-3">
                          <Button
                            onClick={() => copyToClipboard(walletAddress || '', 'Wallet address')}
                            variant="outline"
                            className="w-full h-12 bg-gradient-to-r from-secondary/20 to-secondary/10 hover:from-secondary/30 hover:to-secondary/20"
                          >
                            <Copy className="h-5 w-5 mr-2" />
                            📋 Kopiera Wallet Address
                          </Button>
                          <Button
                            onClick={() => window.open(`https://phantom.app/`, '_blank')}
                            className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-lg"
                          >
                            <ExternalLink className="h-5 w-5 mr-2" />
                            👻 Öppna Phantom Wallet
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Security Notes */}
                <Card className="mt-8 p-6 bg-gradient-to-r from-muted/20 to-muted/10 border border-muted/30">
                  <h4 className="font-crypto text-lg font-bold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    🛡️ Säkerhetsinfo
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
          ) : (
            // No Trading Wallet - Show Create Button
            <Card className="p-12 bg-gradient-to-br from-muted/10 to-secondary/10 border-muted/30 text-center">
              <div className="space-y-6 max-w-md mx-auto">
                <div className="p-6 rounded-full bg-gradient-to-br from-muted/20 to-muted/10 w-fit mx-auto">
                  <Wallet className="h-16 w-16 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-crypto text-2xl font-bold mb-3">Ingen Trading Wallet</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Du har ingen trading wallet ännu. Skapa en för att börja handla på plattformen.
                  </p>
                </div>
                <Button 
                  onClick={handleCreateWallet}
                  disabled={loading}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-4 px-8 text-lg shadow-xl h-auto"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white mr-3"></div>
                      Skapar wallet...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      ✨ Skapa Trading Wallet
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