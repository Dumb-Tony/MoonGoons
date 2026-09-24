import test from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import {Moon} from '../src/simulation/moon.ts';
import {SurveyPilot} from '../src/simulation/survey-pilot.ts';
await RAPIER.init();
const idle={x:0,z:0,yaw:0,jump:false,burst:false,grab:false,scan:false,use:false,sprint:false,brace:false};
test('jetpack flies, exhausts, falls and recharges only after landing',()=>{
 const m=new Moon();try{m.start(true);for(let i=0;i<60;i++)m.step(idle);const y=m.player.translation().y;
 for(let i=0;i<300;i++)m.step({...idle,jet:true});assert.ok(m.player.translation().y>y+10);assert.equal(m.fuel,0);assert.equal(m.jetting,false);
 for(let i=0;i<120;i++)m.step(idle);assert.equal(m.fuel,0);assert.ok(m.player.linvel().y<0);
 for(let i=0;i<1200;i++)m.step(idle);assert.ok(m.grounded);assert.equal(m.fuel,100);
 }finally{m.dispose();}
});
test('both authored elevated relays can be flown, landed on and returned from',()=>{
 const m=new Moon();try{m.start();const pilot=new SurveyPilot();let i=0;for(;i<15000&&!pilot.done;i++){m.step(pilot.input(m));m.events.length=0;}
 assert.ok(pilot.done,`stage ${pilot.stage}, position ${JSON.stringify(m.player.translation())}, fuel ${m.fuel}, surveyed ${[...m.surveyed]}`);
 assert.equal(m.surveyed.size,2);assert.equal(m.recalls,0);assert.ok(m.remaining>60);assert.ok(m.nearShip);console.log('Survey route seconds:',Math.round(m.elapsed));
 }finally{m.dispose();}
});

test('raised decks support gentle cargo placement and airborne ship overflight is not aboard',()=>{
 const m=new Moon();try{m.start(true);for(let i=0;i<60;i++)m.step(idle);const s=m.samples[2];m.extract(s);m.player.setTranslation({x:-22,y:9.9,z:-26},true);m.player.setLinvel({x:0,y:0,z:0},true);s.body.setTranslation({x:-22,y:11,z:-27.7},true);m.held=s;s.collider.setCollisionGroups(0x0004fffd);for(let i=0;i<180;i++)m.step({...idle,brace:true});assert.equal(m.held,s);assert.ok(s.body.translation().y>9.5);m.player.setTranslation({x:0,y:20,z:0},true);assert.equal(m.nearShip,false);}finally{m.dispose();}
});

test('heavy cargo reduces jetpack lift while remaining attached',()=>{
 const heights=[];for(const loaded of [false,true]){const m=new Moon();try{m.start(true);for(let i=0;i<60;i++)m.step(idle);if(loaded){const s=m.samples[5];m.extract(s);s.body.setTranslation({x:0,y:1.5,z:14.3},true);m.held=s;s.collider.setCollisionGroups(0x0004fffd);}for(let i=0;i<90;i++)m.step({...idle,jet:true});heights.push(m.player.translation().y);if(loaded)assert.ok(m.held);}finally{m.dispose();}}assert.ok(heights[1]<heights[0]-1);
});
