export const MAX_LOGO_BYTES=2_000_000;
export const ALLOWED_LOGO_TYPES=['image/png','image/jpeg','image/webp','image/svg+xml'] as const;
export function validateLogo(file:Pick<File,'size'|'type'>):string|null {if(file.size>MAX_LOGO_BYTES)return 'Logo must be smaller than 2 MB.';if(!ALLOWED_LOGO_TYPES.includes(file.type as typeof ALLOWED_LOGO_TYPES[number]))return 'Use a PNG, JPEG, WebP, or SVG logo.';return null;}
export function readLogoAsDataUrl(file:Blob):Promise<string>{return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>typeof r.result==='string'?resolve(r.result):reject(new Error('Could not read logo.'));r.onerror=()=>reject(r.error??new Error('Could not read logo.'));r.readAsDataURL(file);});}
