// A tiny expression tree for the equation workshop: trig atoms (with powers), exact constants, products and fractions.
// Operations apply to both sides of an equation; simplify() cancels via a canonical form where
// csc = sin⁻¹, sec = cos⁻¹, cot = tan⁻¹.

export type Atom = 'sin' | 'cos' | 'tan' | 'csc' | 'sec' | 'cot';
export type Expr =
  | { t: 'a'; n: Atom; p: number }
  | { t: 'n'; v: number }
  | { t: 'm'; xs: Expr[] }
  | { t: 'd'; a: Expr; b: Expr };
export type Eq = { l: Expr; r: Expr };

export const atom = (n: Atom, p = 1): Expr => ({ t: 'a', n, p });
export const num = (v: number): Expr => ({ t: 'n', v });
export const mul = (...xs: Expr[]): Expr => ({ t: 'm', xs });
export const frac = (a: Expr, b: Expr): Expr => ({ t: 'd', a, b });

export function tex(x: Expr): string {
  switch (x.t) {
    case 'a': return `\\${x.n}${x.p > 1 ? `^{${x.p}}` : ''}\\theta`;
    case 'n': return exactTex(x.v);
    case 'm': return x.xs.map((y) => (y.t === 'd' ? `\\left(${tex(y)}\\right)` : tex(y))).join('\\cdot');
    case 'd': return `\\frac{${tex(x.a)}}{${tex(x.b)}}`;
  }
}
export const eqTex = (e: Eq) => `${tex(e.l)}=${tex(e.r)}`;
export const same = (a: Expr, b: Expr) => tex(a) === tex(b);

const isOne = (x: Expr) => x.t === 'n' && Math.abs(x.v - 1) < 1e-9;

// Exact forms for the values the unit circle produces; anything else shows as a decimal.
const R2 = Math.SQRT2, R3 = Math.sqrt(3);
const EXACT: [number, string][] = [
  [1 / 2, '\\frac{1}{2}'], [R2 / 2, '\\frac{\\sqrt{2}}{2}'], [R3 / 2, '\\frac{\\sqrt{3}}{2}'], [R3 / 3, '\\frac{\\sqrt{3}}{3}'],
  [R2, '\\sqrt{2}'], [R3, '\\sqrt{3}'], [(2 * R3) / 3, '\\frac{2\\sqrt{3}}{3}'],
];
export function exactTex(v: number): string {
  const m = Math.abs(v), sign = v < 0 ? '-' : '';
  if (Math.abs(m - Math.round(m)) < 1e-9) return sign + Math.round(m);
  const hit = EXACT.find(([x]) => Math.abs(x - m) < 1e-9);
  return sign + (hit ? hit[1] : m.toFixed(3));
}
export const reciprocal = (x: Expr): Expr => (x.t === 'd' ? (isOne(x.a) ? x.b : frac(x.b, x.a)) : frac(num(1), x));
export const times = (x: Expr, g: Expr): Expr => (x.t === 'm' ? mul(...x.xs, g) : mul(x, g));

const IN_SIN_COS: Partial<Record<Atom, () => Expr>> = {
  tan: () => frac(atom('sin'), atom('cos')),
  csc: () => frac(num(1), atom('sin')),
  sec: () => frac(num(1), atom('cos')),
  cot: () => frac(atom('cos'), atom('sin')),
};
export function inSinCos(x: Expr): Expr {
  switch (x.t) {
    case 'a': {
      const f = IN_SIN_COS[x.n];
      if (!f) return x;
      return x.p > 1 ? mul(...Array.from({ length: x.p }, f)) : f();
    }
    case 'm': return mul(...x.xs.map(inSinCos));
    case 'd': return frac(inSinCos(x.a), inSinCos(x.b));
    default: return x;
  }
}

type Canon = { c: number; e: Record<'sin' | 'cos' | 'tan', number> };
const BASE: Record<Atom, ['sin' | 'cos' | 'tan', number]> = {
  sin: ['sin', 1], cos: ['cos', 1], tan: ['tan', 1], csc: ['sin', -1], sec: ['cos', -1], cot: ['tan', -1],
};
const cmul = (a: Canon, b: Canon): Canon => ({ c: a.c * b.c, e: { sin: a.e.sin + b.e.sin, cos: a.e.cos + b.e.cos, tan: a.e.tan + b.e.tan } });
function canon(x: Expr): Canon {
  switch (x.t) {
    case 'a': {
      const [b, s] = BASE[x.n], e = { sin: 0, cos: 0, tan: 0 };
      e[b] = s * x.p;
      return { c: 1, e };
    }
    case 'n': return { c: x.v, e: { sin: 0, cos: 0, tan: 0 } };
    case 'm': return x.xs.map(canon).reduce(cmul);
    case 'd': {
      const a = canon(x.a), b = canon(x.b);
      return cmul(a, { c: 1 / b.c, e: { sin: -b.e.sin, cos: -b.e.cos, tan: -b.e.tan } });
    }
  }
}
function fromCanon(k: Canon): Expr {
  const up: Expr[] = [], dn: Expr[] = [];
  if (Math.abs(k.c - 1) > 1e-9) up.push(num(k.c));
  for (const b of ['sin', 'cos', 'tan'] as const) {
    if (k.e[b] > 0) up.push(atom(b, k.e[b]));
    if (k.e[b] < 0) dn.push(atom(b, -k.e[b]));
  }
  const pack = (l: Expr[]) => (l.length === 1 ? l[0] : mul(...l));
  const top = up.length ? pack(up) : num(1);
  return dn.length ? frac(top, pack(dn)) : top;
}
/** Cancel and collect; a lone atom (like csc θ) keeps its name. */
export const simplify = (x: Expr): Expr => (x.t === 'a' ? x : fromCanon(canon(x)));

export type Op = { kind: 'reciprocal' | 'inSinCos' | 'simplify' } | { kind: 'times'; by: Atom | 2 };
export function apply(e: Eq, op: Op): Eq {
  switch (op.kind) {
    case 'reciprocal': return { l: reciprocal(e.l), r: reciprocal(e.r) };
    case 'inSinCos': return { l: inSinCos(e.l), r: inSinCos(e.r) };
    case 'simplify': return { l: simplify(e.l), r: simplify(e.r) };
    case 'times': {
      const g = op.by === 2 ? num(2) : atom(op.by);
      return { l: times(e.l, g), r: times(e.r, g) };
    }
  }
}
/** False when the operation would leave the equation unchanged (the button greys out). */
export const changes = (e: Eq, op: Op) => {
  const n = apply(e, op);
  return !same(n.l, e.l) || !same(n.r, e.r);
};
export const isIdentity = (e: Eq) => same(e.l, e.r);

/** sin, cos or tan alone on one side and a constant on the other: ready to read off the circle. */
export function solvedForm(e: Eq): { fn: 'sin' | 'cos' | 'tan'; v: number } | null {
  for (const [a, b] of [[e.l, e.r], [e.r, e.l]])
    if (a.t === 'a' && a.p === 1 && (a.n === 'sin' || a.n === 'cos' || a.n === 'tan') && b.t === 'n') return { fn: a.n, v: b.v };
  return null;
}

export const DEFINITIONS: Record<'csc' | 'sec' | 'cot', Eq> = {
  csc: { l: atom('csc'), r: frac(num(1), atom('sin')) },
  sec: { l: atom('sec'), r: frac(num(1), atom('cos')) },
  cot: { l: atom('cot'), r: frac(num(1), atom('tan')) },
};
