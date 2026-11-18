"use strict";
/* ============ 엔진 (화면과 분리) ============ */
function rnd(s){ s.seed=(s.seed+0x6D2B79F5)|0; let t=s.seed; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }
function ri(s,a,b){ return a+Math.floor(rnd(s)*(b-a+1)); }
function pick(s,arr){ return arr[Math.floor(rnd(s)*arr.length)]; }
function wpick(s,arr,wf){ let tot=0; for(const x of arr) tot+=wf(x); let r=rnd(s)*tot; for(const x of arr){ r-=wf(x); if(r<0) return x; } return arr[arr.length-1]; }
function skillCap(s){ return Math.min(100,60+10*s.mp+(s.flags.cap_up?10:0)); }
function clampStats(s){
  const st=s.stats; if(st.skill>skillCap(s)) st.skill=skillCap(s);
  for(const k of ["skill","rep","net","fame","life","burn"]) st[k]=Math.max(0,Math.min(100,Math.round(st[k])));
  st.money=Math.round(st.money); s.assets=Math.max(0,Math.round(s.assets));
  if(st.burn>s.maxBurn) s.maxBurn=st.burn;
}
function has(s,t){ return s.traits.indexOf(t)>=0; }
function perk(s,p){ return s.perks.indexOf(p)>=0; }
function job(s){ return JOBS[s.job]; }
function working(s){ return WORKING.indexOf(s.track)>=0; }
function networth(s){ return s.stats.money+s.assets; }
function opusOf(s){ return job(s).opus||"대표작"; }
function titleOf(s){
  if(s.track==="school") return (s.edu==="univ"||s.edu==="college")?"대학생":"고등학생";
  if(s.track==="rest") return s.everJoined?"구직 중":"취업 준비생";
  if(s.track==="free") return job(s).free;
  return (s.track==="founder"?job(s).ftitles:job(s).titles)[s.stage];
}
function orgOf(s){
  if(s.track==="school") return EDU[s.edu];
  if(s.track==="rest") return "소속 없음";
  if(s.track==="free") return "소속 없음, 내 이름으로 일한다";
  return s.company;
}
function mark(s,k,t){ s.marks.push({age:s.age,k:k,t:t}); }
function flash(s,kind,title,sub){ s.flashes.push({kind:kind,title:title,sub:sub||""}); }
function logAdd(s,text,shame){ s.log.push({age:s.age,text:text,shame:!!shame}); }
function resumeAdd(s,text){ s.resume.push({age:s.age,text:text}); }
function cardIssue(s){ const c={age:s.age,title:titleOf(s),org:orgOf(s),job:s.job,track:s.track,stage:s.stage,co:s.company,tier:s.track==="career"?(s.companyMult>=1.2?"big":"small"):s.track==="founder"?"own":"",edu:s.edu,ghost:s.track==="career"&&!!s.company&&s.company===s.ghostCo}; const l=s.cards[s.cards.length-1]; if(!l||l.title!==c.title||l.org!==c.org) s.cards.push(c); }

function newRun(seed,name,hist){
  const s={v:4,goals:[],goalsDone:{},streak:0,seed:seed|0,name:"",age:17,origin:"",edu:"",traits:[],perks:[],job:"",track:"school",stage:0,pp:0,
    stats:{skill:10,rep:10,net:10,fame:0,life:50,burn:0,money:0},assets:0,salary:0,company:"",companyMult:1,boss:"",rival:null,nickname:"",
    flags:{},timers:{childcare:0,care:0,loan:0},kids:[],mp:0,prog:0,lifeYears:0,burnYears:0,
    counters:{work:0,study:0,network:0,rest:0,fame:0,family:0,invest:0,total:0,jobChanges:0,yearsAtStage:0,maxStay:0,rejections:0,founded:0,tenure:0},
    resume:[],log:[],cards:[],seen:{},era:null,eraLeft:0,eraWait:0,gradAge:20,everJoined:false,careerStage:1,prevCareerStage:1,
    best:{org:0,craft:0,biz:0,fame:0,wealth:0,life:0},peakAt:{},peaks:[],lastPeak:"",
    maxBurn:0,bestTitle:"",bestStage:0,yearPerf:0,freeWork:0,slots:4,phase:"draw",queue:[],current:null,result:null,summary:null,lastAlloc:null,
    leaveNext:false,onLeave:false,ending:null,news:"",firstCompany:"",perkOffer:null,nextPerk:24,studied:false,hist:[],marks:[],flashes:[],ffLog:null};
  s.name=name||pick(s,SURNAMES)+pick(s,GIVEN);
  s.age=ri(s,17,20);
  s.born=ri(s,1975,2025)-s.age;
  const o=wpick(s,ORIGINS,x=>x.w); s.origin=o.id;
  if(s.age<20){ s.edu=wpick(s,["gen","voc"],k=>o.hs[k]); s.gradAge=20; }
  else{
    const e=wpick(s,["univ","college","work"],k=>o.edu[k]);
    if(e==="univ"){ s.edu="univ"; s.gradAge=24; }
    else if(e==="college"){ s.edu="college"; s.gradAge=22; }
    else{ s.edu=wpick(s,["gen","voc"],k=>o.hs[k]); s.track="rest"; }
  }
  s.traits=[pick(s,TRAITS_GOOD).id,pick(s,TRAITS_BAD).id];
  const ids=Object.keys(JOBS).filter(k=>jobOpen(k,yearOf(s)));
  s.job=rnd(s)<0.1?pick(s,ids):wpick(s,ids,k=>JOBS[k].eduW[s.edu]);
  if(JOBS[s.job].needUniv){ if(s.age>=20&&s.edu!=="univ") s.job=pick(s,ids.filter(k=>!JOBS[k].needUniv)); else if(s.edu==="univ") s.gradAge=26; }
  for(const k in o.fx) s.stats[k]+=o.fx[k];
  s.eraWait=ri(s,3,6);
  if(s.track==="school"){ if(s.edu==="univ"||s.edu==="college") resumeAdd(s,EDU[s.edu]+" 입학"); else resumeAdd(s,EDU[s.edu]+" 재학"); }
  else resumeAdd(s,EDU[s.edu]+" 졸업");
  { const pool=GOALS.map(g=>g.id); for(let i=0;i<3;i++){ const g=pick(s,pool); pool.splice(pool.indexOf(g),1); s.goals.push(g); } }
  s.ghosts=buildGhosts(s,hist||[]);
  clampStats(s); cardIssue(s);
  return s;
}
/* ---- 10판: 연도와 시대 ---- */
function yearOf(s){ return (s.born==null?1985:s.born)+s.age; }
function jobOpen(k,y){ return !JOBS[k].open||y>=JOBS[k].open; }
function fixedEra(x){ return typeof x==="number"?FIXED_ERAS.find(e=>x>=e.from&&x<=e.to):FIXED_ERAS.find(e=>e.id===x); }
function eraDef(id){ return ERAS.find(e=>e.id===id)||FIXED_ERAS.find(e=>e.id===id); }
function eraKind(s){ if(s.era){ const e=eraDef(s.era); if(e) return e.kind||e.id; } const f=s.fixed&&fixedEra(s.fixed); return f&&f.kind||null; }
function eraNow(s){ return s.era?eraDef(s.era):s.fixed?fixedEra(s.fixed):null; }
function yearText(s,age){ return (yearOf(s)-s.age+age)+"년("+age+"세)"; }
/* ---- 10판: 지난 인생의 회사 ---- */
function buildGhosts(s,hist){
  const out=[];
  for(const r of hist){
    if(!r||!r.firm||r.born==null||!r.firm.name) continue;
    const g={name:r.name,co:r.firm.name,job:r.firm.job,born:r.born,from:r.firm.from,to:r.firm.to==null?null:r.firm.to,top:r.firm.top||1,mode:null,used:false};
    if(g.top>=5){
      if(rnd(s)<0.4){ const x=rnd(s); g.mode=x<0.4?"emp":x<0.7?"comp":"light"; if(g.mode!=="light"&&g.job!==s.job) g.mode="light"; if(g.mode==="light"&&rnd(s)<1/3) g.mode="fall"; }
      else g.mode="off";
    }
    out.push(g);
  }
  return out.slice(0,12);
}
function ghostState(g,y){
  if(g.top>=5) return "big";
  if(y>=g.from&&(g.to==null||y<=g.to)) return "now";
  if(g.to!=null&&y>g.to) return "past";
  if(y<g.from&&y>=g.born+5&&y<=g.born+12) return "kid";
  return "none";
}
function ghostFor(s,kind){
  const gs=s.ghosts||[], y=yearOf(s);
  for(let i=0;i<gs.length;i++){ const g=gs[i], st=ghostState(g,y);
    if(kind==="rival"&&g.job===s.job&&g.co!==s.company&&(st==="now"||(st==="big"&&g.mode==="comp"))) return i;
    if(kind==="news"&&st==="big"&&g.mode==="light") return i;
    if(kind==="fall"&&st==="big"&&g.mode==="fall") return i;
    if(kind==="past"&&st==="past") return i;
    if(kind==="kid"&&st==="kid") return i;
  }
  return -1;
}
function ghostNow(s){ const i=s.gbind&&s.current!=null?s.gbind[s.current]:null; return (i!=null&&s.ghosts&&s.ghosts[i])||{co:"",name:""}; }
function ghostHire(s){
  const gs=s.ghosts||[], y=yearOf(s);
  for(const g of gs){ if(g.job!==s.job||g.co===s.company) continue; const st=ghostState(g,y);
    if(st==="big"&&g.mode==="emp"&&!g.used) return g;
    if(st==="now"&&rnd(s)<0.25) return g; }
  return null;
}
function ghostJoined(s,g){ g.used=true; s.ghostCo=g.co; logAdd(s,g.co+" 대표는 "+g.name+". 처음 보는데 낯이 익다."); mark(s,"job","지난 인생의 회사 "+g.co); }
function firmEnd(s,status){ if(s.firm&&s.firm.status==="open"){ s.firm.status=status; if(status==="closed") s.firm.to=yearOf(s); } }
function origin(s){ return ORIGINS.find(o=>o.id===s.origin); }
function addBurn(s,x,fromCard){
  if(x>0){ if(s.origin==="working") x*=0.9; if(fromCard&&has(s,"glass")) x*=1.5; }
  else if(!fromCard){ if(has(s,"workaholic")) x*=0.7; if(perk(s,"calm")) x*=1.4; }
  s.stats.burn+=x;
}
function addSkill(s,x){
  if(x>0){ if(has(s,"hands")) x*=1.25; if(s.origin==="poor") x*=1.1; s.stats.skill=Math.min(Math.max(skillCap(s),s.stats.skill),s.stats.skill+x); }
  else s.stats.skill+=x;
}
function studyGain(s){ const k=s.stats.skill; return k<50?4:k<70?3:k<85?2:0.7; }
function slotsOf(s){
  let n=4+(perk(s,"multi")?1:0);
  if(s.stats.burn>=70) n--;
  if(s.timers.childcare>s.age) n--;
  if(s.timers.care>s.age) n--;
  return Math.max(2,n);
}
function slotNotes(s){
  const a=[]; if(s.stats.burn>=70) a.push("번아웃 70 이상"); if(s.timers.childcare>s.age) a.push("육아 ("+(s.timers.childcare-s.age)+"년 남음)"); if(s.timers.care>s.age) a.push("간병 ("+(s.timers.care-s.age)+"년 남음)"); return a;
}
function beginYear(s){
  s.yearDone=false; s.yearPerf=0; s.freeWork=0; s.result=null; s.queue=[]; s.current=null; s.news=""; s.studied=false;
  const fx=fixedEra(yearOf(s));
  if((fx?fx.id:null)!==s.fixed){ s.fixed=fx?fx.id:null; if(fx){ s.news=fx.text; logAdd(s,"뉴스: "+fx.text); } }
  if(fx&&fx.strong){ s.era=null; s.eraLeft=0; s.eraWait=Math.max(s.eraWait,2); }
  else{
  if(s.eraLeft>0){ s.eraLeft--; if(s.eraLeft===0) s.era=null; }
  if(!s.era&&!s.news){ s.eraWait--; if(s.eraWait<=0){ const e=pick(s,ERAS); s.era=e.id; s.eraLeft=2; s.eraWait=ri(s,4,7); s.news=e.text; logAdd(s,"뉴스: "+e.text); } } }
  s.onLeave=false;
  if(s.leaveNext){ s.leaveNext=false; s.onLeave=true; s.slots=0; }
  else s.slots=slotsOf(s);
  s.phase="alloc";
}
function actionsOf(s){ return ACTIONS[s.track].filter(a=>a[0]!=="invest"||s.age>=25).map(a=>[a[0],a[0]==="craft"?opusOf(s):A[a[1]][0],A[a[1]][1]]); }

