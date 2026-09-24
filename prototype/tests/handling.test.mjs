import test from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {Moon} from '../src/simulation/moon.ts';
await RAPIER.init();
const idle={x:0,z:0,yaw:0,jump:false,burst:false,grab:false,scan:false,use:false,sprint:false,brace:false};
test('air bracing arrests drift without cancelling the fall',()=>{
  const travel=[];
  for(const brace of [false,true]){const m=new Moon();try{m.start(true);m.player.setTranslation({x:0,y:12,z:16},true);m.player.setLinvel({x:4,y:0,z:0},true);for(let i=0;i<60;i++)m.step({...idle,brace});travel.push(m.player.translation().x);assert.ok(m.player.linvel().y< -2);assert.equal(m.charges,2);}finally{m.dispose();}}
  assert.ok(travel[1]<travel[0]*.5,`braced ${travel[1]} / coast ${travel[0]}`);
});
test('bracing lowers cargo and gentle release banks it undamaged',()=>{
  const m=new Moon();try{m.start(true);for(let i=0;i<80;i++)m.step(idle);const s=m.samples[2];m.extract(s);m.player.setTranslation({x:0,y:.9,z:1},true);m.player.setLinvel({x:0,y:0,z:0},true);s.body.setTranslation({x:0,y:1.5,z:-.7},true);m.held=s;s.collider.setCollisionGroups(0x0004fffd);
    for(let i=0;i<120;i++)m.step(idle);const carryY=s.body.translation().y;
    for(let i=0;i<120;i++)m.step({...idle,brace:true});assert.ok(s.body.translation().y<carryY-.3);assert.equal(m.held,s);
    m.step({...idle,brace:true,grab:true});assert.equal(m.held,null);
    for(let i=0;i<240;i++)m.step(idle);assert.equal(s.state,'secured');assert.equal(s.condition,1);assert.equal(m.credits,65);
  }finally{m.dispose();}
});
