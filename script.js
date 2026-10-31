'use strict';

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;       
const nz = (a, b) => { let v = 0; while (v === 0) v = rnd(a, b); return v; }; 
const pick = (arr) => arr[rnd(0, arr.length - 1)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
const mcm = (a, b) => (a / gcd(a, b)) * b;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const num = (n) => (n < 0 ? '−' + Math.abs(n) : String(n));              // número con signo menos "−"
const ELOGIOS = ['¡Muy bien!', '¡Correcto!', '¡Excelente!', '¡Eso es!', '¡Bien hecho!'];
 
const Almacen = {
  clave: 'matematicas-paso-a-paso-v1',
  inicial() {
    return {
      algebra: { ok: 0, total: 0 },
      fracciones: { ok: 0, total: 0 },
      evaluacion: 0,      
      contrarreloj: 0,    
      memoria: 0,         
      semejantes: 0,   
      tema: 'oceano'
    };
  },
  datos: null,
  cargar() {
    this.datos = this.inicial();
    try {
      const txt = localStorage.getItem(this.clave);
      if (txt) this.datos = { ...this.datos, ...JSON.parse(txt) };
    } catch (e) {}
  },
  guardar() {
    try { localStorage.setItem(this.clave, JSON.stringify(this.datos)); } catch (e) {}
  },
  reiniciar() {
    const tema = this.datos.tema;
    this.datos = this.inicial();
    this.datos.tema = tema;
    this.guardar();
  }
};
 
const F = (n, d = 1) => (d < 0 ? { n: -n, d: -d } : { n, d });
const simp = (f) => { const g = gcd(f.n, f.d) || 1; return F(f.n / g, f.d / g); };
const sumaF = (a, b) => simp(F(a.n * b.d + b.n * a.d, a.d * b.d));
const restaF = (a, b) => simp(F(a.n * b.d - b.n * a.d, a.d * b.d));
const multF = (a, b) => simp(F(a.n * b.n, a.d * b.d));
const divF = (a, b) => simp(F(a.n * b.d, a.d * b.n));
const igualF = (a, b) => a.n * b.d === b.n * a.d;
const esSimplificada = (f) => gcd(f.n, f.d) === 1;
 
const fracHTML = (n, d) => `<span class="frac"><span class="frac__n">${n}</span><span class="frac__d">${d}</span></span>`;
const fHTML = (f) => (f.d === 1 ? String(f.n) : fracHTML(f.n, f.d));
const textoFrac = (s) => s.replace(/(\d+)\/(\d+)/g, (m, a, b) => fracHTML(a, b));
const mixtoHTML = (f) => {
  const w = Math.floor(f.n / f.d), r = f.n % f.d;
  return r === 0 ? String(w) : `${w} ${fracHTML(r, f.d)}`;
};
 
function leerFraccion(txt) {
  const s = txt.trim().replace(/[−–]/g, '-').replace(/\s+/g, ' ');
  let m;
  if ((m = s.match(/^(-?\d+)\s*\/\s*(\d+)$/))) {
    const d = Number(m[2]);
    return d === 0 ? null : F(Number(m[1]), d);
  }
  if ((m = s.match(/^(-?)(\d+) (\d+)\s*\/\s*(\d+)$/))) {
    const d = Number(m[4]);
    if (d === 0) return null;
    const signo = m[1] ? -1 : 1;
    return F(signo * (Number(m[2]) * d + Number(m[3])), d);
  }
  if (/^-?\d+$/.test(s)) return F(Number(s), 1);
  return null;
}
function leerEntero(txt) {
  const s = txt.replace(/\s/g, '').replace(/[−–]/g, '-');
  return /^-?\d+$/.test(s) ? Number(s) : null;
}
 
function termsStr(ts) {
  ts = ts.filter(([c]) => c !== 0);
  if (!ts.length) return '0';
  return ts.map(([c, v], i) => {
    const abs = Math.abs(c);
    const cuerpo = v === '' ? String(abs) : (abs === 1 ? v : abs + v);
    if (i === 0) return (c < 0 ? '−' : '') + cuerpo;
    return (c < 0 ? ' − ' : ' + ') + cuerpo;
  }).join('');
}
function polyStr(m) {
  const vars = Object.keys(m).filter((k) => k && m[k] !== 0).sort();
  const ts = vars.map((v) => [m[v], v]);
  if (m['']) ts.push([m[''], '']);
  return termsStr(ts);
}
function totales(ts) {
  const m = {};
  ts.forEach(([c, v]) => { m[v] = (m[v] || 0) + c; });
  return m;
}
function igualLineal(a, b) {
  const claves = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of claves) if ((a[k] || 0) !== (b[k] || 0)) return false;
  return true;
}
function leerLineal(txt) {
  const s = txt.toLowerCase().replace(/[\s·*]/g, '').replace(/[−–—]/g, '-');
  if (!s) return null;
  const T = '(?:\\d+[a-z]?|[a-z])';
  if (!new RegExp(`^[+-]?${T}(?:[+-]${T})*$`).test(s)) return null;
  const m = {};
  for (const t of s.match(new RegExp(`[+-]?${T}`, 'g'))) {
    const signo = t[0] === '-' ? -1 : 1;
    const mm = t.replace(/^[+-]/, '').match(/^(\d*)([a-z]?)$/);
    const coef = mm[1] === '' ? 1 : parseInt(mm[1], 10);
    m[mm[2]] = (m[mm[2]] || 0) + signo * coef;
  }
  return m;
}
const sumaStr = (arr) => arr.map((v, i) => (i === 0 ? num(v) : (v < 0 ? ` − ${Math.abs(v)}` : ` + ${v}`))).join('');
function sustStr(ts, vals) {
  return ts.map(([c, v], i) => {
    const abs = Math.abs(c);
    let cuerpo;
    if (v === '') cuerpo = String(abs);
    else {
      const val = vals[v];
      const vs = val < 0 ? `(${num(val)})` : String(val);
      cuerpo = abs === 1 ? vs : `${abs}·${vs}`;
    }
    if (i === 0) return (c < 0 ? '−' : '') + cuerpo;
    return (c < 0 ? ' − ' : ' + ') + cuerpo;
  }).join('');
}
 
function armarMCQ(correcta, distractores) {
  const vistos = new Set([correcta]);
  const ds = [];
  for (const d of distractores) {
    if (!vistos.has(d)) { vistos.add(d); ds.push(d); }
    if (ds.length === 3) break;
  }
  const todas = shuffle([correcta, ...ds]);
  return { opciones: todas, correcta: todas.indexOf(correcta) };
}
 
function genValor(n) {
  let ts, vals;
  if (n === 1) {
    ts = [[rnd(2, 5), 'x'], [rnd(1, 9), '']];
    vals = { x: rnd(1, 5) };
  } else if (n === 2) {
    ts = [[rnd(2, 9), 'x'], [pick([1, -1]) * rnd(1, 9), '']];
    vals = { x: rnd(2, 9) };
  } else {
    ts = [[rnd(2, 6), 'x'], [pick([1, -1]) * rnd(2, 6), 'y'], [pick([1, -1]) * rnd(1, 9), '']];
    vals = { x: nz(-4, 6), y: nz(-4, 5) };
  }
  const productos = ts.map(([c, v]) => (v === '' ? c : c * vals[v]));
  const total = productos.reduce((s, v) => s + v, 0);
  const valoresTxt = Object.keys(vals).map((v) => `${v} = ${num(vals[v])}`).join(' y ');
  return {
    tema: 'algebra', tipo: 'num', formato: 'un número, por ejemplo: 11',
    enunciado: `Si ${valoresTxt}, ¿cuál es el valor de <span class="expr">${termsStr(ts)}</span>?`,
    correcta: total, respuestaHTML: num(total),
    pasos: [
      `Reemplaza cada letra por su valor: <span class="expr">${sustStr(ts, vals)}</span>`,
      `Resuelve las multiplicaciones: <span class="expr">${sumaStr(productos)}</span>`,
      `Suma y resta los resultados: <b>${num(total)}</b>.`
    ],
    pista: 'Cambia cada letra por su número (usa paréntesis si es negativo) y haz primero las multiplicaciones.'
  };
}
 
