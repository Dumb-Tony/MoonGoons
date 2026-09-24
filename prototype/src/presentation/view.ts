import {Astronaut} from './astronaut';
import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { SSRPass } from 'three/addons/postprocessing/SSRPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { textures, painted, stone, fabric, glow } from './materials';
import {RESOURCES,terrainHeight,LEVEL_BLOCKS,SURVEY_SITES,type Kind} from '../content/config';
import type {Moon} from '../simulation/moon';

const mat=(color:number,roughness=.62,metalness=.22)=>painted(color,roughness,metalness);
function box(g:T.Group|T.Scene,w:number,h:number,d:number,color:number,x=0,y=0,z=0){const m=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.075,w*.1,h*.1,d*.1)),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function cylinder(g:T.Group|T.Scene,r1:number,r2:number,h:number,color:number,x:number,y:number,z:number,segments=10){const m=new T.Mesh(new T.CylinderGeometry(r1,r2,h,segments),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function label(text:string,width=512,height=128,bg='#172b38',fg='#f6ead2'){
  const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d')!;x.fillStyle=bg;x.fillRect(0,0,width,height);x.fillStyle=fg;x.font=`bold ${height*.49}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,width/2,height/2);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:texture});
}
export class View {
  scene=new T.Scene();camera=new T.PerspectiveCamera(70,1,.1,600);renderer:T.WebGLRenderer;
  samples=new Map<string,T.Group>();sampleRoot=new T.Group();avatar=new T.Group();arms:T.Group[]=[];legs:T.Group[]=[];tool=new T.Group();
  terrain:T.Mesh;ship=new T.Group();scanRing:T.Mesh;beam:T.Line;time=0;cameraReady=false;
  ray=new T.Raycaster();camTarget=new T.Vector3();occluders:T.Object3D[]=[];pulseOrigin=new T.Vector3();
  sun=new T.DirectionalLight(0xffd29d,4.1);composer!:EffectComposer;ao!:SSAOPass;ssr!:SSRPass;aoComposite!:ShaderPass;
  reflective:T.Mesh[]=[];low=false;reflections=false;dust!:T.Points;planet!:T.Mesh;
  drillLight=new T.PointLight(0xffaf51,0,5,2);footprints!:T.InstancedMesh;lastFootstep=0;footIndex=0;
  private lastFrame=0;private frameTimes:number[]=[];
  constructor(canvas:HTMLCanvasElement){
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFShadowMap;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.12;
    this.scene.background=new T.Color(0x0b1328);this.scene.fog=new T.FogExp2(0x28334e,.0023);
    this.scene.add(new T.HemisphereLight(0x92b8ec,0x55415b,.9));const sun=this.sun;sun.position.set(-28,28,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-29;sun.shadow.camera.right=29;sun.shadow.camera.top=29;sun.shadow.camera.bottom=-29;sun.shadow.camera.near=.5;sun.shadow.camera.far=115;sun.shadow.normalBias=.045;sun.shadow.bias=-.00008;sun.shadow.radius=3;this.scene.add(sun,sun.target);
    const rim=new T.DirectionalLight(0x86b8ff,1.2);rim.position.set(30,15,-35);this.scene.add(rim);
    const geo=new T.PlaneGeometry(120,120,80,80);geo.rotateX(-Math.PI/2);const attr=geo.attributes.position;const colors=[];
    for(let i=0;i<attr.count;i++){const x=attr.getX(i),z=attr.getZ(i),y=terrainHeight(x,z);attr.setY(i,y);const band=(Math.sin(x*.11+z*.055)+Math.cos(z*.14))*.25+.5;const c=new T.Color(0xc0a9b1).lerp(new T.Color(0xa8c4ca),band);c.lerp(new T.Color(0xe7b58c),Math.max(0,y*.14));colors.push(c.r,c.g,c.b);}
    geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();this.terrain=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,map:textures().map,bumpMap:textures().bump,bumpScale:.18,roughness:.96,metalness:.035}));this.terrain.receiveShadow=true;this.scene.add(this.terrain);this.occluders.push(this.terrain);
    this.makeSky();this.makeShip();this.makeLandscape();this.makeLevel();this.makeAvatar();this.makeDetails();
    this.scene.add(this.sampleRoot,this.avatar);
    this.scanRing=new T.Mesh(new T.RingGeometry(.97,1,100),new T.MeshBasicMaterial({color:0x78edef,transparent:true,opacity:.6,side:T.DoubleSide,depthWrite:false}));this.scanRing.rotation.x=-Math.PI/2;this.scanRing.visible=false;this.scene.add(this.scanRing);
    this.beam=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),new T.LineBasicMaterial({color:0xffd98a,transparent:true,opacity:.9}));this.scene.add(this.beam);
    this.scene.add(this.drillLight);
    // Capture static scenery once for physically based metal/visor reflections.
    const probeTarget=new T.WebGLCubeRenderTarget(128,{type:T.HalfFloatType});const probe=new T.CubeCamera(.1,400,probeTarget);probe.position.set(0,3,8);this.avatar.visible=false;probe.update(this.renderer,this.scene);this.avatar.visible=true;
    const pmrem=new T.PMREMGenerator(this.renderer);this.scene.environment=pmrem.fromCubemap(probeTarget.texture).texture;this.scene.environmentIntensity=.65;pmrem.dispose();probeTarget.dispose();
    this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.ao=new SSAOPass(this.scene,this.camera,innerWidth,innerHeight,16);this.ao.kernelRadius=2;this.ao.minDistance=.001;this.ao.maxDistance=.025;this.composer.addPass(this.ao);
    this.ssr=new SSRPass({renderer:this.renderer,scene:this.scene,camera:this.camera,width:innerWidth,height:innerHeight,selects:this.reflective,groundReflector:null});this.ssr.resolutionScale=.5;this.ssr.maxDistance=12;this.ssr.thickness=.12;this.ssr.opacity=.38;this.ssr.blur=true;this.ssr.distanceAttenuation=true;this.ssr.fresnel=true;this.ssr.enabled=false;this.composer.addPass(this.ssr);
    this.aoComposite=new ShaderPass({uniforms:{tDiffuse:{value:null},tAO:{value:null}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform sampler2D tDiffuse;uniform sampler2D tAO;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float a=texture2D(tAO,vUv).r;gl_FragColor=vec4(c.rgb*mix(1.0,a,.7),c.a);}'});this.aoComposite.uniforms.tAO.value=this.ao.blurRenderTarget.texture;this.aoComposite.enabled=false;this.composer.addPass(this.aoComposite);
    this.composer.addPass(new UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.27,.5,1.15));this.composer.addPass(new OutputPass());this.composer.addPass(new SMAAPass());
    this.resize();window.addEventListener('resize',()=>this.resize());
  }
  makeSky(){
    const sky=new T.Mesh(new T.SphereGeometry(350,48,24),new T.MeshBasicMaterial({map:textures().sky,side:T.BackSide,fog:false,toneMapped:false}));this.scene.add(sky);
    const stars:number[]=[];for(let i=0;i<950;i++){const a=i*2.3999,y=.04+(i%91)/100,r=Math.sqrt(1-Math.min(.98,y*y));stars.push(Math.sin(a)*r*300,y*300,Math.cos(a)*r*300);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(stars,3));this.scene.add(new T.Points(g,new T.PointsMaterial({color:0xd5dfec,size:.32,fog:false})));
    const planet=new T.Mesh(new T.SphereGeometry(24,64,48),new T.MeshStandardMaterial({map:textures().planet,color:0xffffff,roughness:1,fog:false}));planet.position.set(-75,27,-170);planet.rotation.z=-.24;this.planet=planet;this.scene.add(planet);
    const ring=new T.Mesh(new T.RingGeometry(29,44,160),new T.MeshBasicMaterial({color:0xd8b3d3,side:T.DoubleSide,transparent:true,depthWrite:false,opacity:.3,fog:false}));ring.position.copy(planet.position);ring.rotation.set(1.1,.1,-.32);this.scene.add(ring);
    for(let i=0;i<22;i++){const band=new T.Mesh(new T.RingGeometry(29+i*.67,29.12+i*.67,160),new T.MeshBasicMaterial({color:i%3?0xeec1a0:0x98d8e1,side:T.DoubleSide,transparent:true,depthWrite:false,opacity:.2+(i%4)*.07,fog:false}));band.position.copy(planet.position);band.rotation.copy(ring.rotation);this.scene.add(band);}
    const atmosphere=new T.Mesh(new T.SphereGeometry(24.5,48,32),new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.BackSide,blending:T.AdditiveBlending,vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),3.);gl_FragColor=vec4(.24,.65,.85,f*.45);}'}));atmosphere.position.copy(planet.position);this.scene.add(atmosphere);
  }
  makeShip(){
    const s=this.ship;this.scene.add(s);
    box(s,9.7,.1,10.8,0x354856,0,.04,-1);const deck=box(s,6.8,.02,6.8,0x809698,0,.11,0);deck.material=new T.MeshStandardMaterial({color:0x85999b,map:textures().deck,bumpMap:textures().deck,bumpScale:.025,roughness:.3,metalness:.72});this.reflective.push(deck);
    for(let x=-3;x<=3;x+=.65){const stripe=box(s,.33,.024,1,0xf4c86a,x,.125,3.05);stripe.rotation.y=.55;}
    for(let z=-3;z<3;z+=.6){box(s,.14,.024,.3,0xf4c86a,-3.3,.13,z);box(s,.14,.024,.3,0xf4c86a,3.3,.13,z);}
    box(s,1.1,3.4,8.8,0x54a4a5,-4.15,1.7,-1);box(s,1.1,3.4,8.8,0x54a4a5,4.15,1.7,-1);box(s,9.4,3.4,1.4,0x799391,0,1.7,-5.3);box(s,9.5,1,10.2,0xe4d7bd,0,4,-1);
    box(s,8.6,.85,7.8,0xd8ac79,0,4.8,-1.7);const cockpit=box(s,6.7,1.1,3.5,0x315264,0,5.6,-3);cockpit.material=new T.MeshPhysicalMaterial({color:0x174a62,metalness:.8,roughness:.17,clearcoat:1,clearcoatRoughness:.1});this.reflective.push(cockpit);
    const sign=new T.Mesh(new T.PlaneGeometry(5.7,.6),label('ALMOST CERTAIN'));sign.position.set(0,4,4.12);s.add(sign);
    const baySign=new T.Mesh(new T.PlaneGeometry(3.4,.55),label('CARGO // 40 VOL',512,96,'#172b38','#a4e7d9'));baySign.position.set(0,2.2,-4.58);s.add(baySign);
    const floorLabel=new T.Mesh(new T.PlaneGeometry(3.5,.65),label('DROP CARGO',512,128,'#4d656b','#e8e1c5'));floorLabel.rotation.x=-Math.PI/2;floorLabel.position.set(0,.133,0);s.add(floorLabel);
    for(const x of [-5.6,5.6]){cylinder(s,1.15,.85,3.7,0xe2ddc9,x,2,-2);cylinder(s,.85,1.1,.7,0x283d49,x,.9,-2);box(s,2.1,.5,1.8,0xe88754,x,.3,-2);cylinder(s,.7,.7,.5,0xeb9062,x,3.65,-2);}
    for(const x of [-4.2,4.2])for(const z of [-4.2,3]){box(s,.5,1.1,.5,0x293e4c,x,.4,z);box(s,1.4,.15,1.5,0x293e4c,x,.12,z);}
    for(const x of [-3.35,3.35]){const light=box(s,.1,2.3,.1,0x99eee0,x,1.55,3.4);light.material=glow(0x65edce,4);}
    cylinder(s,.08,.08,2.7,0x304758,2.6,6.2,-2);const dish=new T.Mesh(new T.SphereGeometry(.8,12,8,0,Math.PI*2,0,Math.PI*.4),mat(0xe5ccae));dish.position.set(2.6,7.5,-2);dish.rotation.z=.5;s.add(dish);
    for(let i=0;i<4;i++){const solar=box(s,.75,.06,4,0x233e50,-3.4+i*.8,5.42,-1.8);solar.material=painted(0x235d80,.22,.78);this.reflective.push(solar);}
    box(s,1,.9,1,0xdf985c,-2.6,.6,-3.6);box(s,1,.9,1,0xdf985c,-1.4,.6,-3.6);
    // Only the solid hull occludes the camera; floor signs are decorative.
    for(const mesh of s.children){if(mesh instanceof T.Mesh&&mesh.position.y>1&&mesh.geometry instanceof T.BoxGeometry)this.occluders.push(mesh);}
  }
  makeLandscape(){
    const pebbleGeo=new T.DodecahedronGeometry(1,1),pebbles=new T.InstancedMesh(pebbleGeo,stone(0xa6abb8),520),dummy=new T.Object3D();
    for(let i=0;i<520;i++){const a=i*2.39996,r=19+(i*13.37)%38,x=Math.sin(a)*r,z=Math.cos(a)*r,size=i<150?.2+(i%9)*.12:.025+(i%9)*.022;dummy.position.set(x,terrainHeight(x,z)+size*.25,z);dummy.scale.set(size,size*.62,size*.86);dummy.rotation.set(i*.8,i*.5,i);dummy.updateMatrix();pebbles.setMatrixAt(i,dummy.matrix);pebbles.setColorAt(i,new T.Color(i%4===0?0xc89983:i%4===1?0x8ba9ba:0xb5a8bb));}pebbles.receiveShadow=true;pebbles.castShadow=true;this.scene.add(pebbles);
    // Continuous distant ridges replace disconnected pyramid silhouettes; outside the playable boundary.
    const verts:number[]=[],uvs:number[]=[],indices:number[]=[],cols:number[]=[];const segments=160,rings=20;
    for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,r=60+j*5,x=Math.sin(a)*r,z=Math.cos(a)*r;const peaks=8+Math.sin(a*7)*4+Math.cos(a*13)*3+Math.sin(a*29)*1.8;const rise=Math.sin(Math.min(1,j/12)*Math.PI*.7);const y=terrainHeight(x,z)*(1-Math.min(1,j/4))+peaks*rise;verts.push(x,y-1,z);uvs.push(i/segments*12,j/rings*3);const c=new T.Color(0x8b7d92).lerp(new T.Color(0xc6968b),Math.max(0,y/20));cols.push(c.r,c.g,c.b);}
    for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+1,c=a+segments+1,d=c+1;indices.push(a,b,c,b,d,c);}const ridgeGeo=new T.BufferGeometry();ridgeGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));ridgeGeo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));ridgeGeo.setAttribute('color',new T.Float32BufferAttribute(cols,3));ridgeGeo.setIndex(indices);ridgeGeo.computeVertexNormals();const ridgeMat=stone(0xffffff);ridgeMat.vertexColors=true;ridgeMat.side=T.DoubleSide;const ridges=new T.Mesh(ridgeGeo,ridgeMat);ridges.receiveShadow=true;this.scene.add(ridges);
    for(let i=0;i<9;i++){const z=5+i*1.2;for(const x of [-1.4,1.4]){const strip=box(this.scene,.42,.025,.10,0xebc475,x,terrainHeight(x,z)+.035,z);strip.material=glow(i%3===0?0x74cfcc:0xffba65,1.8);strip.castShadow=false;}}
    for(const [x,z] of [[-7,8],[7,8],[-12,-8],[11,-8]]){const y=terrainHeight(x,z);cylinder(this.scene,.04,.06,2.5,0x354954,x,y+1.25,z);const flag=box(this.scene,.95,.5,.03,0xeb9960,x+.45,y+2.2,z);flag.rotation.y=.4;}
    const pad=new T.Mesh(new T.RingGeometry(10.6,10.75,80),new T.MeshBasicMaterial({color:0xc0b695,transparent:true,opacity:.55,side:T.DoubleSide}));pad.rotation.x=-Math.PI/2;pad.position.y=.04;this.scene.add(pad);
  }
  makeLevel(){
    for(const b of LEVEL_BLOCKS){const m=box(this.scene,b.w,b.h,b.d,b.color,b.x,b.y,b.z);this.occluders.push(m);}
    for(const site of SURVEY_SITES){
      for(const dx of [-3,3])for(const dz of [-2.5,2.5]){const m=box(this.scene,.2,.12,.65,0x89e8df,site.x+dx,site.y+.1,site.z+dz);m.material=glow(0x71e7d2,2.5);}
      cylinder(this.scene,.12,.2,4,0xe5bb79,site.x+2.8,site.y+2,site.z-2.5,12);
      const lamp=box(this.scene,.6,.4,.6,0xfbc775,site.x+2.8,site.y+4,site.z-2.5);lamp.material=glow(0xffc078,1.5);
      const sign=new T.Mesh(new T.PlaneGeometry(4,.6),label(site.name.toUpperCase(),512,96));sign.position.set(site.x,site.y+2.1,site.z-2.5);this.scene.add(sign);
      const disc=new T.Mesh(new T.RingGeometry(1.8,2,64),glow(0x7addd0,1.4));disc.rotation.x=-Math.PI/2;disc.position.set(site.x,site.y+.03,site.z);this.scene.add(disc);
    }
    // Guide lights follow the actual ground and lead around the hull to each ascent.
    for(const side of [-1,1])for(let i=0;i<10;i++){const x=side*(9+i*1.2),z=5-i*3;const h=terrainHeight(x,z);cylinder(this.scene,.06,.09,.8,0x314b59,x,h+.4,z,8);const lamp=box(this.scene,.15,.12,.15,0x8ae9df,x,h+.85,z);lamp.material=glow(side<0?0xffc078:0x79e5db,2);}
    for(const x of [-5,5]){const y=terrainHeight(x,-29);cylinder(this.scene,.2,.3,8,0xc89965,x,y+4,-29,12);box(this.scene,.7,.5,1,0x589e9d,x,y+7,-29);}
    const beam=box(this.scene,10,.35,.35,0xc89965,0,5,-29);beam.rotation.z=.08;
  }
  inspectSuit=false;
  pilot!:Astronaut;
  makeAvatar(){this.pilot=new Astronaut();this.avatar.add(this.pilot.root);this.tool=this.pilot.tool;this.reflective.push(this.pilot.visor);}
  makeDetails(){
    const s=this.ship;
    for(const side of [-1,1]){
      const x=side*4.73;
      // Recessed maintenance panels, fasteners, copper plumbing and radiator louvers.
      for(const z of [-3.6,-1.5,.6,2.3]){
        box(s,.045,1.5,1.65,0x1e4e60,x,1.8,z);
        box(s,.07,.12,1.65,0xf2a263,x+side*.015,2.58,z);
        for(let j=0;j<4;j++)box(s,.07,.045,1.3,0x7da4ad,x+side*.03,1.35+j*.23,z);
      }
      box(s,.14,.2,7.3,0xdd7d4e,x,3.16,-1);
      for(const z of [-4,2.3]){const pipe=cylinder(s,.09,.09,2.7,0xd09661,x+side*.07,1.65,z,12);pipe.material=painted(0xd09661,.4,.65);}
      const front=box(s,.72,.43,.07,0xef8a50,side*4.17,2.9,3.46);
      const light=box(s,.38,.08,.08,0xfde4b2,side*4.17,2.9,3.52);light.material=glow(0xffc789,4);
      front.castShadow=false;
      cylinder(s,.9,1.05,.16,0x2b4050,side*5.6,.65,-2,24);
      const engine=new T.Mesh(new T.TorusGeometry(.72,.065,8,32),glow(0x70d7ed,3));engine.rotation.x=Math.PI/2;engine.position.set(side*5.6,.54,-2);s.add(engine);
      const legBrace=box(s,.15,1.9,.16,0xa6b7b9,side*4.65,.9,2.6);legBrace.rotation.z=-side*.3;
    }
    // Interior lights are local, physically attenuated fills; only the sun casts a shadow map.
    const bay=new T.PointLight(0x73ebd7,24,12,2);bay.position.set(0,2.8,-1.6);s.add(bay);
    const door=new T.PointLight(0xffbb74,16,11,2);door.position.set(0,3.2,4.1);s.add(door);
    const ceiling=box(s,4.7,.06,.23,0xb9ffee,0,3.4,-1.5);ceiling.material=glow(0xaaf5e1,2.8);ceiling.castShadow=false;
    for(const x of [-2.65,-1.45]){box(s,.95,.08,.95,0x405561,x,.95,-3.6);for(const z of [-4,-3.2])box(s,1.04,.11,.06,0x344c58,x,.4,z);}
    const terminal=box(s,.8,.5,.08,0x1b4055,2.7,1.6,-4.5);terminal.material=glow(0x239fac,1.1);
    const screen=new T.Mesh(new T.PlaneGeometry(.65,.32),label('SYSTEM OK',256,128,'#164753','#93f6c7'));screen.position.set(2.7,1.6,-4.44);s.add(screen);
    for(let i=0;i<3;i++){const fin=box(s,.07,.45,2.2,0xdee3d0,3.1+i*.35,5.5,.7);fin.rotation.z=-.16;}
    const plate=new T.Mesh(new T.PlaneGeometry(1.4,.65),label('S.P.A.C.E.',512,128,'#b86e41','#eee2c9'));plate.position.set(-2.4,4.05,4.135);s.add(plate);
    // Soft boot-tread decals are pooled in one draw call and never enter the physics world.
    const boot=document.createElement('canvas');boot.width=boot.height=64;const ctx=boot.getContext('2d')!;ctx.fillStyle='rgba(43,31,54,.35)';ctx.beginPath();ctx.roundRect(18,5,28,52,10);ctx.fill();ctx.fillStyle='rgba(29,24,43,.3)';for(let y=12;y<53;y+=7)ctx.fillRect(21,y,22,3);
    const bootMap=new T.CanvasTexture(boot);this.footprints=new T.InstancedMesh(new T.PlaneGeometry(.4,.65),new T.MeshBasicMaterial({map:bootMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),96);this.footprints.frustumCulled=false;this.footprints.count=0;this.scene.add(this.footprints);
    const points:number[]=[];for(let i=0;i<110;i++){const a=i*2.399,r=8+(i*2.31)%45;points.push(Math.sin(a)*r,.2+(i%13)*.2,Math.cos(a)*r);}const dg=new T.BufferGeometry();dg.setAttribute('position',new T.Float32BufferAttribute(points,3));this.dust=new T.Points(dg,new T.PointsMaterial({color:0xd9bfae,size:.035,transparent:true,opacity:.32,depthWrite:false}));this.scene.add(this.dust);
  }
  makeSample(kind:Kind){
    const g=new T.Group(),c=RESOURCES[kind];
    if(kind==='glass'){for(let i=0;i<5;i++){const crystal=new T.Mesh(new T.ConeGeometry(.15+(i%2)*.07,.65+(i%3)*.14,6),new T.MeshPhysicalMaterial({color:c.color,metalness:.22,roughness:.12,clearcoat:1,flatShading:true,emissive:c.color,emissiveIntensity:.65}));crystal.position.set(Math.sin(i*2.4)*.22,-.12,Math.cos(i*2.4)*.22);crystal.rotation.z=Math.sin(i)*.4;g.add(crystal);}}
    else {const rock=new T.Mesh(new T.DodecahedronGeometry(c.radius,1),stone(kind==='ore'?0xa77a59:0x80789e));g.add(rock);for(let i=0;i<6;i++){const chunk=new T.Mesh(new T.OctahedronGeometry(c.radius*.36,0),new T.MeshStandardMaterial({color:c.color,roughness:.26,metalness:.65,emissive:c.color,emissiveIntensity:kind==='core'?.24:.1}));chunk.position.set(Math.sin(i*2.4)*c.radius*.65,Math.sin(i*1.3)*c.radius*.6,Math.cos(i*2.4)*c.radius*.65);g.add(chunk);}}
    const halo=new T.Mesh(new T.TorusGeometry(c.radius+.14,.018,4,28),new T.MeshBasicMaterial({color:c.color}));halo.rotation.x=Math.PI/2;halo.position.y=-c.radius+.04;halo.name='halo';g.add(halo);
    g.traverse(o=>{if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true;}});return g;
  }
  reset(moon:Moon){
    this.sampleRoot.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});this.sampleRoot.clear();this.samples.clear();
    for(const s of moon.samples){const g=this.makeSample(s.kind);this.samples.set(s.id,g);this.sampleRoot.add(g);}this.cameraReady=false;this.footprints.count=0;this.footIndex=0;this.lastFootstep=0;
  }
  scanAt(moon:Moon){this.pulseOrigin.copy(moon.player.translation() as T.Vector3);}
  resize(){const w=window.innerWidth,h=window.innerHeight;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.composer?.setPixelRatio(this.renderer.getPixelRatio());this.composer?.setSize(w,h);}
  quality(low:boolean,reflections=false){
    if(this.low===low&&this.reflections===reflections)return;
    const changed=this.low!==low;this.low=low;this.reflections=reflections;this.renderer.setPixelRatio(low?1:Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;
    if(changed){this.sun.shadow.mapSize.setScalar(low?1024:2048);this.sun.shadow.map?.dispose();this.sun.shadow.map=null;this.sun.shadow.needsUpdate=true;}
    this.ssr.enabled=reflections&&!low;this.aoComposite.enabled=this.ssr.enabled;this.dust.visible=!low;this.resize();
  }
  project(position:{x:number;y:number;z:number}){const p=new T.Vector3(position.x,position.y,position.z).project(this.camera);return {x:(p.x*.5+.5)*innerWidth,y:(-p.y*.5+.5)*innerHeight,visible:p.z<1&&p.z>0&&Math.abs(p.x)<.92&&Math.abs(p.y)<.9};}
  update(moon:Moon,dt:number,yaw:number,pitch:number,intro:boolean,fov:number){
    if(import.meta.env.DEV){const now=performance.now();if(this.lastFrame&&now-this.lastFrame<300){this.frameTimes.push(now-this.lastFrame);if(this.frameTimes.length>120)this.frameTimes.shift();}this.lastFrame=now;const stats=document.getElementById('qa-stats');if(stats&&this.frameTimes.length){const average=this.frameTimes.reduce((a,b)=>a+b,0)/this.frameTimes.length;stats.textContent=`${Math.round(1000/average)} fps · ${average.toFixed(1)} ms · ${this.low?'performance':this.reflections?'reflections':'high'} · ${this.renderer.info.memory.geometries} geometries`;}}
    this.time+=dt;const p=moon.player.translation(),v=moon.player.linvel(),speed=Math.hypot(v.x,v.z);
    const focus=intro?new T.Vector3(0,0,4):new T.Vector3(p.x,0,p.z);
    // Stabilize the shadow volume to texels so it follows exploration without shimmer.
    const texel=58/(this.low?1024:2048);focus.x=Math.round(focus.x/texel)*texel;focus.z=Math.round(focus.z/texel)*texel;this.sun.target.position.copy(focus);this.sun.position.copy(focus).add(new T.Vector3(-28,28,18));
    this.planet.rotation.y=this.time*.004;this.dust.rotation.y=this.time*.0015;
    if(!intro&&moon.grounded&&speed>.8&&moon.walkDistance-this.lastFootstep>.72){this.lastFootstep=moon.walkDistance;const side=this.footIndex%2?-.18:.18,x=p.x+Math.cos(yaw)*side,z=p.z+Math.sin(yaw)*side,dummy=new T.Object3D();dummy.position.set(x,terrainHeight(x,z)+.018,z);dummy.rotation.set(-Math.PI/2,0,yaw);dummy.updateMatrix();this.footprints.setMatrixAt(this.footIndex%96,dummy.matrix);this.footIndex++;this.footprints.count=Math.min(96,this.footIndex);this.footprints.instanceMatrix.needsUpdate=true;}
    for(const s of moon.samples){const g=this.samples.get(s.id)!;g.visible=s.state==='deposit'||s.state==='loose';if(!g.visible)continue;g.position.copy(s.body.translation() as T.Vector3);g.quaternion.copy(s.body.rotation() as T.Quaternion);const halo=g.getObjectByName('halo')!;halo.visible=s.state==='deposit'&&(moon.scanReveal>0||moon.target===s);halo.rotation.z=this.time*.3;g.scale.setScalar(s.kind==='glass'?.8+s.condition*.2:1);}
    this.avatar.position.set(p.x,p.y-.84,p.z);
    const face=speed>.1&&!moon.held&&!moon.drilling?Math.atan2(v.x,-v.z):yaw;
    let delta=-face-this.avatar.rotation.y;delta=Math.atan2(Math.sin(delta),Math.cos(delta));this.avatar.rotation.y+=delta*Math.min(1,dt*10);
    this.pilot.update(moon,dt,this.time,speed);
    this.beam.visible=moon.drilling&&!!moon.target;this.drillLight.intensity=this.beam.visible?3+Math.sin(this.time*57)*1.5:0;if(this.beam.visible){const start=new T.Vector3(0,0,-.55);this.tool.localToWorld(start);const end=moon.target!.body.translation();this.beam.geometry.setFromPoints([start,new T.Vector3(end.x,end.y,end.z)]);this.drillLight.position.set(end.x,end.y+.3,end.z);}
    this.scanRing.visible=moon.scanReveal>6;if(this.scanRing.visible){const radius=(8-moon.scanReveal)*12;this.scanRing.scale.setScalar(Math.max(.1,radius));this.scanRing.position.set(this.pulseOrigin.x,terrainHeight(this.pulseOrigin.x,this.pulseOrigin.z)+.09,this.pulseOrigin.z);(this.scanRing.material as T.MeshBasicMaterial).opacity=(moon.scanReveal-6)*.3;}
    if(import.meta.env.DEV&&this.inspectSuit){this.camera.position.set(p.x+2.5,p.y+1.3,p.z-3.5);this.camera.lookAt(p.x,p.y+.2,p.z);this.cameraReady=false;}
    else if(intro){const angle=.68+Math.sin(this.time*.035)*.04;this.camera.position.set(Math.sin(angle)*39,20,Math.cos(angle)*39);this.camera.lookAt(-3,2,4);this.cameraReady=false;}
    else {
      const target=new T.Vector3(p.x,p.y+.7,p.z),distance=5.7,offset=new T.Vector3(-Math.sin(yaw)*Math.cos(pitch)*distance,Math.sin(pitch)*distance+1.1,Math.cos(yaw)*Math.cos(pitch)*distance);
      this.ray.set(target,offset.clone().normalize());this.ray.far=offset.length();const hit=this.ray.intersectObjects(this.occluders,false)[0];if(hit)offset.setLength(Math.max(1,hit.distance-.25));
      const goal=target.clone().add(offset);if(!this.cameraReady){this.camera.position.copy(goal);this.camTarget.copy(target);this.cameraReady=true;}else{this.camera.position.lerp(goal,1-Math.exp(-12*dt));this.camTarget.lerp(target,1-Math.exp(-18*dt));}this.camera.lookAt(this.camTarget);
    }
    if(this.camera.fov!==fov){this.camera.fov=fov;this.camera.updateProjectionMatrix();}
    if(this.low)this.renderer.render(this.scene,this.camera);else this.composer.render(dt);
  }
}
