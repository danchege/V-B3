/// <reference types="vite/client" />

// CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// CSS
// Add this to resolve TypeScript errors for CSS imports
declare module '*.css' {
  const css: string;
  export default css;
}

// Images
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly VITE_API_URL: string;
  }
}

// For Vite's import.meta.env
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
