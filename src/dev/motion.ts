// Dev-only motion log: what each mark layer did while the app moved from one state to another. The
// mark layer reports every frame in which marks entered, left or changed; `begin` / `end` bracket a
// switch, and `end` says, per layer, how many marks entered, left and changed, which kinds of mark
// those were (a key's first part), and how long the layer kept moving. The browser console reads
// it as `__motion`; nothing here runs in a production build.
type Frame = { layer: string; t: number; added: string[]; removed: string[]; changed: string[] };

let frames: Frame[] = [];
let t0 = 0;
let on = false;

export function recordMarks(layer: string, added: string[], removed: string[], changed: string[]) {
  if (!on || !(added.length || removed.length || changed.length)) return;
  frames.push({ layer, t: performance.now() - t0, added, removed, changed });
}

/** Marks that arrived with a switch and waited for the old figure to leave, per layer. */
const led: Record<string, number> = {};
export function recordLead(layer: string) {
  if (on) led[layer] = (led[layer] ?? 0) + 1;
}

/** What a layer has on the plane now: its live marks (key → how each looks) and how many are leaving. */
export type LayerNow = { live: Record<string, string>; leaving: number };
const probes = new Map<string, () => LayerNow>();
/** A mark layer offers a look at itself, for the switch check (dev/matrix.ts). */
export function registerLayer(name: string, probe: () => LayerNow) {
  probes.set(name, probe);
  return () => void probes.delete(name);
}
const plane = () => Object.fromEntries([...probes].map(([n, p]) => [n, p()]));

const kind = (key: string) => key.split(':').slice(0, 2).join(':');
const kinds = (keys: Set<string>) => [...new Set([...keys].map(kind))].sort();

export const motion = {
  /** Every layer's marks right now. */
  plane,
  /** How many frames each mark was seen changing in, per layer, since `begin`. */
  changes(): Record<string, Record<string, number>> {
    const out: Record<string, Record<string, number>> = {};
    for (const f of frames) {
      const o = (out[f.layer] ??= {});
      for (const k of f.changed) o[k] = (o[k] ?? 0) + 1;
    }
    return out;
  },
  begin() {
    frames = [];
    for (const k of Object.keys(led)) delete led[k];
    t0 = performance.now();
    on = true;
  },
  /** Per layer: marks that entered, left and changed, their kinds, and the span the layer moved over. */
  end() {
    on = false;
    const out: Record<
      string,
      { in: number; out: number; changed: number; kinds: string[]; led: number; spanMs: number }
    > = {};
    for (const layer of new Set(frames.map((f) => f.layer))) {
      const fs = frames.filter((f) => f.layer === layer);
      const a = new Set(fs.flatMap((f) => f.added)),
        r = new Set(fs.flatMap((f) => f.removed)),
        c = new Set(fs.flatMap((f) => f.changed));
      out[layer] = {
        in: a.size,
        out: r.size,
        changed: c.size,
        kinds: kinds(new Set([...a, ...r, ...c])),
        led: led[layer] ?? 0,
        spanMs: Math.round(Math.max(...fs.map((f) => f.t)) - Math.min(...fs.map((f) => f.t))),
      };
    }
    return out;
  },
};

if (import.meta.env.DEV && typeof window !== 'undefined') (window as any).__motion = motion;
