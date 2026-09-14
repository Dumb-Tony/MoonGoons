import { CAPACITY, RESOURCES, type Kind } from '../content/config.ts';
export type Entry = { id:string; kind:Kind; condition:number; credits:number; rp:number; volume:number };
export const clamp = (v:number,min:number,max:number) => Math.min(max,Math.max(min,v));
export function carrySpeed(mass:number) { return clamp(1/(1+mass/40),.35,1); }
export function itemReward(id:string,kind:Kind,condition:number):Entry {
  const c=RESOURCES[kind], q=clamp(condition,0,1);
  return {id,kind,condition:q,credits:Math.floor(c.credits*q+1e-7),rp:Math.floor(c.rp*q+1e-7),volume:c.volume};
}
export function bankItem(manifest:Entry[], item:Entry):boolean {
  if(manifest.some(e=>e.id===item.id) || manifest.reduce((s,e)=>s+e.volume,0)+item.volume>CAPACITY) return false;
  manifest.push(item); return true;
}
export function heatStep(heat:number,locked:boolean,using:boolean,dt:number) {
  const next=clamp(heat+(using&&!locked?22:-15)*dt,0,100);
  return {heat:next,locked: next>=100 || (locked&&next>40)};
}
export function fitsBay(x:number,y:number,z:number,radius:number,speed:number) {
  return Math.abs(x)+radius<3.4 && Math.abs(z)+radius<3.4 && y-radius>=-.12 && y+radius<3.3 && speed<1;
}
