/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				md: '2rem',
				lg: '2.5rem',
				xl: '3rem',
			},
			screens: {
				xs: '475px',
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px',
				'3xl': '1920px',
			},
		},
		extend: {
			screens: {
				'xs': '475px',
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
				'3xl': '1920px',
				// Mobile-first responsive helpers
				'only-mobile': { 'max': '767px' },
				'only-tablet': { 'min': '768px', 'max': '1023px' },
				'only-desktop': { 'min': '1024px' },
				'tablet-up': { 'min': '768px' },
				'desktop-up': { 'min': '1024px' },
				'large-desktop': { 'min': '1440px' },
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				// Custom mobile-friendly colors
				mobile: {
					nav: 'hsl(var(--background) / 0.95)',
					overlay: 'hsl(0 0% 0% / 0.6)',
					backdrop: 'hsl(var(--background) / 0.8)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Mobile-friendly rounded corners
				'3xl': '1.5rem',
				'4xl': '2rem',
			},
			fontSize: {
				// Mobile-optimized font sizes
				'2xs': '0.625rem', // 10px
				'xs': '0.75rem',   // 12px
				'sm': '0.875rem',  // 14px
				'base': '1rem',    // 16px
				'lg': '1.125rem',  // 18px
				'xl': '1.25rem',   // 20px
				'2xl': '1.5rem',   // 24px
				'3xl': '1.875rem', // 30px
				'4xl': '2.25rem',  // 36px
				'5xl': '3rem',     // 48px
				// Responsive font sizes
				'responsive-sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'responsive-base': ['1rem', { lineHeight: '1.5rem' }],
				'responsive-lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'responsive-xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'responsive-2xl': ['1.5rem', { lineHeight: '2rem' }],
			},
			spacing: {
				// Mobile-friendly spacing
				'18': '4.5rem',    // 72px
				'88': '22rem',     // 352px
				'100': '25rem',    // 400px
				'112': '28rem',    // 448px
				'128': '32rem',    // 512px
				// Safe area insets for mobile devices
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
			},
			maxWidth: {
				// Responsive max widths
				'xs': '20rem',     // 320px
				'sm': '24rem',     // 384px
				'md': '28rem',     // 448px
				'lg': '32rem',     // 512px
				'xl': '36rem',     // 576px
				'2xl': '42rem',    // 672px
				'3xl': '48rem',    // 768px
				'4xl': '56rem',    // 896px
				'5xl': '64rem',    // 1024px
				'6xl': '72rem',    // 1152px
				'7xl': '80rem',    // 1280px
				'screen-xs': '475px',
				'screen-sm': '640px',
				'screen-md': '768px',
				'screen-lg': '1024px',
			},
			minHeight: {
				// Mobile viewport heights
				'screen-75': '75vh',
				'screen-50': '50vh',
				'screen-33': '33vh',
				'screen-25': '25vh',
				// Safe area heights
				'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
			},
			height: {
				// Mobile navbar and footer heights
				'navbar-mobile': '4rem',     // 64px
				'navbar-desktop': '5rem',    // 80px
				'footer-mobile': '3.5rem',   // 56px
				'footer-desktop': '4rem',    // 64px
				// Viewport utilities
				'screen-75': '75vh',
				'screen-50': '50vh',
			},
			width: {
				// Sidebar widths
				'sidebar-mobile': '16rem',   // 256px
				'sidebar-collapsed': '5rem', // 80px
				'sidebar-full': '16rem',     // 256px
				// Content widths
				'content-mobile': 'calc(100vw - 2rem)',
				'content-tablet': 'calc(100vw - 5rem)',
				'content-desktop': 'calc(100vw - 16rem)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				// Mobile-friendly animations
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				'slide-out-right': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(100%)' },
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				'slide-out-left': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-100%)' },
				},
				'slide-in-up': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' },
				},
				'slide-out-down': {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(100%)' },
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'scale-out': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.95)', opacity: '0' },
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				// Mobile-friendly animations
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-out-left': 'slide-out-left 0.3s ease-out',
				'slide-in-up': 'slide-in-up 0.3s ease-out',
				'slide-out-down': 'slide-out-down 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'shake': 'shake 0.5s ease-in-out',
				'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
			},
			backdropBlur: {
				// Mobile backdrop blur
				'xs': '2px',
				'sm': '4px',
				'default': '8px',
				'md': '12px',
				'lg': '16px',
				'xl': '24px',
				'2xl': '40px',
				'3xl': '64px',
			},
			zIndex: {
				// Mobile-friendly z-index scale
				'0': '0',
				'10': '10',
				'20': '20',
				'30': '30',
				'40': '40', // Header
				'50': '50', // Sidebar
				'60': '60', // Overlays
				'70': '70', // Modals
				'80': '80', // Popovers
				'90': '90', // Tooltips
				'100': '100', // Toasts/Notifications
				'auto': 'auto',
			},
			transitionProperty: {
				// Extended transition properties
				'height': 'height',
				'spacing': 'margin, padding',
				'transform': 'transform',
				'size': 'width, height',
				'all': 'all',
			},
			transitionDuration: {
				// Mobile-optimized durations
				'0': '0ms',
				'75': '75ms',
				'100': '100ms',
				'150': '150ms',
				'200': '200ms',
				'300': '300ms',
				'500': '500ms',
				'700': '700ms',
				'1000': '1000ms',
			},
			transitionTimingFunction: {
				// Mobile-friendly easings
				'ios': 'cubic-bezier(0.36, 0.66, 0.04, 1)',
				'ios-out': 'cubic-bezier(0.45, 0, 0.55, 1)',
				'material': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'smooth': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
			},
		},
	},
	plugins: [
		require('tailwindcss-animate'),
		// Custom plugin for mobile utilities
		function({ addUtilities, theme }) {
			const newUtilities = {
				// Safe area utilities
				'.pb-safe': {
					paddingBottom: 'env(safe-area-inset-bottom)',
				},
				'.pt-safe': {
					paddingTop: 'env(safe-area-inset-top)',
				},
				'.pl-safe': {
					paddingLeft: 'env(safe-area-inset-left)',
				},
				'.pr-safe': {
					paddingRight: 'env(safe-area-inset-right)',
				},
				'.mb-safe': {
					marginBottom: 'env(safe-area-inset-bottom)',
				},
				'.mt-safe': {
					marginTop: 'env(safe-area-inset-top)',
				},
				// Touch target sizing (minimum 44x44px for iOS)
				'.touch-target': {
					minWidth: '44px',
					minHeight: '44px',
				},
				// Prevent text size adjustment on orientation change
				'.text-size-adjust-none': {
					textSizeAdjust: 'none',
				},
				'.text-size-adjust-100': {
					textSizeAdjust: '100%',
				},
				// Mobile scroll behavior
				'.scroll-smooth-mobile': {
					scrollBehavior: 'smooth',
					'-webkit-overflow-scrolling': 'touch',
				},
				'.overscroll-contain': {
					overscrollBehavior: 'contain',
				},
				// Hide scrollbars but keep functionality
				'.scrollbar-hide': {
					'-ms-overflow-style': 'none',
					'scrollbar-width': 'none',
					'&::-webkit-scrollbar': {
						display: 'none',
					},
				},
				// Mobile tap highlight
				'.tap-highlight-none': {
					'-webkit-tap-highlight-color': 'transparent',
				},
				// Prevent pull-to-refresh on mobile
				'.overscroll-y-contain': {
					overscrollBehaviorY: 'contain',
				},
				// Responsive typography
				'.responsive-text': {
					fontSize: 'clamp(1rem, 2vw, 1.25rem)',
					lineHeight: '1.5',
				},
				// Mobile grid utilities
				'.grid-responsive': {
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
					gap: theme('spacing.4'),
				},
				// Mobile aspect ratios
				'.aspect-mobile': {
					aspectRatio: '9 / 16',
				},
				'.aspect-square-mobile': {
					aspectRatio: '1 / 1',
				},
				// Mobile-only visibility
				'.mobile-only': {
					'@media (min-width: 768px)': {
						display: 'none !important',
					},
				},
				'.desktop-only': {
					'@media (max-width: 767px)': {
						display: 'none !important',
					},
				},
				// Mobile input styles
				'.input-mobile': {
					fontSize: '16px !important', // Prevents iOS zoom on focus
				},
			};
			addUtilities(newUtilities);
		}
	],
};