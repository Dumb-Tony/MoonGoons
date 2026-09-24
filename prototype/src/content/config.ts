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
  const smooth=(a:number,b:number,v:number)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t);};
  const north=smooth(8,20,-z);
  const west=7*(1-smooth(6,14,Math.abs(x+22)))*(1-smooth(7,17,Math.abs(z+27)));
  const east=10*(1-smooth(5,14,Math.abs(x-20)))*(1-smooth(6,17,Math.abs(z+29)));
  const trench=-5*Math.exp(-(x*x/65+(z+28)**2/150));
  return (waves+crater)*fade+north*(west+east+trench);
}
export const DEFAULT_BINDINGS:Record<string,string> = {forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',jump:'Space',sprint:'ShiftLeft',grab:'KeyE',burst:'KeyQ',scan:'KeyF',jet:'KeyR'};


// Shared authored solids: renderer and physics consume the same dimensions.
export const LEVEL_BLOCKS = [
  {x:-22,y:8.8,z:-27,w:8,h:.5,d:7,color:0x4c858d},
  {x:20,y:11.5,z:-29,w:8,h:.5,d:7,color:0x4c858d},
  {x:-22,y:4.4,z:-27,w:1.2,h:8.3,d:1.2,color:0xd6a064},
  {x:20,y:5.7,z:-29,w:1.2,h:11,d:1.2,color:0xd6a064},
  {x:0,y:-2,z:-29,w:7,h:.5,d:9,color:0x59636e},
];
export const SURVEY_SITES = [
  {name:'West Relay',x:-22,y:9.05,z:-27},
  {name:'Glass Observatory',x:20,y:11.75,z:-29},
];
