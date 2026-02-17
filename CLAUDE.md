# CLAUDE.md — I Ching Web App

Guía de referencia rápida para sesiones de Claude Code.

## Propósito de la aplicación

Oracle web del I Ching que replica el método tradicional de las tres monedas. El usuario formula una pregunta, lanza monedas 6 veces (una por línea del hexagrama), y recibe una interpretación del hexagrama resultante. Existe opción de "Voz del Oráculo" powered by OpenAI GPT-4o-mini que ofrece interpretación personalizada.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 5 |
| Backend | Express 4 + Node 18+ |
| BD | sql.js (SQLite en memoria/archivo) |
| IA | OpenAI GPT-4o-mini (streaming SSE) |
| Deploy | Hostinger (Node.js app) |

## Estructura de archivos clave

```
src/
├── App.jsx                 # Componente raíz — orquesta todo el flujo
├── components/
│   ├── QuestionForm.jsx    # Formulario de pregunta inicial
│   ├── CoinToss.jsx        # Animación y botón de lanzar monedas
│   ├── HexagramDisplay.jsx # Visualización SVG del hexagrama
│   ├── Interpretation.jsx  # Juicio, Imagen, Significado del hexagrama
│   ├── AiOracle.jsx        # Botón + streaming de respuesta IA
│   └── History.jsx         # Historial de consultas (footer)
├── data/
│   ├── hexagrams.js        # 64 hexagramas en español (juicio, imagen, etc.)
│   └── hexagrams-en.js     # Traducciones en inglés
├── i18n/
│   ├── index.jsx           # I18nProvider + hook useI18n
│   ├── es.js               # Strings en español
│   └── en.js               # Strings en inglés
├── utils/
│   └── randomness.js       # Algoritmo SHA-256 + Web Crypto para monedas
└── styles/
    └── index.css           # CSS custom con variables (dark/light theme)

server/
├── index.js                # Express: /api/consultas, /api/oraculo, static
└── db.js                   # sql.js wrapper: guardarConsulta, obtenerHistorial
```

## Flujo de la aplicación

```
1. fase='pregunta'   → QuestionForm (texto libre o consulta general)
2. fase='lanzando'   → CoinToss × 6 clicks → generarLinea() × 6
3. fase='resultado'  → HexagramDisplay + Interpretation + AiOracle
                      → POST /api/consultas (guarda en SQLite)
```

## Algoritmo de aleatoriedad (`src/utils/randomness.js`)

Cada moneda combina tres fuentes de entropía:
1. `performance.now() * 1000` (microsegundos del sistema)
2. `crypto.getRandomValues()` (CSPRNG del navegador)
3. Hash SHA-256 de la pregunta

Suma de 3 monedas → valor de línea:
- **6** = Yin mutante (`---x---`)
- **7** = Yang estable (`———`)
- **8** = Yin estable (`--- ---`)
- **9** = Yang mutante (`———o———`)

## API endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/consultas` | Guarda una consulta en SQLite |
| `GET` | `/api/consultas?limit=N` | Obtiene historial (default 50) |
| `DELETE` | `/api/consultas` | Limpia todo el historial |
| `POST` | `/api/oraculo` | Streaming SSE con GPT-4o-mini |
| `GET` | `/api/health` | Debug: info de entorno |

## Variables de entorno

```env
OPENAI_API_KEY=sk-...   # Requerida solo para /api/oraculo
PORT=3001               # Opcional, default 3001
NODE_ENV=production     # Para build de producción
```

## Comandos de desarrollo

```bash
npm run dev       # Frontend (Vite :5173) + Backend (Express :3001) en paralelo
npm run dev:client # Solo Vite
npm run dev:server # Solo Express
npm run build     # Compila React → dist/
npm start         # Producción: Express sirve dist/
```

## Internacionalización

- Idioma detectado de `navigator.language` al primer uso, luego persiste en `localStorage`
- Toggle ES/EN en el header
- Los hexagramas tienen datos en español (`hexagrams.js`) y en inglés (`hexagrams-en.js`)
- La IA siempre responde en el idioma activo del usuario

## Temas

- `dark` (default): fondo `#0a0a0f`, acento gold `#d4a843`
- `light`: fondo `#f5f0e6`, acento gold `#8b6508`
- Persiste en `localStorage('iching-tema')`
- Controlado via atributo `data-theme` en `<html>`

## Persistencia y limitaciones

- El historial usa **sql.js** (SQLite en memoria), guardado en `iching.db` en el servidor
- Si el servidor no está activo, el historial muestra error (no hay fallback local)
- El frontend ignora errores del POST a `/api/consultas` — la consulta procede igual

## Mapping de hexagramas

`KING_WEN_MAPPING` en `hexagrams.js` mapea el patrón binario de 6 líneas (ej. `"101010"`) al número del hexagrama según la secuencia King Wen (1-64).

## Notas de despliegue (Hostinger)

- `postinstall` usa `scripts/postinstall.cjs` que:
  1. Limpia `index.html` si se convirtió en directorio (bug de deploys anteriores)
  2. Limpia `./assets/` obsoleto en la raíz
  3. Ejecuta `vite build` — Express sirve `dist/` directamente
- El servidor Node.js sirve archivos estáticos con MIME types explícitos (problema histórico con `.js` y `.css`)
- **No se copian** archivos de `dist/` a la raíz — Express maneja todo desde `dist/`
- **sql.js** se usa en lugar de **better-sqlite3** por compatibilidad con hosting compartido (no se pueden compilar módulos nativos)
- **BUG HISTÓRICO**: el `postinstall` anterior hacía `cp dist/index.html ./index.html` que sobreescribía la plantilla fuente con el HTML compilado, rompiendo deploys sucesivos
