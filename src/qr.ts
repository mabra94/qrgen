// The QR spec requires a quiet zone of 4 modules on every side. qr-code-styling
// takes margin in pixels, but it also derives the module size from that same
// margin: dot = (size - 2*margin) / modules. Requiring margin = 4 * dot makes it
// solvable: margin = 4 * size / (modules + 8). Using a fixed pixel margin instead
// leaves roughly a third of a module of quiet zone at export sizes, which real
// scanners reject even when the code itself is undamaged.
export const QUIET_ZONE_MODULES=4;
export const DEFAULT_MODULES=33;
export function quietZonePx(size:number,moduleCount:number):number{const modules=moduleCount>0?moduleCount:DEFAULT_MODULES;return Math.round((QUIET_ZONE_MODULES*size)/(modules+8));}