function genReducir(n) {
  let ts;
  if (n === 1) {
    ts = [[rnd(1, 9), 'x'], [rnd(1, 9), 'x']];
  } else if (n === 2) {
    const v = pick([['x', 'y'], ['a', 'b'], ['m', 'n']]);
    ts = shuffle([[rnd(1, 8), v[0]], [rnd(1, 8), v[1]], [rnd(1, 8), v[0]], [rnd(1, 8), v[1]]]);
  } else {
    const v = pick([['x', 'y'], ['a', 'b'], ['p', 'q']]);
    let tot;
    do {
      ts = [[nz(-7, 8), v[0]], [nz(-7, 8), v[1]], [nz(-7, 8), v[0]], [nz(-7, 8), v[1]], [nz(-9, 9), ''], [nz(-9, 9), '']];
      tot = totales(ts);
    } while (tot[v[0]] === 0 || tot[v[1]] === 0 || tot[''] === 0);
    ts = shuffle(ts);
  }
  const tot = totales(ts);
  const vars = [...new Set(ts.filter((t) => t[1]).map((t) => t[1]))].sort();
  const consts = ts.filter((t) => t[1] === '');
  const grupos = vars.map((v) => `con <b>${v}</b>: ${termsStr(ts.filter((t) => t[1] === v))}`);
  if (consts.length) grupos.push(`números sin letra: ${termsStr(consts)}`);
  const sumas = vars.map((v) => `${v}: ${sumaStr(ts.filter((t) => t[1] === v).map((t) => t[0]))} = ${num(tot[v])}`);
  if (consts.length) sumas.push(`números: ${sumaStr(consts.map((t) => t[0]))} = ${num(tot[''])}`);
  return {
    tema: 'algebra', tipo: 'poly', formato: 'por ejemplo: 5x + 3y',
    enunciado: `Reduce los términos semejantes: <span class="expr">${termsStr(ts)}</span>`,
    correcta: tot, respuestaHTML: `<span class="expr">${polyStr(tot)}</span>`,
    pasos: [
      `Agrupa los términos semejantes (los que tienen la misma parte literal) — ${grupos.join('; ')}.`,
      `Suma los coeficientes de cada grupo — ${sumas.join('; ')}.`,
      `Escribe el resultado: <b>${polyStr(tot)}</b>.`
    ],
    pista: 'Solo se pueden sumar los términos que tienen exactamente las mismas letras.'
  };
}
 
function genPartes(n, sub) {
  const tipos = n === 1 ? ['coef', 'lit'] : n === 2 ? ['coef', 'lit', 'cuenta'] : ['coef', 'lit', 'cuenta', 'semejante'];
  const t = sub || pick(tipos);
  const lits = ['x', 'y', 'a', 'b', 'm', 'n', 'xy', 'ab', 'pq'];
  const base = { tema: 'algebra', tipo: 'mcq' };
 
  if (t === 'coef') {
    const l = pick(lits);
    const c = pick([nz(-12, 12), nz(-12, 12), 1, -1]);
    const termino = termsStr([[c, l]]);
    const corr = num(c);
    const m = armarMCQ(corr, [num(-c), (c === 1 || c === -1) ? '0' : num(c + 1), l]);
    return { ...base, ...m,
      enunciado: `¿Cuál es el <b>coeficiente</b> del término <span class="expr">${termino}</span>?`,
      respuestaHTML: corr,
      pasos: [
        'Un término tiene dos partes: el coeficiente (el número) y la parte literal (las letras).',
        `En <b>${termino}</b> el coeficiente es <b>${corr}</b>.` + ((c === 1 || c === -1) ? ' Cuando solo aparece la letra, el coeficiente es 1 (o −1 si lleva el signo menos).' : '')
      ],
      pista: 'El coeficiente es el número que multiplica a las letras. Si no se ve ningún número, vale 1.' };
  }
  if (t === 'lit') {
    const l = pick(lits);
    const c = nz(-12, 12);
    const termino = termsStr([[c, l]]);
    const m = armarMCQ(l, [num(c), `${Math.abs(c)}${l}`, l.length > 1 ? l[0] : `${l}²`]);
    return { ...base, ...m,
      enunciado: `¿Cuál es la <b>parte literal</b> del término <span class="expr">${termino}</span>?`,
      respuestaHTML: l,
      pasos: [
        'La parte literal son las letras del término, sin el número ni el signo.',
        `En <b>${termino}</b> la parte literal es <b>${l}</b>.`
      ],
      pista: 'La parte literal son solo las letras.' };
  }
  if (t === 'cuenta') {
    const k = rnd(2, 4);
    const conConst = k > 2 && Math.random() < 0.5;
    const letras = shuffle(['x', 'y', 'a', 'b', 'm', 'n']).slice(0, conConst ? k - 1 : k);
    let ts = letras.map((l) => [nz(-9, 9), l]);
    if (conConst) ts.push([nz(-9, 9), '']);
    ts = shuffle(ts);
    const lista = ts.map((x) => termsStr([x])).join(', ');
    const m = armarMCQ(String(k), [k - 1, k + 1, k + 2, k - 2, 1].filter((v) => v > 0 && v !== k).map(String));
    return { ...base, ...m,
      enunciado: `¿Cuántos términos tiene la expresión <span class="expr">${termsStr(ts)}</span>?`,
      respuestaHTML: String(k),
      pasos: [
        'Los términos de una expresión están separados por los signos + y −.',
        `En <b>${termsStr(ts)}</b> los términos son: ${lista}. En total hay <b>${k}</b>.`
      ],
      pista: 'Cuenta los grupos separados por + o −. Un número solo también es un término.' };
  }
  const l = pick(['x', 'y', 'a', 'b', 'ab', 'xy', 'm']);
  const otras = lits.filter((v) => v !== l);
  const c1 = nz(-9, 9);
  const baseT = termsStr([[c1, l]]);
  const corr = termsStr([[nz(-9, 9), l]]);
  const ds = [termsStr([[nz(-9, 9), pick(otras)]]), String(nz(2, 9)), termsStr([[nz(-9, 9), l.length > 1 ? l[0] : l + pick(otras)]])];
  const m = armarMCQ(corr, ds);
  return { ...base, ...m,
    enunciado: `¿Cuál de estos términos es <b>semejante</b> a <span class="expr">${baseT}</span>?`,
    respuestaHTML: `<span class="expr">${corr}</span>`,
    pasos: [
      'Los términos semejantes tienen exactamente la misma parte literal; solo puede cambiar el coeficiente.',
      `La parte literal de <b>${baseT}</b> es <b>${l}</b>. El término semejante es <b>${corr}</b>.`
    ],
    pista: 'Busca el término con las mismas letras. El número no importa.' };
}
 
