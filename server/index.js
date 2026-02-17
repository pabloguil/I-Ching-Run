import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// --- Validate env vars at startup ---
const PORT_RAW = process.env.PORT;
const PORT = PORT_RAW ? parseInt(PORT_RAW) : 3001;
if (PORT_RAW && (isNaN(PORT) || PORT < 1 || PORT > 65535)) {
  console.error(`[ERROR] PORT="${PORT_RAW}" no es un número de puerto válido. Usando 3001.`);
}
if (!process.env.OPENAI_API_KEY) {
  console.warn('[WARN] OPENAI_API_KEY no configurada — /api/oraculo devolvera 503');
}
if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
  console.warn('[WARN] ALLOWED_ORIGINS no definida en producción — CORS solo permite localhost');
}

// Supabase config for server-side token verification (optional)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[WARN] SUPABASE_URL / SUPABASE_ANON_KEY no configuradas — DELETE /api/consultas requiere auth y devolverá 403');
}

// --- CORS ---
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin requests (no origin header) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));

// Limit payload size to 16 KB
app.use(express.json({ limit: '16kb' }));

// --- Simple in-memory rate limiter (no external deps) ---
const rateLimitStore = new Map();

// Prune expired entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore) {
    if (now > record.resetTime) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);

function createRateLimiter({ windowMs, max, message }) {
  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimitStore.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }
    record.count++;
    rateLimitStore.set(ip, record);

    if (record.count > max) {
      return res.status(429).json({ error: message || 'Demasiadas peticiones. Inténtalo más tarde.' });
    }
    next();
  };
}

const oraculoLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Has consultado el oráculo demasiadas veces. Espera unos minutos.',
});

const consultasWriteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Demasiadas consultas guardadas. Inténtalo más tarde.',
});

const deleteLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Operación no permitida. Inténtalo en un rato.',
});

// --- Input validators ---
function validateConsultaBody(body) {
  const { pregunta, lineas, hexOriginal, nombreOriginal, hexMutado, nombreMutado } = body;

  if (typeof pregunta !== 'string' || pregunta.length > 1000) {
    return 'pregunta debe ser texto de máximo 1000 caracteres';
  }
  if (!Array.isArray(lineas) || lineas.length !== 6) {
    return 'lineas debe ser un array de 6 elementos';
  }
  if (!lineas.every(v => [6, 7, 8, 9].includes(v))) {
    return 'lineas solo puede contener valores 6, 7, 8 o 9';
  }
  if (typeof hexOriginal !== 'number' || hexOriginal < 1 || hexOriginal > 64) {
    return 'hexOriginal debe ser un número entre 1 y 64';
  }
  if (typeof nombreOriginal !== 'string' || nombreOriginal.length > 200) {
    return 'nombreOriginal debe ser texto de máximo 200 caracteres';
  }
  if (hexMutado !== undefined && hexMutado !== null) {
    if (typeof hexMutado !== 'number' || hexMutado < 1 || hexMutado > 64) {
      return 'hexMutado debe ser un número entre 1 y 64';
    }
  }
  if (nombreMutado !== undefined && nombreMutado !== null) {
    if (typeof nombreMutado !== 'string' || nombreMutado.length > 200) {
      return 'nombreMutado debe ser texto de máximo 200 caracteres';
    }
  }
  return null;
}

function validateOraculoBody(body) {
  const { pregunta, hexagrama, nombreHexagrama, juicio, imagen } = body;

  if (pregunta !== undefined && (typeof pregunta !== 'string' || pregunta.length > 1000)) {
    return 'pregunta debe ser texto de máximo 1000 caracteres';
  }
  if (typeof hexagrama !== 'number' || hexagrama < 1 || hexagrama > 64) {
    return 'hexagrama debe ser un número entre 1 y 64';
  }
  if (typeof nombreHexagrama !== 'string' || nombreHexagrama.length > 200) {
    return 'nombreHexagrama inválido';
  }
  if (typeof juicio !== 'string' || juicio.length > 2000) {
    return 'juicio inválido';
  }
  if (typeof imagen !== 'string' || imagen.length > 2000) {
    return 'imagen inválido';
  }
  return null;
}

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

// --- Auth helpers ---

/**
 * Verifica un JWT de Supabase consultando su endpoint /auth/v1/user.
 * Devuelve el usuario si el token es válido, null en caso contrario.
 */
async function verifySupabaseToken(token) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Middleware que exige un Bearer token válido de Supabase.
 * Si Supabase no está configurado, devuelve 403.
 */
async function requireAuth(req, res, next) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(403).json({ error: 'Operación no permitida: autenticación no configurada en el servidor' });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }
  const token = authHeader.slice(7);
  const user = await verifySupabaseToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
  req.authUser = user;
  next();
}

// --- API Routes ---

