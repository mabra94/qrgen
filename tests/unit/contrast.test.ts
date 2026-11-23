import{describe,it,expect}from'vitest';import{contrastRatio,relativeLuminance,validateContrast,MIN_CONTRAST_RATIO}from'../../src/contrast';
describe('contrast',()=>{
it('gives black on white the maximum ratio',()=>expect(contrastRatio('#000000','#ffffff')).toBeCloseTo(21,5));
it('is symmetric',()=>expect(contrastRatio('#0f172a','#ffffff')).toBeCloseTo(contrastRatio('#ffffff','#0f172a')!,10));
it('expands shorthand hex with or without a hash',()=>{expect(contrastRatio('000','fff')).toBeCloseTo(21,5);expect(contrastRatio('#abc','#ABC')).toBeCloseTo(1,5);});
it('reads pure black as zero luminance',()=>expect(relativeLuminance('#000000')).toBe(0));
it('returns null for unparseable colours',()=>{expect(contrastRatio('rebeccapurple','#ffffff')).toBeNull();expect(relativeLuminance('#12345')).toBeNull();});
it('accepts the default palette',()=>expect(validateContrast('#0f172a','#ffffff')).toBeNull());
it('accepts mid grey on white, the 4.5:1 boundary',()=>expect(validateContrast('#767676','#ffffff')).toBeNull());
it('rejects light grey on white',()=>expect(validateContrast('#aaaaaa','#ffffff')).not.toBeNull());
it('rejects grey on grey',()=>expect(validateContrast('#8a8a8a','#9a9a9a')).toMatch(/too low/));
it('reports the measured ratio and the minimum',()=>{const message=validateContrast('#808080','#808080');expect(message).toContain('1.0:1');expect(message).toContain(`${MIN_CONTRAST_RATIO}:1`);});
});
