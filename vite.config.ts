import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // ✅ NOVO: Permitir acesso via ngrok
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "6f6f33601a24.ngrok-free.app", // Host atual do ngrok
      ".ngrok-free.app", // Todos os subdomínios ngrok
      ".ngrok.io", // Domínios ngrok alternativos
    ],
    // ✅ NOVO: Configurações para desenvolvimento externo
    hmr: {
      clientPort: 8080,
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
