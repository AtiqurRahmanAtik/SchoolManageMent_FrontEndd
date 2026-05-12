/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
       screens: {
        'print': { 'raw': 'print' },
      },
      colors: {
        primary: "#4CAF50",
        secondary: "#28282B",

        // --- NEW Jewellery Brand Colors ---
        'jewel-gold': {
          100: '#FDF3D8', // Very light gold
          300: '#F8E28B', // Light highlight
          500: '#D4AF37', // STANDARD GOLD (Main)
          700: '#B49028', // Dark Antique Gold
          900: '#8A6E1E', // Deep Bronze
        },
        'jewel-black': '#050505', // Richer, deeper black than standard hex #000
      },
      fontFamily: {
        primary: ['Poppins', 'sans-serif'],
        secondary: ['Montserrat', 'sans-serif'],
        // Added serif font for the Luxury look
        serif: ['Playfair Display', 'Cinzel', 'serif'], 
      },
      fontSize: {
        'headline': ['96pt', { fontWeight: '900' }],
        'subheader': ['64pt', { fontWeight: '600' }],
        'body': ['20pt', { fontWeight: '400' }],
        'btn-text': ['24pt', { fontWeight: '600' }],
      }
    }, // <-- FIXED: Removed the extra closing brace that was below here
  },
  plugins: [require("daisyui")],
  daisyui: {
    darkTheme: "dark", 
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#4CAF50",
          "primary-content": "#ffffff",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#4CAF50",
          "primary-content": "#ffffff",
        },
      },
    ],
  },
};