function commitAlloc(s,alloc){
  s.lastAlloc=Object.assign({},alloc); s.lastAllocTrack=s.track; s.summary=null;
  const sk=s.stats.skill, n=k=>alloc[k]||0, c=s.counters;
  if(s.onLeave){ addBurn(s,-12,true); s.stats.life+=6; logAdd(s,"한 해를 쉬었다"); }
  for(let i=0;i<n("work");i++){
    if(s.track==="free") s.freeWork++; else s.yearPerf+=10*(0.5+sk/100);
    let b=8; if(has(s,"steel")) b*=0.75; if(perk(s,"night")) b*=0.7; if(s.track==="career"&&s.boss==="overtime") b+=2; addBurn(s,b);
  }
  for(let i=0;i<n("study");i++){ addSkill(s,studyGain(s)); addBurn(s,3); s.studied=true; }
  for(let i=0;i<n("network");i++){ s.stats.net+=5*(has(s,"talk")?1.5:1)*(perk(s,"mad")?1.5:1); s.stats.rep+=1; s.stats.money-=100; }
  for(let i=0;i<n("fame");i++){
    let g=(2+sk/35+s.stats.rep/80)*(perk(s,"speaker")?1.5:1); if(s.stats.fame>=75) g*=0.5; else if(s.stats.fame>=50) g*=0.75; s.stats.fame+=g;
    if(s.track==="career") s.yearPerf-=3; addBurn(s,3);
  }
  for(let i=0;i<n("craft");i++){ s.prog++; addSkill(s,1); addBurn(s,4); s.studied=true; }
  for(let i=0;i<n("club");i++){ s.stats.net+=4*(has(s,"talk")?1.5:1); s.stats.rep+=2; addBurn(s,2); }
  for(let i=0;i<n("part");i++){ s.stats.money+=300; s.stats.net+=1; addBurn(s,5); }
  for(let i=0;i<n("family");i++){ let g=Math.max(1,8*(1-s.stats.life/120)); if(perk(s,"family")) g*=2; if(perk(s,"calm")) g*=1.4; if(has(s,"workaholic")) g*=0.7; s.stats.life+=g; addBurn(s,-6); }
  for(let i=0;i<n("rest");i++) addBurn(s,s.age>=45?-12:-15);
  for(let i=0;i<n("invest");i++){
    if(s.stats.money<500) break;
    const stake=Math.max(500,Math.round(s.stats.money*0.25));
    let r=rnd(s); if(has(s,"gullible")) r-=0.1; if(has(s,"lucky")) r+=0.04; if(eraKind(s)==="recession") r-=0.12; if(eraKind(s)==="bubble") r+=0.06;
    let m=r<0.18?-0.6:r<0.40?-0.2:r<0.70?0.15:r<0.90?0.4:r<0.98?1.2:4;
    if(m>0&&perk(s,"compound")) m*=1.25;
    const d=Math.round(stake*m); s.stats.money+=d;
    logAdd(s,d>0?"투자 수익 "+won(d):"투자 손실 "+won(-d),m<=-0.6);
  }
  if(working(s)){ c.work+=n("work"); c.study+=n("study"); c.network+=n("network"); c.rest+=n("rest"); c.fame+=n("fame"); c.family+=n("family"); c.invest+=n("invest"); c.total+=s.slots; }
  clampStats(s);
  buildQueue(s);
  nextEvent(s);
}
function matches(s,w){
  if(!w) return true;
  if(w.track){ if([].concat(w.track).indexOf(s.track)<0) return false; }
  if(w.job&&(w.job!==s.job||!working(s))) return false;
  if(w.stage){ if(s.track==="free"){ if(w.track==="career"||w.track==="founder") return false; } else if(s.stage<w.stage[0]||s.stage>w.stage[1]) return false; }
  if(w.age&&(s.age<w.age[0]||s.age>w.age[1])) return false;
  if(w.origin&&w.origin!==s.origin) return false;
  if(w.era&&w.era!==s.era&&w.era!==s.fixed&&w.era!==eraKind(s)) return false;
  if(w.year){ const y=yearOf(s); if(y<w.year[0]||y>w.year[1]) return false; }
  if(w.ghost&&ghostFor(s,w.ghost)<0) return false;
  if(w.flag) for(const f of [].concat(w.flag)) if(!s.flags[f]) return false;
  if(w.noflag) for(const f of [].concat(w.noflag)) if(s.flags[f]) return false;
  if(w.hasRival&&!s.rival) return false;
  if(w.rivalLike!=null&&(!s.rival||s.rival.like<w.rivalLike||s.rival.status!=="same")) return false;
  if(w.kids&&!s.kids.length) return false;
  if(w.maxKids!=null&&s.kids.length>w.maxKids) return false;
  if(w.timer&&!(s.timers[w.timer]>s.age)) return false;
  if(w.minBurnYears!=null&&s.burnYears<w.minBurnYears) return false;
  if(w.minMp!=null&&s.mp<w.minMp) return false;
  if(w.moneyNeg&&s.stats.money>=0) return false;
  if(w.min) for(const k in w.min) if(s.stats[k]<w.min[k]) return false;
  if(w.max) for(const k in w.max) if(s.stats[k]>w.max[k]) return false;
  return true;
}
function cardById(id){ return CARDS.find(c=>c.id===id); }
function buildQueue(s){
  const q=[];
  if(s.onLeave){ s.queue=q; return; }
  if(s.track==="school"&&s.age===s.gradAge-1) q.push(s.edu==="gen"||s.edu==="voc"?"after_high":"job_apply");
  if(s.track==="rest") q.push("job_apply");
  if((s.track==="career"||s.track==="founder")&&s.stage===5&&promoReady(s)) q.push("peak_review");
  if(working(s)&&s.age>=s.nextPerk&&s.perks.length<5){
    const pool=PERKS.filter(p=>!perk(s,p.id)); const offer=[];
    for(let i=0;i<3&&pool.length;i++){ const p=pick(s,pool); pool.splice(pool.indexOf(p),1); offer.push(p.id); }
    s.perkOffer=offer; s.nextPerk=s.age+6; q.push("perk");
  }
  const pool=CARDS.filter(c=>!c.required&&matches(s,c.when)&&!(c.once&&s.seen[c.id]!=null)&&!(s.seen[c.id]!=null&&s.age-s.seen[c.id]<(c.cd||7)));
  const r=rnd(s); let cnt=r<0.12?0:r<0.62?1:r<0.94?2:3; if(s.track==="school"||s.track==="rest") cnt=Math.min(cnt,1);
  for(let i=0;i<cnt&&pool.length;i++){ const c=wpick(s,pool,x=>x.w||5); pool.splice(pool.indexOf(c),1); q.push(c.id); if(c.when&&c.when.ghost){ s.gbind=s.gbind||{}; s.gbind[c.id]=ghostFor(s,c.when.ghost); } }
  s.queue=q;
}
function nextEvent(s){
  if(s.ending){ finish(s); s.phase="ending"; return; }
  if(s.queue.length){ s.current=s.queue.shift(); s.result=null; s.phase="event"; }
  else if(s.yearDone) advance(s);
  else yearEnd(s);
}
function peakName(s){ return s.track==="founder"?job(s).peaks.biz:job(s).peaks.org; }
function fill(s,t){
  return String(t).replace(/\{rival\}/g,s.rival?s.rival.name:"동기").replace(/\{jobname\}/g,job(s).name)
    .replace(/\{peakname\}/g,peakName(s)).replace(/\{lastpeak\}/g,s.lastPeak||"정점").replace(/\{bossname\}/g,s.boss?BOSSES[s.boss].name:"")
    .replace(/\{company\}/g,s.company).replace(/\{gco\}/g,ghostNow(s).co).replace(/\{gname\}/g,ghostNow(s).name).replace(/\{cost\}/g,won(job(s).cost));
}
function choiceChance(s,ch){
  if(ch.chance==null) return null;
  let p=ch.chance;
  if(ch.chanceFn==="apply"){ p=30+(s.stats.skill-25)*1.2+job(s).eduBonus[s.edu]+s.stats.net/5+(s.everJoined?s.careerStage*6:0)-Math.max(0,s.age-45)*2; if(eraKind(s)==="recession") p-=15; if(eraKind(s)==="boom") p+=10; }
  else if(ch.chanceFn==="peak"){ p=28+(s.stats.rep-64)*0.8+(s.stats.net-70)*0.5+(perk(s,"politics")?10:0); }
  else if(ch.chanceFn==="layoff"){ p=40+s.stats.rep/3+s.stage*4+(perk(s,"crisis")?25:0)-Math.max(0,s.age-45); }
  else if(ch.chanceStat) p+=(s.stats[ch.chanceStat]-50)*0.5;
  if(has(s,"lucky")) p+=10; if(perk(s,"nerve")) p+=8;
  return Math.max(5,Math.min(95,Math.round(p)));
}
function cardChoices(s,card){
  if(card.id==="perk") return (s.perkOffer||[]).map(id=>{ const p=PERKS.find(x=>x.id===id); return {text:p.name,hint:p.desc,perkId:id,effects:{},result:"이제 "+p.name+"이 내 것이다."}; });
  if(card.id==="switch_pick") return (s.switchOffer||[]).map(id=>{ const J=JOBS[id]; return {text:J.name,hint:J.titles[1]+"부터 시작, 조직의 정점은 "+J.peaks.org,effects:{do:"switch_to:"+id},result:J.name+" 분야로 간다. 작은 곳의 "+J.titles[1]+" 자리다."}; });
  return card.choices;
}
function visibleChoices(s,card){ return cardChoices(s,card).map((c,i)=>({c:c,i:i})).filter(x=>matches(s,x.c.when)); }
function locked(s,ch){ if(!ch.require) return false; for(const k in ch.require) if(s.stats[k]<ch.require[k]) return true; return false; }
function snap(s){ const o=Object.assign({},s.stats); o.assets=s.assets; o.pp=s.pp; return o; }
function choose(s,idx){
  const card=cardById(s.current), ch=cardChoices(s,card)[idx];
  if(!ch||locked(s,ch)||!matches(s,ch.when)) return;
  const before=snap(s);
  if(!card.required) s.seen[card.id]=s.age;
  let text=ch.result||"", shame=ch.shame||null;
  if(ch.perkId){ s.perks.push(ch.perkId); s.perkOffer=null; }
  applyFx(s,ch.effects);
  let branch=null;
  let roll=null;
  if(ch.check){ const ok=s.stats[ch.check.stat]>=ch.check.min; roll={check:true,stat:ch.check.stat,min:ch.check.min,have:s.stats[ch.check.stat],ok:ok}; branch=ok?ch.success:ch.fail; }
  else if(ch.chance!=null){ const p=choiceChance(s,ch), r=rnd(s)*100; roll={p:p,r:Math.round(r),ok:r<p}; branch=r<p?ch.success:ch.fail; }
  if(branch){ applyFx(s,branch.effects); text=branch.result; shame=branch.shame||null; }
  if(s.pendingText){ text=s.pendingText; s.pendingText=null; }
  clampStats(s);
  text=fill(s,text);
  const after=snap(s), delta={}; for(const k in before) if(after[k]!==before[k]) delta[k]=after[k]-before[k];
  logAdd(s,fill(s,card.title)+": "+fill(s,ch.text)+". "+text,false);
  if(shame) logAdd(s,fill(s,shame),true);
  s.result={title:fill(s,card.title),text:text,delta:delta,shame:shame?fill(s,shame):null,roll:roll,pick:fill(s,ch.text)};
  s.phase="result";
}
function applyFx(s,fx){
  if(!fx) return;
  for(const k in fx){
    const v=fx[k];
    if(k==="skill") addSkill(s,v);
    else if(k==="burn") addBurn(s,v,true);
    else if(k==="rep"||k==="net"||k==="money"||k==="fame"||k==="life") s.stats[k]+=v;
    else if(k==="assets") s.assets+=v;
    else if(k==="perf") s.yearPerf+=v;
    else if(k==="prog") s.prog+=v;
    else if(k==="pp") s.pp=Math.max(0,s.pp+v);
    else if(k==="salaryPct") s.salary=Math.round(s.salary*(1+v/100));
    else if(k==="like"){ if(s.rival) s.rival.like=Math.max(0,Math.min(5,s.rival.like+v)); }
    else if(k==="flag") s.flags[v]=true;
    else if(k==="unflag") delete s.flags[v];
    else if(k==="resume") resumeAdd(s,v);
    else if(k==="do") doAct(s,v);
  }
}
function makeBoss(s){ s.boss=pick(s,Object.keys(BOSSES)); }
function leaveWork(s){ if(s.track==="career") s.careerStage=s.stage; s.salary=0; s.boss=""; s.counters.tenure=0; }
function join(s,tier){
  const j=job(s);
  if(s.track==="school") resumeAdd(s,EDU[s.edu]+" 졸업");
  const stage=s.everJoined?Math.max(1,Math.min(5,s.careerStage)):1;
  if(s.everJoined) s.counters.jobChanges++;
  let c=pick(s,tier==="big"?j.big:j.small); if(c===s.company) c=pick(s,tier==="big"?j.big:j.small);
  const gh=ghostHire(s); if(gh){ c=gh.co; s.ghostCo=gh.co; }
  s.company=c; s.companyMult=gh?(gh.top>=4?1.2:0.9):tier==="big"?1.2:0.9; s.track="career"; s.stage=stage; s.pp=0; s.counters.yearsAtStage=0; s.counters.tenure=0;
  s.salary=Math.round(RULES.salary[stage]*j.rate*s.companyMult);
  makeBoss(s);
  if(!s.everJoined){ s.everJoined=true; s.firstCompany=c; s.rival={name:pick(s,SURNAMES)+pick(s,GIVEN),stage:1,pp:0,like:3,status:"same"}; if(s.rival.name===s.name) s.rival.name=pick(s,SURNAMES)+pick(s,GIVEN); }
  else if(s.rival&&s.rival.status==="same") s.rival.status="other";
  resumeAdd(s,c+" 입사 ("+j.titles[stage]+")"); cardIssue(s); mark(s,"job",c+" 입사");
  if(gh) ghostJoined(s,gh);
}
function found(s,startStage,free,label){
  const j=job(s);
  if(s.track==="career"){ s.prevCareerStage=s.stage; s.careerStage=s.stage; }
  if(!free) s.stats.money-=j.cost;
  s.track="founder"; s.stage=startStage; s.pp=0; s.counters.yearsAtStage=0; s.counters.founded++; s.boss=""; s.salary=0; s.counters.tenure=0;
  s.company=label||(s.name.slice(1)+pick(s,j.mine)); s.companyMult=1; s.flags.founder=true;
  s.firm={name:s.company,job:s.job,from:yearOf(s),to:null,top:startStage,status:"open"};
  if(s.rival&&s.rival.status==="same") s.rival.status="other";
  resumeAdd(s,s.company+" 창업"); cardIssue(s); mark(s,"biz",s.company+" 창업"); flash(s,"found",s.company,"대표 "+s.name+". 오늘부터 월급을 주는 쪽이다.");
}
function dropDream(s){ if(!JOBS[s.job].needUniv) return; const old=JOBS[s.job].name; s.job=pick(s,Object.keys(JOBS).filter(k=>!JOBS[k].needUniv)); s.pendingText=old+"의 꿈은 접었다. "+JOBS[s.job].name+" 쪽으로 간다."; logAdd(s,old+" 지망을 접었다",true); }
function offerRetire(s){ if(s.peaks.length&&!s.ending&&s.queue.indexOf("retire_offer")<0) s.queue.unshift("retire_offer"); }
function doAct(s,a){
  const j=job(s), unit=RULES.profitUnit[Math.max(1,s.stage)];
  if(a==="go_univ"){ s.edu="univ"; s.gradAge=s.age+(j.needUniv?7:5); resumeAdd(s,j.needUniv?"의과대학 합격":"4년제 대학 합격"); }
  else if(a==="go_college"){ dropDream(s); s.edu="college"; s.gradAge=s.age+3; resumeAdd(s,"전문대 합격"); }
  else if(a==="go_work"){ dropDream(s); s.queue.unshift("job_apply"); }
  else if(a==="join_big") join(s,"big");
  else if(a==="join_small") join(s,"small");
  else if(a==="apply_fail"){ if(s.track==="school") resumeAdd(s,EDU[s.edu]+" 졸업"); s.track="rest"; s.counters.rejections++; cardIssue(s); }
  else if(a==="switch_job"){ const pool=Object.keys(JOBS).filter(k=>k!==s.job&&!JOBS[k].needUniv&&jobOpen(k,yearOf(s))), offer=[]; while(offer.length<3&&pool.length){ const k=pick(s,pool); pool.splice(pool.indexOf(k),1); offer.push(k); } s.switchOffer=offer; s.queue.unshift("switch_pick"); }
  else if(a.indexOf("switch_to:")===0){ s.job=a.slice(10); if(s.everJoined){ s.careerStage=Math.max(1,s.careerStage-1); s.stats.skill*=0.6; } join(s,"small"); s.switchOffer=null; s.pendingText=JOBS[s.job].name+" 분야에서 다시 시작한다."; }
  else if(a==="retire_self"){ s.ending="self"; logAdd(s,"스스로 자리에서 내려왔다"); }
  else if(a==="close_biz"){ firmEnd(s,"closed"); resumeAdd(s,s.company+" 정리"); mark(s,"bad",s.company+" 정리"); if(s.stats.money<0) s.stats.money=Math.round(s.stats.money*0.5); s.track="rest"; s.stage=0; s.careerStage=Math.max(1,s.prevCareerStage||1); cardIssue(s); offerRetire(s); }
  else if(a==="poached"){ s.counters.jobChanges++; let c=pick(s,j.big); if(c===s.company) c=pick(s,j.big); s.company=c; s.companyMult=1.2; s.stage=Math.min(5,s.stage+1); s.pp=0; s.salary=Math.max(Math.round(s.salary*1.3),Math.round(RULES.salary[s.stage]*j.rate*1.2)); makeBoss(s); s.counters.yearsAtStage=0; s.counters.tenure=0; resumeAdd(s,c+" 이직 ("+j.titles[s.stage]+")"); cardIssue(s); mark(s,"job",c+" 스카우트"); }
  else if(a==="go_free"){ if(s.track==="school") resumeAdd(s,EDU[s.edu]+" 졸업"); leaveWork(s); s.track="free"; s.stage=0; s.company=""; if(s.rival&&s.rival.status==="same") s.rival.status="other"; resumeAdd(s,j.free+"로 독립"); cardIssue(s); mark(s,"job","프리랜서 독립"); }
  else if(a==="fri_refuse"){ if(s.boss==="overtime"){ s.stats.rep-=4; s.pendingText="월요일 아침, 상사의 표정이 보고서보다 먼저 왔다."; } else s.pendingText="월요일에 해도 아무 일 없었다."; }
  else if(a==="move"){ s.counters.jobChanges++; let c=pick(s,j.big); if(c===s.company) c=pick(s,j.small); const gh=ghostHire(s); if(gh) c=gh.co; s.company=c; s.companyMult=1.2; if(gh) ghostJoined(s,gh); s.salary=Math.round(s.salary*1.2); s.pp=0; makeBoss(s); s.counters.yearsAtStage=0; s.counters.tenure=0; if(s.rival&&s.rival.status==="same") s.rival.status="other"; resumeAdd(s,c+" 이직 ("+j.titles[s.stage]+")"); cardIssue(s); }
  else if(a==="reboss"){ const old=s.boss; makeBoss(s); if(s.boss===old) makeBoss(s); }
  else if(a==="quit_move"){ if(s.track==="career") logAdd(s,s.company+"에 사직서를 냈다"); leaveWork(s); s.track="rest"; s.stage=0; cardIssue(s); offerRetire(s); }
  else if(a==="fired"){ mark(s,"bad","회사를 나옴"); leaveWork(s); s.track="rest"; s.stage=0; s.stats.life-=8; cardIssue(s); }
  else if(a==="severance"){ s.stats.money+=s.salary; leaveWork(s); s.track="rest"; s.stage=0; cardIssue(s); offerRetire(s); }
  else if(a==="honor_retire"){ s.stats.money+=s.salary*2; leaveWork(s); s.track="free"; s.stage=0; s.company=""; resumeAdd(s,"명예퇴직, "+j.free+"로 독립"); cardIssue(s); }
  else if(a==="found") found(s,1,false);
  else if(a==="found_team"){ found(s,2,false); s.stats.rep+=3; }
  else if(a==="found_family") found(s,2,true,"부모님 가게");
  else if(a==="found_with_rival"){ found(s,2,false); if(s.rival){ s.rival.status="partner"; s.rival.like=Math.min(5,s.rival.like+1); } s.flags.with_rival=true; }
  else if(a==="rival_leaves"){ if(s.rival) s.rival.status="founder"; }
  else if(a==="pay_unit") s.stats.money-=Math.round(unit*0.15);
  else if(a==="pay_small") s.stats.money-=Math.round(unit*0.06);
  else if(a==="take_invest") s.stats.money+=unit*2;
  else if(a==="mortgage"){ s.stats.money+=Math.round(s.assets*0.6); s.assets=Math.round(s.assets*0.4); }
  else if(a==="loanshark"){ s.stats.money+=Math.round(unit*0.4); s.flags.loanshark=(s.flags.loanshark||0)+Math.round(unit*0.6); }
  else if(a==="sell"){ firmEnd(s,"sold"); s.stats.money+=unit*3; resumeAdd(s,s.company+" 매각"); s.track="career"; s.stage=5; s.pp=0; s.company=pick(s,j.big); s.companyMult=1.2; s.salary=Math.round(RULES.salary[5]*j.rate*1.2); makeBoss(s); s.counters.yearsAtStage=0; s.counters.tenure=0; resumeAdd(s,s.company+" 합류 ("+j.titles[5]+")"); cardIssue(s); offerRetire(s); }
  else if(a==="peak"){ s.stage=6; s.pp=0; if(s.track==="founder"&&s.firm) s.firm.top=6; if(s.track==="career") s.salary=Math.round(RULES.salary[6]*j.rate*s.companyMult); resumeAdd(s,titleOf(s)+" 취임"); cardIssue(s); checkPeaks(s); }
  else if(a==="retire_now") s.ending="clear";
  else if(a==="marry"){ mark(s,"life","결혼"); s.flags.married=true; delete s.flags.partner; delete s.flags.divorced; logAdd(s,"결혼했다"); }
  else if(a==="divorce"){ mark(s,"bad","이혼"); delete s.flags.married; s.flags.divorced=true; s.stats.life-=25; if(s.stats.money>0) s.stats.money=Math.round(s.stats.money/2); s.assets=Math.round(s.assets/2); }
  else if(a==="baby"){ mark(s,"life",(s.kids.length?"둘째":"첫째")+" 출생"); s.kids.push(s.age); s.timers.childcare=s.age+6; s.stats.money-=500; logAdd(s,(s.kids.length===1?"첫째":"둘째")+"가 태어났다"); }
  else if(a==="nanny"){ s.timers.childcare=0; }
  else if(a==="leave"||a==="sabbatical"){ s.leaveNext=true; }
  else if(a==="sick_leave"){ s.leaveNext=true; s.stats.burn=Math.min(s.stats.burn,30); s.burnYears=0; }
  else if(a==="collapse"){ s.stats.burn=100; }
  else if(a==="care_self"){ s.timers.care=s.age+4; }
  else if(a==="buy_house"){ mark(s,"life","내 집 마련"); s.flags.house=true; s.assets+=5000; s.timers.loan=s.age+16; }
  else if(a==="coin_win"){ const st=Math.round(Math.max(0,s.stats.money)*0.3); s.stats.money+=st*2; }
  else if(a==="coin_lose"){ const st=Math.round(Math.max(0,s.stats.money)*0.3); s.stats.money-=st; }
  else if(a==="cap_up"){ s.flags.cap_up=true; }
}
function promoNeed(s){ return RULES.promo[s.stage]; }
function promoMin(s){ if(s.track==="founder") return RULES.bizNeed[s.stage]||{}; const p=promoNeed(s); return p?p.min:{}; }
function promoLack(s){ const m=promoMin(s), l=[]; for(const k in m) if(s.stats[k]<m[k]) l.push(STAT[k]+" "+m[k]); if(s.track==="founder"&&s.stage<6&&s.stats.money<RULES.profitUnit[s.stage]*0.5) l.push("현금 "+won(RULES.profitUnit[s.stage]*0.5)); return l; }
function promoReady(s){ const p=promoNeed(s); if(!p||s.pp<p.pp) return false; return promoLack(s).length===0; }
function eraOne(er,s){ if(!er) return 1; let m=er.perf[s.job]; if(m==null) m=er.def==null?1:er.def; return m; }
function eraMult(s){ let m=eraOne(s.era&&eraDef(s.era),s)*eraOne(s.fixed&&fixedEra(s.fixed),s); return m<1&&perk(s,"crisis")?1:m; }
function won(n){ const a=Math.abs(Math.round(n)), sign=n<0?"-":""; if(a>=10000){ const e=Math.floor(a/10000), m=a%10000; return sign+e.toLocaleString("ko-KR")+"억"+(m?" "+m.toLocaleString("ko-KR")+"만":"")+" 원"; } return sign+a.toLocaleString("ko-KR")+"만 원"; }
function ranksNow(s){
  const r={org:0,craft:0,biz:0,fame:0,wealth:0,life:0}, nw=networth(s);
  if(s.track==="career") r.org=Math.max(0,Math.min(5,s.stage-1));
  if(s.track==="founder") r.biz=Math.max(0,Math.min(5,s.stage-1));
  RULES.craft.forEach((c,i)=>{ if(s.stats.skill>=c[0]&&s.mp>=c[1]) r.craft=i+1; });
  RULES.fame.forEach((c,i)=>{ if(s.stats.fame>=c&&(i<4||s.flags.hit)) r.fame=i+1; });
  RULES.wealth.forEach((c,i)=>{ if(nw>=c) r.wealth=i+1; });
  RULES.lifeYears.forEach((c,i)=>{ if(s.lifeYears>=c&&(i<4||s.stats.life>=80)) r.life=i+1; });
  return r;
}
function rankName(s,p,n){
  if(n<=0) return "";
  if(p==="org") return job(s).titles[n+1]; if(p==="biz") return job(s).ftitles[n+1];
  if(n===5&&job(s).peaks[p]) return job(s).peaks[p];
  return PATH_RANKS[p][n-1];
}
function checkPeaks(s){
  const r=ranksNow(s); let got=null;
  for(const p in r){ if(r[p]>s.best[p]) s.best[p]=r[p]; if(r[p]>=5&&!s.peakAt[p]){ s.peakAt[p]=s.age; const nm=rankName(s,p,5); s.peaks.push({path:p,age:s.age,name:nm}); logAdd(s,"정점에 올랐다: "+nm); mark(s,"peak",nm); flash(s,"peak",nm,PATHS[p]+"의 길 꼭대기에 섰다. "+s.age+"세."); if(p!=="org"&&p!=="biz") resumeAdd(s,nm+"의 반열에 오름"); if(p!=="life"){ got=nm; } } }
  if(got){ s.lastPeak=got; if(s.queue.indexOf("peak_choice")<0) s.queue.unshift("peak_choice"); }
  return r;
}
const PATH_TIPS={
  org:"회사에서 좋은 평가를 받아 승진한다. 위로 갈수록 자리가 적고 인맥과 평판이 필요하다.",
  craft:"능력을 키우고 그 일의 대표 업적을 쌓아 한계를 깬다. 공부를 쉬면 실력이 녹슨다.",
  biz:"내 회사를 차려 키운다. 돈이 마르면 끝이다.",
  fame:"대외 활동으로 이름을 알린다. 꼭대기에는 책이나 방송 한 방이 필요하다.",
  wealth:"아끼고 굴린다. 집과 현금을 합친 순자산으로 잰다.",
  life:"일상 75 이상, 번아웃 55 미만인 '좋은 해'를 쌓는다. 가족과 일상에 칸을 꽤 써야 한다."};
function ladder(s,p){ return [1,2,3,4,5].map(i=>rankName(s,p,i)); }
function nextReq(s,p){
  const b=ranksNow(s)[p];
  if(s.peakAt[p]&&b>=5) return "정점";
  if(p==="org"){ if(s.track!=="career") return "회사에 다녀야 한다"; if(s.stage>=6) return "정점"; const l=promoLack(s); return "승진 점수 "+s.pp+"/"+promoNeed(s).pp+(l.length?", "+l.join(", "):""); }
  if(p==="biz"){ if(s.track!=="founder") return "창업해야 한다 ("+won(job(s).cost)+")"; if(s.stage>=6) return "정점"; const l=promoLack(s); return "성장 점수 "+s.pp+"/"+promoNeed(s).pp+(l.length?", "+l.join(", "):""); }
  if(p==="craft"){ const c=RULES.craft[Math.min(4,b)]; return "능력 "+c[0]+(c[1]?", "+opusOf(s)+" "+c[1]+"건":"")+" (지금 "+s.mp+"건, 한계 "+skillCap(s)+")"; }
  if(p==="fame"){ const i=Math.min(4,b); return "명성 "+RULES.fame[i]+(i===4?", 책이나 방송으로 한 번 터져야 한다":""); }
  if(p==="wealth") return "순자산 "+won(RULES.wealth[Math.min(4,b)]);
  const i=Math.min(4,b); return "좋은 해 "+s.lifeYears+"/"+RULES.lifeYears[i]+"년"+(i===4?", 일상 80":"");
}

