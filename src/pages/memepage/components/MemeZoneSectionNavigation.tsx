import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Flame, 
  Copy, 
  Monitor, 
  Target, 
  Briefcase, 
  Gift,
  Zap,
  Crown,
  Rocket
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SectionNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { 
    id: 'trenches', 
    name: 'Trenches', 
    icon: Flame, 
    color: 'text-destructive',
    description: 'High-risk, high-reward tokens',
    badge: 'RISK'
  },
  { 
    id: 'trending', 
    name: 'Trending', 
    icon: TrendingUp, 
    color: 'text-success',
    description: 'Most popular tokens right now',
    badge: 'HOT'
  },
  { 
    id: 'copytrade', 
    name: 'CopyTrade', 
    icon: Copy, 
    color: 'text-primary',
    description: 'Follow successful traders',
    badge: 'AUTO'
  },
  { 
    id: 'monitor', 
    name: 'Monitor', 
    icon: Monitor, 
    color: 'text-warning',
    description: 'Real-time market surveillance',
    badge: 'LIVE'
  },
  { 
    id: 'track', 
    name: 'Track', 
    icon: Target, 
    color: 'text-secondary',
    description: 'Portfolio tracking & analytics',
    badge: 'PRO'
  },
  { 
    id: 'portfolio', 
    name: 'Portfolio', 
    icon: Briefcase, 
    color: 'text-muted-foreground',
    description: 'Manage your investments',
    badge: null
  },
  { 
    id: 'rewards', 
    name: 'Rewards', 
    icon: Gift, 
    color: 'text-primary',
    description: 'Earn rewards for trading',
    badge: 'NEW'
  }
];

const MemeZoneSectionNavigation: React.FC<SectionNavigationProps> = ({
  activeSection,
  onSectionChange
}) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  return (
    <div className="bg-card/60 backdrop-blur-md border border-border/20 rounded-2xl p-6 shadow-lg mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Rocket className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Trading Sections</h3>
        <Badge variant="outline" className="text-xs">
          PROFESSIONAL
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isHovered = hoveredSection === section.id;

          return (
            <motion.div
              key={section.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredSection(section.id)}
              onHoverEnd={() => setHoveredSection(null)}
            >
              <Button
                onClick={() => onSectionChange(section.id)}
                variant={isActive ? "default" : "outline"}
                className={`
                  group relative w-full h-24 p-4 rounded-xl
                  transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25' 
                    : 'bg-card/50 border-border/30 hover:bg-card/80 hover:border-primary/40'
                  }
                  ${isHovered ? 'shadow-lg shadow-primary/20' : ''}
                `}
              >
                {/* Background glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-xl" />
                )}

                <div className="relative flex flex-col items-center gap-2 text-center">
                  {/* Icon with animation */}
                  <motion.div
                    animate={isActive ? { 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ duration: 0.6 }}
                    className="relative"
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-foreground' : section.color}`} />
                    
                    {/* Badge */}
                    {section.badge && (
                      <motion.div
                        className="absolute -top-1 -right-2"
                        animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        <Badge 
                          variant="destructive" 
                          className="text-xs px-1 py-0 h-4 rounded-full"
                        >
                          {section.badge}
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Section name */}
                  <span className={`text-xs font-semibold ${
                    isActive ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                    {section.name}
                  </span>

                  {/* Hover description */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
                    >
                      <div className="bg-popover text-popover-foreground text-xs p-2 rounded-lg shadow-lg border border-border/20 whitespace-nowrap">
                        {section.description}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Shine effect on active */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl" />
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Active section info */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/10"
      >
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {sections.find(s => s.id === activeSection)?.name || 'Trending'} Section
            </h4>
            <p className="text-xs text-muted-foreground">
              {sections.find(s => s.id === activeSection)?.description || 'Most popular tokens right now'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MemeZoneSectionNavigation;