import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { guardarConsulta, obtenerHistorial, limpiarHistorial } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// En produccion, manejar archivos estáticos con MIME types correctos
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '..', 'dist');

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

  // Servir otros archivos estáticos normalmente
  app.use(express.static(distPath));
}

// --- API Routes ---

// Debug endpoint para verificar que el servidor funciona
app.get('/api/health', (req, res) => {
  const distPath = join(__dirname, '..', 'dist');
  const distExists = existsSync(distPath);
  const indexExists = existsSync(join(distPath, 'index.html'));
  res.json({
    status: 'ok',
    nodeEnv: process.env.NODE_ENV,
    distExists,
    indexExists,
    distPath
  });
});

// Guardar una consulta
app.post('/api/consultas', (req, res) => {
  try {
    const { pregunta, lineas, hexOriginal, nombreOriginal, hexMutado, nombreMutado, tieneMutaciones } = req.body;
    if (!pregunta || !lineas || !hexOriginal || !nombreOriginal) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const result = guardarConsulta({ pregunta, lineas, hexOriginal, nombreOriginal, hexMutado, nombreMutado, tieneMutaciones });
    res.json({ id: result.lastInsertRowid, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener historial
app.get('/api/consultas', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const consultas = obtenerHistorial(limit);
    res.json(consultas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Limpiar historial
app.delete('/api/consultas', (req, res) => {
  try {
    limpiarHistorial();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback en produccion
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`I Ching server running on port ${PORT}`);
});
