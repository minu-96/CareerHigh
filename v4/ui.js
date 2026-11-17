"use strict";
/* ============ 화면 ============ */
(function(){
const app=document.getElementById("app");
let S=null, view="title", draft=[], drawStep=0, nameDraft="", focusAge=null, lastKey="", selPath=null, recent=[], seenSummary=null, prevRanks=null, cardFlip=false, lastTitle="", copied="";
let shown=null, shownAge=null, lastFlash="", lastResult=null, lastSlip=null, timers=[];
const PCOLOR={org:"var(--c-org)",craft:"var(--c-craft)",biz:"var(--c-biz)",fame:"var(--c-fame)",wealth:"var(--c-wealth)",life:"var(--c-life)",rest:"var(--c-rest)"};
const HEX={org:"#2f66d8",craft:"#dd6f22",biz:"#17915a",fame:"#d93f77",wealth:"#c79a00",life:"#7353cf"};
const ACT_COLOR={work:"org",study:"craft",craft:"craft",network:"biz",fame:"fame",invest:"wealth",family:"life",rest:"rest",part:"wealth",club:"biz"};
const MARK_COLOR={job:"var(--ink)",up:"var(--c-org)",biz:"var(--c-biz)",craft:"var(--c-craft)",peak:"var(--stamp)",life:"var(--c-life)",bad:"var(--muted)"};
const ORDER={promo:["인사발령","발령","새 명함 받기"],peak:["정점","축","계속 산다"],mp:["대표작 완성","완성","계속"],found:["사업자등록증","등록","문을 연다"],collapse:["진단서","입원","받아들인다"],miss:["승진 심사 결과","누락","다음을 노린다"],closed:["폐업 신고","폐업","다시 시작한다"],goal:["버킷리스트","달성","좋다"]};
const ENDINGS=["정년 퇴임","박수 칠 때 떠나다","조기 은퇴","파산","르네상스인","오뚝이","최연소","동기 사랑","프로 이직러","만년 과장","한 우물"];
const NICKS=["야근 요정","가족 바보","칼퇴의 신","관종","차트 중독","회식 에이스","자기계발 중독","프로 이직러","만년 ○○"];
const END_LABEL={retire:"정년 퇴임",clear:"박수 칠 때 떠나다",burnout:"조기 은퇴",bankrupt:"파산"};
const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store={get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } }, set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }, del(k){ try{ localStorage.removeItem(k); }catch(e){} }};
const save=()=>{ if(S&&!S.final) store.set("careerhigh.run",S); };
const later=(fn,ms)=>{ timers.push(setTimeout(fn,ms)); };
const clearTimers=()=>{ timers.forEach(clearTimeout); timers=[]; };

/* ---------- 수집첩 ---------- */
const M=(function(){ const m=store.get("careerhigh.meta")||{}; for(const k of ["stamps","endings","nicks","cards","origins","goals"]) m[k]=m[k]||{}; m.runs=m.runs||0; if(m.rerolls==null) m.rerolls=1; m.mute=!!m.mute; return m; })();
const saveMeta=()=>store.set("careerhigh.meta",M);
const CARD_TOTAL=CARDS.filter(c=>!c.required).length;
function archive(){
  if(!S||!S.final||S.archived) return; S.archived=true;
  const f=S.final, finds=[], j=job(S);
  for(const p of f.peaks){ const k=S.job+"|"+p.path; if(!M.stamps[k]){ M.stamps[k]=p.age; finds.push("정점 도장: "+j.name+"에서 "+PATHS[p.path]+"의 길"); } }
  const en=f.hidden||END_LABEL[f.kind]; if(en&&!M.endings[en]){ M.endings[en]=1; finds.push("새 엔딩: "+en); }
  if(f.hidden&&!M.endings[END_LABEL[f.kind]]) M.endings[END_LABEL[f.kind]]=1;
  if(S.nickname){ const nk=S.nickname.indexOf("만년 ")===0?"만년 ○○":S.nickname; if(!M.nicks[nk]){ M.nicks[nk]=1; finds.push("새 별명: "+S.nickname); } }
  if(!M.origins[S.origin]){ M.origins[S.origin]=1; finds.push("새 출신: "+origin(S).name); }
  for(const id in S.goalsDone) if(!M.goals[id]){ M.goals[id]=1; finds.push("버킷리스트: "+GOALS.find(g=>g.id===id).t); }
  M.runs++; M.rerolls=Math.min(3,M.rerolls+1); f.finds=finds; saveMeta();
  const h=store.get("careerhigh.history")||[];
  let bp="org",bv=-1; for(const p in S.best) if(S.best[p]>bv){ bv=S.best[p]; bp=p; }
  h.unshift({name:S.name,title:S.bestTitle||titleOf(S),end:f.hidden||f.title,age:S.age,job:j.name,nick:S.nickname,path:bp});
  store.set("careerhigh.history",h.slice(0,12)); store.del("careerhigh.run");
}
function nextHint(){
  const miss=[]; for(const jb in JOBS) for(const p in PATHS) if(!M.stamps[jb+"|"+p]) miss.push([jb,p]);
  if(!miss.length) return "도장판을 다 채웠다. 이제 숨은 엔딩을 찾을 차례다.";
  const m=miss[(M.runs*7+3)%miss.length]; return "아직 아무도 못 한 일: "+JOBS[m[0]].name+"에서 "+PATHS[m[1]]+"의 정점.";
}

/* ---------- 소리 ---------- */
let AC=null;
function tone(freq,dur,type,vol,delay,slide){
  if(M.mute) return;
  try{
    if(!AC) AC=new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended") AC.resume();
    const t=AC.currentTime+(delay||0), o=AC.createOscillator(), g=AC.createGain();
    o.type=type||"triangle"; o.frequency.setValueAtTime(freq,t); if(slide) o.frequency.exponentialRampToValueAtTime(slide,t+dur);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.08,t+0.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+dur+0.02);
  }catch(e){}
}
const SFX={
  tap(){ tone(520,.06,"triangle",.05); },
  post(n){ tone(392*Math.pow(1.122,n||0),.12,"triangle",.09); },
  unpost(){ tone(300,.08,"triangle",.05,0,220); },
  page(){ tone(180,.12,"sawtooth",.025,0,90); tone(660,.05,"triangle",.03,.08); },
  stamp(d){ tone(120,.16,"square",.09,d||0,50); tone(70,.2,"sine",.12,d||0); },
  tick(d){ tone(880,.03,"square",.025,d||0); },
  good(d){ tone(523,.1,"triangle",.08,d||0); tone(784,.18,"triangle",.08,(d||0)+.09); },
  bad(d){ tone(220,.18,"sawtooth",.05,d||0,150); tone(147,.28,"sawtooth",.05,(d||0)+.14,98); },
  promo(){ [523,659,784,1047].forEach((f,i)=>tone(f,.16,"triangle",.09,i*.09)); },
  peak(){ [392,523,659,784,1047,1319].forEach((f,i)=>tone(f,.22,"triangle",.09,i*.1)); tone(1568,.6,"sine",.06,.62); },
  coin(){ tone(988,.07,"square",.04); tone(1319,.14,"square",.04,.07); }
};

