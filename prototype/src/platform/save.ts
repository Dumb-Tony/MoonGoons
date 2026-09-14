export type Profile = {schemaVersion:1;credits:number;rp:number;runs:number;discoveries:string[];claimed:string[]};
export const emptyProfile=():Profile=>({schemaVersion:1,credits:0,rp:0,runs:0,discoveries:[],claimed:[]});
export function validateProfile(value:unknown):Profile {
  const p=value as Profile;
  if(!p||p.schemaVersion!==1) throw new Error('This save version is not supported. Your current progress was not replaced.');
  for(const key of ['credits','rp','runs'] as const) if(!Number.isSafeInteger(p[key])||p[key]<0||p[key]>100000000) throw new Error('This save contains invalid progress.');
  if(!Array.isArray(p.discoveries)||!p.discoveries.every(v=>typeof v==='string'&&['ore','glass','core'].includes(v))) throw new Error('Invalid discovery list.');
  if(!Array.isArray(p.claimed)||p.claimed.length>100000||!p.claimed.every(v=>typeof v==='string'&&v.length<100)) throw new Error('Invalid mission history.');
  return {schemaVersion:1,credits:p.credits,rp:p.rp,runs:p.runs,discoveries:[...new Set(p.discoveries)],claimed:[...new Set(p.claimed)]};
}
export function award(profile:Profile,runId:string,credits:number,rp:number,discoveries:string[]):Profile {
  if(profile.claimed.includes(runId)) return profile;
  return validateProfile({...profile,credits:profile.credits+credits,rp:profile.rp+rp,runs:profile.runs+1,discoveries:[...new Set([...profile.discoveries,...discoveries])],claimed:[...profile.claimed,runId]});
}
async function database():Promise<IDBDatabase> { return new Promise((resolve,reject)=>{const r=indexedDB.open('moon-goons',1);r.onupgradeneeded=()=>r.result.createObjectStore('profiles');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(new Error('Browser storage is unavailable. Export your progress to keep it.'));}); }
export async function readProfile(backup=false):Promise<Profile> {const db=await database();try{return await new Promise((resolve,reject)=>{const r=db.transaction('profiles').objectStore('profiles').get(backup?'backup':'current');r.onsuccess=()=>{try{resolve(r.result?validateProfile(r.result):emptyProfile());}catch(e){reject(e);}};r.onerror=()=>reject(r.error);});}finally{db.close();}}
export async function writeProfile(profile:Profile) {validateProfile(profile);const db=await database();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('profiles','readwrite'),s=tx.objectStore('profiles');const previous=s.get('current');previous.onsuccess=()=>{if(previous.result)s.put(previous.result,'backup');s.put(profile,'current');};tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('Progress could not be saved. Export it or retry.'));tx.onabort=()=>reject(new Error('Save interrupted. Your previous save is preserved.'));});}finally{db.close();}}
