import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Fixed port: the app's data lives in this origin's localStorage, so a
  // drifting port would silently split your data across two "versions".
  server: { port: 5173, strictPort: true },
});
