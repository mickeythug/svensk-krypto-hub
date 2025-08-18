import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Shield, 
  Zap, 
  Bell,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Smartphone,
  Clock,
  DollarSign,
  AlertTriangle,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const WalletSettingsPanel = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    // Security settings
    autoLock: true,
    autoLockTime: 15,
    biometricAuth: false,
    requirePasswordForTransactions: true,
    hideBalances: false,
    
    // Trading settings
    slippageTolerance: 0.5,
    maxGasPrice: 20,
    autoApprove: false,
    
    // Notification settings
    transactionAlerts: true,
    priceAlerts: true,
    securityAlerts: true,
    emailNotifications: false,
    
    // Privacy settings
    allowAnalytics: true,
    shareUsageData: false
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success("Inställning uppdaterad");
  };

  const resetToDefaults = () => {
    setSettings({
      autoLock: true,
      autoLockTime: 15,
      biometricAuth: false,
      requirePasswordForTransactions: true,
      hideBalances: false,
      slippageTolerance: 0.5,
      maxGasPrice: 20,
      autoApprove: false,
      transactionAlerts: true,
      priceAlerts: true,
      securityAlerts: true,
      emailNotifications: false,
      allowAnalytics: true,
      shareUsageData: false
    });
    toast.success("Inställningar återställda till standard");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Wallet Inställningar</h2>
          <p className="text-muted-foreground">Anpassa din wallet enligt dina preferenser</p>
        </div>
        <Button variant="outline" onClick={resetToDefaults}>
          Återställ Standard
        </Button>
      </div>

      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Säkerhet
          </TabsTrigger>
          <TabsTrigger value="trading" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Trading
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifikationer
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Integritet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Säkerhetsinställningar
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Automatisk låsning</Label>
                  <p className="text-sm text-muted-foreground">
                    Lås wallet automatiskt efter inaktivitet
                  </p>
                </div>
                <Switch 
                  checked={settings.autoLock}
                  onCheckedChange={(checked) => updateSetting('autoLock', checked)}
                />
              </div>

              {settings.autoLock && (
                <div className="ml-4 space-y-2">
                  <Label htmlFor="auto-lock-time">Låsningstid (minuter)</Label>
                  <Input
                    id="auto-lock-time"
                    type="number"
                    value={settings.autoLockTime}
                    onChange={(e) => updateSetting('autoLockTime', parseInt(e.target.value))}
                    className="w-32"
                    min="1"
                    max="60"
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Biometrisk autentisering</Label>
                  <p className="text-sm text-muted-foreground">
                    Använd fingeravtryck eller ansiktsigenkänning
                  </p>
                </div>
                <Switch 
                  checked={settings.biometricAuth}
                  onCheckedChange={(checked) => updateSetting('biometricAuth', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Lösenord för transaktioner</Label>
                  <p className="text-sm text-muted-foreground">
                    Kräv lösenord för alla transaktioner
                  </p>
                </div>
                <Switch 
                  checked={settings.requirePasswordForTransactions}
                  onCheckedChange={(checked) => updateSetting('requirePasswordForTransactions', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Dölj saldon</Label>
                  <p className="text-sm text-muted-foreground">
                    Dölj wallet saldon som standard
                  </p>
                </div>
                <Switch 
                  checked={settings.hideBalances}
                  onCheckedChange={(checked) => updateSetting('hideBalances', checked)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-warning/20 bg-warning/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h4 className="font-semibold text-warning">Säkerhetsråd</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Aktivera alltid automatisk låsning</li>
              <li>• Använd biometrisk autentisering när det är tillgängligt</li>
              <li>• Dela aldrig dina privata nycklar med någon</li>
              <li>• Säkerhetskopiera dina nycklar säkert</li>
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="trading" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Trading Inställningar
            </h3>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="slippage">Slippage tolerans (%)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Maximal prisförändring du accepterar för en transaktion
                </p>
                <Input
                  id="slippage"
                  type="number"
                  value={settings.slippageTolerance}
                  onChange={(e) => updateSetting('slippageTolerance', parseFloat(e.target.value))}
                  className="w-32"
                  min="0.1"
                  max="10"
                  step="0.1"
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="gas-price">Max gas pris (Gwei)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Högsta gas pris du är villig att betala
                </p>
                <Input
                  id="gas-price"
                  type="number"
                  value={settings.maxGasPrice}
                  onChange={(e) => updateSetting('maxGasPrice', parseInt(e.target.value))}
                  className="w-32"
                  min="1"
                  max="100"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Auto-godkänn transaktioner</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatiskt godkänn transaktioner under ett visst belopp
                  </p>
                </div>
                <Switch 
                  checked={settings.autoApprove}
                  onCheckedChange={(checked) => updateSetting('autoApprove', checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifikationsinställningar
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Transaktionsvarningar</Label>
                  <p className="text-sm text-muted-foreground">
                    Få notifiering när transaktioner bekräftas
                  </p>
                </div>
                <Switch 
                  checked={settings.transactionAlerts}
                  onCheckedChange={(checked) => updateSetting('transactionAlerts', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Prisvarningar</Label>
                  <p className="text-sm text-muted-foreground">
                    Få notifiering vid betydande prisförändringar
                  </p>
                </div>
                <Switch 
                  checked={settings.priceAlerts}
                  onCheckedChange={(checked) => updateSetting('priceAlerts', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Säkerhetsvarningar</Label>
                  <p className="text-sm text-muted-foreground">
                    Få notifiering vid säkerhetsrelaterade händelser
                  </p>
                </div>
                <Switch 
                  checked={settings.securityAlerts}
                  onCheckedChange={(checked) => updateSetting('securityAlerts', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">E-postnotifikationer</Label>
                  <p className="text-sm text-muted-foreground">
                    Ta emot notifikationer via e-post
                  </p>
                </div>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Integritetsinställningar
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Tillåt analys</Label>
                  <p className="text-sm text-muted-foreground">
                    Hjälp oss förbättra appen genom anonym användningsanalys
                  </p>
                </div>
                <Switch 
                  checked={settings.allowAnalytics}
                  onCheckedChange={(checked) => updateSetting('allowAnalytics', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Dela användningsdata</Label>
                  <p className="text-sm text-muted-foreground">
                    Dela anonymiserad användningsdata för forskning
                  </p>
                </div>
                <Switch 
                  checked={settings.shareUsageData}
                  onCheckedChange={(checked) => updateSetting('shareUsageData', checked)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-info/20 bg-info/5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-info" />
              <h4 className="font-semibold text-info">Integritetsinformation</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Vi tar din integritet på allvar. All data som samlas in är anonymiserad och används endast för att förbättra tjänsten. Vi säljer aldrig dina data till tredje part.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletSettingsPanel;