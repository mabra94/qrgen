import type { State } from './types';
import { validateContrast } from './contrast';
import { validateLogoSize } from './logo';
export function escapeQrField(value:string):string {return value.replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');}
export function payload(s:State):string {switch(s.contentType){
case 'url':return s.url.trim(); case 'text':return s.text;
case 'wifi':return `WIFI:T:${s.wifiAuth};S:${escapeQrField(s.ssid)};P:${escapeQrField(s.wifiPassword)};H:${s.hidden?'true':'false'};;`;
case 'vcard':{const n=`${s.firstName} ${s.lastName}`.trim();return ['BEGIN:VCARD','VERSION:3.0',`N:${escapeQrField(s.lastName)};${escapeQrField(s.firstName)};;;`,`FN:${escapeQrField(n)}`,s.organization&&`ORG:${escapeQrField(s.organization)}`,s.title&&`TITLE:${escapeQrField(s.title)}`,s.phone&&`TEL;TYPE=CELL:${s.phone}`,s.email&&`EMAIL:${s.email}`,s.website&&`URL:${s.website}`,s.address&&`ADR:;;${escapeQrField(s.address)};;;;`,'END:VCARD'].filter(Boolean).join('\r\n');}
case 'email':{const q=new URLSearchParams();if(s.subject)q.set('subject',s.subject);if(s.message)q.set('body',s.message);return `mailto:${s.email}${q.size?`?${q}`:''}`;}
case 'sms':return `SMSTO:${s.phone}:${s.message}`; case 'phone':return `tel:${s.phone}`;}}
export function validate(s:State,p:string):string[]{const e:string[]=[];if(!p.trim())e.push('Add content before exporting.');if(s.contentType==='url'){try{const u=new URL(s.url);if(!['http:','https:'].includes(u.protocol))e.push('Use an http:// or https:// URL.');}catch{e.push('Enter a complete URL, including https://.');}}if(s.contentType==='wifi'&&!s.ssid.trim())e.push('Enter a Wi-Fi network name.');if(s.contentType==='vcard'&&!`${s.firstName}${s.lastName}`.trim())e.push('Enter a contact name.');if(s.contentType==='email'&&!/^\S+@\S+\.\S+$/.test(s.email))e.push('Enter a valid email address.');if(['sms','phone'].includes(s.contentType)&&!s.phone.trim())e.push('Enter a phone number.');const contrast=validateContrast(s.foreground,s.background);if(contrast)e.push(contrast);if(s.logo){const logoSize=validateLogoSize(s.logoSize);if(logoSize)e.push(logoSize);}return e;}
