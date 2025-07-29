import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for a React/TypeScript project.  This configuration
// enables the React fast refresh plugin and leaves most options at their
// sensible defaults.  The user can extend or modify this file as
// necessary, for example to change the project base or add additional
// plugins.  See https://vitejs.dev/config/ for more details.

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});