const BANCO_TRADUCIR = {
  1: [
    { q: 'El doble de un número', ok: '2n', ds: ['n + 2', 'n/2', 'n − 2'], exp: '«El doble» significa multiplicar por 2: <b>2n</b>.' },
    { q: 'El triple de un número', ok: '3n', ds: ['n + 3', 'n/3', 'n − 3'], exp: '«El triple» significa multiplicar por 3: <b>3n</b>.' },
    { q: 'La mitad de un número', ok: 'n/2', ds: ['2n', 'n + 2', 'n − 2'], exp: '«La mitad» significa dividir entre 2: <b>n/2</b>.' },
    { q: 'Un número aumentado en 5', ok: 'n + 5', ds: ['5n', 'n − 5', 'n/5'], exp: '«Aumentado en» significa sumar: <b>n + 5</b>.' },
    { q: 'Un número disminuido en 7', ok: 'n − 7', ds: ['7 − n', 'n + 7', '7n'], exp: '«Disminuido en» significa restar: <b>n − 7</b>.' }
  ],
  2: [
    { q: 'El doble de un número aumentado en 3', ok: '2n + 3', ds: ['2(n + 3)', 'n + 6', '2n − 3'], exp: 'Primero «el doble de un número» → 2n. Después «aumentado en 3» → + 3. Resultado: <b>2n + 3</b>.' },
    { q: 'El triple de un número menos 4', ok: '3n − 4', ds: ['3(n − 4)', '4n − 3', '3n + 4'], exp: '«El triple de un número» → 3n y «menos 4» → − 4. Resultado: <b>3n − 4</b>.' },
    { q: 'La suma de un número y su doble', ok: 'n + 2n', ds: ['n + 2', '2n', '2n + 2'], exp: 'El número es n y su doble es 2n. La suma es <b>n + 2n</b>.' },
    { q: 'Cinco veces un número, disminuido en 8', ok: '5n − 8', ds: ['5(n − 8)', 'n + 5 − 8', '8n − 5'], exp: '«Cinco veces un número» → 5n y «disminuido en 8» → − 8. Resultado: <b>5n − 8</b>.' },
    { q: 'La mitad de un número más 6', ok: 'n/2 + 6', ds: ['(n + 6)/2', '2n + 6', 'n/2 − 6'], exp: '«La mitad de un número» → n/2 y «más 6» → + 6. Resultado: <b>n/2 + 6</b>.' }
  ],
  3: [
    { hist: true, q: 'Ana tiene x pesos y Luis tiene 3 pesos más que ella. ¿Cuántos pesos tienen entre los dos?', ok: 'x + (x + 3) = 2x + 3', ds: ['x + 3', '3x', '2x − 3'], exp: 'Ana tiene x. Luis tiene x + 3. Juntos: x + (x + 3) = <b>2x + 3</b>.' },
    { hist: true, q: 'Un cuaderno cuesta c pesos. ¿Cuánto cuestan 4 cuadernos y un lápiz de 500 pesos?', ok: '4c + 500', ds: ['4(c + 500)', 'c + 4 + 500', '4c − 500'], exp: 'Los 4 cuadernos cuestan 4c y se suma el lápiz: <b>4c + 500</b>.' },
    { hist: true, q: 'Un rectángulo tiene base b y altura h. ¿Cuál expresión representa su perímetro?', ok: '2b + 2h', ds: ['b·h', 'b + h', '2bh'], exp: 'El perímetro es la suma de los cuatro lados: b + h + b + h = <b>2b + 2h</b>.' },
    { hist: true, q: 'La edad de Pedro es n. Su papá tiene 4 veces la edad de Pedro más 2 años. ¿Qué expresión representa la edad del papá?', ok: '4n + 2', ds: ['4(n + 2)', 'n + 4 + 2', '4n − 2'], exp: '«4 veces la edad de Pedro» → 4n y «más 2 años» → + 2. Resultado: <b>4n + 2</b>.' },
    { hist: true, q: 'Se reparten m caramelos en partes iguales entre 5 niños. ¿Cuántos caramelos recibe cada niño?', ok: 'm/5', ds: ['5m', 'm − 5', 'm + 5'], exp: 'Repartir en partes iguales es dividir: <b>m/5</b>.' }
  ]
};
function genTraducir(n) {
  const it = pick(BANCO_TRADUCIR[n]);
  const m = armarMCQ(it.ok, it.ds);
  return {
    tema: 'algebra', tipo: 'mcq', ...m,
    enunciado: it.hist ? it.q : `¿Cuál expresión representa «${it.q}»?`,
    respuestaHTML: `<span class="expr">${it.ok}</span>`,
    pasos: [it.exp],
    pista: 'Identifica el número desconocido (n) y traduce cada palabra: doble → ×2, triple → ×3, aumentado → +, disminuido → −.'
  };
}
 
function genAlgebra(n) {
  const g = pick([genValor, genValor, genReducir, genReducir, genPartes, genPartes, genTraducir]);
  return g(n);
}
 
function pasosOperacion(op, a, b) {
  const pasos = [];
  let crudo;
  if (op === '+' || op === '−') {
    const sg = op;
    const verbo = op === '+' ? 'suman' : 'restan';
    if (a.d === b.d) {
      const s = op === '+' ? a.n + b.n : a.n - b.n;
      crudo = F(s, a.d);
      pasos.push(`Los denominadores son iguales (${a.d}): se conserva el denominador y se ${verbo} los numeradores.`);
      pasos.push(`${a.n} ${sg} ${b.n} = ${s}, entonces queda ${fracHTML(s, a.d)}.`);
    } else {
      const M = mcm(a.d, b.d), fa = M / a.d, fb = M / b.d;
      const s = op === '+' ? a.n * fa + b.n * fb : a.n * fa - b.n * fb;
      crudo = F(s, M);
      pasos.push(`Los denominadores son distintos. Busca el mcm de ${a.d} y ${b.d}: <b>${M}</b>.`);
      pasos.push(`Convierte a denominador ${M}: ${fracHTML(a.n, a.d)} = ${fracHTML(a.n * fa, M)} (se multiplica por ${fa}) y ${fracHTML(b.n, b.d)} = ${fracHTML(b.n * fb, M)} (se multiplica por ${fb}).`);
      pasos.push(`Ahora se ${verbo} los numeradores: ${a.n * fa} ${sg} ${b.n * fb} = ${s}, y se conserva el denominador: ${fracHTML(s, M)}.`);
    }
  } else if (op === '×') {
    crudo = F(a.n * b.n, a.d * b.d);
    pasos.push(`Multiplica numerador con numerador y denominador con denominador: (${a.n}·${b.n}) / (${a.d}·${b.d}) = ${fracHTML(crudo.n, crudo.d)}.`);
  } else {
    crudo = F(a.n * b.d, a.d * b.n);
    pasos.push(`Para dividir, se multiplica por el inverso de la segunda fracción: ${fracHTML(a.n, a.d)} × ${fracHTML(b.d, b.n)}.`);
    pasos.push(`Multiplica: (${a.n}·${b.d}) / (${a.d}·${b.n}) = ${fracHTML(crudo.n, crudo.d)}.`);
  }
  const r = simp(crudo);
  const g = gcd(crudo.n, crudo.d);
  if (g > 1) pasos.push(`Simplifica dividiendo numerador y denominador entre ${g}: ${fracHTML(crudo.n, crudo.d)} = ${fHTML(r)}.`);
  else pasos.push('La fracción ya está simplificada (no hay un número que divida a los dos).');
  if (r.d > 1 && r.n > r.d) pasos.push(`Como el numerador es mayor que el denominador, también se puede escribir como número mixto: <b>${mixtoHTML(r)}</b>.`);
  pasos.push(`Respuesta: <b>${fHTML(r)}</b>.`);
  return pasos;
}
 
function genOperacion(n, op) {
  op = op || pick(['+', '−', '×', '÷']);
  let a, b;
  if (op === '+' || op === '−') {
    do {
      if (n === 1) {
        const d = rnd(4, 10);
        a = F(rnd(1, d - 1), d); b = F(rnd(1, d - 1), d);
      } else if (n === 2) {
        const d1 = rnd(2, 6), d2 = d1 * rnd(2, 3);
        a = F(rnd(1, d1 - 1), d1); b = F(rnd(1, d2 - 1), d2);
        if (Math.random() < 0.5) [a, b] = [b, a];
      } else {
        const d1 = rnd(2, 9); let d2 = rnd(2, 9);
        while (d2 === d1) d2 = rnd(2, 9);
        a = F(rnd(1, d1 - 1), d1); b = F(rnd(1, d2 - 1), d2);
      }
      if (op === '−' && a.n * b.d < b.n * a.d) [a, b] = [b, a];
    } while (op === '−' && a.n * b.d === b.n * a.d);
  } else {
    const cfg = n === 1 ? { nmax: 3, dmin: 2, dmax: 5 } : n === 2 ? { nmax: 5, dmin: 2, dmax: 8 } : { nmax: 9, dmin: 2, dmax: 12 };
    a = F(rnd(1, cfg.nmax), rnd(cfg.dmin, cfg.dmax));
    b = F(rnd(1, cfg.nmax), rnd(cfg.dmin, cfg.dmax));
  }
  const r = op === '+' ? sumaF(a, b) : op === '−' ? restaF(a, b) : op === '×' ? multF(a, b) : divF(a, b);
  let enunciado = `Calcula: <span class="expr">${fracHTML(a.n, a.d)} ${op} ${fracHTML(b.n, b.d)}</span>`;
  if (n === 3 && (op === '+' || op === '−') && Math.random() < 0.4) {
    enunciado = op === '+'
      ? `Carlos recorrió ${fracHTML(a.n, a.d)} km por la mañana y ${fracHTML(b.n, b.d)} km por la tarde. ¿Cuántos kilómetros recorrió en total?`
      : `Una botella tiene ${fracHTML(a.n, a.d)} litros de jugo y se sirvieron ${fracHTML(b.n, b.d)} litros. ¿Cuántos litros quedan?`;
  }
  const pistas = {
    '+': 'Si los denominadores son distintos, busca el mcm y convierte las fracciones antes de sumar.',
    '−': 'Si los denominadores son distintos, busca el mcm y convierte las fracciones antes de restar.',
    '×': 'Multiplica arriba con arriba y abajo con abajo. Al final, simplifica.',
    '÷': 'Invierte la segunda fracción y conviértelo en una multiplicación.'
  };
  return {
    tema: 'fracciones', tipo: 'frac', formato: 'por ejemplo: 3/4',
    enunciado, correcta: r, respuestaHTML: fHTML(r) + ((r.d > 1 && r.n > r.d) ? ` (o ${mixtoHTML(r)})` : ''),
    pasos: pasosOperacion(op, a, b), pista: pistas[op]
  };
}
 
