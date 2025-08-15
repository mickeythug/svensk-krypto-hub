import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const ModernToggle = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Base switch container
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      
      // Background states with glass effect
      "bg-gradient-to-r from-white/[0.1] to-white/[0.05]",
      "border border-white/[0.1]",
      "backdrop-blur-xl",
      
      // Active state with brand turquoise gradient
      "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-primary-glow",
      "data-[state=checked]:shadow-[0_0_15px_hsl(var(--primary)/0.4)]",
      "data-[state=checked]:border-primary/30",
      
      // Hover effects with brand color
      "hover:shadow-[0_0_10px_hsl(var(--primary)/0.2)]",
      
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Base thumb styles
        "pointer-events-none block h-4 w-4 rounded-full shadow-lg transition-all duration-300",
        
        // Glass effect on thumb
        "bg-gradient-to-br from-white to-white/80",
        "border border-white/20",
        
        // Position transitions
        "translate-x-1 data-[state=checked]:translate-x-6",
        
        // Active state styling with brand colors
        "data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-white data-[state=checked]:to-primary-glow/20",
        "data-[state=checked]:shadow-[0_0_10px_rgba(255,255,255,0.3)]"
      )}
    />
  </SwitchPrimitives.Root>
));
ModernToggle.displayName = SwitchPrimitives.Root.displayName;

export { ModernToggle };