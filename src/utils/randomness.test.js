/**
 * Tests para src/utils/randomness.js
 * Usa el test runner nativo de Node.js (node:test), disponible desde Node 18.
 * Ejecutar con: node --test src/utils/randomness.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPregunta,
  generarLinea,
  getPatron,
  calcularMutado,
  getLineasMutantes,
  hayMutaciones,
} from './randomness.js';

// ---------------------------------------------------------------------------
// hashPregunta
// ---------------------------------------------------------------------------

describe('hashPregunta', () => {
  test('devuelve 0 para cadena vacía', () => {
    assert.equal(hashPregunta(''), 0);
  });

  test('devuelve 0 para undefined/null', () => {
    assert.equal(hashPregunta(undefined), 0);
    assert.equal(hashPregunta(null), 0);
  });

  test('devuelve la suma correcta de charCodes', () => {
    // 'A' = 65, 'B' = 66
    assert.equal(hashPregunta('AB'), 131);
  });

  test('es determinista — misma entrada, misma salida', () => {
    const pregunta = '¿Cuál es mi camino?';
    assert.equal(hashPregunta(pregunta), hashPregunta(pregunta));
  });

  test('valores distintos producen hashes distintos (sin colisiones triviales)', () => {
    assert.notEqual(hashPregunta('hola'), hashPregunta('mundo'));
  });
});

// ---------------------------------------------------------------------------
// generarLinea
// ---------------------------------------------------------------------------

describe('generarLinea', () => {
  const valoresValidos = new Set([6, 7, 8, 9]);

  test('devuelve un valor en {6, 7, 8, 9}', async () => {
    const resultado = await generarLinea(0);
    assert.ok(valoresValidos.has(resultado.valor), `valor inesperado: ${resultado.valor}`);
  });

  test('devuelve un array de 3 monedas (yin/yang)', async () => {
    const resultado = await generarLinea(0);
    assert.equal(resultado.monedas.length, 3);
    assert.ok(resultado.monedas.every(m => m === 'yin' || m === 'yang'),
      `monedas inesperadas: ${resultado.monedas}`);
  });

  test('la suma de monedas coincide con el valor', async () => {
    const resultado = await generarLinea(42);
    const suma = resultado.monedas.reduce((acc, m) => acc + (m === 'yin' ? 2 : 3), 0);
    assert.equal(suma, resultado.valor);
  });

  test('100 tiradas producen solo valores válidos', async () => {
    for (let i = 0; i < 100; i++) {
      const { valor } = await generarLinea(i * 7);
      assert.ok(valoresValidos.has(valor), `valor inválido en tirada ${i}: ${valor}`);
    }
  });

  test('hay variabilidad — no todas las tiradas son iguales', async () => {
    const valores = new Set();
    for (let i = 0; i < 50; i++) {
      const { valor } = await generarLinea(i);
      valores.add(valor);
    }
    // Con 50 tiradas esperamos ver al menos 2 valores diferentes
    assert.ok(valores.size >= 2, `sin variabilidad: solo se obtuvo ${[...valores]}`);
  });
});

// ---------------------------------------------------------------------------
// getPatron
// ---------------------------------------------------------------------------

describe('getPatron', () => {
  test('yin (6, 8) → 0, yang (7, 9) → 1', () => {
    assert.equal(getPatron([6, 7, 8, 9, 6, 7]), '010101');
  });

  test('seis yin estables → 000000', () => {
    assert.equal(getPatron([8, 8, 8, 8, 8, 8]), '000000');
  });

  test('seis yang estables → 111111', () => {
    assert.equal(getPatron([7, 7, 7, 7, 7, 7]), '111111');
  });

  test('yin mutante (6) cuenta como yin (0)', () => {
    assert.equal(getPatron([6, 6, 6, 6, 6, 6]), '000000');
  });

  test('yang mutante (9) cuenta como yang (1)', () => {
    assert.equal(getPatron([9, 9, 9, 9, 9, 9]), '111111');
  });

  test('devuelve cadena de longitud 6', () => {
    assert.equal(getPatron([7, 8, 7, 8, 7, 8]).length, 6);
  });
});

// ---------------------------------------------------------------------------
// calcularMutado
// ---------------------------------------------------------------------------

describe('calcularMutado', () => {
  test('6 (yin mutante) → 7 (yang estable)', () => {
    const resultado = calcularMutado([6, 7, 8, 9, 6, 9]);
    assert.deepEqual(resultado, [7, 7, 8, 8, 7, 8]);
  });

  test('9 (yang mutante) → 8 (yin estable)', () => {
    assert.deepEqual(calcularMutado([9, 9, 9, 9, 9, 9]), [8, 8, 8, 8, 8, 8]);
  });

  test('7 y 8 (estables) no cambian', () => {
    assert.deepEqual(calcularMutado([7, 8, 7, 8, 7, 8]), [7, 8, 7, 8, 7, 8]);
  });

  test('no modifica el array original', () => {
    const original = [6, 9, 7, 8, 6, 9];
    const copia = [...original];
    calcularMutado(original);
    assert.deepEqual(original, copia);
  });
});

// ---------------------------------------------------------------------------
// getLineasMutantes
// ---------------------------------------------------------------------------

describe('getLineasMutantes', () => {
  test('devuelve índices de líneas con valor 6 o 9', () => {
    assert.deepEqual(getLineasMutantes([6, 7, 9, 8, 6, 7]), [0, 2, 4]);
  });

  test('sin mutaciones → array vacío', () => {
    assert.deepEqual(getLineasMutantes([7, 8, 7, 8, 7, 8]), []);
  });

  test('todos mutantes → todos los índices', () => {
    assert.deepEqual(getLineasMutantes([6, 9, 6, 9, 6, 9]), [0, 1, 2, 3, 4, 5]);
  });

  test('solo el último es mutante', () => {
    assert.deepEqual(getLineasMutantes([7, 8, 7, 8, 7, 6]), [5]);
  });
});

// ---------------------------------------------------------------------------
// hayMutaciones
// ---------------------------------------------------------------------------

describe('hayMutaciones', () => {
  test('true si hay al menos un 6 o 9', () => {
    assert.equal(hayMutaciones([7, 8, 6, 8, 7, 8]), true);
    assert.equal(hayMutaciones([7, 8, 7, 8, 9, 8]), true);
  });

  test('false si no hay mutaciones', () => {
    assert.equal(hayMutaciones([7, 8, 7, 8, 7, 8]), false);
  });

  test('false para hexagrama completamente yang estable', () => {
    assert.equal(hayMutaciones([7, 7, 7, 7, 7, 7]), false);
  });

  test('false para hexagrama completamente yin estable', () => {
    assert.equal(hayMutaciones([8, 8, 8, 8, 8, 8]), false);
  });

  test('true para hexagrama completamente mutante', () => {
    assert.equal(hayMutaciones([6, 9, 6, 9, 6, 9]), true);
  });
});
