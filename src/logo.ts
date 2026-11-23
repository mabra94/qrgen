import{quietZonePx}from'./qr';
export const MAX_LOGO_BYTES=2_000_000;
export const ALLOWED_LOGO_TYPES=['image/png','image/jpeg','image/webp','image/svg+xml'] as const;
// Share of the codewords a level can recover: L 7%, M 15%, Q 25%, H 30%.
export const ERROR_CORRECTION_CAPACITY:Record<'L'|'M'|'Q'|'H',number>={L:0.07,M:0.15,Q:0.25,H:0.30};
// qr-code-styling reads imageOptions.imageSize as a share of the recovery budget,
// not of the code width: it blanks imageSize * capacity * modules^2 dots. This cap
// is calibrated against a real decoder (zbar) reading exported PNGs across
// versions 2-9 and all four levels: hidden areas above this share of the budget
// stopped decoding, this share and below decoded everywhere. The theoretical
// budget is not usable in full because a centred region damages whole codewords,
// so a small region can exceed the per-block correction count at low levels.
export const LOGO_BUDGET_SHARE=0.5;
export const MAX_LOGO_SIZE=LOGO_BUDGET_SHARE;
export const MIN_LOGO_WIDTH_FRACTION=0.05;
export const LOGO_RENDER_SIZE=420;
export function validateLogo(file:Pick<File,'size'|'type'>):string|null {if(file.size>MAX_LOGO_BYTES)return 'Logo must be smaller than 2 MB.';if(!ALLOWED_LOGO_TYPES.includes(file.type as typeof ALLOWED_LOGO_TYPES[number]))return 'Use a PNG, JPEG, WebP, or SVG logo.';return null;}
export function readLogoAsDataUrl(file:Blob):Promise<string>{return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>typeof r.result==='string'?resolve(r.result):reject(new Error('Could not read logo.'));r.onerror=()=>reject(r.error??new Error('Could not read logo.'));r.readAsDataURL(file);});}
export function dotSize(moduleCount:number,renderSize=LOGO_RENDER_SIZE,qrMargin=quietZonePx(renderSize,moduleCount)):number{return moduleCount>0?Math.floor((Math.min(renderSize,renderSize)-2*qrMargin)/moduleCount):0;}
// Mirrors the library: dots hidden = imageSize * capacity * moduleCount^2, then it
// takes the square root, clamps to the axis limit and forces an odd count.
export function hiddenDotCount(errorCorrection:'L'|'M'|'Q'|'H',moduleCount:number,imageSize:number):number{const hidden=Math.floor(imageSize*ERROR_CORRECTION_CAPACITY[errorCorrection]*moduleCount*moduleCount+1e-6);let count=Math.floor(Math.sqrt(hidden));if(count<=0)count=1;const axis=moduleCount-14;if(axis&&axis<count)count=axis;if(count%2===0)count--;return Math.max(0,count);}
export function logoWidthFraction(errorCorrection:'L'|'M'|'Q'|'H',moduleCount:number,imageSize:number,logoMargin:number,renderSize=LOGO_RENDER_SIZE,qrMargin=quietZonePx(renderSize,moduleCount)):number{if(moduleCount<=0)return 0;const width=hiddenDotCount(errorCorrection,moduleCount,imageSize)*dotSize(moduleCount,renderSize,qrMargin)-2*logoMargin;return Math.max(0,width)/renderSize;}
// Only whole (odd) module counts are drawable, so a level offers a handful of
// distinct logo sizes. Return one imageSize per drawable size so a slider can
// step through real changes instead of mostly doing nothing. The half-dot of
// headroom keeps each stop on the dot count it was computed for, because the
// library floors imageSize * capacity * modules^2.
export function logoSizeStops(errorCorrection:'L'|'M'|'Q'|'H',moduleCount:number,logoMargin:number,renderSize=LOGO_RENDER_SIZE,qrMargin=quietZonePx(renderSize,moduleCount)):number[]{if(moduleCount<=0)return [];const capacity=ERROR_CORRECTION_CAPACITY[errorCorrection];const dot=dotSize(moduleCount,renderSize,qrMargin);if(dot<=0)return [];const stops:number[]=[];const maxDots=Math.min(moduleCount-14,Math.floor(Math.sqrt(MAX_LOGO_SIZE*capacity)*moduleCount));for(let dots=1;dots<=maxDots;dots+=2){if(dots*dot-2*logoMargin<MIN_LOGO_WIDTH_FRACTION*renderSize)continue;const imageSize=(dots*dots+0.5)/(capacity*moduleCount*moduleCount);if(imageSize>MAX_LOGO_SIZE+1e-9)break;stops.push(imageSize);}return stops;}
export function validateLogoSize(size:number):string|null{const limit=MAX_LOGO_SIZE;if(size<=limit+1e-9)return null;return `Logo is too large. Keep it at or below ${Math.round(limit*100)}% of the error-correction budget, or raise the error correction level.`;}
