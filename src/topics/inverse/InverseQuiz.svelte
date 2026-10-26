<!-- A run of Inverse trig questions: Practice and the Guide's exam, on the shared Practice screen. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Practice, { type PracticeView } from '../../practice/Practice.svelte';
  import { invQuiz, type InvSession } from './quiz.svelte.ts';
  import { angleTex } from '../../core/angles.ts';
  import { progress } from '../../core/progress.svelte.ts';
  import { NOUN, domainTex, explain, hintMsg, hintTip, qTex, task, type IQ } from './quiz.ts';

  let { session = invQuiz, trailing }: { session?: InvSession; trailing?: Snippet } = $props();
  const unit = $derived(progress.unit);
  const view: PracticeView<IQ, number> = {
    ariaLabel: (strict) => (strict ? 'Inverse trig exam' : 'Inverse trig practice'),
    label: (q) => (q.t === 3 ? `Set the ${NOUN[q.fn]}` : 'Find the angle'),
    promptTex: (q) => (q.t === 3 ? qTex(q, unit) : `${qTex(q, unit)}=\\ ?`),
    subTex: (q) => (q.t === 2 ? domainTex(q.dom, unit) : null),
    task: (q) => task(q, unit),
    choiceTex: (_, c) => angleTex(c, unit),
    explain: (q) => explain(q, unit),
    hintMsg: (q) => hintMsg(q, unit),
    hintTip: (q) => hintTip(q),
    missedTex: (q) => qTex(q, unit),
    checklist: { asin: 'arcsin', acos: 'arccos', atan: 'arctan', compose: 'arcsin(sin θ)' },
    color: 'var(--slope)',
  };
</script>

<Practice {session} {view} {trailing} />