function yearEnd(s){
  const sum={grade:null,lines:[],promo:null,nick:null,age:s.age}, j=job(s), c=s.counters, st=s.stats;
  const push=t=>sum.lines.push(t);
  if(s.track==="career"&&!s.onLeave){
    if(has(s,"sleepy")&&rnd(s)<0.2){ s.yearPerf-=4; logAdd(s,"중요한 회의 날 지각했다",true); push("중요한 회의 날 지각했다."); }
    if(has(s,"blunt")&&rnd(s)<0.15){ st.rep-=3; logAdd(s,"회의에서 할 말을 다 해 버렸다",true); push("회의에서 할 말을 다 해 버렸다. 평판 -3"); }
    if(has(s,"softie")&&rnd(s)<0.15){ s.yearPerf-=3; st.net+=2; push("옆 팀 일을 떠맡았다. 고맙다는 말은 들었다."); }
  }
  /* 수입 */
  let rate=0.3+(has(s,"thrift")?0.05:0)+(perk(s,"frugal")?0.08:0)+(s.flags.married?0.05:0);
  const kidCost=s.kids.filter(b=>s.age-b<22).length*600;
  if(s.track==="career"&&!s.onLeave){
    let perf=s.yearPerf*(s.boss==="credit"?0.85:s.boss==="overtime"?1.1:1)*eraMult(s)*(perk(s,"calm")?0.9:1)*(perk(s,"loyal")&&c.tenure>=5?1.15:1)+st.rep/10;
    perf=Math.round(perf);
    const g=RULES.grade.find(x=>perf>=x[1]); sum.grade=g[0]; sum.perf=perf;
    if(s.stage<6) s.pp+=g[2]; st.rep+=g[4];
    if(eraKind(s)!=="recession") s.salary=Math.round(s.salary*(1+g[3]/100));
    const sv=Math.round(s.salary*rate); st.money+=sv;
    push("연봉 "+won(s.salary)+", 저축 "+won(sv));
    if(s.boss==="mentor") addSkill(s,2);
    logAdd(s,"인사평가 "+g[0]+" (성과 "+perf+")");
    if(g[0]==="D"){ s.flags.dstreak=(s.flags.dstreak||0)+1; if(s.flags.dstreak>=2&&s.stage<6){ delete s.flags.dstreak; logAdd(s,"2년 연속 D. 권고사직을 받았다",true); push("2년 연속 D. 권고사직 통보를 받았다."); doAct(s,"fired"); } else push("D를 받았다. 한 번 더 받으면 자리가 없다."); } else delete s.flags.dstreak;
  } else if(s.track==="founder"&&!s.onLeave){
    let perf=Math.round(s.yearPerf*eraMult(s)+st.rep/10);
    const g=RULES.grade.find(x=>perf>=x[1]); sum.grade=g[0]; sum.perf=perf;
    if(s.stage<6) s.pp+=g[2]; st.rep+=g[4];
    const vol=0.55+rnd(s)*0.9;
    let profit=RULES.profitUnit[s.stage]*(perf-18)/20*(perf>18?vol:1)*(1+st.fame/200)*(s.flags.with_rival?1.15:1)*(perk(s,"eye")?1.2:1);
    profit=Math.round(profit-1000); st.money+=profit;
    push(profit>=0?"올해 남긴 돈 "+won(profit):"올해 적자 "+won(-profit));
    logAdd(s,"결산 "+g[0]+", "+(profit>=0?"흑자 ":"적자 ")+won(Math.abs(profit)),profit<0);
  } else if(s.track==="free"&&!s.onLeave){
    const vol=0.7+rnd(s)*0.6;
    const inc=Math.round(s.freeWork*(st.skill*12+st.fame*15+st.net*5)*j.rate*vol*eraMult(s));
    st.money+=inc-1500;
    push("올해 수입 "+won(inc)+", 생활비 "+won(1500));
    logAdd(s,"프리랜서 수입 "+won(inc));
  } else if(s.onLeave){ push("한 해를 쉬었다."); if(s.track==="career") st.money+=Math.round(s.salary*0.1); }
  else if(s.track==="rest"){ st.money-=400; }
  if(kidCost&&s.track!=="school"){ st.money-=kidCost; }
  if(s.timers.loan>s.age){ st.money-=800; s.assets+=800; }
  if(s.assets>0) s.assets=Math.round(s.assets*(eraKind(s)==="recession"?0.96:eraKind(s)==="bubble"?1.09:1.035));
  if(s.flags.loanshark){ st.money-=s.flags.loanshark; push("급전 이자까지 "+won(s.flags.loanshark)+"을 갚았다."); delete s.flags.loanshark; }
  /* 대표작 */
  if(s.prog>=4){
    let p=15+(st.skill-50)*0.9+(perk(s,"master")?15:0)+(has(s,"lucky")?10:0); p=Math.max(5,Math.min(90,p));
    if(rnd(s)*100<p){ const nm=j.works[Math.min(s.mp,j.works.length-1)]; s.mp++; s.prog=0; st.rep+=6; st.fame+=5; resumeAdd(s,opusOf(s)+": "+nm); logAdd(s,opusOf(s)+" 완성: "+nm); push(opusOf(s)+" 완성: "+nm+". 능력 한계가 "+skillCap(s)+"로 올랐다."); mark(s,"craft",nm); flash(s,"mp",nm,opusOf(s)+" "+s.mp+"건째. 능력 한계가 "+skillCap(s)+"로 올랐다."); }
    else{ s.prog=0; addBurn(s,8,true); logAdd(s,opusOf(s)+" 도전에 실패했다",true); push(opusOf(s)+" 도전 실패. 처음부터 다시 쌓는다."); }
  }
  /* 낡음과 회복 */
  if(!perk(s,"lifelong")&&working(s)){ if(s.age>=30&&!s.studied) st.skill-=s.age>=45?3:2; else if(s.age>=50) st.skill-=1; }
  st.fame-=1+st.fame/30;
  if(st.life>35) st.life-=4+(st.life-35)/12-(s.flags.married||s.flags.pet?1.5:0);
  if(working(s)&&s.lastAlloc&&(s.lastAlloc.work||0)>=3) st.life-=3;
  if(st.burn>=70) st.life-=3;
  if(s.kids.length&&st.life<90) st.life+=1;
  if(perk(s,"multi")) addBurn(s,6);
  clampStats(s);
  if(st.burn>=70) s.burnYears++;
  if(st.life>=75&&st.burn<55) s.lifeYears++;
  /* 번아웃 */
  if(st.burn>=100){
    if(s.flags.burnout_once){ s.ending="burnout"; }
    else{ s.flags.burnout_once=true; s.leaveNext=true; st.burn=45; logAdd(s,"쓰러졌다. 응급실 천장을 봤다",true); mark(s,"bad","쓰러짐"); flash(s,"collapse","쓰러졌다","내년은 통째로 쉰다. 한 번 더 쓰러지면 돌아오지 못한다."); push("쓰러졌다. 내년은 통째로 쉰다. 다음에 또 쓰러지면 돌아오지 못한다."); }
  } else {
    let rec=s.age<40?5:s.age<50?3:1; if(perk(s,"body")) rec+=5; if(st.life>=60) rec+=3; if(st.life<40) rec-=7; if(st.life<20){ rec-=3; push("마음 둘 곳이 없다. 피로가 풀리지 않는다."); }
    st.burn-=rec;
  }
  clampStats(s);
  /* 승진 */
  if((s.track==="career"||s.track==="founder")&&s.stage>=1&&s.stage<=4&&!s.onLeave){
    const need=promoNeed(s).pp;
    if(promoReady(s)){
      let ok=true;
      if(s.track==="career"){
        let p=RULES.promoTO[s.stage]+(st.net-50)*0.4+(perk(s,"politics")?15:0); const rv=s.rival&&s.rival.status==="same"&&s.rival.stage===s.stage; if(rv) p-=10;
        ok=rnd(s)*100<p;
        if(!ok){ s.pp=Math.floor(need/2); logAdd(s,"승진 심사에서 누락됐다",true); push("승진 심사 누락. 자리는 하나였다."+(rv?" 동기 "+s.rival.name+"이 먼저 올라갔다.":"")); if(rv){ s.rival.stage++; s.rival.pp=0; } flash(s,"miss","승진 누락",rv?"동기 "+s.rival.name+"이 그 자리에 갔다. 승진 점수가 절반으로 줄었다.":"자리는 하나였다. 승진 점수가 절반으로 줄었다."); }
      } else { st.money-=Math.round(RULES.profitUnit[s.stage]*0.3); }
      if(ok){ s.stage++; s.pp=0; c.yearsAtStage=-1; if(s.track==="founder"&&s.firm) s.firm.top=Math.max(s.firm.top,s.stage);
        if(s.track==="career") s.salary=Math.max(Math.round(s.salary*1.1),Math.round(RULES.salary[s.stage]*j.rate*s.companyMult));
        sum.promo=titleOf(s); resumeAdd(s,(s.track==="career"?titleOf(s)+" 승진":"회사 성장: "+titleOf(s))); logAdd(s,titleOf(s)+(s.track==="career"?" 승진":" 단계로 성장")); cardIssue(s); mark(s,"up",titleOf(s)); if(s.stage<6) flash(s,"promo",titleOf(s),s.track==="career"?s.company:"회사가 한 단계 컸다"); }
    } else if(s.pp>=need){ push((s.track==="career"?"승진":"성장")+" 점수는 찼다. 부족한 것: "+promoLack(s).join(", ")); }
  } else if(s.stage===5&&(s.track==="career"||s.track==="founder")){
    if(promoReady(s)) push("내년에 마지막 한 자리를 두고 표결이 열린다.");
  }
  if(working(s)){ c.yearsAtStage++; c.tenure++; if(s.stage===3&&s.track==="career"&&c.yearsAtStage>c.maxStay) c.maxStay=c.yearsAtStage; if(s.stage>=s.bestStage||!s.bestTitle){ s.bestStage=s.stage; s.bestTitle=titleOf(s); } }
  /* 창업 실패와 파산 */
  if(s.track==="founder"&&st.money<-Math.max(6000,RULES.profitUnit[s.stage])){
    if(s.flags.closed_once){ s.ending="bankrupt"; }
    else{ firmEnd(s,"closed"); s.flags.closed_once=true; logAdd(s,s.company+" 폐업. 간판을 직접 내렸다",true); mark(s,"bad",s.company+" 폐업"); flash(s,"closed",s.company+" 폐업","빚을 정리하고 다시 구직한다. 재기는 한 번뿐이다."); resumeAdd(s,s.company+" 정리"); push(s.company+" 폐업. 빚을 정리하고 다시 구직한다. 재기는 한 번뿐이다.");
      s.track="rest"; s.stage=0; st.money=-1000; st.life-=10; s.careerStage=Math.max(1,s.prevCareerStage||1); cardIssue(s); }
  }
  if(s.track!=="founder"&&networth(s)<-20000) s.ending="bankrupt";
  /* 동기 */
  if(s.rival){
    const r=s.rival, need=[0,4,8,12,16,20][r.stage]; r.pp+=ri(s,1,3);
    if(r.stage<5&&r.pp>=need){ r.stage++; r.pp=0;
      const t=r.status==="founder"?j.ftitles[r.stage]:j.titles[r.stage];
      push("동기 "+r.name+": "+t+" 승진"+(s.track==="career"&&r.stage>s.stage?". 나보다 빠르다.":"."));
    } else if(rnd(s)<0.25){
      push("동기 "+r.name+": "+pick(s,["프로필 사진이 골프장으로 바뀌었다.","단체방에 야근 사진을 올렸다.","결혼식 사회를 봐 달라고 한다.","\"요즘 어때?\" 다섯 글자가 왔다.","이직했다는 소문이 돈다.","점심 먹자더니 자기 회사 얘기만 했다."]));
    }
  }
  const nk=calcNick(s); if(nk&&nk!==s.nickname){ s.nickname=nk; sum.nick=nk; logAdd(s,"별명이 생겼다: "+nk); }
  clampStats(s);
  const before=Object.assign({},s.best);
  checkPeaks(s);
  for(const p in s.best) if(s.best[p]>before[p]&&p!=="org"&&p!=="biz") push(PATHS[p]+"의 길: "+rankName(s,p,s.best[p])+(s.best[p]>=5?" — 정점":""));
  if(sum.grade){ s.streak=(sum.grade==="S"||sum.grade==="A")?(s.streak||0)+1:0; sum.streak=s.streak; }
  checkGoals(s);
  s.hist.push({age:s.age,life:st.life,burn:st.burn,nw:networth(s),rest:(s.lastAlloc&&s.lastAlloc.rest)||0,work:(s.lastAlloc&&s.lastAlloc.work)||0});
  s.summary=sum; s.yearDone=true;
  if(s.ffLog) s.ffLog.push(sum);
  if(s.ending){ finish(s); s.phase="ending"; return; }
  if(s.queue.length){ nextEvent(s); return; }
  advance(s);
}
function calcNick(s){
  const c=s.counters; if(c.total<16) return s.nickname;
  if(c.jobChanges>=3) return "프로 이직러";
  if(s.track==="career"&&c.yearsAtStage>=10&&s.stage<5) return "만년 "+titleOf(s);
  if(c.work/c.total>=0.6) return "야근 요정";
  if(c.family/c.total>=0.3) return "가족 바보";
  if(c.rest/c.total>=0.3) return "칼퇴의 신";
  if(c.fame/c.total>=0.3) return "관종";
  if(c.invest/c.total>=0.3) return "차트 중독";
  if(c.network/c.total>=0.3) return "회식 에이스";
  if(c.study/c.total>=0.33) return "자기계발 중독";
  return s.nickname;
}
function advance(s){
  if(s.ending){ finish(s); s.phase="ending"; return; }
  s.age++;
  if(s.age>=RULES.retireAge){ s.ending="retire"; finish(s); s.phase="ending"; return; }
  beginYear(s);
}
function finish(s){
  if(s.final) return;
  const f={kind:s.ending,title:"",scene:"",verdict:"",hidden:null,ranks:Object.assign({},s.best)};
  const peaks=s.peaks.slice();
  if(s.ending==="burnout"){ f.title="조기 은퇴"; f.scene="두 번째로 쓰러진 날, 의사는 차트를 덮었다. \"이제 그만하셔야 합니다.\""; f.verdict=s.age+"세, 몸이 먼저 사표를 냈다.";
    const h=s.hist.slice(-6); if(h.length>=2){ const last=h.slice(1), rest=last.reduce((a,x)=>a+(x.rest||0),0)/last.length, life=Math.round(last.reduce((a,x)=>a+x.life,0)/last.length), up=Math.round((h[h.length-1].burn-h[0].burn)/(h.length-1));
      f.cause="마지막 "+last.length+"년, 휴식은 한 해 평균 "+rest.toFixed(1)+"칸, 일상은 평균 "+life+"."+(up>0?" 피로가 해마다 "+up+"씩 더 쌓였다.":"")+(life<40?" 일상이 40 아래면 해가 바뀌어도 피로가 거의 풀리지 않는다.":""); } }
  else if(s.ending==="self"){ f.title="스스로 내려왔다"; f.scene="책상을 정리하는 데 한 시간이 걸렸다. 아무도 붙잡지 않았고, 그게 좋았다."; f.verdict=(peaks.length?peaks.map(p=>p.age+"세에 "+p.name).join(", ")+". ":"")+s.age+"세, 내려올 때를 내가 정했다."; }
  else if(s.ending==="bankrupt"){ f.title="파산"; f.scene="법원 복도는 길었다. 서류에 도장을 찍는 데는 10초가 걸렸다."; f.verdict=s.age+"세, 숫자가 나를 이겼다."; }
  else{
    f.scene=s.ending==="clear"?"떠나는 날은 조용했다. 꽃다발은 생각보다 무거웠다.":"65세, 마지막 출근. 책상 서랍에서 20년 된 볼펜이 나왔다.";
    if(peaks.length){ f.title=peaks.length>1?peaks.length+"개의 정점":peaks[0].name; f.verdict=peaks.map(p=>p.age+"세에 "+p.name).join(", ")+"."; }
    else{
      let bp="org", bv=-1; for(const p of ["org","biz","craft","fame","wealth","life"]) if(s.best[p]>bv){ bv=s.best[p]; bp=p; }
      f.title="정년 퇴임";
      f.verdict=bv<=0?"어느 길에서도 이름을 남기지 못했다. 그래도 끝까지 걸었다.":PATHS[bp]+"의 길에서 가장 멀리 갔다: "+rankName(s,bp,bv)+". 정점까지 "+(5-bv)+"단계 남았다.";
    }
  }
  const c=s.counters;
  if(s.ending==="retire"||s.ending==="clear"||s.ending==="self"){
    if(peaks.length>=3) f.hidden="르네상스인";
    else if(s.flags.closed_once&&s.peakAt.biz) f.hidden="오뚝이";
    else if(peaks.length&&Math.min.apply(null,peaks.map(p=>p.age))<42) f.hidden="최연소";
    else if(s.peakAt.biz&&s.flags.with_rival) f.hidden="동기 사랑";
    else if(!peaks.length&&c.jobChanges>=7) f.hidden="프로 이직러";
    else if(!peaks.length&&c.maxStay>=20) f.hidden="만년 과장";
    else if(!peaks.length&&s.track==="career"&&c.jobChanges===0&&!s.flags.founder&&s.company===s.firstCompany) f.hidden="한 우물";
  }
  const seenT={}, sh=s.log.filter(l=>l.shame&&!seenT[l.text]&&(seenT[l.text]=1)); f.shames=sh.length<=3?sh:[sh[0],sh[Math.floor(sh.length/2)],sh[sh.length-1]];
  f.peaks=peaks;
  s.final=f;
}


