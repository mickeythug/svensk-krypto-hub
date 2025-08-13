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
  Smartphone
} from "lucide-react";

interface MobileWalletManagementProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress?: string;
  privateKey?: string;
  acknowledged: boolean;
  loading: boolean;
  showPrivateKey: boolean;
  setShowPrivateKey: (show: boolean) => void;
  showQrCode: boolean;
  setShowQrCode: (show: boolean) => void;
  qrCodeDataUrl: string;
  copyToClipboard: (text: string, label: string) => void;
  downloadQrCode: () => void;
  handleBackupConfirmed: () => void;
  handleCreateWallet: () => void;
}

export function MobileWalletManagement({
  open,
  onOpenChange,
  walletAddress,
  privateKey,
  acknowledged,
  loading,
  showPrivateKey,
  setShowPrivateKey,
  showQrCode,
  setShowQrCode,
  qrCodeDataUrl,
  copyToClipboard,
  downloadQrCode,
  handleBackupConfirmed,
  handleCreateWallet
}: MobileWalletManagementProps) {
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
              <Wallet className="h-5 w-5 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold mb-1">Laddar Wallet</h3>
              <p className="text-sm text-muted-foreground">Hämtar din wallet-information...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto p-0 z-[100]">
        <div className="bg-gradient-to-br from-background to-muted/20 min-h-full">
          {/* Header */}
          <div className="p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Wallet Management</h2>
                <p className="text-sm text-muted-foreground">Hantera din trading wallet</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {walletAddress ? (
              <>
                {/* Wallet Card - App Store Style */}
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                  <div className="p-4 space-y-4">
                    {/* Wallet Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary/10">
                          <Wallet className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Trading Wallet</h3>
                          <p className="text-sm text-muted-foreground">Auto-genererad</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="px-2 py-1 text-xs">
                        Aktiv
                      </Badge>
                    </div>

                    {/* Wallet Address */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Wallet Address</label>
                      <div className="relative">
                        <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs break-all border">
                          {walletAddress}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(walletAddress || '', 'Wallet address')}
                          className="absolute right-1 top-1 h-8 w-8"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => setShowQrCode(!showQrCode)}
                        variant="outline"
                        size="sm"
                        className="h-10"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        QR-kod
                      </Button>
                      <Button
                        onClick={() => copyToClipboard(walletAddress || '', 'Wallet address')}
                        variant="outline"
                        size="sm"
                        className="h-10"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Kopiera
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* QR Code Card */}
                {showQrCode && qrCodeDataUrl && (
                  <Card className="border-0 shadow-lg">
                    <div className="p-4 text-center space-y-3">
                      <h4 className="font-medium">QR-kod för Insättning</h4>
                      <div className="inline-block p-3 bg-white rounded-xl border">
                        <img 
                          src={qrCodeDataUrl} 
                          alt="Wallet QR Code"
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Skanna med din wallet för att skicka SOL
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowQrCode(false)}
                          className="flex-1"
                        >
                          <EyeOff className="h-3 w-3 mr-2" />
                          Dölj
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={downloadQrCode}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-2" />
                          Ladda ner
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Private Key Section */}
                {!acknowledged && privateKey && (
                  <Card className="border-destructive/20 bg-destructive/5">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <h4 className="font-medium text-destructive">Säkra din Private Key</h4>
                      </div>
                      
                      <div className="bg-background/80 rounded-lg p-3 border">
                        <p className="text-xs text-muted-foreground">
                          <strong>Din private key visas endast en gång.</strong> Spara den säkert.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Key className="h-3 w-3" />
                          Private Key
                        </label>
                        <div className="relative">
                          <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs break-all border min-h-[50px] flex items-center">
                            {showPrivateKey ? privateKey : '•'.repeat(32)}
                          </div>
                          <div className="absolute right-1 top-1 flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowPrivateKey(!showPrivateKey)}
                              className="h-8 w-8"
                            >
                              {showPrivateKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                            {showPrivateKey && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(privateKey, 'Private key')}
                                className="h-8 w-8"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={handleBackupConfirmed}
                        className="w-full"
                        size="sm"
                      >
                        <CheckCircle className="h-3 w-3 mr-2" />
                        Bekräfta säkring
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Private Key Access (after acknowledged) */}
                {acknowledged && (
                  <Card className="border-0 shadow-lg">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-success" />
                        <span className="font-medium text-success">Private Key Säkrad</span>
                      </div>
                      
                      {showPrivateKey ? (
                        <div className="space-y-2">
                          <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs break-all border">
                            {privateKey || 'Private key ej tillgänglig'}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowPrivateKey(false)}
                              className="flex-1"
                            >
                              <EyeOff className="h-3 w-3 mr-2" />
                              Dölj
                            </Button>
                            {privateKey && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(privateKey, 'Private key')}
                                className="flex-1"
                              >
                                <Copy className="h-3 w-3 mr-2" />
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
                          size="sm"
                        >
                          <Eye className="h-3 w-3 mr-2" />
                          Visa Private Key
                        </Button>
                      )}
                    </div>
                  </Card>
                )}

                {/* Funding Actions */}
                <Card className="border-0 shadow-lg">
                  <div className="p-4 space-y-3">
                    <h4 className="font-medium">Fyll på Konto</h4>
                    <p className="text-sm text-muted-foreground">
                      Skicka SOL för att börja handla
                    </p>
                    <Button
                      onClick={() => window.open(`https://phantom.app/`, '_blank')}
                      className="w-full"
                      size="sm"
                    >
                      <ExternalLink className="h-3 w-3 mr-2" />
                      Öppna Phantom Wallet
                    </Button>
                  </div>
                </Card>

                {/* Security Note */}
                <Card className="bg-muted/20 border-0">
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-3 w-3" />
                      <span className="text-xs font-medium">Säkerhetsinfo</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Spara din private key säkert</li>
                      <li>• Dela aldrig din private key</li>
                      <li>• Använd endast för mindre belopp</li>
                    </ul>
                  </div>
                </Card>
              </>
            ) : (
              /* No Wallet - Create Card */
              <Card className="border-0 shadow-lg text-center">
                <div className="p-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-muted/20 w-fit mx-auto">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Ingen Trading Wallet</h3>
                    <p className="text-sm text-muted-foreground">
                      Skapa en trading wallet för att börja handla
                    </p>
                  </div>
                  <Button 
                    onClick={handleCreateWallet}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/20 border-t-white mr-2"></div>
                        Skapar...
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-2" />
                        Skapa Trading Wallet
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}