function genConcepto(n) {
  const t = pick(['simplificar', 'equivalente', 'comparar']);
  if (t === 'simplificar') {
    let d, nn;
    do { d = rnd(2, 9); nn = rnd(1, d - 1); } while (gcd(nn, d) !== 1);
    const k = rnd(2, n === 1 ? 4 : 7);
    const base = F(nn, d), dado = F(nn * k, d * k);
    return {
      tema: 'fracciones', tipo: 'frac', estricta: true, formato: 'por ejemplo: 3/4',
      enunciado: `Simplifica la fracción <span class="expr">${fracHTML(dado.n, dado.d)}</span> hasta su mínima expresión.`,
      correcta: base, respuestaHTML: fHTML(base),
      pasos: [
        `Busca el mayor número que divide al numerador y al denominador (MCD): MCD(${dado.n}, ${dado.d}) = <b>${k}</b>.`,
        `Divide ambos entre ${k}: ${dado.n} ÷ ${k} = ${base.n} y ${dado.d} ÷ ${k} = ${base.d}.`,
        `Resultado: <b>${fHTML(base)}</b>.`
      ],
      pista: 'Busca un número que divida exactamente al numerador y al denominador. Repite hasta que ya no se pueda.'
    };
  }
  if (t === 'equivalente') {
    const d = rnd(3, 8), a = F(rnd(1, d - 1), d), k = rnd(2, 4);
    const corr = fracHTML(a.n * k, a.d * k);
    const m = armarMCQ(corr, [fracHTML(a.n * k, a.d * k + 1), fracHTML(a.n * k + 1, a.d * k), fracHTML(a.n + k, a.d + k)]);
    return {
      tema: 'fracciones', tipo: 'mcq', ...m,
      enunciado: `¿Cuál fracción es <b>equivalente</b> a ${fracHTML(a.n, a.d)}?`,
      respuestaHTML: corr,
      pasos: [
        'Una fracción equivalente se obtiene multiplicando (o dividiendo) el numerador y el denominador por el mismo número.',
        `${fracHTML(a.n, a.d)}: ${a.n}·${k} = ${a.n * k} y ${a.d}·${k} = ${a.d * k}. La equivalente es <b>${corr}</b>.`
      ],
      pista: 'Lo que le hagas al numerador, hazlo también al denominador.'
    };
  }
  let a, b;
  do { a = F(rnd(1, 7), rnd(2, 9)); b = F(rnd(1, 7), rnd(2, 9)); } while (igualF(a, b));
  const mayor = a.n * b.d > b.n * a.d ? a : b;
  const corr = fracHTML(mayor.n, mayor.d);
  const m = armarMCQ(corr, [fracHTML(a.n, a.d), fracHTML(b.n, b.d), 'Son iguales']);
  return {
    tema: 'fracciones', tipo: 'mcq', ...m,
    enunciado: `¿Cuál fracción es <b>mayor</b>: ${fracHTML(a.n, a.d)} o ${fracHTML(b.n, b.d)}?`,
    respuestaHTML: corr,
    pasos: [
      `Multiplica en cruz: ${a.n}·${b.d} = ${a.n * b.d} y ${b.n}·${a.d} = ${b.n * a.d}.`,
      `El producto mayor corresponde a la fracción mayor: <b>${corr}</b>.`
    ],
    pista: 'Multiplica en cruz y compara los productos.'
  };
}
 
function genFraccion(n) {
  return pick(['op', 'op', 'op', 'concepto']) === 'op' ? genOperacion(n) : genConcepto(n);
}
 
function verificar(ej, entrada) {
  switch (ej.tipo) {
    case 'mcq':
      return { valido: true, ok: entrada === ej.correcta };
    case 'num': {
      const v = leerEntero(entrada);
      return v === null ? { valido: false } : { valido: true, ok: v === ej.correcta };
    }
    case 'poly': {
      const m = leerLineal(entrada);
      return m ? { valido: true, ok: igualLineal(m, ej.correcta) } : { valido: false };
    }
    case 'frac': {
      const f = leerFraccion(entrada);
      if (!f) return { valido: false };
      const ok = igualF(f, ej.correcta);
      if (ok && !esSimplificada(f)) {
        const s = simp(f);
        if (ej.estricta) return { valido: true, ok: false, nota: 'Tu fracción es equivalente, pero todavía se puede simplificar más.' };
        return { valido: true, ok: true, nota: `Está bien, pero también puedes simplificarla a ${fHTML(s)}.` };
      }
      return { valido: true, ok };
    }
    default:
      return { valido: false };
  }
}
 
function pintarPregunta(cont, ej, alEnviar, enfocar = false) {
  cont.innerHTML = '';
  const q = document.createElement('div');
  q.className = 'pregunta';
  q.innerHTML = `<p class="enunciado">${ej.enunciado}</p>`;
  cont.appendChild(q);
  let bloqueado = false;
  if (ej.tipo === 'mcq') {
    const lista = document.createElement('div');
    lista.className = 'opciones';
    ej.opciones.forEach((o, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opcion';
      b.innerHTML = o;
      b.addEventListener('click', () => {
        if (bloqueado) return;
        if (alEnviar(i) !== false) { bloqueado = true; b.classList.add('elegida'); }
      });
      lista.appendChild(b);
    });
    q.appendChild(lista);
  } else {
    const f = document.createElement('form');
    f.className = 'formulario';
    f.autocomplete = 'off';
    f.innerHTML = `<input type="text" class="campo" aria-label="Tu respuesta" placeholder="${esc(ej.formato || '')}" autocapitalize="off" spellcheck="false"><button class="btn" type="submit">Comprobar</button>`;
    const campo = $('input', f), boton = $('button', f);
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (bloqueado || !campo.value.trim()) return;
      if (alEnviar(campo.value) !== false) { bloqueado = true; campo.readOnly = true; boton.disabled = true; }
    });
    q.appendChild(f);
    if (enfocar) setTimeout(() => campo.focus({ preventScroll: true }), 0);
  }
}
 
function marcarRespuesta(cont, ej, entrada, ok) {
  if (ej.tipo === 'mcq') {
    $$('.opcion', cont).forEach((b, i) => {
      b.disabled = true;
      if (i === ej.correcta) b.classList.add('correcta');
      else if (i === entrada) b.classList.add('incorrecta');
    });
  } else {
    const c = $('.campo', cont);
    if (c) c.classList.add(ok ? 'ok' : 'mal');
  }
}
 
const htmlPasos = (ej, abierto) =>
  `<details class="pasos" ${abierto ? 'open' : ''}><summary>Ver el procedimiento</summary><ol>${ej.pasos.map((p) => `<li>${p}</li>`).join('')}</ol></details>`;
 
