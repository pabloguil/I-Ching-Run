import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '..', 'iching.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS consultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pregunta TEXT NOT NULL,
    lineas TEXT NOT NULL,
    hexagrama_original INTEGER NOT NULL,
    nombre_original TEXT NOT NULL,
    hexagrama_mutado INTEGER,
    nombre_mutado TEXT,
    tiene_mutaciones INTEGER DEFAULT 0,
    fecha TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

export function guardarConsulta({ pregunta, lineas, hexOriginal, nombreOriginal, hexMutado, nombreMutado, tieneMutaciones }) {
  const stmt = db.prepare(`
    INSERT INTO consultas (pregunta, lineas, hexagrama_original, nombre_original, hexagrama_mutado, nombre_mutado, tiene_mutaciones)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    pregunta,
    JSON.stringify(lineas),
    hexOriginal,
    nombreOriginal,
    hexMutado || null,
    nombreMutado || null,
    tieneMutaciones ? 1 : 0
  );
}

export function obtenerHistorial(limit = 50) {
  const stmt = db.prepare(`
    SELECT * FROM consultas ORDER BY id DESC LIMIT ?
  `);
  return stmt.all(limit);
}

export function limpiarHistorial() {
  db.exec('DELETE FROM consultas');
}

export default db;
