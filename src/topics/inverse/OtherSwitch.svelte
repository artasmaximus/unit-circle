<script lang="ts">
  import Switch from '../../ui/Switch.svelte';
  import { inverse } from './state.svelte.ts';
</script>

<Switch
  label="Other angle"
  checked={inverse.showOther}
  onchange={(on) => (inverse.showOther = on)}
  tip="Shows the other angle that has the same value. It is outside the range, which is why the inverse never gives it."
/>
