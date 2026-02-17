/**
 * Script de postinstall para Hostinger.
 *
 * Problemas que resuelve:
 * 1. Si `index.html` en la raíz es un directorio (de un deploy fallido),
 *    lo elimina antes de que Vite intente leerlo como archivo.
 * 2. Ya no sobreescribe el `index.html` fuente con el compilado,
 *    que era la causa de que Vite fallara en deploys sucesivos.
 * 3. Express ya sirve `dist/` con MIME types correctos, así que
 *    los `cp` a la raíz son innecesarios.
 */

const { execSync } = require('child_process');
const { statSync, rmSync, existsSync } = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// --- Limpiar index.html si es directorio ---
const indexPath = path.join(root, 'index.html');
if (existsSync(indexPath)) {
  const stat = statSync(indexPath);
  if (stat.isDirectory()) {
    console.log('[postinstall] WARN: index.html es un directorio. Eliminando...');
    rmSync(indexPath, { recursive: true, force: true });
  }
}

// --- Limpiar assets/ en la raíz si existe (artefacto de deploys anteriores) ---
const assetsRoot = path.join(root, 'assets');
if (existsSync(assetsRoot)) {
  console.log('[postinstall] Eliminando ./assets/ antiguo...');
  rmSync(assetsRoot, { recursive: true, force: true });
}

// --- Build ---
console.log('[postinstall] Iniciando vite build...');
try {
  execSync('npx vite build', { stdio: 'inherit', cwd: root });
  console.log('[postinstall] Build completado.');
} catch (err) {
  console.error('[postinstall] Build falló:', err.message);
  process.exit(0); // No bloquear npm install
}
