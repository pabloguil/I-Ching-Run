/**
 * Algoritmo de aleatoriedad para el I Ching.
 * Replica la lógica del script Python original:
 * - Combina microsegundos del reloj, hash de la pregunta y crypto aleatorio
 * - Aplica SHA-256 para mezclar la entropía
 * - Determina yin (2) o yang (3) según el primer dígito hex
 */

// Hash simple de la pregunta (suma de charCodes, igual que en Python)
export function hashPregunta(pregunta) {
  if (!pregunta) return 0;
  return [...pregunta].reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

// SHA-256 usando Web Crypto API
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Lanzar una moneda: retorna 2 (yin) o 3 (yang)
async function lanzarMoneda(questionHash) {
  // Microsegundos del sistema (equivalente a Python time.time() * 1_000_000)
  const microsegundo = Math.floor(performance.now() * 1000) % 1_000_000;

  // Valor criptográficamente aleatorio (equivalente a SystemRandom)
  const randomArray = new Uint32Array(1);
  crypto.getRandomValues(randomArray);
  const secureRandom = randomArray[0] % 1001; // 0-1000 como en Python

  // Combinar y aplicar SHA-256
  const s = `${microsegundo}${questionHash}${secureRandom}`;
  const hashVal = await sha256(s);

  // Primer dígito hexadecimal
  const firstDigit = parseInt(hashVal[0], 16);
  return (firstDigit & 1) === 0 ? 2 : 3;
}

// Generar una línea: 3 monedas, suma = 6, 7, 8 o 9
// 6 = yin mutante (---x---), 7 = yang (———), 8 = yin (--- ---), 9 = yang mutante (———o———)
export async function generarLinea(questionHash) {
  const monedas = await Promise.all([
    lanzarMoneda(questionHash),
    lanzarMoneda(questionHash),
    lanzarMoneda(questionHash),
  ]);
  const valor = monedas.reduce((a, b) => a + b, 0);
  const descripcion = monedas.map(m => m === 2 ? 'yin' : 'yang');
  return { valor, monedas: descripcion };
}

// Obtener el patrón binario de un hexagrama (6 líneas, de abajo hacia arriba)
export function getPatron(lineas) {
  return lineas.map(v => (v % 2 === 0 ? '0' : '1')).join('');
}

// Calcular el hexagrama mutado a partir de las líneas originales
export function calcularMutado(lineas) {
  return lineas.map(v => {
    if (v === 6) return 7;  // yin mutante → yang
    if (v === 9) return 8;  // yang mutante → yin
    return v;
  });
}

// Obtener indices de las lineas mutantes
export function getLineasMutantes(lineas) {
  return lineas
    .map((v, i) => (v === 6 || v === 9) ? i : -1)
    .filter(i => i !== -1);
}

// Verificar si hay mutaciones
export function hayMutaciones(lineas) {
  return lineas.some(v => v === 6 || v === 9);
}
