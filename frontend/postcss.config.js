export default {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    // Only minify in production
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  }
}
