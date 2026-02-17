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

// Oráculo IA — streaming con OpenAI
app.post('/api/oraculo', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'OPENAI_API_KEY no configurada en el servidor' });
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
      const errText = await openaiRes.text().catch(() => '');
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
