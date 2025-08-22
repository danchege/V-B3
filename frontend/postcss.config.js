// @ts-check

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    // Only minify in production
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  }
};

export default config;
