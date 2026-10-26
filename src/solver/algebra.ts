// The equation workshop's algebra, on mathjs expression trees. mathjs parses, cancels and folds;
// this file adds the trig vocabulary (csc = 1/sin, …), the exact display of constants like √3/2,
// and the operations a learner applies to both sides of an equation. Everything is in terms of θ,
// written `theta`.
import type { MathNode, ConstantNode, FunctionNode, OperatorNode } from 'mathjs';
import { math } from '../core/math.ts';

export type Atom = 'sin' | 'cos' | 'tan' | 'csc' | 'sec' | 'cot';
export type Expr = MathNode;
export type Eq = { l: Expr; r: Expr };

export const atom = (n: Atom): Expr => math.parse(`${n}(theta)`);
export const num = (v: number): Expr => new math.ConstantNode(v);

const TRIG = new Set(['sin', 'cos', 'tan', 'csc', 'sec', 'cot']);
const isTrig = (n: MathNode): n is FunctionNode =>
  n.type === 'FunctionNode' &&
  TRIG.has((n as FunctionNode).fn.name) &&
  (n as FunctionNode).args[0]?.type === 'SymbolNode';
const hasTheta = (n: MathNode) =>
  n.filter((c) => c.type === 'SymbolNode' && (c as unknown as { name: string }).name === 'theta')
    .length > 0;

// Exact forms for the values the unit circle produces; anything else shows as a decimal.
const R2 = Math.SQRT2,
  R3 = Math.sqrt(3);
const EXACT: [number, string][] = [
  [1 / 2, '\\frac{1}{2}'],
  [R2 / 2, '\\frac{1}{\\sqrt{2}}'],
  [R3 / 2, '\\frac{\\sqrt{3}}{2}'],
  [R3 / 3, '\\frac{1}{\\sqrt{3}}'],
  [R2, '\\sqrt{2}'],
  [R3, '\\sqrt{3}'],
  [(2 * R3) / 3, '\\frac{2}{\\sqrt{3}}'],
];
export function exactTex(v: number): string {
  const m = Math.abs(v),
    sign = v < 0 ? '-' : '';
  if (Math.abs(m - Math.round(m)) < 1e-9) return sign + Math.round(m);
  const hit = EXACT.find(([x]) => Math.abs(x - m) < 1e-9);
  return sign + (hit ? hit[1] : m.toFixed(3));
}

// LaTeX as the app writes it: \sin\theta (no brackets), \sin^{2}\theta, constants in exact form
const handler = (node: MathNode, options: object): string | undefined => {
  if (node.type === 'ConstantNode') return exactTex(Number((node as ConstantNode).value));
  if (isTrig(node)) return `\\${node.fn.name}\\theta`;
  const op = node as OperatorNode;
  if (
    op.type === 'OperatorNode' &&
    op.op === '^' &&
    isTrig(op.args[0]) &&
    op.args[1].type === 'ConstantNode'
  )
    return `\\${(op.args[0] as FunctionNode).fn.name}^{${(op.args[1] as ConstantNode).value}}\\theta`;
  void options;
  return undefined;
};
export const tex = (x: Expr) => x.toTex({ handler, parenthesis: 'auto' });
export const eqTex = (e: Eq) => `${tex(e.l)}=${tex(e.r)}`;
const same = (a: Expr, b: Expr) => tex(a) === tex(b);

const isOne = (x: Expr) =>
  x.type === 'ConstantNode' && Math.abs(Number((x as ConstantNode).value) - 1) < 1e-9;
export function reciprocal(x: Expr): Expr {
  const op = x as OperatorNode;
  if (op.type === 'OperatorNode' && op.op === '/')
    return isOne(op.args[0])
      ? op.args[1]
      : new math.OperatorNode('/', 'divide', [op.args[1], op.args[0]]);
  return new math.OperatorNode('/', 'divide', [num(1), x]);
}
export const times = (x: Expr, g: Expr): Expr => new math.OperatorNode('*', 'multiply', [x, g]);

const IN_SIN_COS: Record<string, string> = {
  tan: 'sin(theta)/cos(theta)',
  csc: '1/sin(theta)',
  sec: '1/cos(theta)',
  cot: 'cos(theta)/sin(theta)',
};
export const inSinCos = (x: Expr): Expr =>
  x.transform((n) =>
    isTrig(n) && IN_SIN_COS[n.fn.name]
      ? new math.ParenthesisNode(math.parse(IN_SIN_COS[n.fn.name]))
      : n,
  );

// for cancelling, csc/sec/cot become negative powers of sin/cos/tan; a lone function (csc θ) keeps
// its name
const AS_POWER: Record<string, string> = {
  csc: 'sin(theta)^(-1)',
  sec: 'cos(theta)^(-1)',
  cot: 'tan(theta)^(-1)',
};
export function simplify(x: Expr): Expr {
  if (isTrig(x) || x.type === 'ConstantNode') return x;
  const powers = x.transform((n) =>
    isTrig(n) && AS_POWER[n.fn.name] ? math.parse(AS_POWER[n.fn.name]) : n,
  );
  // then any piece without θ in it is just a number: fold it, so √3 shows exactly instead of as
  // 1.732
  const foldable = (n: MathNode) =>
    ['OperatorNode', 'FunctionNode', 'ParenthesisNode'].includes(n.type) && !hasTheta(n);
  return math.simplify(powers).transform((n) => (foldable(n) ? num(n.evaluate()) : n));
}

export type Op = { kind: 'reciprocal' | 'inSinCos' | 'simplify' } | { kind: 'times'; by: Atom | 2 };
export function apply(e: Eq, op: Op): Eq {
  switch (op.kind) {
    case 'reciprocal':
      return { l: reciprocal(e.l), r: reciprocal(e.r) };
    case 'inSinCos':
      return { l: inSinCos(e.l), r: inSinCos(e.r) };
    case 'simplify':
      return { l: simplify(e.l), r: simplify(e.r) };
    case 'times': {
      const g = op.by === 2 ? num(2) : atom(op.by);
      return { l: times(e.l, g), r: times(e.r, g) };
    }
  }
}
/** False when the operation would leave the equation unchanged (the key greys out). */
export const changes = (e: Eq, op: Op) => {
  const n = apply(e, op);
  return !same(n.l, e.l) || !same(n.r, e.r);
};
export const isIdentity = (e: Eq) => same(e.l, e.r);

/** sin, cos or tan alone on one side and a number on the other: ready to read off the circle. */
export function solvedForm(e: Eq): { fn: 'sin' | 'cos' | 'tan'; v: number } | null {
  for (const [a, b] of [
    [e.l, e.r],
    [e.r, e.l],
  ])
    if (isTrig(a) && ['sin', 'cos', 'tan'].includes(a.fn.name) && !hasTheta(b))
      return { fn: a.fn.name as 'sin' | 'cos' | 'tan', v: b.evaluate() };
  return null;
}

export const DEFINITIONS: Record<'csc' | 'sec' | 'cot', Eq> = {
  csc: { l: atom('csc'), r: math.parse('1/sin(theta)') },
  sec: { l: atom('sec'), r: math.parse('1/cos(theta)') },
  cot: { l: atom('cot'), r: math.parse('1/tan(theta)') },
};
