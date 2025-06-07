import { defineConfig, loadEnv, type ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig((configEnv: ConfigEnv) => {
  const env = loadEnv(configEnv.mode, process.cwd(), 'VITE')
  // Get list of allowed hosts separated by a comma from .env.local
  const allowedHostEnv  = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(',').map(h => h.trim())
    : [];

  return {
    plugins: [react()],
    optimizeDeps: {
      include: ["@mediapipe/camera_utils"]
    },
    server:
    {
      host: '0.0.0.0',
      allowedHosts: allowedHostEnv,
    }
  }
})