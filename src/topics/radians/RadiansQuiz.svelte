<!-- A run of Radians questions: Practice and the Guide's exam, on the shared Practice screen. -->
<script lang="ts">
  import Practice, { type PracticeView } from '../../practice/Practice.svelte';
  import type { Session } from './state.svelte.ts';
  import {
    rChoiceTex,
    rExplain,
    rHintMsg,
    rHintTip,
    rLabel,
    rPromptTex,
    rTask,
    type RQ,
  } from './quiz.ts';

  let { session }: { session: Session } = $props();
  const view: PracticeView<RQ, number> = {
    ariaLabel: (strict) => (strict ? 'Radians exam' : 'Radians practice'),
    label: rLabel,
    promptTex: rPromptTex,
    task: rTask,
    choiceTex: rChoiceTex,
    explain: rExplain,
    hintMsg: () => rHintMsg(),
    hintTip: () => rHintTip(),
    missedTex: rPromptTex,
    checklist: { '1': 'degrees → radians', '2': 'radians → degrees', '3': 'placing the point' },
    color: 'var(--rad)',
  };
</script>

<Practice {session} {view} />
