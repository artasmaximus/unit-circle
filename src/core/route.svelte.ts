// The address follows the app: `?topic=inverse&mode=practice` names where the learner is, so a
// link, a reload or the back button lands there. A topic switch adds a history entry, a mode
// switch only rewrites the current one; everything else in the address (`?unlock=radians`)
// is left alone. The address is read on load in startApp (app.svelte.ts).
import { setMode, setTopic, topics, ui } from './app.svelte.ts';
import { fromSearch, toSearch } from './nav.ts';
import { progress } from './progress.svelte.ts';

/**
 * Keep the address in step with the app, and the app in step with back and forward. Called once,
 * while the root component is being set up.
 */
export function followAddress() {
  let topic: string | null = null;
  $effect(() => {
    const search = toSearch(location.search, ui.topic, ui.mode);
    if (search === location.search) return void (topic = ui.topic);
    // the first write replaces the address the page was opened with
    history[topic === null || topic === ui.topic ? 'replaceState' : 'pushState'](
      null,
      '',
      search + location.hash,
    );
    topic = ui.topic;
  });
  const onpop = () => {
    const at = fromSearch(location.search, topics, progress.completed);
    if (at.topic) setTopic(at.topic);
    if (at.mode) setMode(at.mode);
  };
  addEventListener('popstate', onpop);
}