function autoAlloc(s){
  if(!s.lastAlloc) return null; const acts=actionsOf(s).map(a=>a[0]); const al={}; let left=s.slots;
  for(const k of acts){ const v=Math.min(s.lastAlloc[k]||0,left); if(v>0&&!(k==="invest"&&s.stats.money<500)){ al[k]=v; left-=v; } }
  if(left>0) al.rest=(al.rest||0)+left;
  return al;
}
function fastForward(s,max){
  s.ffLog=[]; let n=0;
  while(n<max&&s.phase==="alloc"&&!s.onLeave){
    const al=autoAlloc(s); if(!al) break;
    commitAlloc(s,al); n++;
    if(s.flashes.length||s.stats.burn>=75||s.stats.money<0) break;
  }
  const log=s.ffLog; s.ffLog=null; return log;
}
function previewFx(ch){ const fx=ch.effects||{}, o={}; for(const k of ["skill","rep","net","fame","life","burn","money","assets","pp"]) if(fx[k]) o[k]=fx[k]; return o; }

function goalTest(s,id){
  const st=s.stats;
  switch(id){
    case "house35": return !!s.flags.house&&s.age<35;
    case "marry": return !!s.flags.married;
    case "kid2": return s.kids.length>=2;
    case "nw10": return networth(s)>=100000;
    case "mp1": return s.mp>=1;
    case "stage4": return s.track==="career"&&s.stage>=4;
    case "found": return !!s.flags.founder;
    case "book": return !!s.flags.hit;
    case "fame40": return st.fame>=40;
    case "noburn": return s.age>=50&&!s.flags.burnout_once;
    case "life10": return s.lifeYears>=10;
    case "skill80": return st.skill>=80;
    case "pet": return !!s.flags.pet;
    case "free": return s.track==="free";
    case "rich30": return s.age<30&&networth(s)>=10000;
  }
  return false;
}
function checkGoals(s){
  for(const id of s.goals){ if(s.goalsDone[id]==null&&goalTest(s,id)){ s.goalsDone[id]=s.age; const g=GOALS.find(x=>x.id===id); logAdd(s,"버킷리스트 달성: "+g.t); mark(s,"life",g.t); flash(s,"goal",g.t,"버킷리스트 "+Object.keys(s.goalsDone).length+"/3. 이건 이력서에 안 써도 내가 안다."); } }
}


