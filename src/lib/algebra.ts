// A tiny expression tree for the equation workshop: trig atoms (with powers), integers, products and fractions.
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
    case 'n': return String(x.v);
    case 'm': return x.xs.map((y) => (y.t === 'd' ? `\\left(${tex(y)}\\right)` : tex(y))).join('\\cdot');
    case 'd': return `\\frac{${tex(x.a)}}{${tex(x.b)}}`;
  }
}
export const eqTex = (e: Eq) => `${tex(e.l)}=${tex(e.r)}`;
export const same = (a: Expr, b: Expr) => tex(a) === tex(b);

const isOne = (x: Expr) => x.t === 'n' && x.v === 1;
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

type Canon = { n: number; d: number; e: Record<'sin' | 'cos' | 'tan', number> };
const BASE: Record<Atom, ['sin' | 'cos' | 'tan', number]> = {
  sin: ['sin', 1], cos: ['cos', 1], tan: ['tan', 1], csc: ['sin', -1], sec: ['cos', -1], cot: ['tan', -1],
};
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
function cmul(a: Canon, b: Canon): Canon {
  const n = a.n * b.n, d = a.d * b.d, g = gcd(n, d) || 1;
  return { n: n / g, d: d / g, e: { sin: a.e.sin + b.e.sin, cos: a.e.cos + b.e.cos, tan: a.e.tan + b.e.tan } };
}
function canon(x: Expr): Canon {
  switch (x.t) {
    case 'a': {
      const [b, s] = BASE[x.n], e = { sin: 0, cos: 0, tan: 0 };
      e[b] = s * x.p;
      return { n: 1, d: 1, e };
    }
    case 'n': return { n: x.v, d: 1, e: { sin: 0, cos: 0, tan: 0 } };
    case 'm': return x.xs.map(canon).reduce(cmul);
    case 'd': {
      const a = canon(x.a), b = canon(x.b);
      return cmul(a, { n: b.d, d: b.n, e: { sin: -b.e.sin, cos: -b.e.cos, tan: -b.e.tan } });
    }
  }
}
function fromCanon(c: Canon): Expr {
  const up: Expr[] = [], dn: Expr[] = [];
  if (c.n !== 1) up.push(num(c.n));
  if (c.d !== 1) dn.push(num(c.d));
  for (const b of ['sin', 'cos', 'tan'] as const) {
    if (c.e[b] > 0) up.push(atom(b, c.e[b]));
    if (c.e[b] < 0) dn.push(atom(b, -c.e[b]));
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

export const DEFINITIONS: Record<'csc' | 'sec' | 'cot', Eq> = {
  csc: { l: atom('csc'), r: frac(num(1), atom('sin')) },
  sec: { l: atom('sec'), r: frac(num(1), atom('cos')) },
  cot: { l: atom('cot'), r: frac(num(1), atom('tan')) },
};
