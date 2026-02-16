import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'iching.db');

// Inicializar la base de datos
const SQL = await initSqlJs();
let db;

// Cargar o crear la base de datos
if (existsSync(dbPath)) {
  const buffer = readFileSync(dbPath);
  db = new SQL.Database(buffer);
} else {
  db = new SQL.Database();
}

// Crear tabla si no existe
db.run(`
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

// Función para persistir cambios
function saveDatabase() {
  const data = db.export();
  writeFileSync(dbPath, data);
}

export function guardarConsulta({ pregunta, lineas, hexOriginal, nombreOriginal, hexMutado, nombreMutado, tieneMutaciones }) {
  db.run(
    `INSERT INTO consultas (pregunta, lineas, hexagrama_original, nombre_original, hexagrama_mutado, nombre_mutado, tiene_mutaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      pregunta,
      JSON.stringify(lineas),
      hexOriginal,
      nombreOriginal,
      hexMutado || null,
      nombreMutado || null,
      tieneMutaciones ? 1 : 0
    ]
  );
  saveDatabase();
  return { lastInsertRowid: db.exec('SELECT last_insert_rowid() as id')[0].values[0][0] };
}

export function obtenerHistorial(limit = 50) {
  const result = db.exec('SELECT * FROM consultas ORDER BY id DESC LIMIT ?', [limit]);
  if (result.length === 0) return [];

  const columns = result[0].columns;
  const values = result[0].values;

  return values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

export function limpiarHistorial() {
  db.run('DELETE FROM consultas');
  saveDatabase();
}

export default db;
