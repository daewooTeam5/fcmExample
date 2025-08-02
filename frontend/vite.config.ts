import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: env.VITE_FIREBASE_DATABASE_URL,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
  };

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_FIREBASE_CONFIG': JSON.stringify(JSON.stringify(firebaseConfig))
    },
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          'firebase-messaging-sw': 'src/firebase-messaging-sw.js',
        },
        output: {
          entryFileNames: assetInfo => {
            return assetInfo.name === 'firebase-messaging-sw'
              ? '[name].js' // Keep the original name for the service worker
              : 'assets/[name]-[hash].js' // Others can have hashes
          }
        }
      }
    }
  }
})
