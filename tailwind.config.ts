import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '1.5rem',
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
  				foreground: 'hsl(var(--primary-foreground))',
  				light: 'hsl(var(--primary-light))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			brand: {
  				DEFAULT: 'hsl(var(--brand))',
  				ink: 'hsl(var(--brand-ink))',
  				pressed: '#172E6E',
  				tint: 'rgba(30, 58, 138, 0.08)',
  				'tint-pressed': 'rgba(30, 58, 138, 0.14)'
  			},
  			// Dashboard palette: the mobile app's tokens (mobile/src/lib/theme.ts), so the web and the apps match.
  			ink: {
  				DEFAULT: '#0F172A',
  				2: '#5B6B82',
  				3: '#94A3B8'
  			},
  			canvas: '#F6F7F9',
  			line: '#E5E7EB',
  			night: {
  				DEFAULT: '#0A1430',
  				glow: '#1E40AF',
  				line: 'rgba(255, 255, 255, 0.16)'
  			},
  			live: '#38BDF8',
  			ok: {
  				DEFAULT: '#10B981',
  				text: '#047857',
  				tint: '#ECFDF5'
  			},
  			warn: {
  				DEFAULT: '#F59E0B',
  				text: '#B45309',
  				tint: '#FFFBEB'
  			},
  			bad: {
  				DEFAULT: '#EF4444',
  				text: '#B91C1C',
  				tint: '#FEF2F2',
  				'tint-pressed': '#FEE2E2'
  			},
  			info: {
  				text: '#1E40AF',
  				tint: '#EFF6FF'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'var(--font-display)',
  				'var(--font-inter)',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'ui-monospace',
  				'SFMono-Regular',
  				'monospace'
  			]
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
  			'pulse-ring': {
  				'0%': {
  					transform: 'scale(0.8)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'scale(2.4)',
  					opacity: '0'
  				}
  			},
  			'word-up': {
  				from: { transform: 'translateY(105%)' },
  				to: { transform: 'translateY(0)' }
  			},
  			'fade-up': {
  				from: { opacity: '0', transform: 'translateY(16px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'hero-zoom': {
  				from: { transform: 'scale(1.06)' },
  				to: { transform: 'scale(1)' }
  			},
  			// Dashboard: content settles in place, shorter and closer than the landing page's fade-up.
  			rise: {
  				from: { opacity: '0', transform: 'translateY(8px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'grow-x': {
  				from: { transform: 'scaleX(0)' },
  				to: { transform: 'scaleX(1)' }
  			},
  			'grow-y': {
  				from: { transform: 'scaleY(0)' },
  				to: { transform: 'scaleY(1)' }
  			},
  			shimmer: {
  				from: { backgroundPosition: '200% 0' },
  				to: { backgroundPosition: '-200% 0' }
  			},
  			// The signature card's glow wanders a little, so the navy card feels lit rather than printed.
  			'glow-drift': {
  				from: { transform: 'translate3d(0, 0, 0) scale(1)' },
  				to: { transform: 'translate3d(-56px, 28px, 0) scale(1.1)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
  			'word-up': 'word-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
  			'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
  			'hero-zoom': 'hero-zoom 2.4s cubic-bezier(0.22, 1, 0.36, 1) both',
  			rise: 'rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
  			'grow-x': 'grow-x 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
  			'grow-y': 'grow-y 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
  			shimmer: 'shimmer 1.6s linear infinite'
  		},
  		transitionTimingFunction: {
  			// The landing page's easing (Reveal, fade-up), for dashboard transitions.
  			swift: 'cubic-bezier(0.22, 1, 0.36, 1)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
