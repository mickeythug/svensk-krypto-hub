import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Shuffle, Upload, Rocket, Globe, Twitter, MessageCircle } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

// Generated meme images
import frog1 from '@/assets/meme-generated/meme-coin-frog-1.webp';
import shiba1 from '@/assets/meme-generated/meme-coin-shiba-1.webp';
import doghat1 from '@/assets/meme-generated/meme-coin-dog-hat-1.webp';
import cat1 from '@/assets/meme-generated/meme-coin-cat-1.webp';
import doglaser1 from '@/assets/meme-generated/meme-coin-doge-laser-1.webp';
import frogpx1 from '@/assets/meme-generated/meme-coin-frog-pixel-1.webp';

const generatedImages = [frog1, shiba1, doghat1, cat1, doglaser1, frogpx1];

const MemeTokenCreator = () => {
  const [tokenName, setTokenName] = useState('MegaFrog Coin');
  const [tokenSymbol, setTokenSymbol] = useState('MEGA');
  const [description, setDescription] = useState('Den ultimata meme token upplevelsen! 🚀');
  const [selectedImage, setSelectedImage] = useState(generatedImages[0]);
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [telegram, setTelegram] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleRandomize = () => {
    const randomImage = generatedImages[Math.floor(Math.random() * generatedImages.length)];
    setSelectedImage(randomImage);
    
    const randomNames = ['Moon Dog', 'Pepe King', 'Doge Master', 'Frog Prince', 'Cat Emperor', 'Shiba Lord'];
    const randomSymbols = ['MOON', 'PEPE', 'DOGE', 'FROG', 'CAT', 'SHIB'];
    const randomDescs = [
      'Till månen och längre! 🚀',
      'Den ultimata meme token upplevelsen',
      'Community-driven roliga token',
      'Memes, drömmar och diamanthänder',
      'Gå med i revolutionen!',
      'HODL tills vi når Mars'
    ];
    
    setTokenName(randomNames[Math.floor(Math.random() * randomNames.length)]);
    setTokenSymbol(randomSymbols[Math.floor(Math.random() * randomSymbols.length)]);
    setDescription(randomDescs[Math.floor(Math.random() * randomDescs.length)]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
  };

  return (
    <section aria-labelledby="creator-title" className="relative max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Creator Form */}
        <Card className="p-8 border-2 border-primary/30 bg-gradient-to-br from-card/90 via-card/70 to-card/90 backdrop-blur-sm shadow-glow-rainbow">
          <h3 id="creator-title" className="font-crypto font-black text-3xl mb-8 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            SKAPA DIN MEME TOKEN
          </h3>

          <div className="space-y-6">
            {/* Token Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="font-crypto font-bold text-lg text-foreground">TOKEN NAMN</Label>
                <Input 
                  id="name" 
                  value={tokenName} 
                  onChange={(e) => setTokenName(e.target.value)} 
                  placeholder="t.ex. MegaFrog Coin"
                  className="font-crypto text-lg border-primary/30 bg-input/80 focus:border-primary mt-2"
                />
              </div>
              <div>
                <Label htmlFor="symbol" className="font-crypto font-bold text-lg text-foreground">SYMBOL</Label>
                <Input 
                  id="symbol" 
                  value={tokenSymbol} 
                  onChange={(e) => setTokenSymbol(e.target.value.toUpperCase().slice(0,6))} 
                  placeholder="MEGA"
                  className="font-crypto text-lg border-primary/30 bg-input/80 focus:border-primary mt-2"
                />
              </div>
            </div>

            {/* Fixed Supply */}
            <div>
              <Label className="font-crypto font-bold text-lg text-foreground">TOTAL SUPPLY</Label>
              <div className="relative mt-2">
                <Input 
                  value="1,000,000,000 (1B)"
                  disabled
                  className="font-crypto text-lg border-primary/30 bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs font-crypto text-primary bg-primary/10 px-2 py-1 rounded">LÅST</span>
                </div>
              </div>
              <p className="text-xs font-crypto text-muted-foreground mt-1">Supply är fastställd på 1 miljard tokens</p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="font-crypto font-bold text-lg text-foreground">BESKRIVNING</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beskriv din meme token..."
                className="font-crypto border-primary/30 bg-input/80 focus:border-primary resize-none mt-2"
                rows={3}
              />
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="font-crypto font-bold text-xl text-foreground">SOCIALA LÄNKAR</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="twitter" className="font-crypto font-semibold text-sm text-foreground flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                    TWITTER
                  </Label>
                  <Input 
                    id="twitter" 
                    value={twitter} 
                    onChange={(e) => setTwitter(e.target.value)} 
                    placeholder="@username"
                    className="font-crypto border-primary/30 bg-input/80 focus:border-primary mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="website" className="font-crypto font-semibold text-sm text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    HEMSIDA
                  </Label>
                  <Input 
                    id="website" 
                    value={website} 
                    onChange={(e) => setWebsite(e.target.value)} 
                    placeholder="https://yoursite.com"
                    className="font-crypto border-primary/30 bg-input/80 focus:border-primary mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="telegram" className="font-crypto font-semibold text-sm text-foreground flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#0088cc]" />
                    TELEGRAM
                  </Label>
                  <Input 
                    id="telegram" 
                    value={telegram} 
                    onChange={(e) => setTelegram(e.target.value)} 
                    placeholder="@channel"
                    className="font-crypto border-primary/30 bg-input/80 focus:border-primary mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Image Selection */}
            <div>
              <Label className="font-crypto font-bold text-lg text-foreground">TOKEN BILD</Label>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {generatedImages.map((img, index) => (
                  <Card 
                    key={index}
                    className={`p-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedImage === img ? 'border-2 border-primary shadow-glow-primary' : 'border border-border/50 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <AspectRatio ratio={1}>
                      <OptimizedImage
                        src={img}
                        alt={`AI genererad bild ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                        fallbackSrc="/placeholder.svg"
                      />
                    </AspectRatio>
                  </Card>
                ))}
              </div>
              
              <div className="flex gap-3 mt-4">
                <input 
                  ref={fileRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileRef.current?.click()}
                  className="font-crypto font-bold border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  LADDA UPP EGEN BILD
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleRandomize}
                  className="font-crypto font-bold border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  SLUMPA
                </Button>
              </div>
            </div>

            <p className="text-xs font-crypto text-muted-foreground bg-muted/30 p-3 rounded border border-border/30">
              <strong>Obs:</strong> Detta är en visuell prototyp utan blockchain-deploy. Använd för att designa och planera din token innan lansering.
            </p>
          </div>
        </Card>

        {/* Live Preview */}
        <Card className="p-8 border-2 border-success/50 bg-gradient-to-br from-card via-card/90 to-success/10 backdrop-blur-sm shadow-glow-secondary">
          <h4 className="font-crypto font-black text-2xl mb-6 text-success">LIVE FÖRHANDSVISNING</h4>
          
          <div className="space-y-6">
            {/* Token Card Preview */}
            <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-card/80 to-primary/5">
              <div className="relative">
                <AspectRatio ratio={16/9}>
                  <OptimizedImage 
                    src={selectedImage} 
                    alt={`${tokenName} omslagsbild`} 
                    className="w-full h-full object-cover" 
                    fallbackSrc="/placeholder.svg" 
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="space-y-2">
                    <h3 className="font-crypto font-black text-2xl text-foreground">{tokenName || 'Token Namn'}</h3>
                    <p className="font-crypto font-bold text-lg text-primary">${tokenSymbol || 'SYMBOL'}</p>
                    <p className="font-crypto text-sm text-muted-foreground line-clamp-2">{description || 'Token beskrivning visas här...'}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Token Details */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 border border-border/60 bg-secondary/10">
                <div className="font-crypto text-xs text-muted-foreground">TOTAL SUPPLY</div>
                <div className="font-crypto font-black text-lg text-foreground">1,000,000,000</div>
                <div className="font-crypto text-xs text-primary">1B TOKENS</div>
              </Card>
              <Card className="p-4 border border-border/60 bg-accent/10">
                <div className="font-crypto text-xs text-muted-foreground">STATUS</div>
                <div className="font-crypto font-black text-lg text-foreground">REDO</div>
                <div className="font-crypto text-xs text-accent">FÖR LANSERING</div>
              </Card>
            </div>

            {/* Social Links Preview */}
            {(twitter || website || telegram) && (
              <Card className="p-4 border border-border/60 bg-primary/5">
                <div className="font-crypto text-sm font-bold text-foreground mb-3">SOCIALA LÄNKAR</div>
                <div className="space-y-2">
                  {twitter && (
                    <div className="flex items-center gap-2 font-crypto text-sm">
                      <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                      <span className="text-muted-foreground">Twitter:</span>
                      <span className="text-foreground font-semibold">{twitter}</span>
                    </div>
                  )}
                  {website && (
                    <div className="flex items-center gap-2 font-crypto text-sm">
                      <Globe className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Hemsida:</span>
                      <span className="text-foreground font-semibold truncate">{website}</span>
                    </div>
                  )}
                  {telegram && (
                    <div className="flex items-center gap-2 font-crypto text-sm">
                      <MessageCircle className="w-4 h-4 text-[#0088cc]" />
                      <span className="text-muted-foreground">Telegram:</span>
                      <span className="text-foreground font-semibold">{telegram}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Action Button */}
            <Button 
              className="w-full font-crypto font-black text-lg bg-gradient-primary hover:shadow-glow-primary h-12"
              size="lg"
            >
              <Rocket className="mr-3 h-5 w-5" />
              GENERERA DELNINGSBILD
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MemeTokenCreator;