/* ---------- 색종이와 흔들림 ---------- */
let fxc=null, parts=[], raf=0;
function confetti(n,colors){
  if(reduce) return;
  if(!fxc){ fxc=document.createElement("canvas"); fxc.className="fx"; document.body.appendChild(fxc); }
  const W=fxc.width=window.innerWidth, H=fxc.height=window.innerHeight;
  for(let i=0;i<n;i++) parts.push({x:W/2+(Math.random()-.5)*W*.5,y:H*.42,vx:(Math.random()-.5)*13,vy:-6-Math.random()*11,r:4+Math.random()*5,c:colors[i%colors.length],a:Math.random()*6,va:(Math.random()-.5)*.4,life:0});
  if(!raf) raf=requestAnimationFrame(step);
  function step(){
    const ctx=fxc.getContext("2d"); ctx.clearRect(0,0,fxc.width,fxc.height);
    parts=parts.filter(p=>p.y<fxc.height+20&&p.life<220);
    for(const p of parts){ p.vy+=.32; p.vx*=.99; p.x+=p.vx; p.y+=p.vy; p.a+=p.va; p.life++; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a); ctx.fillStyle=p.c; ctx.fillRect(-p.r,-p.r*.45,p.r*2,p.r*.9); ctx.restore(); }
    raf=parts.length?requestAnimationFrame(step):0; if(!raf) ctx.clearRect(0,0,fxc.width,fxc.height);
  }
}
function shake(){ if(reduce) return; app.classList.remove("shake"); void app.offsetWidth; app.classList.add("shake"); }
function fxFor(f){
  const all=Object.keys(HEX).map(k=>HEX[k]);
  if(f.kind==="peak"){ SFX.peak(); confetti(160,all.concat(["#ffe14d","#d33a22"])); later(()=>confetti(90,all),450); }
  else if(f.kind==="promo"||f.kind==="found"){ SFX.promo(); confetti(46,["#2f66d8","#ffe14d","#16213b"]); }
  else if(f.kind==="mp"){ SFX.promo(); confetti(60,["#dd6f22","#ffe14d"]); }
  else if(f.kind==="goal"){ SFX.good(); confetti(36,["#7353cf","#ffe14d"]); }
  else { SFX.bad(); shake(); }
}

const counts=arr=>{ const o={}; for(const k of arr) o[k]=(o[k]||0)+1; return o; };
function prefill(){ draft=[]; if(!S||S.onLeave||S.phase!=="alloc") return; const al=autoAlloc(S); if(!al) return; const acts=actionsOf(S).map(a=>a[0]); for(const k of acts) for(let i=0;i<(al[k]||0);i++) draft.push(k); draft=draft.slice(0,S.slots); }
function trackColor(s){ return s.track==="founder"?PCOLOR.biz:s.track==="free"?PCOLOR.craft:s.track==="career"?PCOLOR.org:"var(--ink)"; }
function wonShort(n){ const a=Math.abs(n), sg=n<0?"-":""; if(a>=10000) return sg+(a/10000).toFixed(a>=100000?0:1).replace(/\.0$/,"")+"억"; return sg+a.toLocaleString("ko-KR")+"만"; }

