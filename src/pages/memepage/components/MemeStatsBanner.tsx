import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, Zap, Activity, Clock } from 'lucide-react';

const MemeStatsBanner = () => {
  return (
    <section className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <Card className="p-8 bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/20 rounded-full border border-primary/30">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">500+</div>
              <div className="text-sm text-muted-foreground font-medium">MEME TOKENS</div>
              <Badge className="mt-2 bg-success/20 text-success border-success">LIVE</Badge>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/20 rounded-full border border-primary/30">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">$2.1B</div>
              <div className="text-sm text-muted-foreground font-medium">TOTAL MARKET CAP</div>
              <Badge className="mt-2 bg-primary/20 text-primary border-primary">24H</Badge>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary/20 rounded-full border border-primary/30">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">1.2M</div>
              <div className="text-sm text-muted-foreground font-medium">TOTAL HOLDERS</div>
              <Badge className="mt-2 bg-primary/20 text-primary border-primary">GROWING</Badge>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-orange-500/20 rounded-full border border-orange-500/30">
                  <Activity className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-orange-500 mb-1">85%</div>
              <div className="text-sm text-muted-foreground font-medium">24H VOLUME +</div>
              <Badge className="mt-2 bg-orange-500/20 text-orange-500 border-orange-500">HOT</Badge>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-purple-500/20 rounded-full border border-purple-500/30">
                  <Zap className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-purple-500 mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground font-medium">DATA ACCURACY</div>
              <Badge className="mt-2 bg-purple-500/20 text-purple-500 border-purple-500">VERIFIED</Badge>
            </div>

            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-500/20 rounded-full border border-green-500/30">
                  <Clock className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-green-500 mb-1">24/7</div>
              <div className="text-sm text-muted-foreground font-medium">LIVE UPDATES</div>
              <Badge className="mt-2 bg-green-500/20 text-green-500 border-green-500">REAL-TIME</Badge>
            </div>

          </div>

          {/* Bottom text */}
          <div className="text-center mt-8 pt-6 border-t border-border/30">
            <p className="text-lg text-muted-foreground">
              <span className="text-primary font-bold">VÄRLDENS MEST KOMPLETTA</span> meme token databas med 
              <span className="text-primary font-bold"> REALTIDSDATA</span> och 
              <span className="text-primary font-bold"> AVANCERAD ANALYS</span>
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MemeStatsBanner;