/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'yellow-gold': '#E6CA97',
                'white-gold': '#D9D9D9',
                'rose-gold': '#E1A4A9',
            },
        },
    },
    plugins: [],
}