/* ---------- 조각 ---------- */
function bizcard(s){
  const nk=s.nickname?`<div class="nick">${esc(s.nickname)}</div>`:"";
  const tick=shownAge!=null&&shownAge!==s.age&&view==="game";
  return `<div class="bizcard${cardFlip?" flip":""}" style="--track:${trackColor(s)}">${nk}
    <div class="co">${esc(orgOf(s))}</div><div class="nm">${esc(s.name)}</div><div class="tt">${esc(titleOf(s))}</div>
    <div class="age num"><span class="${tick?"tick":""}">${s.age}</span><small>세</small></div>
    <div class="left">${esc(job(s).name)}, 정년까지 ${Math.max(0,RULES.retireAge-s.age)}년</div></div>`;
}
function ruler(s,big){
  const x=a=>10+(a-17)/(65-17)*320, W=big?44:34;
  let h=`<svg class="ruler" viewBox="0 0 340 ${W}" role="img" aria-label="${s.age}세, 17세부터 65세까지의 인생 자">`;
  h+=`<rect x="${x(17)}" y="12" width="${Math.max(0,x(s.age)-x(17))}" height="6" fill="var(--hl)"/>`;
  h+=`<line x1="${x(17)}" y1="18" x2="${x(65)}" y2="18" stroke="var(--ink)" stroke-width="1.5"/>`;
  for(let a=20;a<=65;a+=5){ h+=`<line x1="${x(a)}" y1="${a%10===0?12:15}" x2="${x(a)}" y2="18" stroke="var(--ink)" stroke-width="1"/>`; if(a%10===0||a===65) h+=`<text x="${x(a)}" y="30" text-anchor="middle">${a}</text>`; }
  for(const m of s.marks){ const c=MARK_COLOR[m.k]||"var(--ink)"; h+= m.k==="peak"?`<path d="M${x(m.age)} 2l2.4 4.8 5.2.6-3.8 3.6 1 5.2-4.8-2.6-4.8 2.6 1-5.2-3.8-3.6 5.2-.6z" fill="${c}"><title>${m.age}세 ${esc(m.t)}</title></path>`:`<circle cx="${x(m.age)}" cy="7" r="3.2" fill="${c}"><title>${m.age}세 ${esc(m.t)}</title></circle>`; }
  h+=`<path d="M${x(s.age)} 19l-4 6h8z" fill="var(--stamp)"/>`;
  if(big) h+=`<text x="10" y="42">17세</text>`;
  return h+`</svg>`;
}
function towerSvg(p,rank,peaked,fresh){
  const fl=16, base=112, c=PCOLOR[p];
  let g=`<svg viewBox="0 0 48 128" aria-hidden="true">`;
  g+=`<line x1="24" y1="${base-5*fl-2}" x2="24" y2="${base-5*fl-(peaked?18:6)}" stroke="${peaked?"var(--stamp)":"var(--ghost)"}" stroke-width="1.5"/>`;
  if(peaked) g+=`<path class="${fresh?"flag":""}" d="M24 ${base-5*fl-18}h12l-4 4 4 4h-12z" fill="var(--stamp)"/>`;
  for(let i=0;i<5;i++){
    const y=base-(i+1)*fl, on=i<rank, top=fresh&&i===rank-1;
    if(on){ g+=`<g class="${top?"drop":""}"><rect x="7" y="${y}" width="34" height="${fl}" fill="var(--ink)"/>`;
      for(let w=0;w<3;w++) g+=`<rect class="${top?"lit":""}" style="animation-delay:${.35+w*.12}s" x="${11+w*10}" y="${y+4}" width="6" height="8" fill="${c}"/>`; g+=`</g>`; }
    else g+=`<rect x="7.5" y="${y+.5}" width="33" height="${fl-1}" fill="none" stroke="var(--ghost)" stroke-dasharray="2 2"/>`;
  }
  g+=`<rect x="4" y="${base}" width="40" height="3" fill="var(--ink)"/>`;
  return g+`</svg>`;
}
function skyline(s,interactive){
  const r=ranksNow(s), best=s.best;
  const html=Object.keys(PATHS).map(p=>{ const rank=Math.max(r[p],0), peaked=!!s.peakAt[p], fresh=!!(interactive&&prevRanks&&rank>(prevRanks[p]||0));
    const label=`${PATHS[p]}의 길 ${rank}층${peaked?", 정점 달성":""}${best[p]>rank?", 최고 "+best[p]+"층":""}`;
    return interactive?`<button class="tower" data-act="path" data-p="${p}" aria-pressed="${selPath===p}" aria-label="${label}">${towerSvg(p,rank,peaked,fresh)}<span>${PATHS[p]}</span></button>`
      :`<div class="tower" role="img" aria-label="${label}">${towerSvg(p,rank,peaked,false)}<span>${PATHS[p]}</span></div>`; }).join("");
  return `<div class="skyline">${html}</div>`;
}
function towerDetail(s){
  if(!selPath) return `<p class="small muted">건물을 누르면 그 길에서 무엇이 필요한지 보인다.</p>`;
  const p=selPath, r=Math.max(ranksNow(s)[p],0), names=ladder(s,p);
  return `<div class="tower-detail" style="--pc:${PCOLOR[p]}"><p><b>${PATHS[p]}의 길.</b> ${esc(PATH_TIPS[p])}</p>
    <ul class="ladder">${names.map((n,i)=>`<li class="${i<r?"on":""} ${i===r?"next":""}"><i></i><span>${i+1}층 ${esc(n)}</span></li>`).join("")}</ul>
    <p class="small"><span class="hl">다음: ${esc(nextReq(s,p))}</span></p></div>`;
}
function statsBlock(s){
  const g=(k,cls,extra)=>`<div class="stat" data-stat="${k}"><div class="row"><span>${STAT[k]}</span><b class="num">${s.stats[k]}</b></div><div class="gauge ${cls||""}"><i style="width:${s.stats[k]}%"></i>${extra||""}</div></div>`;
  const cap=skillCap(s);
  return `<div class="stats">${g("skill","",cap<100?`<u style="left:${cap}%" title="능력 한계 ${cap}"></u>`:"")}${g("rep")}${g("net")}${g("fame")}${g("life")}${g("burn","burn"+(s.stats.burn>=70?" hot":""))}</div>
    <div class="money"><div class="stat" data-stat="money">현금<b class="num">${won(s.stats.money)}</b></div><div class="stat" data-stat="nw">순자산<b class="num">${won(networth(s))}</b></div></div>`;
}
function goalsBlock(s){
  return `<div class="goals"><p class="goals-h">버킷리스트</p>${s.goals.map(id=>{ const g=GOALS.find(x=>x.id===id), d=s.goalsDone[id];
    return `<p class="goal ${d!=null?"done":""}"><i></i><span>${esc(g.t)}</span>${d!=null?`<em>${d}세</em>`:""}</p>`; }).join("")}</div>`;
}
function tags(s){
  const t=[]; if(s.flags.married) t.push("기혼"); else if(s.flags.partner) t.push("연애 중"); else if(s.flags.divorced) t.push("이혼");
  if(s.kids.length) t.push("자녀 "+s.kids.length); if(s.flags.house) t.push("자가"); if(s.flags.pet) t.push("반려동물");
  if(s.track==="career"&&s.boss) t.push("상사: "+BOSSES[s.boss].name);
  if(s.rival) t.push("동기 "+s.rival.name+" ("+(s.rival.status==="founder"?job(s).ftitles:job(s).titles)[s.rival.stage]+")");
  const perks=s.perks.map(p=>PERKS.find(x=>x.id===p));
  if(!t.length&&!perks.length) return "";
  return `<div class="tags">${t.map(x=>`<span class="tag">${esc(x)}</span>`).join("")}${perks.map(p=>`<span class="tag perk" title="${esc(p.desc)}">${esc(p.name)}</span>`).join("")}</div>`;
}
function chipList(d){ return Object.keys(d).map(k=>{ const v=d[k], good=k==="burn"?v<0:v>0; return `<span class="chip ${good?"up":"dn"}">${STAT[k]} ${v>0?"+":""}${k==="money"||k==="assets"?wonShort(v):v}</span>`; }).join(""); }
function catOf(card){
  const w=card.when||{};
  if(card.required) return ["갈림길","var(--stamp)"];
  if(w.job) return [JOBS[w.job].name,PCOLOR.craft];
  const tr=[].concat(w.track||[]);
  if(tr.length===1&&tr[0]==="founder") return ["사업",PCOLOR.biz];
  if(tr.length===1&&tr[0]==="free") return ["프리랜서",PCOLOR.craft];
  if(tr.length===1&&tr[0]==="school") return ["학창 시절",PCOLOR.life];
  if(w.min&&w.min.fame) return ["명성",PCOLOR.fame];
  if(tr.length===1&&tr[0]==="career") return ["회사",PCOLOR.org];
  return ["인생",PCOLOR.life];
}

/* ---------- 그리기 ---------- */
function tween(el,from,to,money){
  if(!el) return; const fmt=v=>money?won(Math.round(v)):String(Math.round(v));
  if(reduce){ el.textContent=fmt(to); return; }
  const t0=performance.now(), dur=520;
  (function f(now){ if(!el.isConnected) return; const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=fmt(from+(to-from)*e); if(k<1) requestAnimationFrame(f); })(t0);
}
function animateStats(){
  if(!S||S.phase==="draw"||S.phase==="ending"||view!=="game"){ return; }
  const cur=Object.assign({},S.stats,{nw:networth(S)});
  app.querySelectorAll("[data-stat]").forEach(el=>{
    const k=el.dataset.stat, to=cur[k], from=shown&&shown[k]!=null?shown[k]:to; if(from===to) return;
    const money=k==="money"||k==="nw", bar=el.querySelector(".gauge i");
    if(bar&&!reduce){ bar.style.width=from+"%"; requestAnimationFrame(()=>requestAnimationFrame(()=>{ bar.style.width=to+"%"; })); }
    tween(el.querySelector("b"),from,to,money);
    const d=to-from, good=k==="burn"?d<0:d>0, f=document.createElement("em"); f.className="pop "+(good?"up":"dn"); f.textContent=(d>0?"+":"")+(money?wonShort(d):d); el.appendChild(f);
  });
  shown=cur;
}
function render(){
  clearTimers();
  let h="";
  if(view==="title") h=vTitle();
  else if(view==="resume") h=wrapSide(vResume());
  else if(view==="log") h=wrapSide(vLog());
  else if(view==="cards") h=wrapSide(vCards());
  else if(S.phase==="draw") h=vDraw();
  else if(S.phase==="ending") h=vEnding();
  else h=vGame();
  const fl=S&&view==="game"&&S.flashes&&S.flashes.length?S.flashes[0]:null;
  if(fl) h+=vOverlay(fl);
  app.innerHTML=h;
  animateStats();
  if(S&&S.phase!=="draw"&&view==="game"){ prevRanks=Object.assign({},ranksNow(S)); shownAge=S.age; }
  cardFlip=false;
  const fk=fl?fl.kind+"|"+fl.title+"|"+S.age+"|"+S.flashes.length:"";
  if(fk&&fk!==lastFlash) fxFor(fl);
  lastFlash=fk;
  if(S&&view==="game"&&S.phase==="result") lastResult=S.result;
  if(view==="game"&&S&&S.phase==="alloc") lastSlip=recent.length?recent[recent.length-1]:null;
  if(S&&S.phase==="ending"&&view==="game"&&!S.final.fxDone){ S.final.fxDone=true; if(S.final.peaks.length){ SFX.peak(); confetti(120,Object.keys(HEX).map(k=>HEX[k])); } else if(S.final.kind==="retire"||S.final.kind==="clear") SFX.good(); else SFX.bad(); }
  const ov=app.querySelector(".overlay button"); if(ov) ov.focus();
  if(focusAge!=null){ const el=document.getElementById("log-"+focusAge); if(el) el.scrollIntoView({block:"start"}); focusAge=null; return; }
  const key=view+"|"+(S?S.phase+"|"+S.current+"|"+S.age+"|"+drawStep:"");
  if(key!==lastKey){
    const play=document.getElementById("play");
    if(play&&S&&(S.phase==="event"||S.phase==="result")&&window.innerWidth<900) play.scrollIntoView({block:"start"}); else window.scrollTo(0,0);
  }
  lastKey=key;
}
function wrapSide(inner){ return `<div class="layout"><aside class="dash">${bizcard(S)}${skyline(S,false)}</aside><main class="play">${inner}</main></div>`; }

