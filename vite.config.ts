import { execSync } from 'node:child_process';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function getGitCommitSha(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}

const commitSha = getGitCommitSha();
const buildTimestamp = Date.now();
const builtAt = new Date(buildTimestamp).toISOString();
const buildId = `${commitSha}-${buildTimestamp}`;

function versionManifestPlugin(): Plugin {
  const versionPayload = JSON.stringify(
    {
      buildId,
      builtAt,
      commit: commitSha,
    },
    null,
    2
  );

  return {
    name: 'terroir-version-manifest',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: versionPayload,
      });
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/version.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.end(versionPayload);
          return;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
    __APP_BUILT_AT__: JSON.stringify(builtAt),
    __APP_COMMIT_SHA__: JSON.stringify(commitSha),
  },
  server: { proxy: { '/api': 'http://localhost:4242' } },
  plugins: [
    react(),
    tailwindcss(),
    versionManifestPlugin(),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) {
              return 'vendor-leaflet';
            }
            if (id.includes('firebase') || id.includes('@firebase') || id.includes('@capacitor-firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
          }
        },
      },
    },
  },
});
