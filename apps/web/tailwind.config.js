const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}', // if using App Router
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Inter', ...fontFamily.sans],
        secondary: ['Poppins', ...fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: '#007BFF', // Blue
          light: '#409EFF',
          dark: '#0056B3',
        },
        secondary: {
          DEFAULT: '#F8F9FA', // Light Grey
          dark: '#E9ECEF',
        },
        accent: {
          DEFAULT: '#28A745', // Green
          light: '#34D399',
          dark: '#1E7E34',
        },
        background: {
          DEFAULT: '#FFFFFF', // White
          darker: '#F8F9FA', // Light Grey for slightly off-white backgrounds
        },
        text: {
          DEFAULT: '#212529', // Dark Grey
          secondary: '#6C757D', // Medium Grey
          light: '#FFFFFF', // White for dark backgrounds
        },
        border: {
          DEFAULT: '#DEE2E6', // Border Grey
          medium: '#CED4DA',
        },
        status: {
          success: '#28A745',
          warning: '#FFC107',
          error: '#DC3545',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': "url('https://source.unsplash.com/1600x900/?ecommerce,shopping&sig=123')", // Example hero background
      },
      boxShadow: {
        'subtle': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 12px 20px -4px rgba(0, 123, 255, 0.2)' // Subtle blue shadow for card hover
      },
      transitionTimingFunction: {
        'custom-ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideInUp: 'slideInUp 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@headlessui/tailwindcss')({ prefix: 'ui' })
  ],
};
