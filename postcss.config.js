// Explicit PostCSS config so Tailwind can run with autoprefixer; missing plugin caused build failure
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
