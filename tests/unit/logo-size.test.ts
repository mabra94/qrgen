import{describe,it,expect}from'vitest';import{ERROR_CORRECTION_CAPACITY,MAX_LOGO_SIZE,dotSize,hiddenDotCount,logoSizeStops,logoWidthFraction,validateLogoSize}from'../../src/logo';import{quietZonePx}from'../../src/qr';
const REFERENCE_MARGIN=12;
// Reference widths measured from qr-code-styling 1.9.2 itself, in px inside a
// 420px render with a 12px code margin and an 8px logo margin.
const referenceWidth=(ec:'L'|'M'|'Q'|'H',modules:number,size:number)=>Math.round(logoWidthFraction(ec,modules,size,8,420,REFERENCE_MARGIN)*420);
const stageWidth=(ec:'L'|'M'|'Q'|'H',modules:number,size:number)=>Math.round(logoWidthFraction(ec,modules,size,8)*420);
// Largest logo each level/version could still decode, verified by exporting PNGs
// through the UI and reading them with zbar. See the scan e2e test.
const DECODED:{level:'L'|'M'|'Q'|'H';modules:number;maxDots:number}[]=[{level:'L',modules:25,maxDots:3},{level:'L',modules:33,maxDots:7},{level:'M',modules:25,maxDots:7},{level:'M',modules:37,maxDots:11},{level:'Q',modules:25,maxDots:7},{level:'Q',modules:41,maxDots:15},{level:'H',modules:29,maxDots:11},{level:'H',modules:49,maxDots:21}];
describe('quiet zone',()=>{
it('reserves four modules on every side',()=>{expect(quietZonePx(1000,25)).toBe(121);expect(quietZonePx(420,29)).toBe(45);expect(quietZonePx(4000,29)).toBe(432);});
it('falls back to a sane module count before the first render',()=>expect(quietZonePx(420,0)).toBe(quietZonePx(420,33)));
it('keeps the margin at about four modules after rounding',()=>[[1000,25],[420,29],[4000,29],[4000,49]].forEach(([size,modules])=>{const margin=quietZonePx(size,modules);const dot=dotSize(modules,size,margin);expect(margin/dot,`${size}px/${modules} modules`).toBeGreaterThan(3.9);expect(margin/dot).toBeLessThan(4.1);}));
});
describe('logo sizing',()=>{
it('reads imageSize as a share of the recovery budget',()=>{expect(hiddenDotCount('H',29,0.8)).toBe(13);expect(hiddenDotCount('H',29,0.25)).toBe(7);});
it('reproduces the widths the library draws',()=>{expect([0.1,0.25,0.43,0.5,0.8].map(size=>referenceWidth('H',29,size))).toEqual([49,75,101,127,153]);expect([0.25,0.43,0.8].map(size=>referenceWidth('L',25,size))).toEqual([29,29,59]);expect([0.1,0.25,0.43,0.8].map(size=>referenceWidth('Q',25,size))).toEqual([29,59,89,149]);});
it('snaps to whole, odd module counts',()=>{expect(hiddenDotCount('H',29,0.26)).toBe(7);expect(hiddenDotCount('H',29,0.1)).toBe(5);});
it('sizes a module from the render size and quiet zone',()=>{expect(dotSize(29,420,REFERENCE_MARGIN)).toBe(13);expect(dotSize(25,420,REFERENCE_MARGIN)).toBe(15);expect(dotSize(29)).toBe(11);});
it('offers real, distinct sizes at H',()=>{const stops=logoSizeStops('H',29,8);expect(stops.length).toBe(4);const widths=stops.map(size=>stageWidth('H',29,size));expect(widths).toEqual([39,61,83,105]);expect(new Set(widths).size).toBe(stops.length);});
it('never offers a size larger than the verified ones',()=>DECODED.forEach(({level,modules,maxDots})=>logoSizeStops(level,modules,8).forEach(size=>expect(hiddenDotCount(level,modules,size),`${level}/${modules}`).toBeLessThanOrEqual(maxDots))));
it('still offers the widest verified size where the budget allows',()=>DECODED.forEach(({level,modules,maxDots})=>{const stops=logoSizeStops(level,modules,8);if(!stops.length)return;const widest=hiddenDotCount(level,modules,stops[stops.length-1]);expect(widest/Math.max(1,maxDots),`${level}/${modules}`).toBeGreaterThan(0.5);}));
it('keeps every stop inside the recovery budget',()=>DECODED.forEach(({level,modules})=>logoSizeStops(level,modules,8).forEach(size=>expect(hiddenDotCount(level,modules,size)/(modules*modules)).toBeLessThanOrEqual(ERROR_CORRECTION_CAPACITY[level]+1e-9))));
it('caps at half the recovery budget',()=>{expect(validateLogoSize(MAX_LOGO_SIZE)).toBeNull();expect(validateLogoSize(MAX_LOGO_SIZE+0.01)).toMatch(/too large/);expect(MAX_LOGO_SIZE).toBe(0.5);});
it('offers at least one size at every level',()=>(['L','M','Q','H']as const).forEach(level=>{expect(logoSizeStops(level,29,8).length,level).toBeGreaterThan(0);}));
it('returns nothing without a module count',()=>{expect(logoSizeStops('H',0,8)).toEqual([]);expect(logoWidthFraction('H',0,0.5,8)).toBe(0);});
});
