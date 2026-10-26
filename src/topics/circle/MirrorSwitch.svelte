<script lang="ts">
  import { circleUi } from './ui.svelte.ts';
  import Switch from '../../ui/Switch.svelte';
</script>

<Switch
  label="Mirror Point"
  checked={circleUi.mirror}
  onchange={(on) => (circleUi.mirror = on)}
  tip="Shows the other angles that have the same reference angle. In Practice it also shows the second angle with the same sin, cos or tan."
/>