function crearPractica(cont, tema, generador) {
  const est = { nivel: 1, ej: null, ok: 0, total: 0, racha: 0 };
  const nombres = ['Fácil', 'Medio', 'Difícil'];
  cont.innerHTML = `
    <div class="niveles" role="group" aria-label="Nivel de dificultad">
      ${[1, 2, 3].map((n) => `<button type="button" class="nivel" data-n="${n}" aria-pressed="${n === 1}">Nivel ${n} · ${nombres[n - 1]}</button>`).join('')}
    </div>
    <div class="marcador">
      <span>Aciertos de esta sesión: <b data-r="ok">0</b> de <b data-r="total">0</b></span>
      <span>Racha: <b data-r="racha">0</b> 🔥</span>
    </div>
    <div class="tarjeta">
      <div data-r="pregunta"></div>
      <div class="feedback" data-r="fb" aria-live="polite"></div>
      <div class="acciones" data-r="acciones"></div>
    </div>`;
  const q = $('[data-r=pregunta]', cont), fb = $('[data-r=fb]', cont), ac = $('[data-r=acciones]', cont);
 
  const pintarMarcador = () => {
    $('[data-r=ok]', cont).textContent = est.ok;
    $('[data-r=total]', cont).textContent = est.total;
    $('[data-r=racha]', cont).textContent = est.racha;
  };
 
  function nuevo(enfocar) {
    est.ej = generador(est.nivel);
    fb.innerHTML = '';
    ac.innerHTML = '';
    const pista = document.createElement('button');
    pista.type = 'button'; pista.className = 'btn btn--suave'; pista.textContent = '💡 Pista';
    pista.addEventListener('click', () => { fb.innerHTML = `<p class="fb fb--aviso">💡 ${est.ej.pista}</p>`; });
    ac.appendChild(pista);
    pintarPregunta(q, est.ej, responder, enfocar);
  }
 
  function responder(entrada) {
    const ej = est.ej;
    const r = verificar(ej, entrada);
    if (!r.valido) {
      fb.innerHTML = `<p class="fb fb--aviso">Escribe tu respuesta así: ${esc(ej.formato)}.</p>`;
      return false;
    }
    est.total++;
    Almacen.datos[tema].total++;
    if (r.ok) { est.ok++; est.racha++; Almacen.datos[tema].ok++; } else { est.racha = 0; }
    Almacen.guardar();
    marcarRespuesta(q, ej, entrada, r.ok);
    fb.innerHTML =
      (r.ok
        ? `<p class="fb fb--ok">${pick(ELOGIOS)}${est.racha >= 3 ? ` ¡Llevas ${est.racha} seguidas!` : ''}</p>`
        : `<p class="fb fb--mal">Todavía no. La respuesta correcta es ${ej.respuestaHTML}. Revisa el procedimiento y aprende del error.</p>`) +
      (r.nota ? `<p class="fb fb--aviso">${r.nota}</p>` : '') +
      htmlPasos(ej, !r.ok);
    ac.innerHTML = '';
    const sig = document.createElement('button');
    sig.type = 'button'; sig.className = 'btn'; sig.textContent = 'Siguiente ejercicio ▶';
    sig.addEventListener('click', () => nuevo(true));
    ac.appendChild(sig);
    pintarMarcador();
    sig.focus({ preventScroll: true });
    return true;
  }
 
  $$('.nivel', cont).forEach((b) => b.addEventListener('click', () => {
    est.nivel = Number(b.dataset.n);
    $$('.nivel', cont).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    nuevo(false);
  }));
  nuevo(false);
}
 
function iniciarLabAlgebra() {
  const EXPRS = [
    [[3, 'x'], [2, '']], [[5, 'x'], [-4, '']], [[1, 'x'], [7, '']],
    [[2, 'x'], [3, 'y']], [[4, 'x'], [-2, 'y'], [1, '']]
  ];
  const sel = $('#labExpr'), X = $('#labX'), Y = $('#labY');
  sel.innerHTML = EXPRS.map((t, i) => `<option value="${i}">${termsStr(t)}</option>`).join('');
  function actualizar() {
    const ts = EXPRS[Number(sel.value)];
    const x = Number(X.value), y = Number(Y.value);
    const usaY = ts.some((t) => t[1] === 'y');
    $('#labYcaja').hidden = !usaY;
    $('#labXv').textContent = num(x);
    $('#labYv').textContent = num(y);
    const vals = { x, y };
    const prod = ts.map(([c, v]) => (v === '' ? c : c * vals[v]));
    const total = prod.reduce((s, v) => s + v, 0);
    $('#labSalida').innerHTML =
      `<b>${termsStr(ts)}</b> cuando x = ${num(x)}${usaY ? ` y y = ${num(y)}` : ''}<br>` +
      `→ ${sustStr(ts, vals)}<br>→ ${sumaStr(prod)}<br>→ <b>${num(total)}</b>`;
  }
  [sel, X, Y].forEach((el) => el.addEventListener('input', actualizar));
  actualizar();
}
 
function iniciarLabFracciones() {
  const N = $('#labN'), D = $('#labD');
  function actualizar() {
    const n = Number(N.value), d = Number(D.value);
    $('#labNv').textContent = n;
    $('#labDv').textContent = d;
    const barras = $('#labBarras');
    barras.innerHTML = '';
    const cuantas = Math.max(1, Math.ceil(n / d));
    for (let i = 0; i < cuantas; i++) {
      const fila = document.createElement('div');
      fila.className = 'barra-fraccion';
      for (let j = 0; j < d; j++) {
        const c = document.createElement('span');
        c.className = 'celda' + (i * d + j < n ? ' llena' : '');
        fila.appendChild(c);
      }
      barras.appendChild(fila);
    }
    barras.setAttribute('aria-label', `Representación de ${n} de ${d} partes`);
    const s = simp(F(n, d));
    const dec = Number((n / d).toFixed(3)).toString().replace('.', ',');
    const li = [
      `Fracción: ${fracHTML(n, d)}`,
      `Simplificada: ${fHTML(s)}`,
      `Decimal: ${dec}`
    ];
    if (n > d && d > 1) li.push(`Número mixto: ${mixtoHTML(F(n, d))}`);
    if (n > 0) li.push(`Equivalentes: ${fracHTML(n * 2, d * 2)} y ${fracHTML(n * 3, d * 3)}`);
    $('#labDatos').innerHTML = li.map((t) => `<li>${t}</li>`).join('');
  }
  [N, D].forEach((el) => el.addEventListener('input', actualizar));
  actualizar();
}
 
const EJEMPLOS = [
  {
    titulo: 'Términos semejantes', ir: 'modulo1',
    enunciado: 'Reduce: <span class="expr">3x + 5y + 2x − y</span>',
    pasos: [
      'Identifica los términos semejantes (misma parte literal). Con <b>x</b>: 3x y 2x. Con <b>y</b>: 5y y −y.',
      'Suma los coeficientes de cada grupo. Con x: 3 + 2 = 5. Con y: 5 + (−1) = 4. (Recuerda que −y es lo mismo que −1y).',
      'Escribe el resultado: <b>5x + 4y</b>.'
    ]
  },
  {
    titulo: 'Valor numérico', ir: 'modulo1',
    enunciado: 'Calcula <span class="expr">2a + 3b</span> si a = 4 y b = −1.',
    pasos: [
      'Reemplaza cada letra por su valor (usa paréntesis con los negativos): 2·4 + 3·(−1).',
      'Resuelve las multiplicaciones: 8 + (−3), que es lo mismo que 8 − 3.',
      'Resta: <b>5</b>.'
    ]
  },
  {
    titulo: 'Lenguaje algebraico', ir: 'modulo1',
    enunciado: 'Escribe en lenguaje algebraico: «El triple de un número menos 4».',
    pasos: [
      'Elige una letra para el número desconocido: <b>n</b>.',
      '«El triple de un número» significa multiplicar por 3: <b>3n</b>.',
      '«Menos 4» significa restar 4: <b>− 4</b>.',
      'Une las partes: <b>3n − 4</b>. Comprobación con n = 5: 3·5 − 4 = 11.'
    ]
  },
  {
    titulo: 'Simplificar', ir: 'modulo2',
    enunciado: `Simplifica: <span class="expr">${fracHTML(18, 24)}</span>`,
    pasos: [
      'Busca el mayor número que divide a 18 y a 24. Ese número es el MCD: <b>6</b>.',
      `Divide arriba y abajo entre 6: 18 ÷ 6 = 3 y 24 ÷ 6 = 4. Queda ${fracHTML(3, 4)}.`,
      `3 y 4 no tienen otro divisor común, así que ya está simplificada: <b>${fracHTML(3, 4)}</b>.`
    ]
  },
  {
    titulo: 'Suma (denominadores distintos)', ir: 'modulo2',
    enunciado: `Calcula: <span class="expr">${fracHTML(2, 3)} + ${fracHTML(3, 4)}</span>`,
    pasos: [
      'Busca el mcm de 3 y 4. Múltiplos de 3: 3, 6, 9, <b>12</b>. Múltiplos de 4: 4, 8, <b>12</b>. El mcm es <b>12</b>.',
      `Convierte a denominador 12: ${fracHTML(2, 3)} = ${fracHTML(8, 12)} (×4) y ${fracHTML(3, 4)} = ${fracHTML(9, 12)} (×3).`,
      `Suma los numeradores y conserva el denominador: ${fracHTML(8, 12)} + ${fracHTML(9, 12)} = ${fracHTML(17, 12)}.`,
      `17 es primo, así que no se simplifica. Como es mayor que 1, también se escribe como número mixto: <b>${mixtoHTML(F(17, 12))}</b>.`
    ]
  },
  {
    titulo: 'Resta (denominadores distintos)', ir: 'modulo2',
    enunciado: `Calcula: <span class="expr">${fracHTML(5, 6)} − ${fracHTML(1, 4)}</span>`,
    pasos: [
      'El mcm de 6 y 4 es <b>12</b>.',
      `Convierte: ${fracHTML(5, 6)} = ${fracHTML(10, 12)} (×2) y ${fracHTML(1, 4)} = ${fracHTML(3, 12)} (×3).`,
      `Resta los numeradores: 10 − 3 = 7. Queda ${fracHTML(7, 12)}.`,
      `7 y 12 no tienen divisores comunes, por lo tanto la respuesta es <b>${fracHTML(7, 12)}</b>.`
    ]
  },
  {
    titulo: 'Multiplicación', ir: 'modulo2',
    enunciado: `Calcula: <span class="expr">${fracHTML(3, 5)} × ${fracHTML(10, 9)}</span>`,
    pasos: [
      `Multiplica numeradores y denominadores: (3·10) / (5·9) = ${fracHTML(30, 45)}.`,
      'Busca el MCD de 30 y 45: es <b>15</b>.',
      `Divide arriba y abajo entre 15: <b>${fracHTML(2, 3)}</b>.`
    ]
  },
  {
    titulo: 'División', ir: 'modulo2',
    enunciado: `Calcula: <span class="expr">${fracHTML(2, 3)} ÷ ${fracHTML(4, 5)}</span>`,
    pasos: [
      `El inverso de ${fracHTML(4, 5)} es ${fracHTML(5, 4)} (se invierte la segunda fracción).`,
      `Cambia la división por una multiplicación: ${fracHTML(2, 3)} × ${fracHTML(5, 4)}.`,
      `Multiplica: (2·5) / (3·4) = ${fracHTML(10, 12)}.`,
      `Simplifica dividiendo entre 2: <b>${fracHTML(5, 6)}</b>.`
    ]
  }
];
 
