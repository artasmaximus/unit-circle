// The Radians guide. The drawing's features (see radiansMarks.ts) come on one at a time, and each
// step asks for a little something before going on. It starts from the one fact to accept (a half
// turn is π radians), then explains why, then builds every familiar angle from pieces of π/6, π/4,
// π/3 and π/2.
import type { Step } from '../lib/guide.ts';
import type { Feature } from '../lib/radiansFeatures.ts';

const m = (t: string) => ({ m: t });

export const RADIANS_GUIDE: Step<Feature>[] = [
  {
    id: 'half-turn',
    title: 'A half turn is π',
    say: [
      [
        'You know a full turn is ',
        m('360^\\circ'),
        ' and a half turn is ',
        m('180^\\circ'),
        '. Radians are just another unit for the same turns.',
      ],
      [
        'In radians, a half turn is ',
        m('\\pi'),
        ' (about 3.14), and a full turn is ',
        m('2\\pi'),
        '. Nobody picks 360 for a reason either: it is a number we agreed on, and this is another one.',
      ],
    ],
    features: ['ray', 'degrees', 'half'],
    task: { kind: 'read' },
  },
  {
    id: 'why-pi',
    title: 'Why π?',
    say: [
      [
        "Take the circle's radius, which here is exactly ",
        m('1'),
        ', and lay it along the edge like a bendy ruler. Three lengths fit along the top half, with a little left over.',
      ],
      [
        'That little bit makes it ',
        m('3.14\\ldots'),
        ' lengths in all. It is the circumference formula in disguise: the whole way round is ',
        m('2\\pi r'),
        ', so half of it is ',
        m('\\pi\\times1'),
        '.',
      ],
      ['An angle in radians counts those radius-lengths along the edge.'],
    ],
    features: ['ray', 'degrees', 'radius', 'beads', 'half'],
    task: { kind: 'read' },
  },
  {
    id: 'full-turn',
    title: 'Check the turns',
    say: [['Half a turn is ', m('\\pi'), ' radians. A full turn is two halves.']],
    features: ['ray', 'degrees', 'half'],
    task: {
      kind: 'choice',
      prompt: ['How many radians make one full turn?'],
      choices: ['\\pi', '2\\pi', '360', '\\pi/2'],
      answer: 1,
      right: ['Yes. Two half turns make ', m('2\\pi'), ' radians.'],
      wrong: ['Not quite. A half turn is π, and a full turn is two half turns.'],
    },
  },
  {
    id: 'pieces',
    title: 'Pieces of π',
    say: [
      [
        'The angles you already know are all built from a few pieces of a half turn: ',
        m('\\pi/2'),
        ' (a quarter turn), ',
        m('\\pi/3'),
        ', ',
        m('\\pi/4'),
        ' and ',
        m('\\pi/6'),
        '.',
      ],
      [
        'The shading shows the angle as whole pieces of one size. At ',
        m('\\pi/3'),
        ' it is one piece, because three of them make a half turn.',
      ],
    ],
    features: ['ray', 'pi', 'slices', 'readout'],
    task: {
      kind: 'drag',
      prompt: ['Put the point at ', m('\\pi/3'), ' (one piece).'],
      deg: 60,
      tol: 3,
      right: ['That is one piece of ', m('\\pi/3'), ', which is ', m('60^\\circ'), '.'],
    },
  },
  {
    id: 'more-pieces',
    title: 'Count the pieces',
    say: [
      [
        'More pieces, bigger angle. ',
        m('2\\pi/3'),
        ' is two pieces of ',
        m('\\pi/3'),
        '. The top number counts the pieces; the bottom number says how many make a half turn.',
      ],
    ],
    features: ['ray', 'pi', 'slices', 'readout'],
    task: {
      kind: 'drag',
      prompt: ['Put the point at ', m('2\\pi/3'), ' (two pieces).'],
      deg: 120,
      tol: 3,
      right: ['Two pieces of ', m('\\pi/3'), ' make ', m('120^\\circ'), '.'],
    },
  },
  {
    id: 'fourths',
    title: 'Fourths and sixths',
    say: [
      [
        'The same idea works for any size. ',
        m('3\\pi/4'),
        ' is three pieces of ',
        m('\\pi/4'),
        ', and ',
        m('5\\pi/6'),
        ' is five pieces of ',
        m('\\pi/6'),
        '.',
      ],
    ],
    features: ['ray', 'pi', 'slices', 'readout'],
    task: {
      kind: 'drag',
      prompt: ['Put the point at ', m('3\\pi/4'), ' (three pieces of ', m('\\pi/4'), ').'],
      deg: 135,
      tol: 3,
      right: ['Three pieces of ', m('\\pi/4'), ' make ', m('135^\\circ'), '.'],
    },
  },
  {
    id: 'to-degrees',
    title: 'Radians to degrees',
    say: [
      [
        'Since ',
        m('\\pi'),
        ' is ',
        m('180^\\circ'),
        ', wherever you see ',
        m('\\pi'),
        ' you can swap it for ',
        m('180^\\circ'),
        ' and tidy up.',
      ],
      [m('\\dfrac{5\\pi}{6}=\\dfrac{5\\times180^\\circ}{6}=150^\\circ')],
    ],
    features: ['ray', 'pi', 'slices', 'readout'],
    task: {
      kind: 'choice',
      prompt: ['What is ', m('3\\pi/4'), ' in degrees?'],
      choices: ['135^\\circ', '120^\\circ', '45^\\circ', '270^\\circ'],
      answer: 0,
      right: ['Yes: ', m('\\dfrac{3\\times180^\\circ}{4}=135^\\circ'), '.'],
      wrong: ['Not quite. Swap π for 180°, then work out 3 × 180 ÷ 4.'],
    },
  },
  {
    id: 'to-radians',
    title: 'Degrees to radians',
    say: [
      [
        'Going the other way, multiply by ',
        m('\\dfrac{\\pi}{180^\\circ}'),
        '. The degrees cancel, which leaves radians:',
      ],
      [m('150^\\circ\\times\\dfrac{\\pi}{180^\\circ}=\\dfrac{150\\pi}{180}=\\dfrac{5\\pi}{6}')],
    ],
    features: ['ray', 'degrees', 'slices', 'readout'],
    task: {
      kind: 'choice',
      prompt: ['What is ', m('150^\\circ'), ' in radians?'],
      choices: ['5\\pi/6', '2\\pi/3', '3\\pi/4', '5\\pi/3'],
      answer: 0,
      right: ['Yes: ', m('150^\\circ\\times\\dfrac{\\pi}{180^\\circ}=\\dfrac{5\\pi}{6}'), '.'],
      wrong: [
        'Not quite. Multiply 150° by π/180°, so the degrees cancel, then simplify the fraction.',
      ],
    },
  },
  {
    id: 'check',
    title: 'Show what you know',
    say: [
      [
        'Last step: correctly answer ten questions in a row with no hints. Getting one wrong resets your streak.',
      ],
    ],
    features: ['ray', 'slices'],
    task: { kind: 'exam' },
  },
];
