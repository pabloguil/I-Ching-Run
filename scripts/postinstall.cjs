/**
 * Script de postinstall para Hostinger.
 *
 * Flujo en Hostinger:
 *   1. Git clona en .builds/source/repository/
 *   2. npm install → ejecuta este postinstall
 *   3. Hostinger copia archivos al directorio de deploy (public_html/)
 *      PERO dist/ está en .gitignore, así que NO se copia.
 *
 * Por eso necesitamos copiar dist/* a la raíz del repo:
 *   - dist/index.html   → ./index.html  (para que Apache/Express lo sirva)
 *   - dist/assets/       → ./assets/     (JS/CSS bundles)
 *
 * Problema: copiar dist/index.html sobreescribe la plantilla fuente que
 * Vite necesita para compilar. Solución: si detectamos que index.html ya
 * es la versión compilada (no tiene /src/main.jsx), lo restauramos desde
 * git antes de compilar.
 */

const { execSync } = require('child_process');
const { statSync, rmSync, existsSync, readFileSync, copyFileSync } = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const indexPath = path.join(root, 'index.html');

// --- 1. Limpiar index.html si es directorio (bug de deploys anteriores) ---
if (existsSync(indexPath)) {
  try {
    const stat = statSync(indexPath);
    if (stat.isDirectory()) {
      console.log('[postinstall] WARN: index.html es un directorio. Eliminando...');
      rmSync(indexPath, { recursive: true, force: true });
    }
  } catch (e) {
    // Si no se puede leer el stat, eliminar por si acaso
    console.log('[postinstall] WARN: index.html inaccesible. Eliminando...');
    try { rmSync(indexPath, { recursive: true, force: true }); } catch {}
  }
}

// --- 2. Restaurar index.html fuente si fue sobreescrito por un build anterior ---
if (existsSync(indexPath)) {
  const content = readFileSync(indexPath, 'utf-8');
  if (!content.includes('/src/main.jsx')) {
    console.log('[postinstall] index.html es la versión compilada. Restaurando fuente desde git...');
    try {
      execSync('git checkout -- index.html', { cwd: root, stdio: 'inherit' });
    } catch {
      console.error('[postinstall] ERROR: No se pudo restaurar index.html desde git.');
      process.exit(0);
    }
  }
} else {
  // index.html no existe (fue eliminado arriba), restaurar desde git
  console.log('[postinstall] index.html no existe. Restaurando desde git...');
  try {
    execSync('git checkout -- index.html', { cwd: root, stdio: 'inherit' });
  } catch {
    console.error('[postinstall] ERROR: No se pudo restaurar index.html desde git.');
    process.exit(0);
  }
}

// --- 3. Limpiar assets/ viejo en la raíz ---
const assetsRoot = path.join(root, 'assets');
if (existsSync(assetsRoot)) {
  console.log('[postinstall] Eliminando ./assets/ antiguo...');
  rmSync(assetsRoot, { recursive: true, force: true });
}

// --- 4. Build ---
console.log('[postinstall] Iniciando vite build...');
try {
  execSync('npx vite build', { stdio: 'inherit', cwd: root });
  console.log('[postinstall] Build completado.');
} catch (err) {
  console.error('[postinstall] Build falló:', err.message);
  process.exit(0); // No bloquear npm install
}

// --- 5. Copiar archivos compilados a la raíz para Hostinger ---
const distPath = path.join(root, 'dist');
if (existsSync(distPath)) {
  console.log('[postinstall] Copiando dist/* a la raíz...');
  try {
    // Copiar index.html compilado (Apache lo necesita en la raíz)
    copyFileSync(path.join(distPath, 'index.html'), indexPath);
    // Copiar assets (JS/CSS bundles)
    execSync(`cp -r "${path.join(distPath, 'assets')}" "${assetsRoot}"`, { cwd: root });
    console.log('[postinstall] Archivos copiados a la raíz.');
  } catch (err) {
    console.error('[postinstall] WARN: Error copiando a raíz:', err.message);
  }
}
