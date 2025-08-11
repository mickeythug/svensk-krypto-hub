import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from './use-mobile';

const MOBILE_ROUTES = [
  '/',           // Home
  '/marknad',    // Marknad
  '/meme',       // Meme Zone  
  '/handel',     // Handel
  '/nyheter'     // Nyheter
];

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const getCurrentRouteIndex = useCallback(() => {
    return MOBILE_ROUTES.findIndex(route => route === location.pathname);
  }, [location.pathname]);

  const navigateToRoute = useCallback((direction: 'left' | 'right') => {
    if (!isMobile) return;
    
    const currentIndex = getCurrentRouteIndex();
    if (currentIndex === -1) return;
    
    let nextIndex: number;
    if (direction === 'left') {
      // Swipe left = go to next page
      nextIndex = currentIndex + 1;
      if (nextIndex >= MOBILE_ROUTES.length) nextIndex = 0; // Loop to start
    } else {
      // Swipe right = go to previous page  
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = MOBILE_ROUTES.length - 1; // Loop to end
    }
    
    navigate(MOBILE_ROUTES[nextIndex]);
  }, [isMobile, getCurrentRouteIndex, navigate]);

  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;
    let startY = 0;
    let isScrolling: boolean | null = null;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isScrolling = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      
      const diffX = startX - currentX;
      const diffY = startY - currentY;
      
      if (isScrolling === null) {
        isScrolling = Math.abs(diffY) > Math.abs(diffX);
      }
      
      // If user is scrolling vertically, don't interfere
      if (isScrolling) return;
      
      // Prevent default horizontal scroll behavior
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY || isScrolling) return;
      
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;
      
      // Minimum swipe distance threshold (50px)
      const threshold = 50;
      
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          // Swiped left (finger moved left)
          navigateToRoute('left');
        } else {
          // Swiped right (finger moved right)  
          navigateToRoute('right');
        }
      }
      
      // Reset
      startX = 0;
      startY = 0;
      isScrolling = null;
    };

    // Add listeners to document for global swipe detection
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, navigateToRoute]);

  return {
    currentRouteIndex: getCurrentRouteIndex(),
    totalRoutes: MOBILE_ROUTES.length,
    routeNames: ['Home', 'Marknad', 'Meme Zone', 'Handel', 'Nyheter']
  };
}