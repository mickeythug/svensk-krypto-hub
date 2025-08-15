import * as React from "react";
import { cn } from "@/lib/utils";

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative group">
        <input
          type={type}
          className={cn(
            // Base styles
            "flex h-11 w-full rounded-xl px-4 py-2 text-sm font-medium",
            
            // Glass morphism background
            "bg-gradient-to-br from-white/[0.05] to-white/[0.02]",
            "backdrop-blur-xl",
            
            // Border with subtle glow
            "border border-white/[0.08]",
            "focus:border-purple-500/50",
            
            // Text styling
            "text-white placeholder:text-white/40",
            
            // Focus effects
            "focus:outline-none focus:ring-2 focus:ring-purple-500/20",
            "focus:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
            
            // Transition
            "transition-all duration-300",
            
            // Disabled state
            "disabled:cursor-not-allowed disabled:opacity-50",
            
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Subtle inner shadow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-black/[0.05] pointer-events-none" />
        
        {/* Focus glow ring */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.2)]" />
        </div>
      </div>
    );
  }
);
ModernInput.displayName = "ModernInput";

export { ModernInput };