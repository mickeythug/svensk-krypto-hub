import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, Zap, Activity, Clock } from 'lucide-react';

const MemeStatsBanner = () => {
  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <Card className="p-8 bg-gradient-to-r from-card/90 via-card/70 to-card/90 backdrop-blur-sm border-2 border-primary/30 shadow-glow-rainbow">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            
            <div className="text-center group hover:scale-110 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-primary rounded-full shadow-glow-primary">
                  <TrendingUp className="w-8 h-8 text-primary-foreground" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-crypto font-black text-primary mb-1">500+</div>
              <div className="text-sm text-muted-foreground font-crypto font-medium">MEME TOKENS</div>
              <Badge className="mt-2 bg-success/20 text-success border-success font-crypto">LIVE</Badge>
            </div>

            <div className="text-center group hover:scale-110 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-secondary rounded-full shadow-glow-secondary">
                  <DollarSign className="w-8 h-8 text-secondary-foreground" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-crypto font-black text-secondary mb-1">$2.1B</div>
              <div className="text-sm text-muted-foreground font-crypto font-medium">TOTAL MARKET CAP</div>
              <Badge className="mt-2 bg-secondary/20 text-secondary border-secondary font-crypto">24H</Badge>
            </div>

            <div className="text-center group hover:scale-110 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-neon rounded-full shadow-glow-primary">
                  <Users className="w-8 h-8 text-foreground" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-crypto font-black text-accent mb-1">1.2M</div>
              <div className="text-sm text-muted-foreground font-crypto font-medium">TOTAL HOLDERS</div>
              <Badge className="mt-2 bg-accent/20 text-accent border-accent font-crypto">GROWING</Badge>
            </div>

            <div className="text-center group hover:scale-110 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-glow-secondary">
                  <Activity className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-crypto font-black text-orange-400 mb-1">85%</div>
              <div className="text-sm text-muted-foreground font-crypto font-medium">24H VOLUME +</div>
              <Badge className="mt-2 bg-orange-500/20 text-orange-400 border-orange-400 font-crypto">HOT</Badge>
            </div>

            <div className="text-center group hover:scale-110 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-glow-primary">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-crypto font-black text-purple-400 mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground font-crypto font-medium">DATA ACCURACY</div>
              <Badge className="mt-2 bg-purple-500/20 text-purple-400 border-purple-400 font-crypto">VERIFIED</Badge>
            </div>

            <div className="text-center group hover:scale-110 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-glow-secondary">
                  <Clock className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-crypto font-black text-green-400 mb-1">24/7</div>
              <div className="text-sm text-muted-foreground font-crypto font-medium">LIVE UPDATES</div>
              <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-400 font-crypto">REAL-TIME</Badge>
            </div>

          </div>

          {/* Bottom text */}
          <div className="text-center mt-8 pt-6 border-t border-border/30">
            <p className="text-lg text-muted-foreground font-crypto">
              <span className="text-primary font-bold">VÄRLDENS MEST KOMPLETTA</span> meme token databas med 
              <span className="text-accent font-bold"> REALTIDSDATA</span> och 
              <span className="text-secondary font-bold"> AVANCERAD ANALYS</span>
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MemeStatsBanner;