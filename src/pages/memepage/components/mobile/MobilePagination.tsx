import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  loading: boolean;
  totalPages?: number;
  totalTokens?: number;
}
const MobilePagination: React.FC<PaginationProps> = ({
  currentPage,
  hasMore,
  onPageChange,
  loading,
  totalPages = 10,
  totalTokens = 200
}) => {
  const { t } = useLanguage();
  // Generate page numbers (show 3 pages around current)
  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-4 pt-6 pb-4">
      {/* Page indicator */}
      <div className="text-center">
        <span className="text-sm text-white/60 font-medium">
          {t('memePagination.page')} {currentPage} {t('memePagination.of')} {totalPages} • {totalTokens} {t('memePagination.tokensTotal')}
        </span>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Previous button */}
        <Button 
          variant="outline" 
          disabled={loading || currentPage === 1} 
          onClick={() => onPageChange(currentPage - 1)} 
          className="flex items-center gap-1 bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50 font-sans px-3 py-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('memePagination.previous')}</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === currentPage ? "default" : "outline"}
              onClick={() => onPageChange(pageNum)}
              disabled={loading}
              className={`w-10 h-10 p-0 font-bold transition-all duration-300 ${
                pageNum === currentPage 
                  ? 'bg-gradient-to-r from-primary/80 to-primary text-black hover:scale-105' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        {/* Next button */}
        <Button 
          disabled={loading || !hasMore || currentPage >= totalPages} 
          onClick={() => onPageChange(currentPage + 1)} 
          className="flex items-center gap-1 bg-gradient-to-r from-primary/80 to-primary text-black font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50 font-sans px-3 py-2"
        >
          <span className="hidden sm:inline">{t('memePagination.next')}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
export default MobilePagination;