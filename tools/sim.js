const fs=require('fs');const src=fs.readFileSync(process.argv[2]+'/data.js','utf8')+fs.readFileSync(process.argv[2]+'/jobs2.js','utf8')+fs.readFileSync(process.argv[2]+'/engine.js','utf8');
const api=new Function(src+';return {newRun,beginYear,commitAlloc,choose,nextEvent,advance,actionsOf,cardById,visibleChoices,locked,titleOf,CARDS,slotsOf,networth,JOBS,ranksNow};')();
const N=+process.argv[3]||800;
const AVOID=['found','found_team','found_with_rival','found_family','quit_move','go_free','switch_job','retire_now','retire_self','honor_retire','sell','severance','sabbatical','leave'];
const PREF={org:['politics','mad','night','body','loyal'],craft:['master','lifelong','hands','body','night'],biz:['eye','mad','night','body','nerve'],fame:['speaker','body','night','lifelong'],wealth:['compound','frugal','body','night'],life:['family','calm','body'],random:[]};
function plan(s,style,R){
  const acts=api.actionsOf(s).map(a=>a[0]);const al={};const add=k=>{if(acts.includes(k))al[k]=(al[k]||0)+1;else al.rest=(al.rest||0)+1;};
  let n=s.slots;if(n===0)return al;
  if(style==='random'){for(let i=0;i<n;i++)add(acts[Math.floor(R()*acts.length)]);return al;}
  const w=acts.includes('work');
  if(!w){ for(let i=0;i<n;i++){ if(s.stats.burn>55)add('rest'); else add(R()<0.75?'study':(R()<0.5?'family':acts[1])); } return al; }
  if(s.stats.burn>60){add('rest');n--;} if(n>0&&s.stats.burn>85){add('rest');n--;}
  const seq={org:['work','network','work','study','work'],craft:['work','study','craft','study','craft'],biz:['work','work','network','work','study'],fame:['work','fame','fame','study','fame'],wealth:['work','invest','work','invest','study'],life:['work','family','family','study','work']}[style];
  if(style==='org'&&s.stats.net>75) seq[1]='study';
  if(style==='life'&&s.stats.life>85) seq[1]='study';
  if(style==='wealth'&&s.age<25){seq[1]='study';seq[3]='study';}
  if(style==='biz'&&s.track!=='founder'){seq[1]='study';}
  for(let i=0;i<n;i++)add(seq[i%seq.length]);
  return al;
}
const out={};
for(const style of ['random','org','craft','biz','fame','wealth','life']){
  const ends={},peaks={},best={org:0,craft:0,biz:0,fame:0,wealth:0,life:0};let errs=0,evs=0,yrs=0,any=0,nw=[],gd=0;const seen={};
  for(let i=1;i<=N;i++){
    let r=i*7919+style.length;const R=()=>{r=(r*1103515245+12345)&0x7fffffff;return r/0x7fffffff;};
    try{
      const s=api.newRun(i*7919,'');api.beginYear(s);let guard=0;
      while(s.phase!=='ending'&&guard++<3000){
        if(s.phase==='alloc'){s.flashes.length=0;
          if(style==='biz'&&s.track==='career'&&s.age>=27&&s.age<50&&s.stats.money>=api.JOBS[s.job].cost+3000&&!s.onLeave&&!s.flags.closed_once){ s.current='resign';s.phase='event';api.choose(s,1);s.result=null;s.slots=api.slotsOf(s);s.phase='alloc'; }
          if(style==='fame'&&s.track==='career'&&s.stats.fame>=22&&s.stats.skill>=30&&!s.onLeave){ s.current='resign';s.phase='event';api.choose(s,2);s.result=null;s.slots=api.slotsOf(s);s.phase='alloc'; }
          api.commitAlloc(s,plan(s,style,R));yrs++;}
        else if(s.phase==='event'){const c=api.cardById(s.current);seen[c.id]=1;let v=api.visibleChoices(s,c).filter(x=>!api.locked(s,x.c));
          if(c.id==='perk'){const pf=PREF[style];const hit=v.find(x=>pf.includes(x.c.perkId));api.choose(s,(hit||v[Math.floor(R()*v.length)]).i);evs++;continue;}
          const ok=v.filter(x=>{const d=x.c.effects&&x.c.effects.do;if(!d)return true;if(style==='biz'&&d.startsWith('found'))return true;if(style==='random')return true;return !AVOID.includes(d);});
          if(ok.length)v=ok;if(!v.length){errs++;console.log('nochoice',c.id);break;}
          api.choose(s,v[Math.floor(R()*v.length)].i);evs++;}
        else if(s.phase==='result'){s.flashes.length=0;api.nextEvent(s);}
        else{errs++;console.log('badphase',s.phase);break;}
      }
      if(!s.final){errs++;console.log('nofinal',style,i,s.phase,s.age,guard);continue;}
      for(const k of Object.keys(s.stats))if(!Number.isFinite(s.stats[k])){errs++;console.log('NaN',k);}
      ends[s.final.kind]=(ends[s.final.kind]||0)+1;if(s.final.peaks.length)any++;
      for(const p of s.final.peaks)peaks[p.path]=(peaks[p.path]||0)+1;
      for(const p in best)best[p]+=s.best[p];nw.push(api.networth(s));gd+=Object.keys(s.goalsDone||{}).length;
    }catch(e){errs++;console.log('ERR',style,i,e.stack.split('\n').slice(0,3).join(' | '));if(errs>4)process.exit(1);}
  }
  nw.sort((a,b)=>a-b);for(const p in best)best[p]=+(best[p]/N).toFixed(2);
  console.log(style.padEnd(7),'peak%',(any/N*100).toFixed(1),JSON.stringify(peaks),'ends',JSON.stringify(ends),'avgRank',JSON.stringify(best),'nwMed',nw[N>>1],'ev/yr',(evs/yrs).toFixed(2),'goals',(gd/N).toFixed(2),'errs',errs);
  out[style]=seen;
}
const all=new Set();for(const k in out)for(const id in out[k])all.add(id);
console.log('never:',api.CARDS.filter(c=>!all.has(c.id)).map(c=>c.id));
