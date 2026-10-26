// The Unit circle guide. It starts from the point's shadows on the axes, names them cos and sin,
// finds the right triangle they make, earns the exact values from the 45° and the half-equilateral
// triangles, and then carries them round the circle by mirroring: signs by quadrant, the reference
// angle, and tan as the ray's slope. Angles are written in the learner's unit, so the guide is
// built for one.
import type { Unit } from '../../core/angles.ts';
import { angleTex, angleText } from '../../core/angles.ts';
import type { Step } from '../../guide/guide.ts';
import type { Feature } from './features.ts';

const m = (t: string) => ({ m: t });

export function unitCircleGuide(u: Unit): Step<Feature>[] {
  const a = (deg: number) => m(angleTex(deg, u)),
    at = (deg: number) => angleTex(deg, u);
  return [
    {
      id: 'shadows',
      title: 'Every point casts two shadows',
      say: [
        [
          'This circle has radius ',
          m('1'),
          ' and its middle at the origin. The point sits on its edge, an angle ',
          m('\\theta'),
          ' round from the right.',
        ],
        [
          "Shine a light straight down and the point casts a shadow on the x-axis; shine one from the side and it casts one on the y-axis. Those two shadows are just the point's coordinates, ",
          m('x'),
          ' and ',
          m('y'),
          '.',
        ],
      ],
      features: ['ray', 'angle', 'shadows'],
      task: {
        kind: 'drag',
        prompt: ['Move the point so its shadow on the x-axis shrinks to nothing.'],
        deg: 90,
        also: [270],
        tol: 2,
        right: ['Straight up (or down), the point is right above the origin, so ', m('x=0'), '.'],
      },
    },
    {
      id: 'names',
      title: 'Name the shadows',
      say: [
        [
          'These two shadows are the whole idea of trigonometry. The x-shadow is called ',
          m('\\cos\\theta'),
          ' and the y-shadow ',
          m('\\sin\\theta'),
          '.',
        ],
        [
          'So the point at angle ',
          m('\\theta'),
          ' is ',
          m('(\\cos\\theta,\\ \\sin\\theta)'),
          '. A shadow pointing left or down is negative.',
        ],
      ],
      features: ['ray', 'angle', 'shadows', 'names'],
      task: {
        kind: 'choice',
        prompt: ['At ', a(180), ', what is ', m('\\cos\\theta'), '?'],
        choices: ['-1', '0', '1', '\\tfrac{1}{2}'],
        answer: 0,
        right: [
          'Yes. At ',
          a(180),
          ' the point is at ',
          m('(-1,\\ 0)'),
          ': a whole radius to the left.',
        ],
        wrong: [
          'Not quite. Drag the point to ',
          a(180),
          ' and look at its x-shadow: which way does it point, and how long is it?',
        ],
      },
    },
    {
      id: 'triangle',
      title: 'It is a right triangle',
      say: [
        [
          'Drop a line from the point to the x-axis and you get a right triangle. Its flat side is ',
          m('\\cos\\theta'),
          ', its upright side is ',
          m('\\sin\\theta'),
          ', and its long side is the radius, ',
          m('1'),
          '.',
        ],
        ['Pythagoras says the two short sides squared add up to the long side squared:'],
        [m('\\cos^2\\theta+\\sin^2\\theta=1')],
      ],
      features: ['ray', 'angle', 'shadows', 'names', 'triangle', 'hyp'],
      task: {
        kind: 'choice',
        prompt: [
          'A point in the top-right quarter has ',
          m('\\sin\\theta=0.6'),
          '. What is ',
          m('\\cos\\theta'),
          '?',
        ],
        choices: ['0.8', '0.4', '0.6', '1.6'],
        answer: 0,
        right: ['Yes: ', m('\\cos^2\\theta=1-0.36=0.64'), ', so ', m('\\cos\\theta=0.8'), '.'],
        wrong: ['Not quite. Square 0.6, take it away from 1, then take the square root.'],
      },
    },
    {
      id: 'forty-five',
      title: `The ${angleText(45, u)} triangle`,
      say: [
        [
          'At ',
          a(45),
          ' the ray is halfway between the axes, so the two legs are the same length. Call it ',
          m('s'),
          '.',
        ],
        [
          m(
            's^2+s^2=1\\ \\Rightarrow\\ s^2=\\tfrac{1}{2}\\ \\Rightarrow\\ s=\\tfrac{1}{\\sqrt{2}}',
          ),
          ' (which is also ',
          m('\\tfrac{\\sqrt{2}}{2}'),
          ', about 0.707).',
        ],
      ],
      features: ['ray', 'angle', 'shadows', 'names', 'triangle', 'hyp', 'equal'],
      task: {
        kind: 'choice',
        prompt: ['What is the point at ', a(45), '?'],
        choices: [
          '\\left(\\tfrac{1}{\\sqrt{2}},\\ \\tfrac{1}{\\sqrt{2}}\\right)',
          '\\left(\\tfrac{1}{2},\\ \\tfrac{1}{2}\\right)',
          '\\left(\\tfrac{\\sqrt{3}}{2},\\ \\tfrac{1}{2}\\right)',
          '(1,\\ 1)',
        ],
        answer: 0,
        right: [
          'Yes. Both legs are ',
          m('\\tfrac{1}{\\sqrt{2}}\\approx0.707'),
          ', which you can see on the shadows.',
        ],
        wrong: [
          'Not quite. Both legs are equal and their squares add up to 1, so each square is a half.',
        ],
      },
    },
    {
      id: 'thirty',
      title: 'Half an equilateral triangle',
      say: [
        [
          'Put the point at ',
          a(30),
          ' and mirror its triangle below the axis. The two together make a triangle whose angles are all ',
          a(60),
          ': every side is ',
          m('1'),
          '.',
        ],
        [
          'The upright side of that big triangle is ',
          m('1'),
          ', and ',
          m('\\sin\\theta'),
          ' is exactly half of it. Pythagoras gives the other leg:',
        ],
        [m('\\cos\\theta=\\sqrt{1-\\tfrac{1}{4}}=\\tfrac{\\sqrt{3}}{2}')],
      ],
      features: ['ray', 'angle', 'shadows', 'names', 'triangle', 'hyp', 'equilateral'],
      task: {
        kind: 'choice',
        prompt: ['What is ', m(`\\sin ${at(30)}`), '?'],
        choices: [
          '\\tfrac{1}{2}',
          '\\tfrac{\\sqrt{3}}{2}',
          '\\tfrac{1}{\\sqrt{2}}',
          '\\tfrac{1}{3}',
        ],
        answer: 0,
        right: ['Yes: half of the side of length ', m('1'), '.'],
        wrong: [
          "Not quite. The sin leg is half of the big triangle's upright side, and that side is 1.",
        ],
      },
    },
    {
      id: 'sixty',
      title: 'Stand it on its end',
      say: [
        [
          'At ',
          a(60),
          ' it is the same triangle, stood on its other end: the legs swap. Now the flat side is the short one.',
        ],
        [m(`\\cos ${at(60)}=\\tfrac{1}{2},\\quad \\sin ${at(60)}=\\tfrac{\\sqrt{3}}{2}`)],
        [
          'These three triangles hold every exact value you will need. The rest of the circle reuses them.',
        ],
      ],
      features: ['ray', 'angle', 'shadows', 'names', 'triangle', 'hyp', 'exact'],
      task: {
        kind: 'choice',
        prompt: ['What is ', m(`\\cos ${at(60)}`), '?'],
        choices: ['\\tfrac{1}{2}', '\\tfrac{\\sqrt{3}}{2}', '\\tfrac{1}{\\sqrt{2}}', '1'],
        answer: 0,
        right: [
          'Yes. The flat side of the stood-up triangle is the short one, ',
          m('\\tfrac{1}{2}'),
          '.',
        ],
        wrong: [
          'Not quite. At this angle the triangle is the one from ',
          a(30),
          ' with its legs swapped.',
        ],
      },
    },
    {
      id: 'mirror',
      title: 'Mirror it round the circle',
      say: [
        [
          'Flip the triangle across an axis and it lands in another quarter of the circle, the same size. Only the directions of its legs change.',
        ],
        [
          'So ',
          a(150),
          ' has the same triangle as ',
          a(30),
          ', flipped to the left: its x-shadow is negative.',
        ],
      ],
      features: ['ray', 'angle', 'shadows', 'names', 'triangle', 'exact', 'mirror', 'coords'],
      task: {
        kind: 'drag',
        prompt: ['Put the point at ', a(150), '.'],
        deg: 150,
        tol: 2,
        right: [
          'It is ',
          m('\\left(-\\tfrac{\\sqrt{3}}{2},\\ \\tfrac{1}{2}\\right)'),
          ': the ',
          a(30),
          ' point, flipped to the left.',
        ],
      },
    },
    {
      id: 'signs',
      title: 'Where each value is positive',
      say: [
        [
          m('\\cos\\theta'),
          ' is the x-coordinate, so it is positive on the right half of the circle, shaded blue.',
        ],
        [m('\\sin\\theta'), ' is the y-coordinate, so it is positive on the top half, shaded red.'],
        [
          'The top-right quarter is in both halves, so both are positive there. The bottom-left quarter is in neither, so both are negative.',
        ],
      ],
      features: ['ray', 'angle', 'shadows', 'names', 'exact', 'quads', 'coords'],
      task: {
        kind: 'choice',
        prompt: [
          'In which quadrant are ',
          m('\\cos\\theta'),
          ' and ',
          m('\\sin\\theta'),
          ' both negative?',
        ],
        choices: ['\\text{I}', '\\text{II}', '\\text{III}', '\\text{IV}'],
        answer: 2,
        right: ['Yes. Quadrant III is the quarter neither color covers.'],
        wrong: ['Not quite. Look for the quarter that neither color covers.'],
      },
    },
    {
      id: 'reference',
      title: 'The reference angle',
      say: [
        [
          'To find any value: measure how far the ray is from the nearest x-axis. That is the reference angle, and it tells you which triangle you have.',
        ],
        [
          'Then read the signs off the quadrant. For example ',
          a(210),
          ' is ',
          a(30),
          ' past the left axis, in quadrant III:',
        ],
        [m(`\\sin ${at(210)}=-\\sin ${at(30)}=-\\tfrac{1}{2}`)],
      ],
      features: ['ray', 'angle', 'shadows', 'names', 'triangle', 'exact', 'quads', 'ref'],
      task: {
        kind: 'choice',
        prompt: ['What is ', m(`\\sin ${at(240)}`), '?'],
        choices: [
          '-\\tfrac{\\sqrt{3}}{2}',
          '\\tfrac{\\sqrt{3}}{2}',
          '-\\tfrac{1}{2}',
          '\\tfrac{1}{2}',
        ],
        answer: 0,
        right: [
          'Yes. The reference angle is ',
          a(60),
          ', so the size is ',
          m('\\tfrac{\\sqrt{3}}{2}'),
          ', and below the axis it is negative.',
        ],
        wrong: [
          'Not quite. ',
          a(240),
          ' is ',
          a(60),
          ' past the left axis, and below it sin is negative.',
        ],
      },
    },
    {
      id: 'tangent',
      title: 'tan is the steepness',
      say: [
        ['The third function, ', m('\\tan\\theta'), ', says how steep the ray is.'],
        [
          'Going out along the ray, you move across by the run, ',
          m('\\cos\\theta'),
          ', and up by the rise, ',
          m('\\sin\\theta'),
          '. Steepness is rise divided by run:',
        ],
        [m('\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}')],
        [
          'A flat ray has ',
          m('\\tan\\theta=0'),
          '. The steeper the ray, the bigger ',
          m('\\tan\\theta'),
          '. Straight up there is no run, so ',
          m(`\\tan ${at(90)}`),
          ' is undefined.',
        ],
      ],
      features: ['ray', 'angle', 'shadows', 'names', 'triangle', 'exact', 'slope'],
      task: {
        kind: 'drag',
        prompt: ['Put the point where the rise equals the run.'],
        deg: 45,
        also: [225],
        tol: 2,
        right: [
          'Yes. When rise equals run, ',
          m('\\tan\\theta=1'),
          '. At ',
          a(225),
          ' both are negative, so the slope is 1 there too.',
        ],
      },
    },
    {
      id: 'check',
      title: 'Show what you know',
      say: [
        [
          'Last step: correctly answer ten questions in a row with no hints, with at least one each of sin, cos and tan. Getting one wrong resets your streak.',
        ],
      ],
      features: ['ray', 'angle'],
      task: { kind: 'exam' },
    },
  ];
}
