import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant={language === 'sv' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('sv')}
          className="h-8 w-8 p-0 rounded-full overflow-hidden border-2 transition-all duration-200"
          title="Svenska"
        >
          <img 
            src="https://flagcdn.com/w40/se.png" 
            alt="Svenska"
            className="w-full h-full object-cover"
          />
        </Button>
        <Button
          variant={language === 'en' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLanguage('en')}
          className="h-8 w-8 p-0 rounded-full overflow-hidden border-2 transition-all duration-200"
          title="English"
        >
          <img 
            src="https://flagcdn.com/w40/us.png" 
            alt="English"
            className="w-full h-full object-cover"
          />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Språk / Language
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={language === 'sv' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLanguage('sv')}
          className="flex items-center gap-2 h-10 px-4 transition-all duration-200"
        >
          <img 
            src="https://flagcdn.com/w20/se.png" 
            alt="Svenska"
            className="w-5 h-auto rounded-sm"
          />
          <span className="font-bold">SV</span>
        </Button>
        <Button
          variant={language === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLanguage('en')}
          className="flex items-center gap-2 h-10 px-4 transition-all duration-200"
        >
          <img 
            src="https://flagcdn.com/w20/us.png" 
            alt="English"
            className="w-5 h-auto rounded-sm"
          />
          <span className="font-bold">EN</span>
        </Button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;