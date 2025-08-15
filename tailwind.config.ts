import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
    extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				brand: {
					turquoise: 'hsl(var(--brand-turquoise))',
					white: 'hsl(var(--brand-white))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-casino-gold': 'var(--gradient-casino-gold)',
				'gradient-casino-rainbow': 'var(--gradient-casino-rainbow)',
			},
			boxShadow: {
				'glow-primary': 'var(--shadow-glow-primary)',
				'glow-secondary': 'var(--glow-secondary)',
				'glow-gold': 'var(--shadow-glow-gold)',
				'glow-rainbow': 'var(--shadow-glow-rainbow)',
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'Inter', 'monospace'],
				inter: ['Inter', 'system-ui', 'sans-serif'],
				trading: ['Inter', 'system-ui', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 5px hsl(var(--primary))' },
					'50%': { boxShadow: '0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary))' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'ticker': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        'ticker-seamless': {
          'from': { transform: 'translateX(0%)' },
          'to': { transform: 'translateX(-50%)' }
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px hsl(var(--primary) / 0.5)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 20px hsl(var(--primary) / 0.8), 0 0 30px hsl(var(--primary) / 0.6)',
            transform: 'scale(1.05)'
          }
        },
        'spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'bounce': {
          '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'elastic-pop': {
          '0%': { transform: 'scale(1) rotate(0deg)', boxShadow: '0 0 0px rgba(255, 215, 0, 0)' },
          '50%': { transform: 'scale(1.25) rotate(2deg)', boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)' },
          '100%': { transform: 'scale(1.1) rotate(0deg)', boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)' }
        },
        'neon-pulse': {
          '0%': { transform: 'scale(1)', filter: 'brightness(1) drop-shadow(0 0 5px currentColor)' },
          '50%': { transform: 'scale(1.15)', filter: 'brightness(1.4) drop-shadow(0 0 15px currentColor)' },
          '100%': { transform: 'scale(1.05)', filter: 'brightness(1.2) drop-shadow(0 0 10px currentColor)' }
        },
        'morph-wiggle': {
          '0%': { transform: 'scale(1) skew(0deg)', borderRadius: '8px' },
          '25%': { transform: 'scale(1.1) skew(1deg)', borderRadius: '12px' },
          '75%': { transform: 'scale(1.1) skew(-1deg)', borderRadius: '12px' },
          '100%': { transform: 'scale(1.05) skew(0deg)', borderRadius: '10px' }
        }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'ticker': 'ticker 20s linear infinite',
        'ticker-seamless': 'ticker-seamless 30s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
        'bounce': 'bounce 1s infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'elastic-pop': 'elastic-pop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'neon-pulse': 'neon-pulse 0.3s ease-out',
        'morph-wiggle': 'morph-wiggle 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