function iniciarEjemplos() {
  const fichas = $('#ejemploFichas'), cuerpo = $('#ejemploCuerpo');
  let actual = 0, visibles = 1;
  fichas.innerHTML = EJEMPLOS.map((e, i) => `<button type="button" class="ficha" role="tab" data-i="${i}" aria-selected="${i === 0}">${e.titulo}</button>`).join('');
 
  function pintar() {
    const e = EJEMPLOS[actual], total = e.pasos.length;
    const completo = visibles >= total;
    cuerpo.innerHTML = `
      <div class="enunciado-ejemplo">${e.enunciado}</div>
      ${e.pasos.map((p, i) => `
        <div class="paso${i < visibles ? ' visible' : ''}${i === total - 1 ? ' final' : ''}">
          <span class="paso__n">${i + 1}</span><div class="paso__texto">${p}</div>
        </div>`).join('')}
      <p class="nota">Paso ${visibles} de ${total}</p>
      <div class="acciones">
        <button type="button" class="btn" data-acc="sig" ${completo ? 'disabled' : ''}>Mostrar siguiente paso ▶</button>
        <button type="button" class="btn btn--suave" data-acc="todo" ${completo ? 'disabled' : ''}>Ver todo</button>
        <button type="button" class="btn btn--suave" data-acc="reiniciar">↺ Reiniciar</button>
        ${completo ? `<button type="button" class="btn btn--acento" data-ir="${e.ir}">Practicar este tema</button>` : ''}
      </div>`;
  }
  fichas.addEventListener('click', (ev) => {
    const b = ev.target.closest('.ficha');
    if (!b) return;
    actual = Number(b.dataset.i); visibles = 1;
    $$('.ficha', fichas).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    pintar();
  });
  cuerpo.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-acc]');
    if (!b) return;
    const total = EJEMPLOS[actual].pasos.length;
    if (b.dataset.acc === 'sig') visibles = Math.min(total, visibles + 1);
    if (b.dataset.acc === 'todo') visibles = total;
    if (b.dataset.acc === 'reiniciar') visibles = 1;
    pintar();
  });
  pintar();
}
 
const PAREJAS = {
  algebra: [
    ['2x + 3x', '5x'], ['4a − a', '3a'], ['7y − 2y', '5y'], ['x + x + x', '3x'],
    ['3b + 2b − b', '4b'], ['5n − 2n + n', '4n'], ['2x + 5 + x', '3x + 5'], ['6m − 6m', '0'], ['9p − 3p', '6p']
  ],
  fracciones: [
    ['2/6', '1/3'], ['6/8', '3/4'], ['10/15', '2/3'], ['1/2 + 1/2', '1'],
    ['2/5 + 1/5', '3/5'], ['1/2 × 1/2', '1/4'], ['4/8', '1/2'], ['6/4', '3/2']
  ]
};
const JUEGOS = [
  { id: 'memoria', titulo: '🧠 Memoria' },
  { id: 'reloj', titulo: '⏱️ Contrarreloj' },
  { id: 'semejantes', titulo: '🔍 ¿Semejantes?' }
];
let relojId = null, relojActivo = false;
function detenerJuegos() {
  if (relojId) clearInterval(relojId);
  relojId = null; relojActivo = false;
}
 
function juegoMemoria(cont) {
  cont.innerHTML = `
    <div class="marcador-juego">
      <label>Tema:
        <select id="memTema"><option value="algebra">Álgebra</option><option value="fracciones">Fracciones</option></select>
      </label>
      <span>Intentos: <b id="memMov">0</b></span>
      <span>Parejas: <b id="memPar">0</b>/6</span>
      <button type="button" class="btn btn--suave" id="memNuevo">Nuevo juego</button>
    </div>
    <p class="nota">Voltea dos cartas y une cada expresión con su resultado o fracción equivalente.</p>
    <div class="memoria" id="memTablero"></div>
    <div class="feedback" id="memFin" aria-live="polite"></div>`;
  let cartas = [], abiertas = [], bloqueo = false, mov = 0, par = 0, t0 = null;
  const tablero = $('#memTablero');
 
  function nuevo() {
    const pool = shuffle(PAREJAS[$('#memTema').value]).slice(0, 6);
    cartas = shuffle(pool.flatMap(([a, b], i) => [{ id: i, t: a }, { id: i, t: b }]));
    abiertas = []; bloqueo = false; mov = 0; par = 0; t0 = null;
    $('#memMov').textContent = 0; $('#memPar').textContent = 0; $('#memFin').innerHTML = '';
    tablero.innerHTML = cartas.map((c, k) => `<button type="button" class="carta" data-k="${k}">${textoFrac(c.t)}</button>`).join('');
  }
  tablero.addEventListener('click', (e) => {
    const b = e.target.closest('.carta');
    if (!b || bloqueo || b.classList.contains('volteada') || b.classList.contains('acertada')) return;
    if (t0 === null) t0 = Date.now();
    b.classList.add('volteada');
    abiertas.push(b);
    if (abiertas.length < 2) return;
    mov++;
    $('#memMov').textContent = mov;
    const [c1, c2] = abiertas;
    if (cartas[Number(c1.dataset.k)].id === cartas[Number(c2.dataset.k)].id) {
      [c1, c2].forEach((c) => { c.classList.remove('volteada'); c.classList.add('acertada'); });
      abiertas = [];
      par++;
      $('#memPar').textContent = par;
      if (par === 6) {
        const seg = Math.round((Date.now() - t0) / 1000);
        const mejor = Almacen.datos.memoria;
        const record = !mejor || mov < mejor;
        if (record) { Almacen.datos.memoria = mov; Almacen.guardar(); }
        $('#memFin').innerHTML = `<p class="fb fb--ok">🎉 ¡Completaste el juego en ${mov} intentos y ${seg} segundos!${record ? ' Es tu mejor marca.' : ''}</p>`;
      }
    } else {
      bloqueo = true;
      setTimeout(() => { c1.classList.remove('volteada'); c2.classList.remove('volteada'); abiertas = []; bloqueo = false; }, 900);
    }
  });
  $('#memNuevo').addEventListener('click', nuevo);
  $('#memTema').addEventListener('change', nuevo);
  nuevo();
}
 
