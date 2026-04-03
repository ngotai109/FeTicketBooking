import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Giữ nguyên port 3000 giống CRA nếu bạn muốn
  },
  build: {
    outDir: 'dist', // Đã đổi sang 'dist' để khớp với mặc định của Vercel
  }
});
