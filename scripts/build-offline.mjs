/**
 * build-offline.mjs
 *
 * Menggabungkan output dist/ Vite menjadi berkas HTML mandiri (single-file offline bundle).
 * Memungkinkan juri / pengguna membuka VeriFact ID 3.0 secara langsung
 * hanya dengan klik-ganda (double click) tanpa perlu instalasi Node.js atau server lokal.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('[build-offline] Folder dist/ tidak ditemukan. Jalankan "npm run build" terlebih dahulu.');
  process.exit(1);
}

const distHtmlPath = path.join(distDir, 'index.html');
if (!fs.existsSync(distHtmlPath)) {
  console.error('[build-offline] dist/index.html tidak ditemukan.');
  process.exit(1);
}

let html = fs.readFileSync(distHtmlPath, 'utf8');

// Temukan dan inline berkas CSS
const cssMatches = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/gi) || [];
for (const linkTag of cssMatches) {
  const hrefMatch = linkTag.match(/href="([^"]+)"/i);
  if (hrefMatch && hrefMatch[1]) {
    const cssRelPath = hrefMatch[1].replace(/^\//, '');
    const cssFullPath = path.join(distDir, cssRelPath);
    if (fs.existsSync(cssFullPath)) {
      const cssContent = fs.readFileSync(cssFullPath, 'utf8');
      html = html.replace(linkTag, `<style>\n${cssContent}\n</style>`);
      console.log(`[build-offline] Inlined CSS: ${cssRelPath}`);
    }
  }
}

// Temukan dan inline berkas JavaScript
const scriptMatches = html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/gi) || [];
for (const scriptTag of scriptMatches) {
  const srcMatch = scriptTag.match(/src="([^"]+)"/i);
  if (srcMatch && srcMatch[1]) {
    const jsRelPath = srcMatch[1].replace(/^\//, '');
    const jsFullPath = path.join(distDir, jsRelPath);
    if (fs.existsSync(jsFullPath)) {
      const jsContent = fs.readFileSync(jsFullPath, 'utf8');
      html = html.replace(scriptTag, `<script type="module">\n${jsContent}\n</script>`);
      console.log(`[build-offline] Inlined JS: ${jsRelPath}`);
    }
  }
}

// Tulis ke dist/standalone.html dan index.offline.html di root
const targetOfflineDist = path.join(distDir, 'standalone.html');
fs.writeFileSync(targetOfflineDist, html, 'utf8');
console.log(`[build-offline] Berhasil membuat bundle mandiri: ${targetOfflineDist}`);

const targetOfflineRoot = path.join(rootDir, 'index.offline.html');
fs.writeFileSync(targetOfflineRoot, html, 'utf8');
console.log(`[build-offline] Berhasil menyalin ke root: ${targetOfflineRoot}`);