function juegoReloj(cont) {
  const TIEMPO = 60;
  cont.innerHTML = `
    <p>Tienes <b>${TIEMPO} segundos</b> para resolver todos los ejercicios que puedas. Cada acierto suma <b>10 puntos</b>; con 3 aciertos seguidos ganas <b>5 extra</b>.</p>
    <p class="nota">Mejor puntaje: <b>${Almacen.datos.contrarreloj}</b></p>
    <button type="button" class="btn" id="relIniciar">¡Empezar!</button>`;
  $('#relIniciar').addEventListener('click', iniciar);
 
  function iniciar() {
    detenerJuegos();
    let puntos = 0, racha = 0, tiempo = TIEMPO, aciertos = 0, intentos = 0;
    relojActivo = true;
    cont.innerHTML = `
      <div class="marcador-juego"><span>⏱️ <b id="relT">${tiempo}</b> s</span><span>⭐ <b id="relP">0</b> puntos</span><span>🔥 <b id="relR">0</b></span></div>
      <div class="tiempo"><div class="tiempo__relleno" id="relBarra"></div></div>
      <div id="relPregunta"></div>
      <div class="feedback" id="relFb" aria-live="polite"></div>`;
    const pintarMarcador = () => {
      $('#relT').textContent = tiempo; $('#relP').textContent = puntos; $('#relR').textContent = racha;
      $('#relBarra').style.width = `${(tiempo / TIEMPO) * 100}%`;
    };
    function siguiente() {
      if (!relojActivo) return;
      const ej = Math.random() < 0.5 ? genAlgebra(rnd(1, 2)) : genFraccion(rnd(1, 2));
      $('#relFb').innerHTML = '';
      pintarPregunta($('#relPregunta'), ej, (entrada) => {
        const r = verificar(ej, entrada);
        if (!r.valido) { $('#relFb').innerHTML = `<p class="fb fb--aviso">Formato: ${esc(ej.formato)}.</p>`; return false; }
        intentos++;
        marcarRespuesta($('#relPregunta'), ej, entrada, r.ok);
        if (r.ok) {
          aciertos++; racha++; puntos += 10 + (racha >= 3 ? 5 : 0);
          $('#relFb').innerHTML = `<p class="fb fb--ok">✔ ${pick(ELOGIOS)}</p>`;
        } else {
          racha = 0;
          $('#relFb').innerHTML = `<p class="fb fb--mal">✘ La respuesta era ${ej.respuestaHTML}</p>`;
        }
        pintarMarcador();
        setTimeout(siguiente, r.ok ? 500 : 1400);
        return true;
      }, true);
    }
    function fin() {
      detenerJuegos();
      const record = puntos > Almacen.datos.contrarreloj;
      if (record) { Almacen.datos.contrarreloj = puntos; Almacen.guardar(); }
      cont.innerHTML = `
        <div class="resultado-nota"><div class="resultado-nota__valor">${puntos}</div><p>puntos</p></div>
        <p class="fb fb--ok">Acertaste ${aciertos} de ${intentos} ejercicios.${record ? ' 🏆 ¡Nuevo récord!' : ''}</p>
        <button type="button" class="btn" id="relOtra">Jugar de nuevo</button>`;
      $('#relOtra').addEventListener('click', iniciar);
    }
    relojId = setInterval(() => {
      tiempo--;
      pintarMarcador();
      if (tiempo <= 0) fin();
    }, 1000);
    pintarMarcador();
    siguiente();
  }
}
 
function juegoSemejantes(cont) {
  const TOTAL = 10;
  let ronda = 0, aciertos = 0;
  const LITS = ['x', 'y', 'a', 'b', 'xy', 'ab', 'm', 'n'];
  function inicio() {
    ronda = 0; aciertos = 0;
    siguiente();
  }
  function siguiente() {
    if (ronda >= TOTAL) return fin();
    ronda++;
    const semejantes = Math.random() < 0.5;
    const l1 = pick(LITS);
    const l2 = semejantes ? l1 : pick(LITS.filter((l) => l !== l1).concat(['']));
    const t1 = termsStr([[nz(-9, 9), l1]]), t2 = termsStr([[nz(-9, 9), l2]]);
    cont.innerHTML = `
      <div class="marcador-juego"><span>Ronda <b>${ronda}</b> de ${TOTAL}</span><span>Aciertos: <b>${aciertos}</b></span></div>
      <p class="enunciado">¿Estos dos términos son semejantes?</p>
      <div class="pareja-terminos"><span class="termino-grande">${t1}</span><span class="termino-grande">${t2}</span></div>
      <div class="botones-si-no">
        <button type="button" class="btn" data-r="si">Sí</button>
        <button type="button" class="btn btn--suave" data-r="no">No</button>
      </div>
      <div class="feedback" id="semFb" aria-live="polite"></div>`;
    $$('.botones-si-no button', cont).forEach((b) => b.addEventListener('click', () => {
      const dijoSi = b.dataset.r === 'si';
      const ok = dijoSi === semejantes;
      if (ok) aciertos++;
      const razon = semejantes
        ? `Los dos tienen la misma parte literal (<b>${l1}</b>), por eso son semejantes.`
        : `Sus partes literales son distintas (<b>${l1}</b> y <b>${l2 || 'ninguna: es solo un número'}</b>), por eso no son semejantes.`;
      $$('.botones-si-no button', cont).forEach((x) => { x.disabled = true; });
      $('#semFb').innerHTML = `<p class="fb ${ok ? 'fb--ok' : 'fb--mal'}">${ok ? pick(ELOGIOS) : 'Casi.'}</p><p class="fb fb--aviso">${razon}</p>
        <div class="acciones"><button type="button" class="btn" id="semSig">${ronda >= TOTAL ? 'Ver resultado' : 'Siguiente ▶'}</button></div>`;
      $('#semSig').addEventListener('click', siguiente);
      $('#semSig').focus({ preventScroll: true });
    }));
  }
  function fin() {
    const record = aciertos > Almacen.datos.semejantes;
    if (record) { Almacen.datos.semejantes = aciertos; Almacen.guardar(); }
    cont.innerHTML = `
      <div class="resultado-nota"><div class="resultado-nota__valor">${aciertos}/${TOTAL}</div><p>respuestas correctas</p></div>
      <p class="fb ${aciertos >= 7 ? 'fb--ok' : 'fb--aviso'}">${aciertos >= 7 ? '¡Muy buen trabajo!' : 'Repasa los términos semejantes en el Módulo 1 e inténtalo otra vez.'}${record ? ' 🏆 ¡Nuevo récord!' : ''}</p>
      <div class="acciones"><button type="button" class="btn" id="semOtra">Jugar de nuevo</button><button type="button" class="btn btn--suave" data-ir="modulo1">Repasar Módulo 1</button></div>`;
    $('#semOtra').addEventListener('click', inicio);
  }
  inicio();
}
 
function iniciarJuegos() {
  const fichas = $('#juegoFichas'), cuerpo = $('#juegoCuerpo');
  fichas.innerHTML = JUEGOS.map((j, i) => `<button type="button" class="ficha" role="tab" data-id="${j.id}" aria-selected="${i === 0}">${j.titulo}</button>`).join('');
  function abrir(id) {
    detenerJuegos();
    $$('.ficha', fichas).forEach((x) => x.setAttribute('aria-selected', String(x.dataset.id === id)));
    if (id === 'memoria') juegoMemoria(cuerpo);
    if (id === 'reloj') juegoReloj(cuerpo);
    if (id === 'semejantes') juegoSemejantes(cuerpo);
  }
  fichas.addEventListener('click', (e) => { const b = e.target.closest('.ficha'); if (b) abrir(b.dataset.id); });
  abrir('memoria');
}
 