// Health check — solo disponible fuera de producción
app.get('/api/health', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
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
    nodeEnv: process.env.NODE_ENV,
    distExists: existsSync(distPath),
    distFiles,
    assetsFiles,
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
app.post('/api/consultas', consultasWriteLimiter, async (req, res) => {
  const validationError = validateConsultaBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const db = await getDB();
    const { pregunta, lineas, hexOriginal, nombreOriginal, hexMutado, nombreMutado, tieneMutaciones } = req.body;
    const result = db.guardarConsulta({ pregunta, lineas, hexOriginal, nombreOriginal, hexMutado, nombreMutado, tieneMutaciones });
    res.json({ id: result.lastInsertRowid, success: true });
  } catch (err) {
    console.error('Error saving consulta:', err.message);
    res.status(500).json({ error: 'Error interno al guardar la consulta' });
  }
});

// Obtener historial
app.get('/api/consultas', async (req, res) => {
  try {
    const db = await getDB();
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const consultas = db.obtenerHistorial(limit);
    res.json(consultas);
  } catch (err) {
    console.error('Error getting historial:', err.message);
    res.status(500).json({ error: 'Error interno al obtener el historial' });
  }
});

// Limpiar historial — requiere autenticación
app.delete('/api/consultas', deleteLimiter, requireAuth, async (req, res) => {
  try {
    const db = await getDB();
    db.limpiarHistorial();
    res.json({ success: true });
  } catch (err) {
    console.error('Error clearing historial:', err.message);
    res.status(500).json({ error: 'Error interno al limpiar el historial' });
  }
});

// Oráculo IA — streaming con OpenAI
app.post('/api/oraculo', oraculoLimiter, async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'OPENAI_API_KEY no configurada en el servidor' });
  }

  const validationError = validateOraculoBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { lang, pregunta, hexagrama, nombreHexagrama, juicio, imagen, hexMutado, nombreMutado, lineasMutantes } = req.body;
  const isEn = lang === 'en';

  // Cabeceras SSE
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const mutacionInfo = lineasMutantes && lineasMutantes.length > 0
      ? (isEn
        ? `Lines ${lineasMutantes.map(i => i + 1).join(', ')} are changing, transforming the hexagram towards ${nombreMutado || 'a state of change'}.`
        : `Las líneas ${lineasMutantes.map(i => i + 1).join(', ')} están en mutación, transformando el hexagrama hacia ${nombreMutado || 'un estado de cambio'}.`)
      : (isEn
        ? 'The hexagram is stable, with no changing lines.'
        : 'El hexagrama es estable, sin líneas en mutación.');

    const preguntaLine = pregunta
      ? (isEn
        ? `The querent asks this question: "${pregunta}"\n\n`
        : `El consultante formula esta pregunta: "${pregunta}"\n\n`)
      : (isEn
        ? 'The querent makes a general consultation without a specific question.\n\n'
        : 'El consultante hace una consulta general sin pregunta específica.\n\n');

    const userPrompt = isEn
      ? `${preguntaLine}The I Ching has revealed Hexagram ${hexagrama}: ${nombreHexagrama}.

The Judgment: ${juicio}
The Image: ${imagen}
${mutacionInfo}

Offer a deep and personalized interpretation of this oracle in relation to the query. Illuminate the symbolic meaning of the hexagram and how its teachings apply to this concrete situation. Write in flowing prose, without lists or headings. Be concise yet substantial (between 180 and 280 words).`
      : `${preguntaLine}El I Ching ha revelado el Hexagrama ${hexagrama}: ${nombreHexagrama}.

El Juicio: ${juicio}
La Imagen: ${imagen}
${mutacionInfo}

Ofrece una interpretación profunda y personalizada de este oráculo en relación con la consulta planteada. Ilumina el significado simbólico del hexagrama y cómo sus enseñanzas se aplican a esta situación concreta. Escribe en prosa fluida, sin listas ni encabezados. Sé conciso pero sustancial (entre 180 y 280 palabras).`;

    const systemContent = isEn
      ? 'You are the Oracle of the I Ching. You respond with ancestral wisdom in English, combining the Taoist tradition with practical clarity. You never predict the future deterministically; instead, you illuminate the present moment and offer perspective on the path. Your tone is serene, profound, and compassionate. Always write in English, in continuous prose, without lists or headings.'
      : 'Eres el Oráculo del I Ching. Respondes con sabiduría ancestral en español, combinando la tradición taoísta con claridad práctica. Nunca predices el futuro de forma determinista; en cambio, iluminas el momento presente y ofreces perspectiva sobre el camino. Tu tono es sereno, profundo y compasivo. Escribe siempre en español, en prosa continua, sin listas ni encabezados.';

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        stream: true,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!openaiRes.ok) {
      res.write(`data: ${JSON.stringify({ error: `Error de OpenAI (${openaiRes.status})` })}\n\n`);
      res.end();
      return;
    }

    const reader = openaiRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        let parsed;
        try { parsed = JSON.parse(data); } catch { continue; }

        const text = parsed.choices?.[0]?.delta?.content || '';
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Oracle error:', err.message);
    try {
      res.write(`data: ${JSON.stringify({ error: 'Error al consultar el oráculo' })}\n\n`);
      res.end();
    } catch { /* respuesta ya cerrada */ }
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
  console.log(`OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
});
