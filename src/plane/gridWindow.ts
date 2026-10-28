// The window the grid is built for. The grid is periodic, so the viewport's origin snaps down to a
// multiple of the pitch (the repeating cell: a major line to the next) and the size grows by one
// pitch, which still covers the viewport. The window changes only when a pan crosses a pitch step,
// and the plane's translate carries the grid smoothly between them. Pure, so it can be tested
// without the camera.

/** `v` rounded down to a multiple of `pitch` (floor, so negative coordinates step the same way). */
export const snapDown = (v: number, pitch: number) => Math.floor(v / pitch) * pitch;

export type Window = { x: number; y: number; w: number; h: number };

export function gridWindow(view: Window, pitch: number): Window {
  return {
    x: snapDown(view.x, pitch),
    y: snapDown(view.y, pitch),
    w: view.w + pitch,
    h: view.h + pitch,
  };
}
