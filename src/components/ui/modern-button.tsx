import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const modernButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-xl relative overflow-hidden",
  {
    variants: {
      variant: {
        // Purple gradient from reference image
        primary: [
          "bg-gradient-to-r from-purple-600 to-pink-600",
          "text-white font-semibold",
          "shadow-[0_0_20px_rgba(139,92,246,0.4)]",
          "hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]",
          "hover:scale-[1.02]",
          "border border-purple-500/30",
        ],
        // Glass style buttons
        glass: [
          "bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
          "backdrop-blur-xl",
          "border border-white/[0.1]",
          "text-white",
          "hover:from-white/[0.12] hover:to-white/[0.06]",
          "shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]",
        ],
        // Buy button (green)
        buy: [
          "bg-gradient-to-r from-emerald-600 to-green-600",
          "text-white font-semibold",
          "shadow-[0_0_20px_rgba(16,185,129,0.4)]",
          "hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]",
          "hover:scale-[1.02]",
          "border border-emerald-500/30",
        ],
        // Sell button (red)
        sell: [
          "bg-gradient-to-r from-red-600 to-rose-600",
          "text-white font-semibold",
          "shadow-[0_0_20px_rgba(239,68,68,0.4)]",
          "hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]",
          "hover:scale-[1.02]",
          "border border-red-500/30",
        ],
        // Transparent style
        ghost: [
          "text-white/70 hover:text-white",
          "hover:bg-white/[0.05]",
          "rounded-lg",
        ],
        // Outline style
        outline: [
          "border border-white/[0.1]",
          "bg-transparent",
          "text-white/70 hover:text-white",
          "hover:bg-white/[0.05]",
          "hover:border-white/[0.2]",
        ],
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean;
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(modernButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
      </Comp>
    );
  }
);
ModernButton.displayName = "ModernButton";

export { ModernButton, modernButtonVariants };