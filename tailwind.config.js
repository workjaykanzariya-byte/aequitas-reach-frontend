// Tailwind couldn't generate classes before because it wasn't scanning all source files
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
