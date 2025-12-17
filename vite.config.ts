import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Declare process for TS check
declare const process: any;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // JSON.stringify(undefined) returns undefined, which causes Vite to skip replacement.
      // We default to "" to ensure the code becomes 'process.env.API_KEY': "" instead of leaving the variable.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});