function iniciarEvaluacion() {
  const cont = $('#evalCuerpo');
  const TEMAS = { algebra: 'Expresiones algebraicas', fracciones: 'Fracciones' };
 
  function portada() {
    const mejor = Almacen.datos.evaluacion;
    cont.innerHTML = `
      <h2 style="margin-top:0">Antes de empezar</h2>
      <p>Son 10 preguntas. Durante la evaluación no verás si acertaste; al final recibirás un resumen con las respuestas correctas y el procedimiento de las que fallaste.</p>
      ${mejor ? `<p class="nota">Tu mejor resultado: <b>${mejor}%</b></p>` : ''}
      <button type="button" class="btn" id="evIniciar">Comenzar evaluación</button>`;
    $('#evIniciar').addEventListener('click', comenzar);
  }
 
  function comenzar() {
    const preguntas = [
      genPartes(1, 'coef'), genValor(2), genReducir(2), genTraducir(2), genPartes(2, 'semejante'),
      genOperacion(1, '+'), genOperacion(2, '+'), genOperacion(2, '−'), genOperacion(2, '×'), genOperacion(2, '÷')
    ];
    const respuestas = new Array(preguntas.length).fill(null);
    mostrar(0);
 
    function mostrar(i) {
      const ej = preguntas[i];
      cont.innerHTML = `
        <div class="eval-cabecera"><span>Pregunta ${i + 1} de ${preguntas.length}</span><span>${TEMAS[ej.tema]}</span></div>
        <div class="barra-progreso"><div class="barra-progreso__relleno" style="width:${(i / preguntas.length) * 100}%"></div></div>
        <div style="margin-top:1rem" id="evPregunta"></div>
        <div class="feedback" id="evFb" aria-live="polite"></div>
        <div class="acciones" id="evAcc"></div>`;
      pintarPregunta($('#evPregunta'), ej, (entrada) => {
        if (!verificar(ej, entrada).valido) {
          $('#evFb').innerHTML = `<p class="fb fb--aviso">Escribe tu respuesta así: ${esc(ej.formato)}.</p>`;
          return false;
        }
        respuestas[i] = entrada;
        $('#evFb').innerHTML = '';
        const ultimo = i === preguntas.length - 1;
        $('#evAcc').innerHTML = `<button type="button" class="btn" id="evSig">${ultimo ? 'Ver resultados' : 'Siguiente ▶'}</button>`;
        $('#evSig').addEventListener('click', () => (ultimo ? resultados() : mostrar(i + 1)));
        $('#evSig').focus({ preventScroll: true });
        return true;
      });
    }
 
    function resultados() {
      const porTema = { algebra: { ok: 0, total: 0 }, fracciones: { ok: 0, total: 0 } };
      const fallos = [];
      preguntas.forEach((ej, i) => {
        const r = verificar(ej, respuestas[i]);
        porTema[ej.tema].total++;
        if (r.ok) porTema[ej.tema].ok++; else fallos.push({ n: i + 1, ej, entrada: respuestas[i] });
      });
      const ok = porTema.algebra.ok + porTema.fracciones.ok;
      const pct = Math.round((ok / preguntas.length) * 100);
      if (pct > Almacen.datos.evaluacion) { Almacen.datos.evaluacion = pct; Almacen.guardar(); }
 
      const barra = (t) => {
        const p = Math.round((porTema[t].ok / porTema[t].total) * 100);
        return `<div class="resultado-tema"><div class="resultado-tema__fila"><span>${TEMAS[t]}</span><span>${porTema[t].ok}/${porTema[t].total}</span></div>
          <div class="barra-progreso"><div class="barra-progreso__relleno" style="width:${p}%"></div></div></div>`;
      };
      const recs = [];
      if (porTema.algebra.ok / porTema.algebra.total < 0.6)
        recs.push(`<div class="recomendacion">Te conviene reforzar <b>Expresiones algebraicas</b>: repasa el Módulo 1 y mira los ejemplos.<div class="acciones"><button type="button" class="btn btn--suave" data-ir="modulo1">Ir al Módulo 1</button><button type="button" class="btn btn--suave" data-ir="ejemplos">Ver ejemplos</button></div></div>`);
      if (porTema.fracciones.ok / porTema.fracciones.total < 0.6)
        recs.push(`<div class="recomendacion">Te conviene reforzar <b>Fracciones</b>: repasa el Módulo 2 y practica el nivel 1.<div class="acciones"><button type="button" class="btn btn--suave" data-ir="modulo2">Ir al Módulo 2</button><button type="button" class="btn btn--suave" data-ir="ejemplos">Ver ejemplos</button></div></div>`);
 
      const tuResp = (f) => (f.ej.tipo === 'mcq' ? f.ej.opciones[f.entrada] : `<span class="expr">${esc(f.entrada)}</span>`);
      cont.innerHTML = `
        <div class="resultado-nota">
          <div class="resultado-nota__valor">${ok}/${preguntas.length}</div>
          <p>${pct >= 80 ? '¡Excelente trabajo! 🌟' : pct >= 60 ? '¡Buen trabajo! Ya casi lo dominas.' : 'Sigue practicando, ¡tú puedes! 💪'}</p>
        </div>
        ${barra('algebra')}${barra('fracciones')}
        ${recs.join('')}
        ${fallos.length ? `<h3>Revisa tus errores</h3><ul class="lista-errores">${fallos.map((f) => `
          <li><p><b>Pregunta ${f.n}.</b> ${f.ej.enunciado}</p>
              <p>Tu respuesta: ${tuResp(f)}<br>Respuesta correcta: ${f.ej.respuestaHTML}</p>
              ${htmlPasos(f.ej, false)}</li>`).join('')}</ul>` : '<p class="fb fb--ok">¡No tuviste ningún error!</p>'}
        <div class="acciones"><button type="button" class="btn" id="evRepetir">Repetir evaluación</button></div>`;
      $('#evRepetir').addEventListener('click', comenzar);
    }
  }
  portada();
}
 
const VISTAS = ['inicio', 'modulo1', 'modulo2', 'ejemplos', 'juegos', 'evaluacion'];
 
function ir(id) {
  if (!VISTAS.includes(id)) id = 'inicio';
  VISTAS.forEach((v) => { $('#' + v).hidden = v !== id; });
  $$('#menu button').forEach((b) => {
    if (b.dataset.ir === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  if (id !== 'juegos') detenerJuegos();
  if (id === 'inicio') pintarProgreso();
  try { history.replaceState(null, '', '#' + id); } catch (e) { /* ignorar */ }
  window.scrollTo({ top: 0 });
  const activo = $('#menu [aria-current]');
  if (activo) activo.scrollIntoView({ inline: 'center', block: 'nearest' });
}
 
function pintarProgreso() {
  const d = Almacen.datos;
  const pct = (o) => (o.total ? Math.round((100 * o.ok) / o.total) : 0);
  const tarjeta = (valor, rotulo, barra) => `
    <article class="tarjeta dato">
      <div class="dato__valor">${valor}</div>
      <div class="dato__rotulo">${rotulo}</div>
      ${barra === undefined ? '' : `<div class="barra-progreso"><div class="barra-progreso__relleno" style="width:${barra}%"></div></div>`}
    </article>`;
  $('#progresoLista').innerHTML =
    tarjeta(d.algebra.total ? pct(d.algebra) + '%' : '—', `Álgebra: ${d.algebra.ok} de ${d.algebra.total} ejercicios`, pct(d.algebra)) +
    tarjeta(d.fracciones.total ? pct(d.fracciones) + '%' : '—', `Fracciones: ${d.fracciones.ok} de ${d.fracciones.total} ejercicios`, pct(d.fracciones)) +
    tarjeta(d.evaluacion ? d.evaluacion + '%' : '—', 'Mejor resultado en la evaluación', d.evaluacion) +
    tarjeta(d.contrarreloj || '—', 'Mejor puntaje en Contrarreloj') +
    tarjeta(d.memoria || '—', 'Menos intentos en Memoria') +
    tarjeta(d.semejantes ? d.semejantes + '/10' : '—', 'Mejor puntaje en ¿Semejantes?');
}
 
function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  Almacen.datos.tema = tema;
  Almacen.guardar();
}
 
function arrancar() {
  Almacen.cargar();
 
  const selTema = $('#selectorTema');
  selTema.value = Almacen.datos.tema;
  document.documentElement.dataset.tema = Almacen.datos.tema;
  selTema.addEventListener('change', () => aplicarTema(selTema.value));
 
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ir]');
    if (b) ir(b.dataset.ir);
  });
 
  $('#ejEquivalentes').innerHTML = `${fracHTML(1, 2)} = ${fracHTML(2, 4)} = ${fracHTML(3, 6)}`;
  $('#ejDivision').innerHTML = `${fracHTML(2, 3)} ÷ ${fracHTML(4, 5)} = ${fracHTML(2, 3)} × ${fracHTML(5, 4)} = ${fracHTML(10, 12)} = ${fracHTML(5, 6)}`;
  iniciarLabAlgebra();
  iniciarLabFracciones();
  crearPractica($('#practicaAlgebra'), 'algebra', genAlgebra);
  crearPractica($('#practicaFracciones'), 'fracciones', genFraccion);
  iniciarEjemplos();
  iniciarJuegos();
  iniciarEvaluacion();
 
  $('#btnReiniciar').addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar tu progreso?')) { Almacen.reiniciar(); pintarProgreso(); }
  });
 
  ir(location.hash.replace('#', '') || 'inicio');
}
 
document.addEventListener('DOMContentLoaded', arrancar);