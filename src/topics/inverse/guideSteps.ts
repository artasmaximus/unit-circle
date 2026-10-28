// The Inverse trig guide. It starts from going backwards (a value comes from two angles), shows
// how each inverse picks one answer by keeping one stretch of the circle (its range), takes
// arcsin, arccos and arctan in turn with their own controls, and ends on the classic mistake,
// arcsin(sin θ) ≠ θ. Angles are written in the learner's unit, so the guide is built for one.
// What each step puts on the plane is set up in guide.svelte.ts.
import type { Unit } from '../../core/angles.ts';
import { angleTex } from '../../core/angles.ts';
import type { Step } from '../../guide/guide.ts';
import { m } from '../../core/rich.ts';

export function inverseGuide(u: Unit): Step[] {
  const at = (deg: number) => angleTex(deg, u),
    a = (deg: number) => m(at(deg));
  return [
    {
      id: 'two-angles',
      title: 'Going backwards',
      say: [
        [
          'So far you started from an angle and found its value. An inverse goes the other way: it starts from a value and asks which angle gives it.',
        ],
        [
          'For ',
          m('\\sin\\theta=\\tfrac{1}{2}'),
          ' there are two angles on the circle: ',
          a(30),
          ' and one more. The point shows its y-value as you move it.',
        ],
      ],
      features: [],
      task: {
        kind: 'drag',
        prompt: ['Find the other angle where ', m('\\sin\\theta=\\tfrac{1}{2}'), '.'],
        deg: 150,
        tol: 2,
        how: ['Drag the point round the circle and watch its y-value.'],
        right: [
          'Yes, ',
          a(150),
          '. It is at the same height as ',
          a(30),
          ', mirrored across the y-axis.',
        ],
      },
    },
    {
      id: 'ranges',
      title: 'One answer each',
      say: [
        [
          'To answer with a single angle, each inverse uses only one stretch of the circle, where the value never repeats. That stretch is its range, shaded on the circle.',
        ],
        [
          m('\\arcsin'),
          ' uses the right half, from ',
          a(-90),
          ' to ',
          a(90),
          '. ',
          m('\\arccos'),
          ' uses the top half, from ',
          a(0),
          ' to ',
          a(180),
          '. ',
          m('\\arctan'),
          ' uses the right half without its two ends.',
        ],
      ],
      features: [],
      task: {
        kind: 'choice',
        prompt: ['Which half of the circle does ', m('\\arcsin'), ' use?'],
        choices: ['\\text{right}', '\\text{top}', '\\text{left}', '\\text{bottom}'],
        answer: 0,
        right: [
          'Yes. On the right half every height appears once, from ',
          m('-1'),
          ' at the bottom to ',
          m('1'),
          ' at the top.',
        ],
        wrong: ['Not quite. Look at the shaded half.'],
      },
    },
    {
      id: 'arcsin',
      title: 'arcsin',
      say: [
        [m('\\arcsin y'), ' answers: which angle in the right half has y-value ', m('y'), '?'],
        ['The value sits on the y-axis. Drag it, and the angle follows.'],
      ],
      features: [],
      task: {
        kind: 'drag',
        prompt: [
          'Set ',
          m('y=-\\tfrac{1}{2}'),
          ' and read off ',
          m('\\arcsin\\left(-\\tfrac{1}{2}\\right)'),
          '.',
        ],
        deg: -30,
        tol: 1,
        how: ['Drag the value along the y-axis.'],
        right: [
          'Yes: ',
          m(`\\arcsin\\left(-\\tfrac{1}{2}\\right)=${at(-30)}`),
          '. Below the x-axis, the angle is negative.',
        ],
      },
    },
    {
      id: 'arccos',
      title: 'arccos',
      say: [
        [m('\\arccos x'), ' answers: which angle in the top half has x-value ', m('x'), '?'],
        ['This time the value sits on the x-axis.'],
      ],
      features: [],
      task: {
        kind: 'drag',
        prompt: ['Set ', m('x=-\\tfrac{1}{2}'), ' and read off the angle.'],
        deg: 120,
        tol: 1,
        how: ['Drag the value along the x-axis.'],
        right: [
          'Yes: ',
          m(`\\arccos\\left(-\\tfrac{1}{2}\\right)=${at(120)}`),
          '. The answer stays in the top half, so it is ',
          a(120),
          ', not ',
          a(-120),
          '.',
        ],
      },
    },
    {
      id: 'arctan',
      title: 'arctan',
      say: [
        [
          m('\\arctan m'),
          ' answers: which angle has slope ',
          m('m'),
          '? The slope is ',
          m('\\tan\\theta'),
          ', rise over run, from the unit circle guide.',
        ],
        ['Every slope has exactly one ray in the right half, so that is its range.'],
      ],
      features: [],
      task: {
        kind: 'drag',
        prompt: ['Turn the ray to slope ', m('m=1'), '.'],
        deg: 45,
        tol: 1,
        how: ['Drag the ray round the circle.'],
        right: ['Yes: ', m(`\\arctan 1=${at(45)}`), '. That is where rise equals run.'],
      },
    },
    {
      id: 'trap',
      title: 'Undoing is not always the same angle',
      say: [
        [
          'It is tempting to think ',
          m('\\arcsin(\\sin\\theta)'),
          ' always gives back ',
          m('\\theta'),
          '. It only does when ',
          m('\\theta'),
          ' is in the range.',
        ],
        [
          'The point is at ',
          a(150),
          ', where the y-value is ',
          m('\\tfrac{1}{2}'),
          '. Then ',
          m('\\arcsin'),
          ' looks for the angle in the right half with that y-value.',
        ],
      ],
      features: [],
      task: {
        kind: 'choice',
        prompt: ['What is ', m(`\\arcsin(\\sin ${at(150)})`), '?'],
        choices: [at(30), at(150), at(-30), at(210)],
        answer: 0,
        right: [
          'Yes. ',
          m(`\\sin ${at(150)}=\\tfrac{1}{2}`),
          ', and ',
          m('\\arcsin'),
          ' answers from the right half: ',
          a(30),
          '.',
        ],
        wrong: [
          'Not quite. ',
          m('\\arcsin'),
          ' only answers with angles in the right half. Which angle there has y-value ',
          m('\\tfrac{1}{2}'),
          '?',
        ],
      },
    },
    {
      id: 'check',
      title: 'Final check',
      say: [
        [
          'Last step: answer ten questions in a row without hints, including at least one arcsin, one arccos, one arctan and one like ',
          m('\\arcsin(\\sin\\theta)'),
          '. A wrong answer resets the count.',
        ],
      ],
      features: [],
      task: { kind: 'exam' },
    },
  ];
}
