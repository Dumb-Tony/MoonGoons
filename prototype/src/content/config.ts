export const STEP = 1 / 60;
export const DURATION = 300;
export const CAPACITY = 40;
export type Kind = 'ore' | 'glass' | 'core';
export const RESOURCES = {
  ore: { label: 'Lunar ore', category: 'INDUSTRIAL SAMPLE', mass: 20, volume: 4, credits: 40, rp: 2, color: 0xe59b55, hex: '#efb579', radius: .57, seconds: 6, note: 'Reliable, useful, reassuringly ordinary.' },
  glass: { label: 'Lunar glass', category: 'FRAGILE SPECIMEN', mass: 6, volume: 3, credits: 65, rp: 4, color: 0x73dfe1, hex: '#85e5e8', radius: .53, seconds: 4, note: 'Lightweight. Valuable. Not bounce-proof.' },
  core: { label: 'Dense core', category: 'HEAVY SAMPLE', mass: 45, volume: 8, credits: 120, rp: 6, color: 0xb2a0df, hex: '#c2afe8', radius: .78, seconds: 8, note: 'A small rock with very big opinions.' },
} as const;
export const DEPOSITS: {kind:Kind; x:number; z:number}[] = [
  {kind:'ore',x:-6,z:17},{kind:'ore',x:11,z:14},{kind:'glass',x:16,z:1},
  {kind:'ore',x:-17,z:4},{kind:'glass',x:-14,z:26},{kind:'core',x:26,z:19},
  {kind:'ore',x:5,z:31},{kind:'glass',x:25,z:-15},{kind:'ore',x:-26,z:-12},{kind:'core',x:-31,z:22},
];
export function terrainHeight(x:number,z:number) {
  const d = Math.hypot(x,z);
  const fade = Math.min(1,Math.max(0,(d-13)/14));
  const waves = Math.sin(x*.09)*Math.cos(z*.075)*2.2 + Math.sin(z*.15+x*.04)*.65;
  const crater = -2.5*Math.exp(-((x-27)**2+(z-21)**2)/85);
  return (waves+crater)*fade;
}
export const DEFAULT_BINDINGS:Record<string,string> = {forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',sprint:'ShiftLeft',grab:'KeyE',burst:'KeyQ',scan:'KeyF'};