/* ---------- 9판: 미리보기, 다가오는 결정, 진행도 ---------- */
function defaultPlan(s){
  if(s.track==="school") return {study:2,family:1,rest:1};
  if(s.track==="rest") return {study:2,network:1,rest:1};
  return {work:2,study:1,rest:1};
}
function burnOf(s,k,n){
  let b=0;
  for(let i=0;i<n;i++){
    let x=0;
    if(k==="work"){ x=8; if(has(s,"steel")) x*=0.75; if(perk(s,"night")) x*=0.7; if(s.track==="career"&&s.boss==="overtime") x+=2; }
    else if(k==="study"||k==="fame") x=3; else if(k==="craft") x=4; else if(k==="part") x=5; else if(k==="club") x=2;
    else if(k==="family"){ x=-6; if(has(s,"workaholic")) x*=0.7; if(perk(s,"calm")) x*=1.4; }
    else if(k==="rest"){ x=s.age>=45?-12:-15; if(has(s,"workaholic")) x*=0.7; if(perk(s,"calm")) x*=1.4; }
    if(x>0&&s.origin==="working") x*=0.9;
    b+=x;
  }
  return b;
}
function previewAlloc(s,al){
  const n=k=>al[k]||0, st=s.stats, o={grade:null,burn:0,life:0,money:0,burnEnd:0,lifeEnd:0,rec:0,notes:[]};
  if(s.onLeave) return o;
  let burn=st.burn, life=st.life, money=0;
  for(const k in al) burn+=burnOf(s,k,al[k]);
  burn=Math.max(0,Math.min(100,burn));
  if(perk(s,"multi")) burn+=6;
  for(let i=0;i<n("family");i++){ let g=Math.max(1,8*(1-life/120)); if(perk(s,"family")) g*=2; if(perk(s,"calm")) g*=1.4; if(has(s,"workaholic")) g*=0.7; life+=g; }
  if(life>35) life-=4+(life-35)/12-(s.flags.married||s.flags.pet?1.5:0);
  if(working(s)&&n("work")>=3) life-=3;
  if(burn>=70) life-=3;
  if(s.kids.length&&life<90) life+=1;
  life=Math.max(0,Math.min(100,life));
  let rec=s.age<40?5:s.age<50?3:1; if(perk(s,"body")) rec+=5; if(life>=60) rec+=3; if(life<40) rec-=7; if(life<20) rec-=3;
  o.rec=rec; burn=Math.max(0,Math.min(100,burn-rec));
  if(s.track==="career"||s.track==="founder"){
    let perf=n("work")*10*(0.5+st.skill/100); if(s.track==="career") perf-=3*n("fame");
    if(s.track==="career") perf*=(s.boss==="credit"?0.85:s.boss==="overtime"?1.1:1)*(perk(s,"calm")?0.9:1)*(perk(s,"loyal")&&s.counters.tenure>=5?1.15:1);
    perf=Math.round(perf*eraMult(s)+st.rep/10);
    o.grade=RULES.grade.find(x=>perf>=x[1])[0];
  }
  money+=300*n("part")-100*n("network");
  if(s.track==="career"){ const rate=0.3+(has(s,"thrift")?0.05:0)+(perk(s,"frugal")?0.08:0)+(s.flags.married?0.05:0); money+=Math.round(s.salary*rate); }
  else if(s.track==="free") money+=Math.round(n("work")*(st.skill*12+st.fame*15+st.net*5)*job(s).rate*eraMult(s))-1500;
  else if(s.track==="rest") money-=400;
  if(s.track!=="school") money-=s.kids.filter(b=>s.age-b<22).length*600;
  if(s.track==="founder") o.notes.push("사업 손익은 결산 때 정해진다");
  if(n("invest")) o.notes.push("투자 결과는 운에 달렸다");
  o.burnEnd=Math.round(burn); o.burn=Math.round(burn-st.burn); o.lifeEnd=Math.round(life); o.life=Math.round(life-st.life); o.money=money;
  return o;
}
function upcoming(s){
  const out=[], fmt=(age)=>age===s.age?"올해 끝":age===s.age+1?"내년 끝":(age-s.age)+"년 뒤";
  if(s.track==="school"&&s.gradAge-1>=s.age){
    const at=s.gradAge-1, it={when:fmt(at),title:"졸업 진로",lines:[]};
    if(s.edu==="gen"||s.edu==="voc"){
      it.lines.push({t:"4년제: 능력 22 (지금 "+s.stats.skill+")",ok:s.stats.skill>=22});
      it.lines.push({t:"4년제 등록금 2,000만, 전문대 1,000만 (지금 "+won(s.stats.money)+")",ok:s.stats.money>=1000});
      it.lines.push({t:"바로 일을 시작해도 된다",ok:true});
    } else {
      const p=choiceChance(s,{chance:30,chanceFn:"apply"});
      it.lines.push({t:"지원서: 이름 있는 곳 합격률 지금 "+p+"%",ok:p>=50});
      it.lines.push({t:"합격률은 능력과 인맥으로 오른다",ok:true});
    }
    out.push(it);
  }
  if(s.track==="rest"){ const p=choiceChance(s,{chance:30,chanceFn:"apply"}); out.push({when:"올해 끝",title:"구직",lines:[{t:"이름 있는 곳 합격률 지금 "+p+"%",ok:p>=50},{t:"작은 곳은 확정 합격",ok:true}]}); }
  if((s.track==="career"||s.track==="founder")&&s.stage>=1&&s.stage<=4&&promoNeed(s)){
    const need=promoNeed(s).pp, lack=promoLack(s), it={when:"다음",title:s.track==="career"?"다음 승진":"회사 성장",lines:[{t:(s.track==="career"?"승진":"성장")+" 점수 "+s.pp+"/"+need,ok:s.pp>=need}]};
    for(const l of lack) it.lines.push({t:l+" 필요",ok:false});
    out.push(it);
  }
  if((s.track==="career"||s.track==="founder")&&s.stage===5){ const lack=promoLack(s); out.push({when:"다음",title:"정점 심사",lines:[{t:"점수 "+s.pp+"/"+promoNeed(s).pp,ok:s.pp>=promoNeed(s).pp}].concat(lack.map(l=>({t:l+" 필요",ok:false})))}); }
  if(working(s)&&s.perks.length<5&&s.nextPerk-s.age<=1&&s.nextPerk>=s.age) out.push({when:fmt(s.nextPerk),title:"특성 선택",lines:[{t:"특성 3개 중 1개를 고른다",ok:true}]});
  return out;
}
function pathProgress(s,p){
  const r=ranksNow(s)[p]; if(r>=5) return 1;
  const st=s.stats, frac=(v,a,b)=>Math.max(0,Math.min(1,(v-a)/((b-a)||1)));
  if(p==="org") return s.track==="career"&&promoNeed(s)?frac(s.pp,0,promoNeed(s).pp):0;
  if(p==="biz") return s.track==="founder"&&promoNeed(s)?frac(s.pp,0,promoNeed(s).pp):0;
  if(p==="craft"){ const c=RULES.craft[r], prev=r?RULES.craft[r-1][0]:0; return frac(Math.min(st.skill,c[0]),prev,c[0])*(c[1]&&s.mp<c[1]?0.9:1); }
  if(p==="fame") return frac(st.fame,r?RULES.fame[r-1]:0,RULES.fame[r]);
  if(p==="wealth") return frac(networth(s),r?RULES.wealth[r-1]:0,RULES.wealth[r]);
  return frac(s.lifeYears,r?RULES.lifeYears[r-1]:0,RULES.lifeYears[r]);
}
function goalProgress(s,id){
  const st=s.stats, nw=networth(s);
  switch(id){
    case "house35": return {now:s.flags.house?1:0,need:1,text:s.age<35?"35세까지 "+(35-s.age)+"년. 집 사는 사건은 현금이 있을 때 온다":"35세가 지났다"};
    case "marry": return {text:s.flags.partner?"연애 중이다. 가족·일상에 칸을 쓰면 사건이 온다":"가족·일상, 연애·친구에 칸을 쓰면 인연이 온다"};
    case "kid2": return {now:s.kids.length,need:2,text:"아이 "+s.kids.length+"/2"};
    case "nw10": return {now:nw,need:100000,text:"순자산 "+won(nw)+" / 10억"};
    case "mp1": return {now:s.prog,need:4,text:opusOf(s)+" 진행 "+Math.min(s.prog,4)+"/4, 다 차면 도전"};
    case "stage4": return {now:s.track==="career"?s.stage:0,need:4,text:s.track==="career"?"지금 "+s.stage+"단계":"회사에 다녀야 한다"};
    case "found": return {text:"사직서에서 창업을 고르면 된다 ("+won(job(s).cost)+")"};
    case "book": return {text:"명성을 올리면 책이나 방송 제안이 온다"};
    case "fame40": return {now:st.fame,need:40,text:"명성 "+st.fame+"/40, 대외 활동으로 오른다"};
    case "noburn": return {text:s.flags.burnout_once?"이미 한 번 쓰러졌다":"번아웃 100에 닿지 않으면 된다 (지금 "+st.burn+")"};
    case "life10": return {now:s.lifeYears,need:10,text:"좋은 해 "+s.lifeYears+"/10 (일상 75 이상, 번아웃 55 미만인 해)"};
    case "skill80": return {now:st.skill,need:80,text:"능력 "+st.skill+"/80, 공부와 자기계발로 오른다"};
    case "pet": return {text:"가족·일상에 칸을 쓰면 반려동물 사건이 온다"};
    case "free": return {text:"사직서나 구직 때 프리랜서를 고르면 된다"};
    case "rich30": return {now:nw,need:10000,text:s.age<30?"순자산 "+won(nw)+" / 1억, 30세까지 "+(30-s.age)+"년":"30세가 지났다"};
  }
  return {text:""};
}
