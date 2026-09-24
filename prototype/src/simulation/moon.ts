import RAPIER from '@dimforge/rapier3d-compat';
import {CAPACITY,DEPOSITS,DURATION,RESOURCES,STEP,terrainHeight,type Kind} from '../content/config.ts';
import {bankItem,carrySpeed,clamp,fitsBay,heatStep,itemReward,type Entry} from '../core/rules.ts';
export type Sample={id:string;kind:Kind;state:'deposit'|'loose'|'secured'|'lost';body:RAPIER.RigidBody;collider:RAPIER.Collider;progress:number;condition:number;securing:number;damageDelay:number;previousVy:number};
export type Input={x:number;z:number;yaw:number;jump:boolean;burst:boolean;grab:boolean;scan:boolean;use:boolean;sprint:boolean;brace:boolean};
export type GameEvent={type:string;text?:string;id?:string};
export class Moon {
  world:RAPIER.World;player:RAPIER.RigidBody;playerCollider:RAPIER.Collider;
  samples:Sample[]=[];manifest:Entry[]=[];events:GameEvent[]=[];
  held:Sample|null=null;target:Sample|null=null;heat=0;locked=false;needsRelease=false;
  elapsed=0;running=false;practice=false;finished=false;runId='';charges=2;recharge=0;
  bracing=false;burstVisual=0;
  grounded=false;grace=0;jumpBuffer=0;scanCooldown=0;scanReveal=0;scanWindup=0;usedScan=false;
  yaw=0;walkDistance=0;airTime=0;lost=0;recalls=0;drilling=false;recoverCooldown=0;
  constructor(){
    this.world=new RAPIER.World({x:0,y:-3,z:0});this.world.timestep=STEP;
    const n=80, vertices:number[]=[],indices:number[]=[];
    for(let z=0;z<=n;z++)for(let x=0;x<=n;x++){const xx=x/n*120-60,zz=z/n*120-60;vertices.push(xx,terrainHeight(xx,zz),zz);}
    for(let z=0;z<n;z++)for(let x=0;x<n;x++){const a=z*(n+1)+x,b=a+1,c=a+n+1,d=c+1;indices.push(a,c,b,b,c,d);}
    this.world.createCollider(RAPIER.ColliderDesc.trimesh(new Float32Array(vertices),new Uint32Array(indices)).setFriction(.85).setCollisionGroups(0x0001ffff));
    for(const [x,y,z,hx,hy,hz] of [[-4.15,1.7,-1,.55,1.7,4.4],[4.15,1.7,-1,.55,1.7,4.4],[0,1.7,-5.3,4.7,1.7,.7],[0,4,-1,4.7,.5,5.1]])this.world.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy,hz).setTranslation(x,y,z).setCollisionGroups(0x0001ffff));
    this.player=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,.96,16).lockRotations().setCcdEnabled(true).setCanSleep(false));
    this.playerCollider=this.world.createCollider(RAPIER.ColliderDesc.capsule(.42,.42).setMass(80).setFriction(0).setRestitution(0).setCollisionGroups(0x0002ffff),this.player);
    DEPOSITS.forEach((d,i)=>{const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(d.x,terrainHeight(d.x,d.z)+RESOURCES[d.kind].radius,d.z));const collider=this.world.createCollider(RAPIER.ColliderDesc.ball(RESOURCES[d.kind].radius).setCollisionGroups(0x0004ffff),body);this.samples.push({id:`sample-${i}`,kind:d.kind,state:'deposit',body,collider,progress:0,condition:1,securing:0,damageDelay:0,previousVy:0});});
  }
  start(practice=false){this.runId=crypto.randomUUID();this.running=true;this.practice=practice;}
  get remaining(){return Math.max(0,DURATION-this.elapsed);}
  get volume(){return this.manifest.reduce((s,e)=>s+e.volume,0);}
  get credits(){return this.manifest.reduce((s,e)=>s+e.credits,0);}
  get rp(){return this.manifest.reduce((s,e)=>s+e.rp,0);}
  get nearShip(){const p=this.player.translation();return Math.hypot(p.x,p.z)<8;}
  notify(type:string,text?:string,id?:string){this.events.push({type,text,id});}
  selectTarget(yaw:number){
    const p=this.player.translation(),f={x:Math.sin(yaw),z:-Math.cos(yaw)};
    let score=Infinity;this.target=null;
    for(const sample of this.samples){if(sample.state!=='deposit'&&sample.state!=='loose')continue;const a=sample.body.translation(),dx=a.x-p.x,dz=a.z-p.z,d=Math.hypot(dx,dz);if(d>2.8||Math.abs(a.y-p.y)>2.4)continue;const dot=(dx*f.x+dz*f.z)/Math.max(d,.01);if(dot<-.1)continue;
      const origin={x:p.x,y:p.y+.25,z:p.z},delta={x:a.x-origin.x,y:a.y-origin.y,z:a.z-origin.z},length=Math.hypot(delta.x,delta.y,delta.z);
      const hit=this.world.castRay(new RAPIER.Ray(origin,{x:delta.x/length,y:delta.y/length,z:delta.z/length}),length,true,undefined,undefined,this.playerCollider,this.player);
      if(hit&&hit.collider.handle!==sample.collider.handle)continue;
      const s=d+(1-dot)*.8;if(s<score){score=s;this.target=sample;}}
  }
  release(gentle=false){if(this.held){if(gentle){const v=this.held.body.linvel();this.held.body.setLinvel({x:v.x*.15,y:Math.min(0,v.y),z:v.z*.15},true);this.held.body.setAngvel({x:0,y:0,z:0},true);}this.held.collider.setCollisionGroups(0x0004ffff);this.notify('grab','Cargo released. Let it settle in the striped bay.');this.held=null;}}
  extract(s:Sample){const p=s.body.translation();this.world.removeRigidBody(s.body);s.body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(p.x,p.y+.12,p.z).setLinearDamping(.25).setAngularDamping(1.8).setCcdEnabled(true));s.collider=this.world.createCollider(RAPIER.ColliderDesc.ball(RESOURCES[s.kind].radius).setMass(RESOURCES[s.kind].mass).setFriction(.9).setRestitution(s.kind==='glass'?.08:.17).setCollisionGroups(0x0004ffff),s.body);s.state='loose';s.damageDelay=2;this.notify('extract',`${RESOURCES[s.kind].label} freed. Pick it up and bring it home.`,s.id);}
  recall(){this.release();this.player.setTranslation({x:0,y:1.1,z:12},true);this.player.setLinvel({x:0,y:0,z:0},true);this.charges=2;this.recalls++;this.notify('recall','Suit retrieval complete. Your secured cargo is safe.');}
  finish(){if(this.finished)return;this.release();this.running=false;this.finished=true;this.drilling=false;this.notify('finish');}
  step(input:Input){
    if(!this.running||this.finished)return;
    const dt=STEP,p=this.player.translation(),vel=this.player.linvel();this.yaw=input.yaw;this.bracing=input.brace;this.burstVisual=Math.max(0,this.burstVisual-dt);
    this.scanCooldown=Math.max(0,this.scanCooldown-dt);this.scanReveal=Math.max(0,this.scanReveal-dt);this.recoverCooldown=Math.max(0,this.recoverCooldown-dt);
    const ray=this.world.castRay(new RAPIER.Ray({x:p.x,y:p.y-.78,z:p.z},{x:0,y:-1,z:0}),.19,true,undefined,undefined,this.playerCollider,this.player);
    this.grounded=!!ray&&vel.y<.8;this.grace=this.grounded?.12:Math.max(0,this.grace-dt);this.jumpBuffer=input.jump?.15:Math.max(0,this.jumpBuffer-dt);
    if(this.grounded&&this.charges<2){this.recharge+=dt;if(this.recharge>=8){this.charges++;this.recharge=0;}}
    if(input.burst&&this.charges>0){const f={x:Math.sin(input.yaw)*1.2,y:1.6,z:-Math.cos(input.yaw)*1.2};this.player.applyImpulse({x:f.x*80,y:f.y*80,z:f.z*80},true);this.charges--;this.burstVisual=.45;this.notify('jump');}
    let jumping=false;if(this.jumpBuffer>0&&this.grace>0){this.player.setLinvel({x:vel.x,y:4.2,z:vel.z},true);this.jumpBuffer=0;this.grace=0;this.grounded=false;jumping=true;this.notify('jump');}
    const mass=this.held?RESOURCES[this.held.kind].mass:0,speed=(input.sprint&&mass<=35?6:4)*carrySpeed(mass)*(input.brace?.3:1);
    let dx=Math.sin(input.yaw)*input.z+Math.cos(input.yaw)*input.x,dz=-Math.cos(input.yaw)*input.z+Math.sin(input.yaw)*input.x;const l=Math.hypot(dx,dz);if(l>1){dx/=l;dz/=l;}
    const v=this.player.linvel(),ax=this.grounded?16:input.brace?7:2.5,max=this.grounded?speed:Math.min(4,speed), change=(t:number,c:number)=>clamp(t-c,-ax*dt,ax*dt);
    if(this.grounded||l>0||input.brace)this.player.setLinvel({x:v.x+change(dx*max,v.x),y:jumping?4.2:v.y,z:v.z+change(dz*max,v.z)},true);
    this.walkDistance+=Math.hypot(v.x,v.z)*dt;if(!this.grounded)this.airTime+=dt;
    this.selectTarget(input.yaw);
    if(input.grab){if(this.held)this.release(input.brace);else if(this.target?.state==='loose'){this.held=this.target;this.held.collider.setCollisionGroups(0x0004fffd);this.notify('grab',`${RESOURCES[this.held.kind].label} · ${mass||RESOURCES[this.held.kind].mass} kg. Walk it into the cargo bay.`);}else if(this.target?.state==='deposit'){this.notify('hint','This sample is still embedded. Use the drill first.');}}
    if(input.scan&&this.scanCooldown<=0){this.scanWindup=1;this.scanCooldown=4;this.notify('scanstart','Scanning…');}
    if(this.scanWindup>0){this.scanWindup-=dt;if(this.scanWindup<=0){this.scanReveal=8;this.usedScan=true;this.notify('scan','Survey pulse complete. Nearby sample markers revealed.');}}
    if(!input.use)this.needsRelease=false;
    this.drilling=input.use&&!this.held&&this.target?.state==='deposit'&&!this.locked&&!this.needsRelease;
    const h=heatStep(this.heat,this.locked,this.drilling,dt);if(h.locked&&!this.locked){this.needsRelease=true;this.notify('heat','Drill overheated. Let it cool, then press again.');}this.heat=h.heat;this.locked=h.locked;
    if(this.drilling&&this.target){this.target.progress+=dt;const recoil=.12;this.player.applyImpulse({x:-Math.sin(input.yaw)*recoil,y:0,z:Math.cos(input.yaw)*recoil},true);if(this.target.progress>=RESOURCES[this.target.kind].seconds){this.extract(this.target);this.drilling=false;}}
    if(this.held){const s=this.held,a=s.body.translation(),cv=s.body.linvel(),pv=this.player.linvel(),r=RESOURCES[s.kind],target={x:p.x+Math.sin(input.yaw)*1.7,y:input.brace&&this.grounded?terrainHeight(p.x+Math.sin(input.yaw)*1.7,p.z-Math.cos(input.yaw)*1.7)+r.radius+.12:p.y+.6,z:p.z-Math.cos(input.yaw)*1.7};
      const damping=input.brace?12:9,fx=(target.x-a.x)*24-(cv.x-pv.x)*damping,fy=(target.y-a.y)*24-(cv.y-pv.y)*damping+3,fz=(target.z-a.z)*24-(cv.z-pv.z)*damping,force=Math.hypot(fx,fy,fz),cap=Math.min(1,34/Math.max(force,.01));s.body.applyImpulse({x:fx*r.mass*dt*cap,y:fy*r.mass*dt*cap,z:fz*r.mass*dt*cap},true);
      if(Math.hypot(target.x-a.x,target.y-a.y,target.z-a.z)>4){this.release();this.notify('hint','Grip released: the cargo was caught on something.');}}
    this.world.step();
    const pp=this.player.translation();if(!Number.isFinite(pp.y)||pp.y< -15||Math.abs(pp.x)>57||Math.abs(pp.z)>57)this.recall();
    for(const s of this.samples){if(s.state!=='loose')continue;const sp=s.body.translation(),sv=s.body.linvel();s.damageDelay=Math.max(0,s.damageDelay-dt);
      if(s.kind==='glass'&&s.damageDelay<=0&&s.previousVy< -3&&sv.y-s.previousVy>2){s.condition=Math.max(0,Math.round((s.condition-.1)*10)/10);s.damageDelay=.5;this.notify('damage','Glass chipped. Keep landings gentle.',s.id);}
      s.previousVy=sv.y;
      if(s.condition<=0||sp.y< -15||Math.abs(sp.x)>59||Math.abs(sp.z)>59){if(this.held===s)this.release();this.world.removeRigidBody(s.body);s.state='lost';this.lost++;this.notify('lost','Sample lost. There are other discoveries out here.',s.id);continue;}
      const speed=Math.hypot(sv.x,sv.y,sv.z);if(s!==this.held&&fitsBay(sp.x,sp.y,sp.z,RESOURCES[s.kind].radius,speed)&&this.volume+RESOURCES[s.kind].volume<=CAPACITY)s.securing+=dt;else s.securing=0;
      if(s.securing>=1&&bankItem(this.manifest,itemReward(s.id,s.kind,s.condition))){this.world.removeRigidBody(s.body);s.state='secured';this.notify('bank',`${RESOURCES[s.kind].label} secured · +${itemReward(s.id,s.kind,s.condition).credits} credits`,s.id);}}
    if(!this.practice){const prev=this.remaining;this.elapsed+=dt;for(const threshold of [60,30,10])if(prev>threshold&&this.remaining<=threshold)this.notify('warning',`Launch in ${threshold} seconds. Return to the ship.`);if(this.elapsed>=DURATION)this.finish();}
  }
  dispose(){this.world.free();}
}
