<!-- The unit circle's Practice, on the shared Practice screen. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import Practice from '../../practice/Practice.svelte';
  import { quiz } from './quiz.svelte.ts';
  import { circleView } from './practiceView.ts';

  let { trailing }: { trailing?: Snippet } = $props();
</script>

<Practice session={quiz} view={circleView} {trailing} />
