import * as T from 'three';
import {RESOURCES,terrainHeight,type Kind} from '../content/config';
import type {Moon} from '../simulation/moon';

const mat=(color:number,roughness=.8,metalness=.08)=>new T.MeshStandardMaterial({color,roughness,metalness,flatShading:true});
function box(g:T.Group|T.Scene,w:number,h:number,d:number,color:number,x=0,y=0,z=0){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function cylinder(g:T.Group|T.Scene,r1:number,r2:number,h:number,color:number,x:number,y:number,z:number,segments=10){const m=new T.Mesh(new T.CylinderGeometry(r1,r2,h,segments),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function label(text:string,width=512,height=128,bg='#172b38',fg='#f6ead2'){
  const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d')!;x.fillStyle=bg;x.fillRect(0,0,width,height);x.fillStyle=fg;x.font=`bold ${height*.49}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,width/2,height/2);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:texture});
}
export class View {
  scene=new T.Scene();camera=new T.PerspectiveCamera(70,1,.1,600);renderer:T.WebGLRenderer;
  samples=new Map<string,T.Group>();sampleRoot=new T.Group();avatar=new T.Group();arms:T.Group[]=[];legs:T.Group[]=[];tool=new T.Group();
  terrain:T.Mesh;ship=new T.Group();scanRing:T.Mesh;beam:T.Line;time=0;cameraReady=false;
  ray=new T.Raycaster();camTarget=new T.Vector3();occluders:T.Object3D[]=[];pulseOrigin=new T.Vector3();
  constructor(canvas:HTMLCanvasElement){
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.35;
    this.scene.background=new T.Color(0x192437);this.scene.fog=new T.FogExp2(0x29374c,.0035);
    this.scene.add(new T.HemisphereLight(0xb0cbe9,0x75615b,2));const sun=new T.DirectionalLight(0xffdeb0,3.4);sun.position.set(-26,38,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=45;sun.shadow.camera.bottom=-45;sun.shadow.normalBias=.06;this.scene.add(sun);
    const geo=new T.PlaneGeometry(120,120,80,80);geo.rotateX(-Math.PI/2);const attr=geo.attributes.position;const colors=[];
    for(let i=0;i<attr.count;i++){const x=attr.getX(i),z=attr.getZ(i),y=terrainHeight(x,z);attr.setY(i,y);const c=new T.Color(0x9297a3);c.lerp(new T.Color(0xc0b2a6),Math.max(0,(y+2)/7));c.multiplyScalar(.96+.04*Math.sin(x*1.7+z*2.1));colors.push(c.r,c.g,c.b);}
    geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();this.terrain=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));this.terrain.receiveShadow=true;this.scene.add(this.terrain);this.occluders.push(this.terrain);
    const horizon=new T.Group();for(let i=0;i<34;i++){const a=i/34*Math.PI*2,r=70+Math.sin(i*9)*7;const m=new T.Mesh(new T.ConeGeometry(13+Math.sin(i)*5,10+Math.cos(i*3)*6,5),mat(0x656d82));m.position.set(Math.sin(a)*r,1,Math.cos(a)*r);m.rotation.y=i;horizon.add(m);}this.scene.add(horizon);
    this.makeSky();this.makeShip();this.makeLandscape();this.makeAvatar();
    this.scene.add(this.sampleRoot,this.avatar);
    this.scanRing=new T.Mesh(new T.RingGeometry(.97,1,100),new T.MeshBasicMaterial({color:0x78edef,transparent:true,opacity:.6,side:T.DoubleSide,depthWrite:false}));this.scanRing.rotation.x=-Math.PI/2;this.scanRing.visible=false;this.scene.add(this.scanRing);
    this.beam=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),new T.LineBasicMaterial({color:0xffd98a,transparent:true,opacity:.9}));this.scene.add(this.beam);
    this.resize();window.addEventListener('resize',()=>this.resize());
  }
  makeSky(){
    const stars:number[]=[];for(let i=0;i<950;i++){const a=i*2.3999,y=.04+(i%91)/100,r=Math.sqrt(1-Math.min(.98,y*y));stars.push(Math.sin(a)*r*300,y*300,Math.cos(a)*r*300);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(stars,3));this.scene.add(new T.Points(g,new T.PointsMaterial({color:0xd5dfec,size:.32,fog:false})));
    const planet=new T.Mesh(new T.SphereGeometry(21,48,32),new T.MeshStandardMaterial({color:0xd6a896,roughness:1,fog:false}));planet.position.set(-75,24,-170);this.scene.add(planet);
    const ring=new T.Mesh(new T.RingGeometry(26,38,100),new T.MeshBasicMaterial({color:0xab9394,side:T.DoubleSide,transparent:true,opacity:.5,fog:false}));ring.position.copy(planet.position);ring.rotation.set(1.1,.1,-.32);this.scene.add(ring);
    for(let i=0;i<5;i++){const band=new T.Mesh(new T.RingGeometry(28+i*1.7,28.25+i*1.7,100),new T.MeshBasicMaterial({color:0xf0c6a0,side:T.DoubleSide,transparent:true,opacity:.35,fog:false}));band.position.copy(planet.position);band.rotation.copy(ring.rotation);this.scene.add(band);}
  }
  makeShip(){
    const s=this.ship;this.scene.add(s);
    box(s,9.7,.1,10.8,0x535e67,0,.04,-1);box(s,6.8,.02,6.8,0x75868a,0,.11,0);
    for(let x=-3;x<=3;x+=.65){const stripe=box(s,.33,.024,1,0xf4c86a,x,.125,3.05);stripe.rotation.y=.55;}
    for(let z=-3;z<3;z+=.6){box(s,.14,.024,.3,0xf4c86a,-3.3,.13,z);box(s,.14,.024,.3,0xf4c86a,3.3,.13,z);}
    box(s,1.1,3.4,8.8,0xe0d8be,-4.15,1.7,-1);box(s,1.1,3.4,8.8,0xe0d8be,4.15,1.7,-1);box(s,9.4,3.4,1.4,0xa5b9ba,0,1.7,-5.3);box(s,9.5,1,10.2,0xdcd5c3,0,4,-1);
    box(s,8.6,.85,7.8,0xc7cabb,0,4.8,-1.7);box(s,6.7,1.1,3.5,0x2d4858,0,5.6,-3);
    const sign=new T.Mesh(new T.PlaneGeometry(5.7,.6),label('ALMOST CERTAIN'));sign.position.set(0,4,4.12);s.add(sign);
    const baySign=new T.Mesh(new T.PlaneGeometry(3.4,.55),label('CARGO // 40 VOL',512,96,'#172b38','#a4e7d9'));baySign.position.set(0,2.2,-4.58);s.add(baySign);
    const floorLabel=new T.Mesh(new T.PlaneGeometry(3.5,1),label('DROP CARGO',512,128,'#75868a','#e8e1c5'));floorLabel.rotation.x=-Math.PI/2;floorLabel.position.set(0,.13,0);s.add(floorLabel);
    for(const x of [-5.6,5.6]){cylinder(s,1.15,.85,3.7,0xe2ddc9,x,2,-2);cylinder(s,.85,1.1,.7,0x283d49,x,.9,-2);box(s,2.1,.5,1.8,0xe88754,x,.3,-2);cylinder(s,.7,.7,.5,0xeb9062,x,3.65,-2);}
    for(const x of [-4.2,4.2])for(const z of [-4.2,3]){box(s,.5,1.1,.5,0x293e4c,x,.4,z);box(s,1.4,.15,1.5,0x293e4c,x,.12,z);}
    for(const x of [-3.35,3.35]){const light=box(s,.15,2.3,.1,0x99eee0,x,1.55,3.4);(light.material as T.MeshStandardMaterial).emissive.set(0x5be4c5);(light.material as T.MeshStandardMaterial).emissiveIntensity=1;}
    cylinder(s,.08,.08,2.7,0x304758,2.6,6.2,-2);const dish=new T.Mesh(new T.SphereGeometry(.8,12,8,0,Math.PI*2,0,Math.PI*.4),mat(0xe5ccae));dish.position.set(2.6,7.5,-2);dish.rotation.z=.5;s.add(dish);
    for(let i=0;i<4;i++)box(s,.75,.06,4,0x233e50,-3.4+i*.8,5.42,-1.8);
    box(s,1,.9,1,0xdf985c,-2.6,.6,-3.6);box(s,1,.9,1,0xdf985c,-1.4,.6,-3.6);
    // Only the solid hull occludes the camera; floor signs are decorative.
    for(const mesh of s.children){if(mesh instanceof T.Mesh&&mesh.position.y>1&&mesh.geometry instanceof T.BoxGeometry)this.occluders.push(mesh);}
  }
  makeLandscape(){
    for(let i=0;i<150;i++){const a=i*2.39996,r=20+(i*13.37)%36,x=Math.sin(a)*r,z=Math.cos(a)*r;if(Math.hypot(x,z)<17)continue;const size=.2+(i%9)*.12;const rock=new T.Mesh(new T.DodecahedronGeometry(size,0),mat(i%3===0?0x8b8993:0x777f8c));rock.position.set(x,terrainHeight(x,z)+size*.25,z);rock.scale.y=.55;rock.rotation.set(i*.8,i*.5,i);rock.receiveShadow=true;rock.castShadow=true;this.scene.add(rock);}
    for(let i=0;i<9;i++){const z=5+i*1.2;box(this.scene,.6,.025,.15,0xebc475,-1.4,terrainHeight(-1.4,z)+.035,z);box(this.scene,.6,.025,.15,0xebc475,1.4,terrainHeight(1.4,z)+.035,z);}
    for(const [x,z] of [[-7,8],[7,8],[-12,-8],[11,-8]]){const y=terrainHeight(x,z);cylinder(this.scene,.04,.06,2.5,0x354954,x,y+1.25,z);const flag=box(this.scene,.95,.5,.03,0xeb9960,x+.45,y+2.2,z);flag.rotation.y=.4;}
    const pad=new T.Mesh(new T.RingGeometry(10.6,10.75,80),new T.MeshBasicMaterial({color:0xc0b695,transparent:true,opacity:.55,side:T.DoubleSide}));pad.rotation.x=-Math.PI/2;pad.position.y=.04;this.scene.add(pad);
  }
  makeAvatar(){
    const a=this.avatar;
    const torso=box(a,.7,.68,.48,0xe49a59,0,1,0);torso.rotation.z=.025;
    box(a,.55,.38,.16,0xece5cd,0,1.01,-.3);box(a,.3,.19,.04,0x355767,0,1.04,-.4);
    box(a,.61,.71,.31,0xe7ddc6,0,1,.39);cylinder(a,.13,.13,.55,0x355767,-.21,1,.6);cylinder(a,.13,.13,.55,0x355767,.21,1,.6);
    const helmet=new T.Mesh(new T.SphereGeometry(.49,16,12),mat(0xece7d7,.38));helmet.position.set(0,1.62,0);helmet.scale.set(1,1,.92);a.add(helmet);helmet.castShadow=true;
    const visor=new T.Mesh(new T.SphereGeometry(.424,16,12,Math.PI*.55,Math.PI*.9,Math.PI*.25,Math.PI*.5),mat(0x183c51,.15,.6));visor.position.set(0,1.64,-.04);a.add(visor);
    const glint=box(a,.18,.05,.018,0xb8e7e1,-.13,1.76,-.43);glint.rotation.z=.12;
    for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.44,1.21,0);box(arm,.24,.45,.26,0xe8af75,0,-.2,0);box(arm,.27,.22,.29,0x3a4e5b,0,-.5,0);a.add(arm);this.arms.push(arm);
      const leg=new T.Group();leg.position.set(side*.21,.64,0);box(leg,.28,.47,.3,0xe8d9b9,0,-.21,0);box(leg,.33,.2,.46,0x304653,0,-.52,-.07);a.add(leg);this.legs.push(leg);}
    this.tool= new T.Group();box(this.tool,.25,.23,.55,0x3c5b66);box(this.tool,.31,.28,.21,0xf3c268,0,0,-.2);const bit=cylinder(this.tool,.07,.12,.35,0xb8c8c8,0,0,-.47);bit.rotation.x=Math.PI/2;this.tool.position.set(.47,.8,-.52);a.add(this.tool);
    const shadow=new T.Mesh(new T.CircleGeometry(.55,24),new T.MeshBasicMaterial({color:0x1b2635,transparent:true,opacity:.15,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.005;a.add(shadow);
  }
  makeSample(kind:Kind){
    const g=new T.Group(),c=RESOURCES[kind];
    if(kind==='glass'){for(let i=0;i<5;i++){const crystal=new T.Mesh(new T.ConeGeometry(.15+(i%2)*.07,.65+(i%3)*.14,5),new T.MeshStandardMaterial({color:c.color,metalness:.2,roughness:.2,flatShading:true,emissive:c.color,emissiveIntensity:.16}));crystal.position.set(Math.sin(i*2.4)*.22,-.12,Math.cos(i*2.4)*.22);crystal.rotation.z=Math.sin(i)*.4;g.add(crystal);}}
    else {const rock=new T.Mesh(new T.DodecahedronGeometry(c.radius,0),mat(kind==='ore'?0x7d665b:0x706882,.7,.25));g.add(rock);for(let i=0;i<6;i++){const chunk=new T.Mesh(new T.OctahedronGeometry(c.radius*.36,0),mat(c.color,.35,.3));chunk.position.set(Math.sin(i*2.4)*c.radius*.65,Math.sin(i*1.3)*c.radius*.6,Math.cos(i*2.4)*c.radius*.65);g.add(chunk);}}
    const halo=new T.Mesh(new T.TorusGeometry(c.radius+.14,.018,4,28),new T.MeshBasicMaterial({color:c.color}));halo.rotation.x=Math.PI/2;halo.position.y=-c.radius+.04;halo.name='halo';g.add(halo);
    g.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;}});return g;
  }
  reset(moon:Moon){
    this.sampleRoot.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});this.sampleRoot.clear();this.samples.clear();
    for(const s of moon.samples){const g=this.makeSample(s.kind);this.samples.set(s.id,g);this.sampleRoot.add(g);}this.cameraReady=false;
  }
  scanAt(moon:Moon){this.pulseOrigin.copy(moon.player.translation() as T.Vector3);}
  resize(){const w=window.innerWidth,h=window.innerHeight;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  quality(low:boolean){this.renderer.setPixelRatio(low?1:Math.min(devicePixelRatio,1.6));this.renderer.shadowMap.enabled=!low;this.resize();}
  project(position:{x:number;y:number;z:number}){const p=new T.Vector3(position.x,position.y,position.z).project(this.camera);return {x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight,visible:p.z<1&&p.z>0&&Math.abs(p.x)<.92&&Math.abs(p.y)<.9};}
  update(moon:Moon,dt:number,yaw:number,pitch:number,intro:boolean,fov:number){
    this.time+=dt;const p=moon.player.translation(),v=moon.player.linvel(),speed=Math.hypot(v.x,v.z);
    for(const s of moon.samples){const g=this.samples.get(s.id)!;g.visible=s.state==='deposit'||s.state==='loose';if(!g.visible)continue;g.position.copy(s.body.translation() as T.Vector3);g.quaternion.copy(s.body.rotation() as T.Quaternion);const halo=g.getObjectByName('halo')!;halo.visible=s.state==='deposit'&&(moon.scanReveal>0||moon.target===s);halo.rotation.z=this.time*.3;g.scale.setScalar(s.kind==='glass'?.8+s.condition*.2:1);}
    this.avatar.position.set(p.x,p.y-.84,p.z);
    const face=speed>.1&&!moon.held&&!moon.drilling?Math.atan2(v.x,-v.z):yaw;
    let delta=-face-this.avatar.rotation.y;delta=Math.atan2(Math.sin(delta),Math.cos(delta));this.avatar.rotation.y+=delta*Math.min(1,dt*10);
    const walk=moon.grounded?Math.sin(moon.walkDistance*3.5)*Math.min(.5,speed*.1):-.22;
    this.legs[0].rotation.x=walk;this.legs[1].rotation.x=-walk;this.arms[0].rotation.x=moon.held?-.95:-walk*.65;this.arms[1].rotation.x=moon.held?-.95:moon.drilling?-1:walk*.65;
    this.avatar.rotation.z=moon.grounded?Math.sin(this.time*1.8)*.015:.05;this.tool.visible=!moon.held;this.tool.position.y=.8+(moon.drilling?Math.sin(this.time*70)*.015:0);
    this.beam.visible=moon.drilling&&!!moon.target;if(this.beam.visible){const start=new T.Vector3(.47,.83,-.65);this.avatar.localToWorld(start);const end=moon.target!.body.translation();this.beam.geometry.setFromPoints([start,new T.Vector3(end.x,end.y,end.z)]);}
    this.scanRing.visible=moon.scanReveal>6;if(this.scanRing.visible){const radius=(8-moon.scanReveal)*6;this.scanRing.scale.setScalar(Math.max(.1,radius));this.scanRing.position.set(this.pulseOrigin.x,terrainHeight(this.pulseOrigin.x,this.pulseOrigin.z)+.09,this.pulseOrigin.z);(this.scanRing.material as T.MeshBasicMaterial).opacity=(moon.scanReveal-6)*.3;}
    if(intro){const angle=.68+Math.sin(this.time*.035)*.04;this.camera.position.set(Math.sin(angle)*39,20,Math.cos(angle)*39);this.camera.lookAt(-3,2,4);this.cameraReady=false;}
    else {
      const target=new T.Vector3(p.x,p.y+.7,p.z),distance=5.7,offset=new T.Vector3(-Math.sin(yaw)*Math.cos(pitch)*distance,Math.sin(pitch)*distance+1.1,Math.cos(yaw)*Math.cos(pitch)*distance);
      this.ray.set(target,offset.clone().normalize());this.ray.far=offset.length();const hit=this.ray.intersectObjects(this.occluders,false)[0];if(hit)offset.setLength(Math.max(1,hit.distance-.25));
      const goal=target.clone().add(offset);if(!this.cameraReady){this.camera.position.copy(goal);this.camTarget.copy(target);this.cameraReady=true;}else{this.camera.position.lerp(goal,1-Math.exp(-12*dt));this.camTarget.lerp(target,1-Math.exp(-18*dt));}this.camera.lookAt(this.camTarget);
    }
    if(this.camera.fov!==fov){this.camera.fov=fov;this.camera.updateProjectionMatrix();}
    this.renderer.render(this.scene,this.camera);
  }
}
