// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Ambil dari Figma color panel
                brand: {
                    green: '#4A7C59',   // heading, primary text accent
                    olive: '#8B9D3A',   // button primary
                    cream: '#F5F4E8',   // section background
                    dark: '#1A1A1A',   // body text
                    light: '#F0F4E8',   // card background (missions)
                }
            },
            fontFamily: {
                // Sesuaikan dengan font di Figma-mu
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

export default config