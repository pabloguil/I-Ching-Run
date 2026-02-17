import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// En produccion, manejar archivos estáticos con MIME types correctos
const distPath = join(__dirname, '..', 'dist');

if (existsSync(distPath)) {
  // Servir archivos .js con MIME type correcto
  app.get('*.js', (req, res, next) => {
    const filePath = join(distPath, req.path);
    if (existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // Servir archivos .css con MIME type correcto
  app.get('*.css', (req, res, next) => {
    const filePath = join(distPath, req.path);
    if (existsSync(filePath)) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // Servir otros archivos estáticos
  app.use(express.static(distPath));
}

// --- API Routes ---

// Health check / debug endpoint
app.get('/api/health', (req, res) => {
  let distFiles = [];
  let assetsFiles = [];
  try {
    if (existsSync(distPath)) distFiles = readdirSync(distPath);
    const assetsPath = join(distPath, 'assets');
    if (existsSync(assetsPath)) assetsFiles = readdirSync(assetsPath);
  } catch (e) {
    // ignore
  }

  res.json({
    status: 'ok',
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
    distExists: existsSync(distPath),
    distFiles,
    assetsFiles,
    cwd: process.cwd(),
    distPath
  });
});

// Importar DB de forma lazy para no bloquear el arranque
let dbModule = null;
async function getDB() {
  if (!dbModule) {
    dbModule = await import('./db.js');
  }
  return dbModule;
}

// Guardar una consulta
app.post('/api/consultas', async (req, res) => {
  try {
    const db = await getDB();
    const { pregunta, lineas, hexOriginal, nombreOriginal, hexMutado, nombreMutado, tieneMutaciones } = req.body;
    if (!pregunta || !lineas || !hexOriginal || !nombreOriginal) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const result = db.guardarConsulta({ pregunta, lineas, hexOriginal, nombreOriginal, hexMutado, nombreMutado, tieneMutaciones });
    res.json({ id: result.lastInsertRowid, success: true });
  } catch (err) {
    console.error('Error saving consulta:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Obtener historial
app.get('/api/consultas', async (req, res) => {
  try {
    const db = await getDB();
    const limit = parseInt(req.query.limit) || 50;
    const consultas = db.obtenerHistorial(limit);
    res.json(consultas);
  } catch (err) {
    console.error('Error getting historial:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Limpiar historial
app.delete('/api/consultas', async (req, res) => {
  try {
    const db = await getDB();
    db.limpiarHistorial();
    res.json({ success: true });
  } catch (err) {
    console.error('Error clearing historial:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback - servir index.html para todas las rutas no-API
if (existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`I Ching server running on port ${PORT}`);
  console.log(`Node version: ${process.version}`);
  console.log(`Dist exists: ${existsSync(distPath)}`);
});
