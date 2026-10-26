<!-- The Radians Practice panel. -->
<script lang="ts">
  import RadiansQuiz from './RadiansQuiz.svelte';
  import { radians } from './state.svelte.ts';
</script>

<RadiansQuiz session={radians.practice} />
