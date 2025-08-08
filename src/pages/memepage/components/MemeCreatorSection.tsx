import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, Shuffle, Upload, Zap, Sparkles, Star, Crown } from 'lucide-react';
import OptimizedImage from '@/components/OptimizedImage';

// Generated meme images
import frog1 from '@/assets/meme-generated/meme-coin-frog-1.webp';
import shiba1 from '@/assets/meme-generated/meme-coin-shiba-1.webp';
import doghat1 from '@/assets/meme-generated/meme-coin-dog-hat-1.webp';
import cat1 from '@/assets/meme-generated/meme-coin-cat-1.webp';
import doglaser1 from '@/assets/meme-generated/meme-coin-doge-laser-1.webp';
import frogpx1 from '@/assets/meme-generated/meme-coin-frog-pixel-1.webp';

const generatedImages = [frog1, shiba1, doghat1, cat1, doglaser1, frogpx1];

const MemeCreatorSection = () => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(generatedImages[0]);
  const [supply, setSupply] = useState('1000000000');

  const handleRandomize = () => {
    const randomImage = generatedImages[Math.floor(Math.random() * generatedImages.length)];
    setSelectedImage(randomImage);
    
    const randomNames = ['Moon Dog', 'Pepe King', 'Doge Master', 'Frog Prince', 'Cat Emperor', 'Shiba Lord'];
    const randomSymbols = ['MOON', 'PEPE', 'DOGE', 'FROG', 'CAT', 'SHIB'];
    const randomDescs = [
      'To the moon and beyond! 🚀',
      'The ultimate meme token experience',
      'Community-driven fun token',
      'Memes, dreams, and diamond hands',
      'Join the revolution!',
      'HODL till we reach Mars'
    ];
    
    setTokenName(randomNames[Math.floor(Math.random() * randomNames.length)]);
    setTokenSymbol(randomSymbols[Math.floor(Math.random() * randomSymbols.length)]);
    setDescription(randomDescs[Math.floor(Math.random() * randomDescs.length)]);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="p-8 bg-gradient-to-br from-card/90 via-card/70 to-card/90 backdrop-blur-sm border-2 border-primary/30 shadow-glow-rainbow">
        <Tabs defaultValue="create" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="create" className="text-lg font-bold">
              <Rocket className="w-5 h-5 mr-2" />
              Skapa Token
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-lg font-bold">
              <Sparkles className="w-5 h-5 mr-2" />
              Bild Galleri
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-lg font-bold">
              <Star className="w-5 h-5 mr-2" />
              Förhandsvisning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary" />
                    Token Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Token Name</label>
                      <Input
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        placeholder="e.g., Moon Dog"
                        className="text-lg border-primary/30 bg-input/80 focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Symbol</label>
                      <Input
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                        placeholder="e.g., MOON"
                        className="text-lg border-primary/30 bg-input/80 focus:border-primary"
                        maxLength={10}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Total Supply</label>
                      <Input
                        value={supply}
                        onChange={(e) => setSupply(e.target.value)}
                        placeholder="1,000,000,000"
                        className="text-lg border-primary/30 bg-input/80 focus:border-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your meme token..."
                        className="border-primary/30 bg-input/80 focus:border-primary resize-none"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleRandomize} variant="outline" className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                      <Shuffle className="w-4 h-4 mr-2" />
                      Randomize
                    </Button>
                    <Button className="flex-1 bg-gradient-primary hover:shadow-glow-primary">
                      <Crown className="w-4 h-4 mr-2" />
                      Create Token
                    </Button>
                  </div>
                </div>
              </div>

              {/* Image Selection */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Upload className="w-6 h-6 text-accent" />
                  Choose Image
                </h3>
                
                {/* Selected Image Preview */}
                <Card className="p-4 border-accent/30 bg-card/60">
                  <AspectRatio ratio={1}>
                    <OptimizedImage
                      src={selectedImage}
                      alt="Selected token image"
                      className="w-full h-full object-cover rounded-lg"
                      fallbackSrc="/placeholder.svg"
                    />
                  </AspectRatio>
                </Card>

                {/* Image Grid */}
                <div className="grid grid-cols-3 gap-3">
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
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                          fallbackSrc="/placeholder.svg"
                        />
                      </AspectRatio>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Custom Image
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <h3 className="text-3xl font-bold text-center bg-gradient-neon bg-clip-text text-transparent">
              🎨 AI-Generated Meme Images
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {generatedImages.map((img, index) => (
                <Card key={index} className="overflow-hidden group hover:scale-105 transition-all duration-300 border-primary/30 hover:shadow-glow-primary">
                  <AspectRatio ratio={1}>
                    <OptimizedImage
                      src={img}
                      alt={`AI generated meme ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      fallbackSrc="/placeholder.svg"
                    />
                  </AspectRatio>
                  <div className="p-3 bg-card/90">
                    <Badge className="w-full bg-gradient-primary text-primary-foreground">
                      AI Generated #{index + 1}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {/* Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6 border-2 border-success/50 bg-gradient-to-br from-card via-card/90 to-success/10 shadow-glow-secondary">
                <div className="text-center space-y-4">
                  <Badge className="bg-success text-success-foreground">Live Preview</Badge>
                  
                  <div className="w-32 h-32 mx-auto">
                    <AspectRatio ratio={1}>
                      <OptimizedImage
                        src={selectedImage}
                        alt="Token preview"
                        className="w-full h-full object-cover rounded-full border-4 border-primary animate-float"
                        fallbackSrc="/placeholder.svg"
                      />
                    </AspectRatio>
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold text-foreground">{tokenName || 'Your Token'}</h3>
                    <p className="text-xl text-primary font-bold">${tokenSymbol || 'SYMBOL'}</p>
                  </div>
                  
                  <p className="text-muted-foreground">{description || 'Your token description will appear here...'}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent">Supply</div>
                      <div className="text-sm text-muted-foreground">{parseInt(supply || '0').toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-secondary">Status</div>
                      <div className="text-sm text-muted-foreground">Ready to Launch</div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground">Token Features</h3>
                <div className="space-y-4">
                  <Card className="p-4 border-primary/30">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-primary" />
                      <div>
                        <div className="font-bold text-foreground">Lightning Fast</div>
                        <div className="text-sm text-muted-foreground">Instant transactions</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border-accent/30">
                    <div className="flex items-center gap-3">
                      <Star className="w-6 h-6 text-accent" />
                      <div>
                        <div className="font-bold text-foreground">Community Driven</div>
                        <div className="text-sm text-muted-foreground">Built by the community</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 border-secondary/30">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-secondary" />
                      <div>
                        <div className="font-bold text-foreground">Meme Powered</div>
                        <div className="text-sm text-muted-foreground">Powered by memes and dreams</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default MemeCreatorSection;