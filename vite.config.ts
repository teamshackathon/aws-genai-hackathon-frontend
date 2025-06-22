import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths';
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label'
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }), tsconfigPaths()],
  server: {
    watch: {
      usePolling: true, // ← 変更検知に polling を使う（Dockerでは必須）
    },
  }
})
