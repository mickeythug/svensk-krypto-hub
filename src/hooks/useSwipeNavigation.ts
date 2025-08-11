import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from './use-mobile';

const MOBILE_ROUTES = [
  '/',           // Home
  '/marknad',    // Marknad
  '/meme',       // Meme Zone  
  '/nyheter'     // Nyheter
];

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const getCurrentRouteIndex = useCallback(() => {
    return MOBILE_ROUTES.findIndex(route => route === location.pathname);
  }, [location.pathname]);

  const navigateToRoute = useCallback((direction: 'left' | 'right', animated = true) => {
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
    
    if (animated) {
      setIsTransitioning(true);
      // Add smooth transition effect
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.style.transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
        mainElement.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
          navigate(MOBILE_ROUTES[nextIndex]);
          mainElement.style.transform = direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)';
          
          setTimeout(() => {
            mainElement.style.transform = 'translateX(0)';
            setTimeout(() => {
              mainElement.style.transition = '';
              setIsTransitioning(false);
            }, 300);
          }, 50);
        }, 150);
      }
    } else {
      navigate(MOBILE_ROUTES[nextIndex]);
    }
  }, [isMobile, getCurrentRouteIndex, navigate]);

  useEffect(() => {
    if (!isMobile || isTransitioning) return;

    let startX = 0;
    let startY = 0;
    let isScrolling: boolean | null = null;
    let isDragging = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isScrolling = null;
      isDragging = false;
      setSwipeProgress(0);
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
      
      // Calculate swipe progress for visual feedback
      const screenWidth = window.innerWidth;
      const progress = Math.abs(diffX) / screenWidth;
      const clampedProgress = Math.min(progress, 0.3); // Max 30% preview
      
      if (!isDragging && Math.abs(diffX) > 10) {
        isDragging = true;
      }
      
      if (isDragging) {
        setSwipeProgress(clampedProgress * (diffX > 0 ? 1 : -1));
        
        // Apply real-time transform for drag effect
        const mainElement = document.querySelector('main');
        if (mainElement) {
          const translateX = -diffX * 0.3; // 30% of actual movement
          mainElement.style.transform = `translateX(${translateX}px)`;
          mainElement.style.transition = 'none';
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY || isScrolling) return;
      
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;
      
      // Reset visual feedback
      setSwipeProgress(0);
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.style.transform = '';
        mainElement.style.transition = '';
      }
      
      // Minimum swipe distance threshold (80px for more intentional swipes)
      const threshold = 80;
      
      if (Math.abs(diffX) > threshold && isDragging) {
        if (diffX > 0) {
          // Swiped left (finger moved left)
          navigateToRoute('left', true);
        } else {
          // Swiped right (finger moved right)  
          navigateToRoute('right', true);
        }
      }
      
      // Reset
      startX = 0;
      startY = 0;
      isScrolling = null;
      isDragging = false;
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
  }, [isMobile, navigateToRoute, isTransitioning]);

  return {
    currentRouteIndex: getCurrentRouteIndex(),
    totalRoutes: MOBILE_ROUTES.length,
    routeNames: ['Home', 'Marknad', 'Meme Zone', 'Nyheter'],
    swipeProgress,
    isTransitioning
  };
}