function collectionBlock(){
  const jobs=Object.keys(JOBS), paths=Object.keys(PATHS), got=Object.keys(M.stamps).length;
  const bar=(label,n,tot)=>`<div class="meter"><span>${label}</span><span class="num">${n}/${tot}</span><i><b style="width:${Math.round(n/tot*100)}%"></b></i></div>`;
  return `<div class="sheet"><div class="sheet-head"><h2 class="disp">수집첩</h2><span class="aside">${M.runs}번의 인생</span></div>
    <div class="stampgrid" role="img" aria-label="정점 도장 ${got}개, 전체 ${jobs.length*paths.length}개"><span></span>${paths.map(p=>`<span class="sg-h">${PATHS[p]}</span>`).join("")}
      ${jobs.map(jb=>`<span class="sg-j">${JOBS[jb].name.split("·")[0].split(" ")[0]}</span>`+paths.map(p=>{ const a=M.stamps[jb+"|"+p]; return `<span class="sg-c ${a?"on":""}" style="--pc:${PCOLOR[p]}" title="${JOBS[jb].name}, ${PATHS[p]}${a?", "+a+"세에 달성":""}">${a?"정점":""}</span>`; }).join("")).join("")}</div>
    ${bar("정점 도장",got,jobs.length*paths.length)}${bar("엔딩",Object.keys(M.endings).length,ENDINGS.length)}${bar("별명",Object.keys(M.nicks).length,NICKS.length)}${bar("사건 카드",Math.min(CARD_TOTAL,Object.keys(M.cards).length),CARD_TOTAL)}${bar("출신",Object.keys(M.origins).length,ORIGINS.length)}${bar("버킷리스트",Object.keys(M.goals).length,GOALS.length)}
    <p class="small"><span class="hl">${esc(nextHint())}</span></p>
    <p class="small muted">다시 뽑기권 ${M.rerolls}장. 한 인생을 마칠 때마다 한 장씩 생긴다 (최대 3장).</p></div>`;
}
function vTitle(){
  const run=store.get("careerhigh.run"), hist=store.get("careerhigh.history")||[];
  return `<div class="title-grid"><div class="hero">
      ${heroSky()}
      <h1>커리어<br>하이</h1>
      <p class="lede">출신도, 학력도 고를 수 없다. 열일곱에서 스무 살 사이 어딘가에서 시작해 예순다섯까지 산다. 꼭대기는 여섯 곳이다. 회사, 장인, 창업, 명성, 자산, 그리고 잘 산 인생. 네 칸짜리 한 해로는 다 가질 수 없다.</p>
      ${hist.length?`<div class="sheet-head"><h2 class="disp" style="font-size:19px">지난 인생들</h2><span class="aside">${hist.length}명</span></div>
      <div class="mini-cards">${hist.map(x=>`<div class="mini-card" style="--pc:${PCOLOR[x.path]||"var(--ink)"}"><span class="muted">${esc(x.job)}, ${x.age}세</span><b>${esc(x.name)}</b><span>${esc(x.end)}</span>${x.nick?`<span class="muted">${esc(x.nick)}</span>`:""}</div>`).join("")}</div>`:""}
    </div>
    <div class="side-col"><div class="sheet">
      <div class="sheet-head"><h2 class="disp">입사 지원서</h2></div>
      <label for="nm">이름 (비워 두면 지어 준다)</label>
      <input type="text" id="nm" maxlength="8" value="${esc(nameDraft)}" autocomplete="off">
      <button class="btn" data-act="new">새 인생 시작</button>
      ${run&&run.v===3&&!run.final?`<button class="btn line" data-act="resume-run">이어하기: ${esc(run.name)}, ${run.age}세</button>`:""}
      <button class="link" data-act="mute">${M.mute?"소리 켜기":"소리 끄기"}</button>
    </div>${collectionBlock()}</div></div>`;
}
function heroSky(){
  const ps=Object.keys(PATHS); let g=`<svg class="hero-sky" viewBox="0 0 600 190" role="img" aria-label="여섯 동의 건물이 선 스카이라인">`;
  const H=[3,5,2,4,1,5], X=[14,108,202,296,390,484];
  ps.forEach((p,i)=>{ const x=X.at(i), n=H.at(i), fl=26, base=184;
    for(let f=0;f<5;f++){ const y=base-(f+1)*fl; if(f<n){ g+=`<rect x="${x}" y="${y}" width="96" height="${fl}" fill="var(--ink)"/>`; for(let w=0;w<4;w++){ const lit=(f*4+w+i)%3; g+=`<rect class="${lit?"":"blink"}" style="animation-delay:${((f*5+w*3+i*2)%9)*.7}s" x="${x+10+w*21}" y="${y+7}" width="11" height="12" fill="${lit?PCOLOR[p]:"var(--paper)"}"/>`; } } else g+=`<rect x="${x+.5}" y="${y+.5}" width="95" height="${fl-1}" fill="none" stroke="var(--ghost)" stroke-dasharray="4 4"/>`; }
    if(n===5) g+=`<line x1="${x+48}" y1="${base-5*fl}" x2="${x+48}" y2="${base-5*fl-26}" stroke="var(--stamp)" stroke-width="2"/><path class="wave" d="M${x+48} ${base-5*fl-26}h20l-6 6 6 6h-20z" fill="var(--stamp)"/>`;
  });
  return g+`</svg>`;
}
function vDraw(){
  const o=origin(S), tg=TRAITS_GOOD.find(t=>t.id===S.traits[0]), tb=TRAITS_BAD.find(t=>t.id===S.traits[1]);
  const eduTxt=S.track==="rest"?EDU[S.edu]+" 졸업, 바로 일을 구한다":EDU[S.edu]+(S.edu==="univ"||S.edu==="college"?" 입학":" 재학");
  const rows=[["나이",`${S.age}세`],["출신",`${o.name}<div class="small muted">${o.desc}</div>`],["학력",eduTxt],
    ["타고난 것",`${tg.name}<div class="small muted">${tg.desc}</div>`],["모자란 것",`${tb.name}<div class="small muted">${tb.desc}</div>`],["하고 싶은 일",job(S).name],
    ["버킷리스트",S.goals.map(id=>esc(GOALS.find(g=>g.id===id).t)).join("<br>")]];
  const last=drawStep>=rows.length-1;
  return `<div class="layout"><aside class="dash"><div class="sheet"><p class="disp" style="font-size:34px;line-height:1">커리어<br>하이</p><p class="small muted">아직 아무것도 세우지 않았다. 여섯 동의 땅만 비어 있다.</p></div></aside><main class="play"><div class="doc">
    <h2 class="disp">통지서</h2>
    <p><b>${esc(S.name)}</b> 님의 출발점을 알려 드립니다. 이의 신청은 받지 않습니다.</p>
    <table class="formtbl">${rows.slice(0,drawStep+1).map((r,i)=>`<tr class="${i===drawStep?"reveal":""}"><th>${r[0]}</th><td>${r[1]}</td></tr>`).join("")}</table>
    ${last?`<button class="btn" data-act="draw-done">이 인생으로 시작한다</button>${M.rerolls>0?`<button class="btn line" data-act="reroll">이의 신청: 다시 뽑기 (${M.rerolls}장 남음)</button>`:""}`:`<button class="btn" data-act="draw-next">다음 장 넘기기</button>`}
    <p class="small muted">${drawStep+1} / ${rows.length}</p></div></main></div>`;
}
function vGame(){
  return `<div class="layout"><aside class="dash">
      ${bizcard(S)}
      ${ruler(S)}
      <div class="sheet" style="gap:10px">${skyline(S,true)}${towerDetail(S)}</div>
      <div class="sheet" style="gap:10px">${statsBlock(S)}</div>
      ${goalsBlock(S)}
      ${tags(S)}
    </aside>
    <main class="play" id="play">${S.phase==="alloc"?vAlloc():S.phase==="event"?vEvent():vResult()}${navBlock()}</main></div>`;
}
function navBlock(){
  const canResign=(S.track==="career"||S.track==="free"||S.track==="founder")&&S.stage<6&&S.phase==="alloc"&&!S.onLeave;
  return `<div class="navrow"><button class="btn line" data-act="view-resume">이력서</button><button class="btn line" data-act="view-log">업무 수첩</button><button class="btn line" data-act="view-cards">명함첩</button></div>
    ${canResign?`<button class="resign" data-act="resign">${S.track==="founder"?"회사를 접을까":S.track==="free"?"다른 길을 알아본다":"사직서를 꺼낸다"}</button>`:""}
    <div class="foot"><button class="link" data-act="to-title">처음 화면으로 (자동 저장)</button><button class="link" data-act="mute">${M.mute?"소리 켜기":"소리 끄기"}</button></div>`;
}
function slipHtml(){
  if(!recent.length) return "";
  const fresh=recent[recent.length-1]!==lastSlip;
  const lines=[]; for(const m of recent) for(const l of m.lines) if(lines.indexOf(l)<0) lines.push(l);
  const msg={S:"올해의 주인공이었다.",A:"기대 이상이었다.",B:"할 만큼 했다.",C:"존재감이 옅었다.",D:"면담이 잡혔다."};
  const last=recent[recent.length-1], streak=last.streak>=2?`<span class="streak">A 이상 ${last.streak}년 연속</span>`:"";
  if(recent.length===1){ const m=recent[0];
    return `<div class="slip"><div class="slip-top">${m.grade?`<div class="stamp ${fresh?"":"still"}"><b>${m.grade}</b><span>성과 ${m.perf}</span></div>`:""}<div><h3 class="disp">${m.age}세 결산 ${streak}</h3><p class="small">${m.promo?`<b>${esc(m.promo)}</b>(으)로 올라갔다.`:m.grade?msg[m.grade]:"한 해가 지나갔다."}${m.nick?` 별명이 생겼다: <span class="bad">${esc(m.nick)}</span>`:""}</p></div></div>
      ${lines.length?`<ul class="lines">${lines.slice(0,7).map(l=>`<li>${esc(l)}</li>`).join("")}</ul>`:""}</div>`; }
  const a=recent[0].age, b=last.age;
  return `<div class="slip"><h3 class="disp">${a}세부터 ${b}세까지, 같은 계획으로 ${recent.length}년 ${streak}</h3>
    <div class="stamps">${recent.map((m,i)=>`<span class="mini-stamp ${fresh?"go":""}" style="animation-delay:${i*110}ms;${m.grade?"":"border-style:dashed"}">${m.grade||"쉼"}<small>${m.age}</small></span>`).join("")}</div>
    ${lines.length?`<ul class="lines">${lines.slice(-8).map(l=>`<li>${esc(l)}</li>`).join("")}</ul>`:""}</div>`;
}
function vAlloc(){
  const acts=actionsOf(S), left=S.slots-draft.length, notes=slotNotes(S), era=S.era?ERAS.find(e=>e.id===S.era):null;
  const rot=["-1.5deg","1deg","-.5deg","1.6deg","-1deg"];
  let warn="";
  if(S.stats.burn>=85) warn="번아웃 "+S.stats.burn+". 100이 되면 쓰러진다. 휴식이 필요하다.";
  else if(S.stats.burn>=70) warn="번아웃 "+S.stats.burn+". 행동력이 한 칸 줄었다.";
  else if(S.stats.money<0) warn="현금이 바닥났다. 빚이 계속되면 파산한다.";
  else if(S.track==="career"&&draft.length===S.slots&&draft.indexOf("work")<0) warn="업무 칸이 없으면 평가가 D로 떨어진다. 두 번 연속이면 회사를 나가야 한다.";
  return `${slipHtml()}
    ${era?`<div class="news"><b>${S.news?"속보":"요즘"}</b><span>${esc(era.text)}</span></div>`:""}
    <section class="sheet">
      <div class="sheet-head"><h2 class="disp">${S.age}세의 계획</h2><span class="aside">행동력 ${S.slots}칸</span></div>
      ${S.onLeave?`<p>올해는 쉰다. 아무것도 하지 않아도 된다.</p>`:`
      ${warn?`<p class="warnline">${esc(warn)}</p>`:""}
      ${notes.length?`<p class="notes">칸이 줄었다: ${esc(notes.join(", "))}</p>`:""}
      <div class="slots">${Array.from({length:S.slots},(_,i)=>{ const k=draft[i]; if(!k) return `<div class="slot">빈칸</div>`; const a=acts.find(x=>x[0]===k);
        return `<button class="slot filled ${i===draft.length-1&&draft.justAdded?"new":""}" data-act="unslot" data-i="${i}" style="--pc:${PCOLOR[ACT_COLOR[k]]};--r:${rot.at(i)}" aria-label="${a?a[1]:k} 빼기">${a?a[1]:k}</button>`; }).join("")}</div>
      <div class="posts">${acts.map(a=>{ const n=draft.filter(x=>x===a[0]).length, cant=left<=0||(a[0]==="invest"&&S.stats.money<500);
        let sub=a[2]; if(a[0]==="craft") sub="진행 "+Math.min(S.prog,4)+"/4. 4가 되면 대표작에 도전한다";
        return `<button class="post" data-act="add" data-k="${a[0]}" style="--pc:${PCOLOR[ACT_COLOR[a[0]]]}" ${cant?"disabled":""}>${n?`<span class="cnt">${n}</span>`:""}<b>${a[1]}</b><small>${esc(sub)}</small></button>`; }).join("")}</div>`}
      <div class="btn-row">
        <button class="btn go ${left<=0||S.onLeave?"ready":""}" data-act="commit" ${left>0&&!S.onLeave?"disabled":""}>${S.onLeave?"한 해 쉬기":left>0?left+"칸 남았다":"이 계획으로 한 해 보내기"}</button>
        <button class="btn line" data-act="ff" ${left>0||S.onLeave?"disabled":""}>사건이 생길 때까지 반복</button>
      </div>
      ${draft.length?`<button class="link" data-act="clear">계획 비우기</button>`:""}
    </section>`;
}
function vEvent(){
  const card=cardById(S.current), cat=catOf(card);
  return `<section class="memo" style="--pc:${cat[1]}"><span class="cat">${esc(cat[0])}</span>
    <h2 class="disp">${esc(fill(S,card.title))}</h2><p class="body">${esc(fill(S,card.text))}</p>
    ${visibleChoices(S,card).map((x,n)=>{ const ch=x.c, lk=locked(S,ch), p=choiceChance(S,ch);
      let hint=ch.hint?fill(S,ch.hint):""; if(ch.check) hint=(hint?hint+", ":"")+STAT[ch.check.stat]+" "+ch.check.min+" 이상이면 성공 (지금 "+S.stats[ch.check.stat]+")";
      if(lk) hint="조건 부족: "+Object.keys(ch.require).map(k=>STAT[k]+" "+ch.require[k]).join(", ");
      let luck=""; if(p!=null) luck=`<span class="chip luck">${has(S,"sense")||ch.chanceFn?"성공률 "+p+"%":"운에 달렸다"}</span>`;
      const pv=chipList(previewFx(ch)), chips=pv||luck?`<div class="chips">${pv}${luck}</div>`:"";
      return `<button class="choice ${lk?"locked":""}" data-act="choose" data-i="${x.i}" style="animation-delay:${120+n*70}ms" ${lk?"disabled":""}><span class="key">${n+1}</span><b>${esc(fill(S,ch.text))}</b>${hint?`<small>${esc(hint)}</small>`:""}${chips}</button>`; }).join("")}
  </section>`;
}
function vResult(){
  const r=S.result, fresh=r!==lastResult, roll=r.roll;
  let meter="";
  if(roll&&roll.p!=null) meter=`<div class="roll ${fresh?"play":""} ${roll.ok?"ok":"no"}"><div class="roll-bar"><i class="zone" style="width:${roll.p}%"></i><u class="needle" style="--to:${Math.min(99,roll.r)}%"></u></div><p class="small"><span class="muted">성공 구간 ${roll.p}%</span> <b class="verdict">${roll.ok?"성공":"실패"}</b></p></div>`;
  else if(roll&&roll.check) meter=`<div class="roll ${roll.ok?"ok":"no"}"><p class="small"><span class="muted">${STAT[roll.stat]} ${roll.min} 필요, 지금 ${roll.have}</span> <b class="verdict" style="opacity:1">${roll.ok?"성공":"실패"}</b></p></div>`;
  const late=fresh&&roll&&roll.p!=null?"late":"";
  if(fresh&&!reduce){ if(roll&&roll.p!=null){ for(let i=0;i<7;i++) SFX.tick(i*.11); later(()=>{ roll.ok?SFX.good():SFX.bad(); if(!roll.ok) shake(); },900); } else if(roll&&roll.check){ roll.ok?SFX.good():SFX.bad(); } else if(r.shame) SFX.bad(); else if(r.delta.money>0) SFX.coin(); else SFX.tap(); }
  return `<section class="memo"><p class="small muted">${esc(r.pick||"")}</p><h2 class="disp">${esc(r.title)}</h2>
    ${meter}
    <p class="result-text ${late}">${esc(r.text)}</p>
    ${Object.keys(r.delta).length?`<div class="chips float ${late}">${chipList(r.delta)}</div>`:""}
    ${r.shame?`<p class="shame-note ${late}">이력서에는 안 쓴다. 업무 수첩에만 남는다: ${esc(r.shame)}</p>`:""}
    <button class="btn ${late}" data-act="next-event">다음</button></section>`;
}
function vOverlay(f){
  const o=ORDER[f.kind]||["알림","확인","확인"];
  const peakPath=f.kind==="peak"?(S.peaks.find(p=>p.name===f.title)||{}).path:null;
  let body="";
  if(f.kind==="promo") body=`<table class="formtbl"><tr><th>성명</th><td>${esc(S.name)}</td></tr><tr><th>새 직함</th><td><b>${esc(f.title)}</b></td></tr><tr><th>소속</th><td>${esc(f.sub)}</td></tr><tr><th>나이</th><td>${S.age}세</td></tr></table><p class="small muted">위와 같이 발령함.</p>`;
  else body=`<p class="sub">${esc(f.sub)}</p>`;
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="${esc(o[0])}"><div class="order ${f.kind}" style="--pc:${peakPath?PCOLOR[peakPath]:f.kind==="goal"?PCOLOR.life:"var(--ink)"}">
    <div class="bigstamp">${esc(o[1])}</div>${f.kind==="promo"?"":`<span class="kind">${esc(o[0])}</span>`}
    <h2 class="disp">${esc(f.kind==="promo"?"인사발령":f.title)}</h2>${body}
    ${f.kind==="peak"?skyline(S,false):""}
    <button class="btn" data-act="dismiss">${esc(o[2])}</button></div></div>`;
}
function resumeRows(s){
  let out="", prev=null;
  for(const r of s.resume){
    if(prev!=null&&r.age-prev>=3) out+=`<tr class="gap-row"><th class="num">&nbsp;</th><td>기록 없는 ${r.age-prev-1}년 <button data-act="gap" data-age="${prev+1}">수첩에서 보기</button></td></tr>`;
    out+=`<tr><th class="num">${r.age}세</th><td>${esc(r.text)}</td></tr>`; prev=r.age;
  }
  if(prev!=null&&s.age-prev>=3) out+=`<tr class="gap-row"><th class="num">&nbsp;</th><td>기록 없는 ${s.age-prev}년 <button data-act="gap" data-age="${prev+1}">수첩에서 보기</button></td></tr>`;
  return out;
}
function vResume(){
  return `<div class="doc"><h2 class="disp">이력서</h2><p class="small muted">공식 이력만 적는다. 빈 칸의 사연은 업무 수첩에 있다.</p>
    <table class="formtbl">${resumeRows(S)}</table><button class="btn" data-act="back">돌아가기</button></div>`;
}
function vLog(){
  const by={}; for(const l of S.log){ (by[l.age]=by[l.age]||[]).push(l); }
  const ages=Object.keys(by).map(Number).sort((a,b)=>b-a);
  return `<div class="notebook">${ages.length?ages.map(a=>`<div id="log-${a}"><p class="nb-year">${a}세</p>${by[a].map(l=>`<p class="nb-line ${l.shame?"shame":""}">${esc(l.text)}</p>`).join("")}</div>`).join(""):"<p class=\"nb-line\">아직 적힌 것이 없다.</p>"}</div>
    <button class="btn" data-act="back">돌아가기</button>`;
}
function vCards(){
  return `<div class="sheet"><div class="sheet-head"><h2 class="disp">명함첩</h2><span class="aside">${S.cards.length}장</span></div>
    <div class="mini-cards">${S.cards.map(c=>`<div class="mini-card"><span class="muted">${esc(c.org)}</span><b>${esc(S.name)}</b><span>${esc(c.title)}</span><span class="muted">${c.age}세</span></div>`).join("")}</div>
    <button class="btn" data-act="back">돌아가기</button></div>`;
}
function lifeChart(s){
  const H=s.hist; if(H.length<3) return "";
  const x0=28,x1=332,y0=10,y1=110, ax=a=>x0+(a-H[0].age)/Math.max(1,H[H.length-1].age-H[0].age)*(x1-x0), ay=v=>y1-v/100*(y1-y0);
  const line=k=>H.map((h,i)=>(i?"L":"M")+ax(h.age).toFixed(1)+" "+ay(h[k]).toFixed(1)).join("");
  const mx=Math.max(1,...H.map(h=>h.nw)), mn=Math.min(0,...H.map(h=>h.nw)), by=v=>176-(v-mn)/(mx-mn||1)*46;
  let g=`<svg class="chart" viewBox="0 0 340 196" role="img" aria-label="나이에 따른 일상, 번아웃, 순자산 변화">`;
  for(const v of [0,50,100]) g+=`<line x1="${x0}" x2="${x1}" y1="${ay(v)}" y2="${ay(v)}" stroke="var(--grid)" stroke-width="1"/><text x="${x0-4}" y="${ay(v)+3}" text-anchor="end">${v}</text>`;
  g+=`<path class="draw" pathLength="1" d="${line("burn")}" fill="none" stroke="var(--warn)" stroke-width="1.5" opacity=".8"/><path class="draw" pathLength="1" d="${line("life")}" fill="none" stroke="var(--c-life)" stroke-width="2.2"/>`;
  for(const m of s.marks.filter(m=>m.k==="peak"||m.k==="up"||m.k==="bad")) if(m.age>=H[0].age) g+=`<line x1="${ax(m.age)}" x2="${ax(m.age)}" y1="${y0}" y2="${y1}" stroke="${MARK_COLOR[m.k]}" stroke-width="1" stroke-dasharray="2 3" opacity=".7"><title>${m.age}세 ${esc(m.t)}</title></line>`;
  const nwp=H.map((h,i)=>(i?"L":"M")+ax(h.age).toFixed(1)+" "+by(h.nw).toFixed(1)).join("");
  g+=`<path d="${nwp}L${ax(H[H.length-1].age)} ${by(Math.max(0,mn))}L${ax(H[0].age)} ${by(Math.max(0,mn))}Z" fill="var(--c-wealth)" opacity=".28"/>`;
  g+=`<path class="draw" pathLength="1" d="${nwp}" fill="none" stroke="var(--c-wealth)" stroke-width="1.8"/>`;
  const top=H.reduce((a,b)=>b.nw>a.nw?b:a);
  g+=`<circle cx="${ax(top.age)}" cy="${by(top.nw)}" r="3" fill="var(--c-wealth)"/><text x="${Math.max(40,Math.min(ax(top.age),300))}" y="${by(top.nw)-6}" text-anchor="middle">${wonShort(top.nw)}원</text>`;
  g+=`<text x="${x0}" y="194">${H[0].age}세</text><text x="${x1}" y="194" text-anchor="end">${H[H.length-1].age}세</text><text x="${x0}" y="126">순자산</text>`;
  return g+`</svg><div class="legend"><span><i style="background:var(--c-life)"></i>일상</span><span><i style="background:var(--warn)"></i>번아웃</span><span><i style="background:var(--c-wealth)"></i>순자산</span></div>`;
}
function shareText(){
  const f=S.final, r=f.ranks;
  return `커리어 하이 | ${S.name}, ${S.age}세\n${f.hidden?"숨은 엔딩 "+f.hidden+" / ":""}${f.title}\n${f.verdict}\n`+Object.keys(PATHS).map(p=>PATHS[p]+" "+"■".repeat(r[p])+"□".repeat(5-r[p])).join("\n")+`\n버킷리스트 ${Object.keys(S.goalsDone).length}/3`+(S.nickname?`\n별명: ${S.nickname}`:"");
}
function vEnding(){
  const f=S.final, finds=f.finds||[];
  return `<div class="layout"><aside class="dash">
      ${bizcard(S)}${ruler(S,true)}
      <div class="sheet">${skyline(S,false)}</div>${goalsBlock(S)}${tags(S)}
    </aside><main class="play">
      <section class="ending-hero">
        <p class="muted">${f.hidden?"숨은 엔딩":f.kind==="burnout"||f.kind==="bankrupt"?"중도 엔딩":S.age+"세"}</p>
        <h1>${esc(f.hidden||f.title)}</h1>
        ${f.hidden?`<p class="muted">${esc(f.title)}</p>`:""}
        <p class="hand">${esc(f.scene)}</p>
        <p><span class="hl"><b>${esc(f.verdict)}</b></span></p>
      </section>
      <section class="sheet finds"><div class="sheet-head"><h2 class="disp">이번 인생이 남긴 것</h2><span class="aside">수집첩에 ${finds.length}개 추가</span></div>
        ${finds.length?`<ul class="lines">${finds.map((x,i)=>`<li class="find" style="animation-delay:${300+i*140}ms">${esc(x)}</li>`).join("")}</ul>`:`<p class="small muted">새로 모은 것은 없다. 다른 길을 걸어 보면 생긴다.</p>`}
        <p class="small"><span class="hl">${esc(nextHint())}</span></p>
        <div class="btn-row"><button class="btn line" data-act="copy">${copied?esc(copied):"결과 복사하기"}</button><button class="btn" data-act="again">바로 다음 인생</button></div>
      </section>
      <section class="sheet"><div class="sheet-head"><h2 class="disp">한 사람의 그래프</h2></div>${lifeChart(S)}</section>
      <section class="doc"><h2 class="disp">최종 이력서</h2>
        <table class="formtbl">${Object.keys(PATHS).map(p=>`<tr><th>${PATHS[p]}</th><td>${f.ranks[p]}층 ${f.ranks[p]?esc(rankName(S,p,f.ranks[p])):"<span class=\"muted\">걷지 않은 길</span>"}${S.peakAt[p]?` <b class="bad">정점 (${S.peakAt[p]}세)</b>`:""}</td></tr>`).join("")}
        <tr><th>이직</th><td>${S.counters.jobChanges}회</td></tr><tr><th>순자산</th><td>${won(networth(S))}</td></tr></table>
        <table class="formtbl">${resumeRows(S)}</table></section>
      <section class="notebook"><p class="nb-year">이력서에 못 쓴 이야기</p>${f.shames.length?f.shames.map(l=>`<p class="nb-line shame">${l.age}세, ${esc(l.text)}</p>`).join(""):`<p class="nb-line">놀랍게도 없다. 수첩이 깨끗하다.</p>`}</section>
      <div class="navrow"><button class="btn line" data-act="view-resume">이력서</button><button class="btn line" data-act="view-log">업무 수첩</button><button class="btn line" data-act="view-cards">명함첩</button></div>
      <button class="link" data-act="to-title">처음 화면으로</button>
    </main></div>`;
}

/* ---------- 입력 ---------- */
function afterStep(){
  if(S.summary&&S.summary!==seenSummary){ recent=[S.summary]; seenSummary=S.summary; if(S.summary.grade&&S.phase==="alloc") SFX.stamp(.12); }
  if(S.phase==="alloc") prefill();
  const t=titleOf(S)+orgOf(S); if(t!==lastTitle){ cardFlip=!!lastTitle; lastTitle=t; }
  save();
}
function startRun(){ S=newRun((Date.now()^(Math.random()*1e9))|0,nameDraft); drawStep=0; draft=[]; recent=[]; seenSummary=null; prevRanks=null; shown=null; shownAge=null; selPath=null; lastTitle=""; copied=""; lastResult=null; lastSlip=null; view="game"; }
function act(a,b){
  draft.justAdded=false;
  if(a==="new"){ const el=document.getElementById("nm"); nameDraft=el?el.value.trim().slice(0,8):""; startRun(); SFX.page(); }
  else if(a==="again"){ startRun(); SFX.page(); }
  else if(a==="reroll"){ if(M.rerolls>0){ M.rerolls--; saveMeta(); const nm=S.name; startRun(); S.name=nameDraft||nm; SFX.page(); } }
  else if(a==="resume-run"){ S=store.get("careerhigh.run"); view="game"; recent=S.summary?[S.summary]:[]; seenSummary=S.summary; lastSlip=S.summary; lastTitle=titleOf(S)+orgOf(S); shown=null; shownAge=S.age; lastResult=S.result; prefill(); }
  else if(a==="draw-next"){ drawStep++; SFX.stamp(); }
  else if(a==="draw-done"){ beginYear(S); draft=[]; lastTitle=titleOf(S)+orgOf(S); save(); SFX.promo(); }
  else if(a==="add"){ if(draft.length<S.slots){ draft.push(b.dataset.k); draft.justAdded=true; SFX.post(draft.length-1); } }
  else if(a==="unslot"){ draft.splice(+b.dataset.i,1); SFX.unpost(); }
  else if(a==="clear"){ draft=[]; SFX.unpost(); }
  else if(a==="commit"){ recent=[]; SFX.page(); commitAlloc(S,counts(draft)); afterStep(); }
  else if(a==="ff"){
    SFX.page(); S.ffLog=[]; commitAlloc(S,counts(draft)); let n=1;
    while(n<10&&S.phase==="alloc"&&!S.onLeave&&!S.flashes.length&&S.stats.burn<75&&S.stats.money>=0){ const al=autoAlloc(S); if(!al) break; commitAlloc(S,al); n++; }
    const log=S.ffLog||[]; S.ffLog=null; afterStep(); if(log.length>1&&S.phase==="alloc"){ recent=log; log.forEach((m,i)=>SFX.stamp(.1+i*.11)); }
  }
  else if(a==="choose"){ M.cards[S.current]=1; choose(S,+b.dataset.i); afterStep(); saveMeta(); }
  else if(a==="next-event"){
    if(S.resignOpen){ S.resignOpen=false; S.result=null; S.slots=S.onLeave?0:slotsOf(S); if(S.queue.length) nextEvent(S); else S.phase="alloc"; }
    else nextEvent(S);
    if(S.phase==="alloc"&&!S.summary) recent=[];
    SFX.tap(); afterStep(); }
  else if(a==="resign"){ S.current="resign"; S.resignOpen=true; S.phase="event"; SFX.tap(); }
  else if(a==="dismiss"){ S.flashes.shift(); save(); SFX.tap(); }
  else if(a==="path"){ selPath=selPath===b.dataset.p?null:b.dataset.p; SFX.tap(); }
  else if(a==="mute"){ M.mute=!M.mute; saveMeta(); SFX.tap(); }
  else if(a==="view-resume"){ view="resume"; SFX.tap(); }
  else if(a==="view-log"){ view="log"; SFX.tap(); }
  else if(a==="view-cards"){ view="cards"; SFX.tap(); }
  else if(a==="gap"){ view="log"; const want=+b.dataset.age; const ages=S.log.map(l=>l.age).filter(x=>x>=want).sort((x,y)=>x-y); focusAge=ages.length?ages[0]:null; }
  else if(a==="back") view="game";
  else if(a==="to-title") view="title";
  else if(a==="copy"){ const t=shareText(); try{ navigator.clipboard.writeText(t).then(()=>{ copied="복사했다"; render(); },()=>{ copied="복사가 막혀 있다"; render(); }); }catch(err){ copied="복사가 막혀 있다"; } }
  if(S&&S.final) archive();
  render();
}
app.addEventListener("click",e=>{ const b=e.target.closest("[data-act]"); if(!b||b.disabled) return; act(b.dataset.act,b); });
document.addEventListener("keydown",e=>{
  if(e.target&&e.target.tagName==="INPUT"){ if(e.key==="Enter"&&view==="title"){ const b=app.querySelector("[data-act=new]"); if(b) act("new",b); } return; }
  if(!S||view!=="game") return;
  if(S.flashes&&S.flashes.length){ if(e.key==="Escape"||e.key==="Enter"){ e.preventDefault(); act("dismiss"); } return; }
  if(S.phase==="event"&&e.key>="1"&&e.key<="9"){ const bs=app.querySelectorAll(".choice"); const b=bs[+e.key-1]; if(b&&!b.disabled) act("choose",b); }
  else if(e.key==="Enter"&&document.activeElement===document.body){ const b=app.querySelector("[data-act=next-event]")||app.querySelector("[data-act=commit]:not([disabled])")||app.querySelector("[data-act=draw-next]")||app.querySelector("[data-act=draw-done]"); if(b){ e.preventDefault(); act(b.dataset.act,b); } }
});
function start(data){ if(data&&data.S&&data.S.v===3){ S=data.S; view=data.view||"game"; draft=data.draft||[]; drawStep=data.drawStep||0; lastTitle=titleOf(S)+orgOf(S); recent=S.summary?[S.summary]:[]; seenSummary=S.summary; lastSlip=S.summary; lastResult=S.result; shownAge=S.age; if(S.flashes&&S.flashes[0]) lastFlash=S.flashes[0].kind+"|"+S.flashes[0].title+"|"+S.age+"|"+S.flashes.length; } render(); }
const hot=window.claude&&window.claude.hot;
if(hot&&hot.snapshot) hot.snapshot(()=>({S:S,view:view,draft:Array.from(draft),drawStep:drawStep}));
if(hot&&hot.ready) hot.ready(start); else start((hot&&hot.data)||{});
})();
