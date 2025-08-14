import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  loading: boolean;
  totalPages?: number;
}

const MobilePagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  hasMore, 
  onPageChange, 
  loading,
  totalPages = 10 // Estimate for UI
}) => {
  return (
    <div className="flex items-center justify-center gap-4 pt-6 pb-4">
      <Button 
        variant="outline" 
        disabled={loading || currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Föregående
      </Button>
      
      <Card className="bg-black/20 backdrop-blur-xl border border-white/10 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/70">Sida</span>
          <span className="text-lg font-bold text-white">{currentPage}</span>
          <span className="text-sm text-white/50">av {totalPages}+</span>
        </div>
      </Card>
      
      <Button 
        disabled={loading || !hasMore} 
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-2 bg-gradient-to-r from-primary/80 to-primary text-black font-bold hover:scale-105 transition-all duration-300 disabled:opacity-50"
      >
        Nästa
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default MobilePagination;