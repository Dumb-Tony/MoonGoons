import {terrainHeight,SURVEY_SITES} from '../content/config.ts';
import type {Moon,Input} from './moon.ts';
/** Development input replay: no teleporting, fuel overrides or survey flag writes. */
export class SurveyPilot {
  stage=0;arriving=false;done=false;
  points=[{x:-12,z:10},{x:-22,z:-10},{x:-22,z:-27,site:0},{x:-22,z:-10},{x:12,z:10},{x:20,z:-10},{x:20,z:-29,site:1},{x:20,z:-10},{x:0,z:10},{x:0,z:1}];
  input(m:Moon):Input{
    const idle:Input={x:0,z:0,yaw:m.yaw,jump:false,burst:false,grab:false,scan:false,use:false,sprint:false,brace:true,jet:false};
    if(this.done)return idle;
    const w=this.points[this.stage],p=m.player.translation(),d=Math.hypot(w.x-p.x,w.z-p.z),site=w.site===undefined?null:SURVEY_SITES[w.site];
    const targetY=site?site.y+3:terrainHeight(w.x,w.z)+1;
    if(site&&d<1.3&&p.y>site.y+.9)this.arriving=true;
    if(d<1.1&&(!site||m.surveyed.has(site.name))&&m.grounded){
      if(m.fuel<98)return idle;
      this.stage++;this.arriving=false;this.done=this.stage===this.points.length;return idle;
    }
    const fly=!!site&&!this.arriving&&p.y<targetY;
    return {...idle,yaw:Math.atan2(w.x-p.x,-(w.z-p.z)),z:d>1?1:0,brace:d<2,jet:fly};
  }
}
