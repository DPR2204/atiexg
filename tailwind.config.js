/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
        "!./node_modules/**/*"
    ],
    theme: {
        extend: {
            screens: {
                'xs': '400px',
            },
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
                mono: ['IBM Plex Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
