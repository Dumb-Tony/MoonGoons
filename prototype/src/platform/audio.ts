export class Sound {
  context:AudioContext|null=null; volume=.35;
  unlock(){if(!this.context)this.context=new AudioContext();void this.context.resume();}
  private jetGain:GainNode|null=null;
  thruster(active:boolean){
    const c=this.context;if(!c)return;
    if(active&&!this.jetGain){const buffer=c.createBuffer(1,c.sampleRate,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const source=c.createBufferSource();source.buffer=buffer;source.loop=true;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=500;this.jetGain=c.createGain();this.jetGain.gain.value=0;source.connect(filter);filter.connect(this.jetGain);this.jetGain.connect(c.destination);source.start();}
    this.jetGain?.gain.setTargetAtTime(active?this.volume*.18:0,c.currentTime,.06);
  }
  play(kind:'jump'|'scan'|'bank'|'drill'|'heat'|'grab'|'warning') {
    if(!this.context||this.volume===0)return;
    const c=this.context, o=c.createOscillator(),g=c.createGain(),t=c.currentTime;
    const frequency={jump:190,scan:650,bank:520,drill:75,heat:140,grab:260,warning:350}[kind];
    o.type=kind==='drill'?'triangle':'sine';o.frequency.setValueAtTime(frequency,t);o.frequency.exponentialRampToValueAtTime(frequency*(kind==='jump'||kind==='bank'?2: .65),t+.17);
    g.gain.setValueAtTime(this.volume*(kind==='drill'?.1:.2),t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.25);
  }
}
