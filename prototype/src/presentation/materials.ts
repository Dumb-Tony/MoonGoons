import * as T from 'three';

/** Repeatable, locally authored texture maps. No network requests or random gameplay state. */
function random(seed:number){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function canvas(size:number){const c=document.createElement('canvas');c.width=c.height=size;return c;}
function texture(c:HTMLCanvasElement,color=true,repeat=1){const t=new T.CanvasTexture(c);t.colorSpace=color?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=8;return t;}
function noise(x:number,y:number,period:number){
  const hash=(a:number,b:number)=>{a=((a%period)+period)%period;b=((b%period)+period)%period;let n=Math.imul(a,374761393)+Math.imul(b,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  return T.MathUtils.lerp(T.MathUtils.lerp(hash(ix,iy),hash(ix+1,iy),u),T.MathUtils.lerp(hash(ix,iy+1),hash(ix+1,iy+1),u),v);
}
function groundMaps(){
  const c=canvas(512),b=canvas(512),ctx=c.getContext('2d')!,bx=b.getContext('2d')!,rgb=ctx.createImageData(512,512),height=bx.createImageData(512,512),r=random(312);
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const coarse=noise(x/64,y/64,8),fine=noise(x/12.8,y/12.8,40),grain=r(),p=(y*512+x)*4;
    const n=coarse*.62+fine*.28+grain*.10,ridge=Math.pow(Math.abs(fine-.5)*2,3);
    rgb.data[p]=125+n*75+ridge*15;rgb.data[p+1]=117+n*69;rgb.data[p+2]=131+n*68;
    const h=75+n*100+grain*55;for(let k=0;k<3;k++)height.data[p+k]=h;rgb.data[p+3]=height.data[p+3]=255;
  }
  ctx.putImageData(rgb,0,0);bx.putImageData(height,0,0);
  // Crater depressions and rim highlights tile across all four texture boundaries.
  for(let i=0;i<34;i++){const x=r()*512,y=r()*512,size=3+r()*17;for(const ox of [-512,0,512])for(const oy of [-512,0,512]){const px=x+ox,py=y+oy;const g=ctx.createRadialGradient(px-size*.2,py-size*.2,0,px,py,size);g.addColorStop(0,'rgba(34,31,49,.34)');g.addColorStop(.64,'rgba(41,37,52,.22)');g.addColorStop(.83,'rgba(231,207,183,.15)');g.addColorStop(1,'rgba(220,204,188,0)');ctx.fillStyle=g;ctx.fillRect(px-size,py-size,size*2,size*2);}}
  return{map:texture(c,true,20),bump:texture(b,false,20),rock:texture(c,true,1.5),rockBump:texture(b,false,1.5)};
}
function panelMaps(){
  const c=canvas(512),ctx=c.getContext('2d')!,r=random(821);ctx.fillStyle='#d4d5d5';ctx.fillRect(0,0,512,512);
  for(let i=0;i<18000;i++){const v=120+r()*115;ctx.fillStyle=`rgba(${v},${v},${v},.08)`;ctx.fillRect(r()*512,r()*512,1+r()*3,1);}
  for(let y=0;y<512;y+=128)for(let x=0;x<512;x+=256){ctx.strokeStyle='#697582';ctx.lineWidth=3;ctx.strokeRect(x+5,y+5,246,118);ctx.strokeStyle='#f1efde';ctx.lineWidth=1;ctx.strokeRect(x+8,y+8,240,112);for(const dx of [16,240])for(const dy of [16,112]){ctx.fillStyle='#697078';ctx.beginPath();ctx.arc(x+dx,y+dy,2.5,0,7);ctx.fill();}}
  for(let i=0;i<130;i++){ctx.strokeStyle=`rgba(38,47,59,${.04+r()*.15})`;ctx.lineWidth=.5+r();const x=r()*512,y=r()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+4+r()*24,y+r()*3);ctx.stroke();}
  return texture(c);
}
function fabricMap(){const c=canvas(256),ctx=c.getContext('2d')!;ctx.fillStyle='#d5d7d7';ctx.fillRect(0,0,256,256);for(let y=0;y<256;y+=4)for(let x=0;x<256;x+=4){ctx.fillStyle=(x+y)%8===0?'#a2a8ae':'#f0eee5';ctx.fillRect(x,y,3,1);ctx.fillRect(x,y+1,1,3);}return texture(c,false,3);}
function deckMap(){const c=canvas(512),ctx=c.getContext('2d')!;ctx.fillStyle='#738392';ctx.fillRect(0,0,512,512);for(let y=0;y<512;y+=24)for(let x=0;x<512;x+=32){ctx.save();ctx.translate(x+(y%48?16:0),y);ctx.rotate(Math.PI/4);ctx.fillStyle='#9eaeb4';ctx.fillRect(-6,-1,12,3);ctx.fillStyle='#445260';ctx.fillRect(-6,2,12,2);ctx.restore();}return texture(c,true,3);}
function planetMap(){const c=canvas(1024),ctx=c.getContext('2d')!,data=ctx.createImageData(1024,1024);const palette=[[89,140,157],[135,168,172],[221,191,153],[192,137,123],[161,133,165]];
  for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){const swirl=noise(x/80,y/42,20),v=.5+.28*Math.sin(y*.021+swirl*.7)+.13*Math.sin(y*.071+swirl*.8);const index=Math.min(3,Math.floor(v*4)),f=v*4-index,p=(y*1024+x)*4;for(let k=0;k<3;k++)data.data[p+k]=T.MathUtils.lerp(palette[index][k],palette[index+1][k],f);data.data[p+3]=255;}ctx.putImageData(data,0,0);return texture(c);}
function skyMap(){const c=document.createElement('canvas');c.width=2048;c.height=1024;const x=c.getContext('2d')!,r=random(720);x.fillStyle='#070e20';x.fillRect(0,0,c.width,c.height);
  for(let i=0;i<110;i++){const px=r()*2048,py=230+Math.sin(px/450)*120+(r()-.5)*170,rad=80+r()*140;const g=x.createRadialGradient(px,py,0,px,py,rad);g.addColorStop(0,i%2?'rgba(68,38,102,.12)':'rgba(24,99,121,.09)');g.addColorStop(1,'rgba(5,12,28,0)');x.fillStyle=g;x.fillRect(px-rad,py-rad,rad*2,rad*2);}
  for(let i=0;i<2000;i++){const px=r()*2048,py=r()*820;x.fillStyle=`rgba(${i%3?196:249},${i%3?208:199},242,${.1+r()*.65})`;x.fillRect(px,py,r()>.99?2:1,1);}return texture(c);}
let maps:ReturnType<typeof createMaps>|undefined;
function createMaps(){return{...groundMaps(),panel:panelMaps(),fabric:fabricMap(),deck:deckMap(),planet:planetMap(),sky:skyMap()};}
export function textures(){return maps??=createMaps();}
export function painted(color:number,roughness=.62,metalness=.22){return new T.MeshStandardMaterial({color,map:textures().panel,bumpMap:textures().panel,bumpScale:.013,roughness,metalness});}
export function stone(color:number){return new T.MeshStandardMaterial({color,map:textures().rock,bumpMap:textures().rockBump,bumpScale:.12,roughness:.95,metalness:.06,flatShading:true});}
export function fabric(color:number){return new T.MeshStandardMaterial({color,bumpMap:textures().fabric,bumpScale:.025,roughness:.86});}
export function glow(color:number,intensity=3){return new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.28,metalness:.3});}
