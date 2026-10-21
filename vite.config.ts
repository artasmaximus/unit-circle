import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';

// One self-contained index.html (scripts, styles and fonts inlined), so the build can be published as an artifact.
export default defineConfig({
  plugins: [svelte(), viteSingleFile()],
  build: { assetsInlineLimit: 100_000_000 },
});
