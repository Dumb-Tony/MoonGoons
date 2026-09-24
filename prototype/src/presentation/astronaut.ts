import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {painted,fabric,glow} from './materials';
import type {Moon} from '../simulation/moon';

/** Presentation-only rig. Feet and suit proportions fit the existing player capsule. */
export class Astronaut {
  root=new T.Group(); torso=new T.Group(); head=new T.Group();
  arms:T.Group[]=[]; elbows:T.Group[]=[]; legs:T.Group[]=[]; knees:T.Group[]=[];
  tool=new T.Group(); bit=new T.Group(); jets:T.Mesh[]=[]; visor:T.Mesh;
  private land=0; private wasGrounded=false;
  constructor(){
    const cream=painted(0xe8ddbd,.38,.3),orange=fabric(0xd98043),dark=painted(0x263e50,.65,.2),teal=painted(0x58aaa9,.35,.5),rubber=painted(0x182934,.95,0);
    const mesh=(g:T.Group,geo:T.BufferGeometry,m:T.Material,x:number,y:number,z:number)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
    const box=(g:T.Group,w:number,h:number,d:number,m:T.Material,x:number,y:number,z:number)=>mesh(g,new RoundedBoxGeometry(w,h,d,3,Math.min(w,h,d)*.22),m,x,y,z);
    const round=(g:T.Group,x:number,y:number,z:number,sx:number,sy:number,sz:number,m:T.Material)=>{const o=mesh(g,new T.SphereGeometry(1,24,16),m,x,y,z);o.scale.set(sx,sy,sz);return o;};
    const ring=(g:T.Group,r:number,t:number,x:number,y:number,z:number,m:T.Material)=>mesh(g,new T.TorusGeometry(r,t,8,32),m,x,y,z);
    this.root.add(this.torso);this.torso.position.y=.88;
    round(this.torso,0,.22,0,.39,.47,.29,orange);
    box(this.torso,.63,.14,.51,dark,0,-.16,0);
    box(this.torso,.51,.38,.12,cream,0,.22,-.29);
    box(this.torso,.29,.16,.035,dark,-.06,.26,-.366);
    for(let i=0;i<3;i++)box(this.torso,.04,.025,.02,glow(i===2?0xffbb66:0x74ecda,1.4),-.14+i*.08,.27,-.39);
    box(this.torso,.1,.09,.025,teal,.17,.16,-.37);
    for(const side of [-1,1]){box(this.torso,.09,.63,.045,dark,side*.25,.25,-.26);box(this.torso,.14,.09,.06,cream,side*.25,.05,-.29);}
    // Two oxygen bottles, ribbed pack, status strip, antenna and exposed service hose.
    box(this.torso,.59,.65,.28,cream,0,.2,.35);
    box(this.torso,.4,.42,.09,teal,0,.21,.52);
    for(let i=0;i<5;i++)box(this.torso,.28,.025,.03,dark,0,.08+i*.065,.58);
    box(this.torso,.35,.055,.035,glow(0x83ead7,2),0,.47,.53);
    for(const side of [-1,1]){
      mesh(this.torso,new T.CapsuleGeometry(.115,.35,6,12),teal,side*.34,.22,.38);
      const band=ring(this.torso,.12,.027,side*.34,.12,.38,dark);band.rotation.x=Math.PI/2;
      mesh(this.torso,new T.CylinderGeometry(.09,.13,.15,16),dark,side*.28,-.19,.4);
      const jet=mesh(this.torso,new T.ConeGeometry(.075,.32,12),glow(0x8cefff,2.5),side*.28,-.42,.4);jet.rotation.z=Math.PI;jet.castShadow=false;this.jets.push(jet);
    }
    mesh(this.torso,new T.CylinderGeometry(.018,.022,.48,8),dark,.26,.74,.4);
    round(this.torso,.26,1,.4,.035,.035,.035,glow(0xffb66b,1.3));
    const hose=new T.CatmullRomCurve3([new T.Vector3(-.31,.3,.43),new T.Vector3(-.51,-.02,.22),new T.Vector3(-.4,-.13,-.18),new T.Vector3(-.2,.07,-.32)]);
    mesh(this.torso,new T.TubeGeometry(hose,22,.036,8,false),teal,0,0,0);
    this.torso.add(this.head);this.head.position.y=.77;
    const collar=ring(this.torso,.3,.065,0,.56,0,dark);collar.rotation.x=Math.PI/2;
    round(this.head,0,0,0,.49,.47,.44,cream);
    // Visor sits beyond the shell, with an opaque seal behind it (front is local -Z).
    round(this.head,0,.01,-.32,.435,.325,.205,dark);
    this.visor=round(this.head,0,.025,-.36,.397,.278,.205,new T.MeshPhysicalMaterial({color:0x967540,metalness:.92,roughness:.16,clearcoat:1,envMapIntensity:1.5}));
    box(this.head,.44,.08,.15,cream,0,.32,-.32);
    for(const side of [-1,1]){const ear=mesh(this.head,new T.CylinderGeometry(.16,.16,.08,24),teal,side*.48,0,0);ear.rotation.z=Math.PI/2;box(this.head,.1,.075,.08,glow(0xffdaa0,1.5),side*.32,.28,-.38);}
    box(this.head,.21,.05,.03,cream,0,-.32,-.35);
    for(const side of [-1,1]){
      const arm=new T.Group();arm.position.set(side*.43,.43,0);this.torso.add(arm);this.arms.push(arm);
      round(arm,0,-.05,0,.19,.19,.2,cream);
      mesh(arm,new T.CapsuleGeometry(.125,.16,6,12),orange,0,-.23,0);
      const elbow=new T.Group();elbow.position.y=-.39;arm.add(elbow);this.elbows.push(elbow);
      round(elbow,0,0,0,.13,.12,.13,dark);mesh(elbow,new T.CapsuleGeometry(.13,.13,6,12),orange,0,-.14,0);
      box(elbow,.27,.08,.27,teal,0,-.25,0);round(elbow,0,-.34,-.015,.145,.14,.15,rubber);
      const leg=new T.Group();leg.position.set(side*.2,.64,0);this.root.add(leg);this.legs.push(leg);
      mesh(leg,new T.CapsuleGeometry(.155,.13,6,12),orange,0,-.12,0);
      const knee=new T.Group();knee.position.y=-.29;leg.add(knee);this.knees.push(knee);
      round(knee,0,0,0,.15,.13,.15,dark);box(knee,.24,.18,.1,cream,0,.01,-.14);
      mesh(knee,new T.CapsuleGeometry(.135,.08,6,12),orange,0,-.13,0);
      box(knee,.31,.17,.43,dark,0,-.27,-.07);box(knee,.33,.055,.46,rubber,0,-.35,-.07);
      for(let j=0;j<3;j++)box(knee,.27,.022,.03,cream,0,-.2,-.16-j*.055);
    }
    box(this.tool,.23,.21,.38,teal,0,0,0);box(this.tool,.28,.24,.13,cream,0,0,-.21);
    box(this.tool,.08,.23,.1,dark,0,-.16,.06);this.tool.add(this.bit);
    const shaft=mesh(this.bit,new T.CylinderGeometry(.045,.095,.28,12),dark,0,0,-.4);shaft.rotation.x=Math.PI/2;
    for(let i=0;i<4;i++)ring(this.bit,.075-i*.009,.014,0,0,-.3-i*.055,cream);
    box(this.tool,.12,.035,.09,glow(0x78edda,1.8),0,.12,.04);
    this.elbows[1].add(this.tool);this.tool.position.set(0,-.36,-.12);this.tool.rotation.x=-Math.PI/2;
  }
  update(moon:Moon,dt:number,time:number,speed:number){
    if(moon.grounded&&!this.wasGrounded)this.land=.09;this.wasGrounded=moon.grounded;this.land*=Math.exp(-12*dt);
    const moving=Math.min(1,speed/4),phase=moon.walkDistance*3.5,walk=Math.sin(phase)*.5*moving;
    this.torso.position.y=.88-this.land+(moon.grounded?Math.abs(Math.sin(phase))*.025*moving:0);
    this.torso.rotation.x=moon.held?-.09:moon.bracing?.12:-moving*.045;
    this.head.rotation.y=Math.sin(time*.75)*.025;this.head.rotation.x=moon.drilling?.1:moon.held?.08:0;
    for(let i=0;i<2;i++){
      const sign=i===0?1:-1;
      this.legs[i].rotation.x=moon.grounded?walk*sign:-.2+sign*.12;
      this.knees[i].rotation.x=moon.grounded?-Math.max(0,-walk*sign)*.8:-(this.land+.35);
      this.arms[i].rotation.x=moon.held?1.1:moon.drilling&&i===1?.95:moon.grounded?-walk*sign*.6:.3;
      this.arms[i].rotation.z=sign*(moon.held?.08:moon.grounded?.08:.22);
      this.elbows[i].rotation.x=moon.held?.35:moon.drilling&&i===1?.55:.18;
    }
    this.tool.visible=!moon.held;this.bit.rotation.z=moon.drilling?time*35:0;
    this.jets.forEach(j=>{j.visible=moon.burstVisual>0||moon.bracing&&!moon.grounded;j.scale.y=moon.burstVisual>0?1+Math.sin(time*60)*.2:.3;});
  }
}
