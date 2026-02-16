# I Ching - El Libro de las Mutaciones

Aplicacion web para consultar el I Ching de forma interactiva y visual, generando hexagramas mediante el metodo tradicional de las tres monedas.

## Caracteristicas

- **Interfaz Zen/Oriental minimalista** con animaciones suaves y estetica de caligrafia china
- **Lanzamiento ritual**: 6 clicks, uno por cada linea del hexagrama
- **Aleatoriedad robusta**: SHA-256 + Web Crypto API + microsegundos del sistema
- **Interpretaciones tradicionales** para los 64 hexagramas (juicio, imagen, significado)
- **Hexagramas mutados**: visualizacion de lineas mutantes y hexagrama resultante
- **Historial persistente** con SQLite
- **Responsive**: funciona en movil y escritorio

## Stack

- **Frontend**: React 18 + Vite
- **Backend**: Express + Node.js
- **Base de datos**: SQLite (better-sqlite3)

## Instalacion

```bash
git clone https://github.com/pabloguil/I-Ching-Run.git
cd I-Ching-Run
npm install
```

## Uso

### Desarrollo (frontend + backend en paralelo)

```bash
npm run dev
```

Esto inicia:
- Frontend Vite en `http://localhost:5173`
- Backend Express en `http://localhost:3001`

### Produccion

```bash
npm run build
npm start
```

El servidor sirve la app compilada en `http://localhost:3001`.

## Como funciona

1. Escribe tu pregunta al oraculo
2. Haz click en "Lanzar Monedas" 6 veces (una por cada linea)
3. Cada lanzamiento simula 3 monedas usando:
   - Microsegundos del reloj del sistema
   - Hash SHA-256 de la pregunta
   - Valores criptograficamente aleatorios (Web Crypto API)
4. La suma de las 3 monedas determina el tipo de linea:
   - **6**: Yin mutante (viejo yin)
   - **7**: Yang estable (joven yang)
   - **8**: Yin estable (joven yin)
   - **9**: Yang mutante (viejo yang)
5. Se muestra el hexagrama original y, si hay mutaciones, el hexagrama mutado
6. Se presentan las interpretaciones tradicionales del I Ching

## Version Python (original)

La version de escritorio original en Python/tkinter sigue disponible:

```bash
pip install Pillow
python iching_4.py
```

## Licencia

MIT
