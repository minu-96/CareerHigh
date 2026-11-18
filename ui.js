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
const ENDINGS=["정년 퇴임","박수 칠 때 떠나다","스스로 내려왔다","조기 은퇴","파산","르네상스인","오뚝이","최연소","동기 사랑","프로 이직러","만년 과장","한 우물"];
const NICKS=["야근 요정","가족 바보","칼퇴의 신","관종","차트 중독","회식 에이스","자기계발 중독","프로 이직러","만년 ○○"];
const END_LABEL={retire:"정년 퇴임",clear:"박수 칠 때 떠나다",self:"스스로 내려왔다",burnout:"조기 은퇴",bankrupt:"파산"};
const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store={get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } }, set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }, del(k){ try{ localStorage.removeItem(k); }catch(e){} }};
const save=()=>{ if(S&&!S.final) store.set("careerhigh.run",S); };
const later=(fn,ms)=>{ timers.push(setTimeout(fn,ms)); };
const clearTimers=()=>{ timers.forEach(clearTimeout); timers=[]; };

/* ---------- 수집첩 ---------- */
const M=(function(){ const m=store.get("careerhigh.meta")||{}; for(const k of ["stamps","endings","nicks","cards","origins","goals","bcards"]) m[k]=m[k]||{}; m.runs=m.runs||0; if(m.rerolls==null) m.rerolls=1; m.mute=!!m.mute; return m; })();
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
  const nc=(S.cardFinds||[]).length; if(nc) finds.push("새 명함 "+nc+"장 (명함 도감 "+dexCount(M.bcards)+"/"+CARD_DESIGNS+")");
  M.runs++; M.rerolls=Math.min(3,M.rerolls+1); f.finds=finds; saveMeta();
  const h=store.get("careerhigh.history")||[];
  let bp="org",bv=-1; for(const p in S.best) if(S.best[p]>bv){ bv=S.best[p]; bp=p; }
  h.unshift(makeRecord(S));
  store.set("careerhigh.history",h.slice(0,20)); store.del("careerhigh.run"); town=null;
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
function prefill(){ draft=[]; if(!S||S.onLeave||S.phase!=="alloc") return; const changed=!S.lastAlloc||S.lastAllocTrack!==S.track; S.planNote=S.lastAlloc&&S.lastAllocTrack&&S.lastAllocTrack!==S.track?"처지가 바뀌어 계획을 새로 짰다.":""; const al=changed?defaultPlan(S):autoAlloc(S); if(!al) return; const acts=actionsOf(S).map(a=>a[0]); for(const k of acts) for(let i=0;i<(al[k]||0);i++) draft.push(k); draft=draft.slice(0,S.slots); }
function trackColor(s){ return s.track==="founder"?PCOLOR.biz:s.track==="free"?PCOLOR.craft:s.track==="career"?PCOLOR.org:"var(--ink)"; }
function wonShort(n){ const a=Math.abs(n), sg=n<0?"-":""; if(a>=10000) return sg+(a/10000).toFixed(a>=100000?0:1).replace(/\.0$/,"")+"억"; return sg+a.toLocaleString("ko-KR")+"만"; }
function chipList(d){ return Object.keys(d).map(k=>{ const v=d[k], good=k==="burn"?v<0:v>0; return `<span class="chip ${good?"up":"dn"}">${STAT[k]} ${v>0?"+":""}${k==="money"||k==="assets"?wonShort(v):v}</span>`; }).join(""); }
function catOf(card){
  const w=card.when||{};
  if(card.required) return ["갈림길","var(--stamp)"];
  if(w.ghost) return ["지난 인생","#9a7b4f"];
  if(w.year) return ["시대","#4f5b6e"];
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
function resumeRows(s){
  let out="", prev=null;
  for(const r of s.resume){
    if(prev!=null&&r.age-prev>=3) out+=`<tr class="gap-row"><th class="num">&nbsp;</th><td>기록 없는 ${r.age-prev-1}년 <button data-act="gap" data-age="${prev+1}">수첩에서 보기</button></td></tr>`;
    out+=`<tr><th class="num">${s.born!=null?`<small class="yr">${s.born+r.age}</small>`:""}${r.age}세</th><td>${esc(r.text)}</td></tr>`; prev=r.age;
  }
  if(prev!=null&&s.age-prev>=3) out+=`<tr class="gap-row"><th class="num">&nbsp;</th><td>기록 없는 ${s.age-prev}년 <button data-act="gap" data-age="${prev+1}">수첩에서 보기</button></td></tr>`;
  return out;
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

/* ============ 5판 화면 구조 ============ */
let lastToast=null, confirmNoWork=false;
let recTab="status", slipClosed=false, colOpen=false, slipMini=false, cardOpen=null, cardFlipped=false, lastCardKey="", guideStep=null;
const SKY=[[0,"#26345f","#f2a27a"],[.1,"#5f8fd6","#ffd2a8"],[.3,"#4b8be4","#c4e3ff"],[.5,"#3a7ddf","#acd6ff"],[.7,"#5584cc","#f5d59c"],[.86,"#45437f","#f28a5c"],[.95,"#1d2350","#9a5a7a"],[1,"#0f1533","#4a3a6a"]];
const mix=(a,b,k)=>{ const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); const x=p(a),y=p(b); return "#"+x.map((v,i)=>Math.round(v+(y[i]-v)*k).toString(16).padStart(2,"0")).join(""); };
function skyAt(t){ for(let i=1;i<SKY.length;i++){ const a=SKY[i-1],b=SKY[i]; if(t<=b[0]){ const k=(t-a[0])/(b[0]-a[0]); return [mix(a[1],b[1],k),mix(a[2],b[2],k)]; } } return [SKY[SKY.length-1][1],SKY[SKY.length-1][2]]; }
const TX=[111,175,239,303,367,431];

/* 도시: 나이가 곧 하루의 시각이다. 17세는 새벽, 65세는 해 질 녘. */
function city(o){
  const t=Math.max(0,Math.min(1,(o.age-17)/48)), sky=skyAt(t), id="g"+Math.round(t*1000)+(o.mini?"m":"");
  const night=t>.84, sx=40+t*520, sy=228-Math.sin(Math.PI*t)*190, sunC=t<.12||t>.82?"#ff9b54":"#fff3c4";
  let g=`<svg class="city" viewBox="${o.vb||"0 0 600 272"}" data-vb="${o.vb?1:0}" preserveAspectRatio="xMidYMax slice" ${o.label?`role="img" aria-label="${esc(o.label)}"`:`aria-hidden="true"`}>
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
  <radialGradient id="${id}s"><stop offset="0" stop-color="${sunC}" stop-opacity=".55"/><stop offset="1" stop-color="${sunC}" stop-opacity="0"/></radialGradient></defs>
  <rect x="-1400" y="-800" width="3400" height="1100" fill="url(#${id})"/>`;
  if(t>.8){ const op=Math.min(1,(t-.8)/.15); for(let i=0;i<60;i++){ const x=(i*97)%1800-600, y=(i*53)%150-130; g+=`<circle cx="${x}" cy="${y+150}" r="${i%3?1:1.6}" fill="#fff" opacity="${(op*(.4+(i%4)*.15)).toFixed(2)}"/>`; } }
  g+=`<circle cx="${sx}" cy="${sy}" r="46" fill="url(#${id}s)"/><circle cx="${sx}" cy="${sy}" r="17" fill="${sunC}"/>`;
  if(!o.mini) for(let i=0;i<3;i++){ const y=[40,72,26].at(i), sc=[1,.7,.85].at(i); g+=`<g class="cloud" style="animation-duration:${[70,95,120].at(i)}s;animation-delay:-${[10,50,80].at(i)}s"><g transform="translate(0 ${y}) scale(${sc})" fill="#fff" opacity="${night?.18:.75}"><ellipse cx="40" cy="10" rx="34" ry="11"/><ellipse cx="62" cy="2" rx="22" ry="12"/><ellipse cx="22" cy="4" rx="16" ry="9"/></g></g>`; }
  const far=mix(sky[1],"#16213b",night?.55:.28);
  for(let i=0;i<64;i++){ const w=28+(i*13)%22, h=26+(i*37)%50, x=-1400+i*44; g+=`<rect x="${x}" y="${232-h}" width="${w}" height="${h}" fill="${far}" opacity=".55"/>`; }
  const r=o.ranks, ps=Object.keys(PATHS);
  ps.forEach((p,i)=>{
    const x=TX.at(i), w=58, fl=24, base=232, rank=Math.max(0,r[p]||0), peaked=!!(o.peaks&&o.peaks[p]), fresh=!!(o.fresh&&o.fresh[p]);
    if(o.fade) g+=`<g opacity=".38">`;
    const tag=o.interactive?`g class="tw${o.sel===p?" sel":""}" data-act="path" data-p="${p}" tabindex="0" role="button" aria-label="${PATHS[p]}의 길 ${rank}층${peaked?", 정점":""}"`:`g`;
    g+=`<${tag}><rect class="hit" x="${x-4}" y="${base-5*fl-30}" width="${w+8}" height="${5*fl+30}" fill="transparent" rx="4"/>`;
    for(let f=0;f<5;f++){ const y=base-(f+1)*fl;
      if(f<rank){ const top=fresh&&f===rank-1; g+=`<g class="${top?"drop":""}"><rect class="body" x="${x}" y="${y}" width="${w}" height="${fl}" fill="#16213b"/>`;
        for(let k=0;k<4;k++) g+=`<rect class="${top?"lit":""}" style="animation-delay:${.35+k*.1}s" x="${x+6+k*12.5}" y="${y+6}" width="8" height="11" fill="${HEX[p]}"/>`; g+=`</g>`; }
      else if(f===rank&&o.prog){ const pr=Math.max(0,Math.min(1,o.prog[p]||0)), lit=Math.round(pr*4);
        g+=`<rect x="${x+.5}" y="${y+.5}" width="${w-1}" height="${fl-1}" fill="#16213b" fill-opacity=".35" stroke="#ffffff" stroke-opacity=".7" stroke-dasharray="3 3"/>`;
        for(let k=0;k<4;k++) g+=`<rect x="${x+6+k*12.5}" y="${y+6}" width="8" height="11" fill="${k<lit?HEX[p]:"#ffffff"}" opacity="${k<lit?.85:.18}"/>`;
        if(rank===0) g+=`<path d="M${x-3} ${base}V${y-6}M${x+w+3} ${base}V${y-6}M${x-3} ${y-6}H${x+w+3}M${x-3} ${base-8}L${x+w+3} ${y-2}" stroke="#ffe14d" stroke-opacity=".7" stroke-width="1.5" fill="none"/>`; }
      else g+=`<rect x="${x+.5}" y="${y+.5}" width="${w-1}" height="${fl-1}" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-dasharray="3 3"/>`;
    }
    if(peaked) g+=`<line x1="${x+w/2}" y1="${base-5*fl}" x2="${x+w/2}" y2="${base-5*fl-24}" stroke="#d33a22" stroke-width="2"/><path class="flag" d="M${x+w/2} ${base-5*fl-24}h16l-5 5 5 5h-16z" fill="#d33a22"/>`;
    g+=`${o.fade?"":`<text class="tw-label" x="${x+w/2}" y="253" text-anchor="middle">${PATHS[p]}</text>`}</${o.interactive?"g":"g"}>`+(o.fade?`</g>`:"");
  });
  g+=`<rect x="-1400" y="232" width="3400" height="300" fill="#232a3a"/><rect x="-1400" y="232" width="3400" height="3" fill="#16213b"/>`;
  for(let i=0;i<64;i++) g+=`<rect x="${-1400+i*50}" y="264" width="24" height="2" fill="#ffe14d" opacity=".55"/>`;
  return g+`</svg>`;
}
function freshRanks(){ if(!prevRanks) return null; const r=ranksNow(S), o={}; for(const p in r) if(r[p]>(prevRanks[p]||0)) o[p]=1; return o; }
function sceneFor(s,extra){ const prog={}; for(const p in PATHS) prog[p]=pathProgress(s,p); return city({age:s.age,ranks:ranksNow(s),peaks:s.peakAt,fresh:freshRanks(),interactive:true,sel:selPath,label:null,prog:prog})+(extra||""); }

function hudRuler(s){
  const x=a=>6+(a-17)/(65-17)*328;
  let h=`<svg class="ruler" viewBox="0 0 340 26" role="img" aria-label="${s.age}세, 정년까지 ${Math.max(0,RULES.retireAge-s.age)}년">`;
  h+=`<rect x="${x(17)}" y="9" width="${Math.max(0,x(s.age)-x(17))}" height="5" fill="#ffe14d" rx="2"/>`;
  h+=`<line x1="${x(17)}" y1="14" x2="${x(65)}" y2="14" stroke="currentColor" stroke-width="1.2" opacity=".6"/>`;
  for(let a=20;a<=60;a+=10) h+=`<text x="${x(a)}" y="25" text-anchor="middle">${a}</text>`;
  for(const m of s.marks){ const c=m.k==="peak"?"#ff6a55":m.k==="bad"?"#95a2b7":m.k==="life"?"#a78bff":m.k==="up"?"#6f9cff":m.k==="biz"?"#45c98a":m.k==="craft"?"#ff9a52":"#f8f9f6"; h+=`<circle cx="${x(m.age)}" cy="5" r="${m.k==="peak"?3.6:2.6}" fill="${c}"><title>${m.age}세 ${esc(m.t)}</title></circle>`; }
  h+=`<path d="M${x(s.age)} 15l-4 6h8z" fill="#ff6a55"/>`;
  return h+`</svg>`;
}
function hud(s){
  const tick=shownAge!=null&&shownAge!==s.age;
  const done=Object.keys(s.goalsDone||{}).length;
  return `<header class="hud" style="--track:${trackColor(s)}">
    <div class="who-wrap"><button class="hud-card ${cardFlip?"flip":""}" data-act="card" data-i="cur" aria-label="지금 명함 크게 보기">${cardHtml(cardInfoOf(s),{w:window.innerWidth<520?78:96})}</button><div class="who" data-act="card" data-i="cur" role="button" tabindex="0" aria-label="지금 명함 크게 보기"><b>${esc(s.name)}</b><span>${esc(cardTitleOf(s))}${s.track==="career"||s.track==="founder"?", "+esc(s.company):""}</span>${s.nickname?`<span class="nick">${esc(s.nickname)}</span>`:""}</div></div>
    <div class="clock"><div class="age num"><span class="${tick?"tick":""}">${s.age}</span><small>세</small><em class="yr">${yearOf(s)}</em></div>${hudRuler(s)}</div>
    <div class="hud-btns"><button class="hbtn" data-act="rec" data-tab="status">기록</button><button class="hbtn" data-act="mute" aria-label="${M.mute?"소리 켜기":"소리 끄기"}">${M.mute?"소리 끔":"소리 켬"}</button></div>
  </header>`;
}
function statbar(s){
  const TIP={skill:"일을 잘하는 정도. 승진, 대표 업적, 판정에 쓰인다",rep:"업계와 회사의 평가. 평가 점수와 스카우트에 쓰인다",net:"아는 사람. 높은 직급과 회사 성장에 필요하다",fame:"세상이 아는 정도. 명성의 길과 강연, 출간",life:"일 밖의 삶. 높으면 피로가 잘 풀린다",burn:"쌓인 피로. 70부터 칸이 줄고 100이면 쓰러진다"};
  const g=(k,cls,extra)=>{ const hot=k==="burn"&&s.stats.burn>=70; return `<div class="st ${hot?"hot":""}" data-stat="${k}" title="${TIP[k]}"><div class="row"><span>${STAT[k]}</span><b class="num">${s.stats[k]}</b></div><div class="gauge ${cls||""}"><i style="width:${s.stats[k]}%"></i>${extra||""}</div></div>`; };
  const cap=skillCap(s);
  return `<div class="statbar">${g("skill","",cap<100?`<u style="left:${cap}%" title="능력 한계 ${cap}"></u>`:"")}${g("rep")}${g("net")}${g("fame")}${g("life")}${g("burn","burn"+(s.stats.burn>=70?" hot":""))}
    <div class="st money"><div class="row" data-stat="money" style="position:relative"><span>현금</span><b class="num">${won(s.stats.money)}</b></div><div class="row" data-stat="nw" style="position:relative"><span>순자산</span><b class="num">${won(networth(s))}</b></div></div></div>`;
}
function toastHtml(){
  if(!recent.length||slipClosed||S.phase!=="alloc") return "";
  const fresh=recent[recent.length-1]!==lastSlip, last=recent[recent.length-1];
  const lines=[]; for(const m of recent) for(const l of m.lines) if(lines.indexOf(l)<0) lines.push(l);
  const msg={S:"올해의 주인공이었다.",A:"기대 이상이었다.",B:"할 만큼 했다.",C:"존재감이 옅었다.",D:"면담이 잡혔다."};
  const streak=last.streak>=2?` <span class="streak">A 이상 ${last.streak}년 연속</span>`:"";
  const tk=(S.era?"":" notick")+(slipMini?" mini":"");
  if(recent.length===1){ const m=recent[0];
    return `<div class="toast${tk}" data-act="${slipMini?"slip-open":""}"><button class="x" data-act="slip-close" aria-label="결산 닫기">×</button><div class="toast-top">${m.grade?`<div class="stamp ${fresh?"":"still"}"><b>${m.grade}</b><span>성과 ${m.perf}</span></div>`:""}<div><h3 class="disp">${m.age}세 결산${streak}</h3><p class="small">${m.promo?`<b>${esc(m.promo)}</b>(으)로 올라갔다.`:m.grade?msg[m.grade]:"한 해가 지나갔다."}${m.nick?` 별명: <span class="bad">${esc(m.nick)}</span>`:""}</p></div></div>
      ${lines.length?`<ul>${lines.slice(0,4).map(l=>`<li>${esc(l)}</li>`).join("")}</ul>`:""}</div>`; }
  return `<div class="toast${tk}" data-act="${slipMini?"slip-open":""}"><button class="x" data-act="slip-close" aria-label="결산 닫기">×</button><h3 class="disp">${recent[0].age}~${last.age}세, ${recent.length}년${streak}</h3>
    <div class="stamps">${recent.map((m,i)=>`<span class="mini-stamp ${fresh?"go":""}" style="animation-delay:${i*110}ms;${m.grade?"":"border-style:dashed"}">${m.grade||"쉼"}<small>${m.age}</small></span>`).join("")}</div>
    ${lines.length?`<ul>${lines.slice(-4).map(l=>`<li>${esc(l)}</li>`).join("")}</ul>`:""}</div>`;
}
function tipHtml(){
  if(!selPath) return "";
  const p=selPath, r=Math.max(ranksNow(S)[p],0);
  return `<div class="tipbox" style="--pc:${PCOLOR[p]}"><button class="x" data-act="path" data-p="${p}" aria-label="닫기">×</button><b>${PATHS[p]}의 길, ${r}층${r?": "+esc(rankName(S,p,r)):""}</b><span>${esc(PATH_TIPS[p])}</span><span class="hl">다음: ${esc(nextReq(S,p))}</span></div>`;
}
function towerDetail(s){
  if(!selPath) return `<p class="small muted">도시의 건물을 누르면 그 길의 층과 다음 조건이 보인다.</p>`;
  const p=selPath, r=Math.max(ranksNow(s)[p],0), names=ladder(s,p);
  return `<div class="tower-detail" style="--pc:${PCOLOR[p]}"><h3 class="disp">${PATHS[p]}의 길</h3><p>${esc(PATH_TIPS[p])}</p>
    <ul class="ladder">${names.map((n,i)=>`<li class="${i<r?"on":""} ${i===r?"next":""}"><i></i><span>${i+1}층 ${esc(n)}</span></li>`).join("")}</ul>
    <p class="small"><span class="hl">다음: ${esc(nextReq(s,p))}</span></p></div>`;
}
function goalsBlock(s,detail){
  const first=!Object.keys(M.endings||{}).length&&!s.final;
  let focus=null; if(first){ let best=-1; for(const id of s.goals){ if(s.goalsDone[id]!=null) continue; const p=goalProgress(s,id), f=p.need?Math.min(1,(p.now||0)/p.need):0.05; if(f>best){ best=f; focus=id; } } }
  return `<div class="goals"><p class="goals-h">버킷리스트</p>${s.goals.map(id=>{ const g=GOALS.find(x=>x.id===id), d=s.goalsDone[id], p=d==null&&detail!==false&&!s.final?goalProgress(s,id):null;
    const bar=p&&p.need?`<span class="gbar"><i style="width:${Math.round(Math.max(0,Math.min(1,(p.now||0)/p.need))*100)}%"></i></span>`:"";
    return `<div class="goal-wrap ${focus===id?"focus":""}"><p class="goal ${d!=null?"done":""}"><i></i><span>${esc(g.t)}</span>${d!=null?`<em>${d}세</em>`:focus===id?`<em class="tagf">첫 목표</em>`:""}</p>${p?`${bar}<small class="ghint">${esc(p.text)}</small>`:""}</div>`; }).join("")}</div>`;
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
function rail(s){ const logs=s.log.slice(-3).reverse();
  return `<aside class="rail"><button data-act="card" data-i="cur" aria-label="지금 명함 크게 보기">${cardHtml(cardInfoOf(s),{w:298,cls:cardFlip?"reveal":""})}</button>${upcoming(s).length?`<div class="rail-block"><p class="goals-h">다가오는 결정</p>${upcomingHtml(s)}</div>`:""}${goalsBlock(s)}${towerDetail(s)}${logs.length?`<div class="rail-block"><p class="goals-h">최근 수첩</p><ul class="recent-log">${logs.map(l=>`<li class="${l.shame?"shame":""}"><b>${l.age}세</b> ${esc(l.text)}</li>`).join("")}</ul><button class="link" data-act="rec" data-tab="log">수첩 전체 보기</button></div>`:""}${tags(s)}</aside>`; }
const QUARTER=["1분기","2분기","3분기","4분기","야근"];
const SHORT={work:"성과↑ 번아웃+8",bizwork:"회사 성과↑ 번아웃+8",gig:"수입↑ 번아웃+8",study:"능력↑ 번아웃+3",prep:"능력↑ 번아웃+3",school:"능력↑ 번아웃+3",network:"인맥+5 현금-100만",fame:"명성↑ 성과-3",invest:"현금 25% 투자",family:"일상↑ 번아웃-6",friends:"일상↑ 번아웃-6",rest:"번아웃-15",part:"현금+300만 번아웃+5",club:"인맥+4 평판+2"};
function actKey(s,k){ const a=ACTIONS[s.track].find(x=>x[0]===k); return a?a[1]:k; }
function signed(n,unit){ return (n>0?"+":"")+n+(unit||""); }
function upcomingHtml(s,max){ const u=upcoming(s).slice(0,max||9); if(!u.length) return "";
  return `<div class="upnext">${u.map(it=>`<div class="up-item"><p class="up-h"><b>${esc(it.when)}</b> ${esc(it.title)}</p><ul>${it.lines.map(l=>`<li class="${l.ok?"ok":"no"}">${esc(l.t)}</li>`).join("")}</ul></div>`).join("")}</div>`; }
function toastBand(){ const r=lastToast; if(!r) return "";
  return `<div class="resultbar"><button class="x" data-act="toast-close" aria-label="닫기">×</button><p><span class="muted">방금</span> <b>${esc(r.title)}</b> ${esc(r.text)}</p>${Object.keys(r.delta||{}).length?`<div class="chips">${chipList(r.delta)}</div>`:""}${r.shame?`<p class="shame-note">업무 수첩에만 남는다: ${esc(r.shame)}</p>`:""}</div>`; }
function desk(s){
  const acts=actionsOf(s), planning=s.phase==="alloc", plan=planning?draft:(s.planView||[]), left=s.slots-draft.length, notes=slotNotes(s), rot=["-1.5deg","1deg","-.5deg","1.6deg","-1deg"];
  const pv=planning&&!s.onLeave&&left<=0?previewAlloc(s,counts(draft)):null;
  let warn="";
  if(pv&&pv.burnEnd>=100) warn="이대로면 올해 끝에 번아웃이 100에 닿아 쓰러진다. 휴식을 넣자.";
  else if(s.stats.burn>=85) warn="번아웃 "+s.stats.burn+". 100이 되면 쓰러진다. 휴식이 필요하다.";
  else if(s.stats.burn>=70) warn="번아웃 "+s.stats.burn+". 행동력이 한 칸 줄었다.";
  else if(s.stats.money<0) warn="현금이 바닥났다. 빚이 계속되면 파산한다.";
  else if(working(s)&&s.track!=="free"&&draft.length===s.slots&&draft.indexOf("work")<0) warn="업무 칸이 없으면 평가가 D로 떨어진다.";
  else if(s.stats.life<40&&working(s)) warn="일상 "+s.stats.life+". 일상이 40 아래면 해가 바뀌어도 피로가 거의 풀리지 않는다.";
  else if(notes.length) warn="칸이 줄었다: "+notes.join(", ");
  const canResign=(s.track==="career"||s.track==="free"||s.track==="founder")&&s.stage<6&&!s.onLeave;
  return `<section class="desk">
    <div class="desk-head"><h2 class="disp">${yearOf(s)}년, ${s.age}세의 한 해</h2><span class="aside">${s.onLeave?"쉬는 해":"행동력 "+s.slots+"칸"} <button class="bucket-chip" data-act="rec" data-tab="status">버킷리스트 ${Object.keys(s.goalsDone||{}).length}/3</button></span></div>
    ${planning?toastBand():""}
    ${planning?upcomingHtml(s,1).replace('class="upnext"','class="upnext desk-up"'):""}
    ${warn?`<p class="warnline">${esc(warn)}</p>`:""}
    ${planning&&s.planNote&&!s.onLeave?`<p class="small plannote">${esc(s.planNote)}</p>`:""}
    ${s.onLeave?`<p class="small">올해는 쉰다. 아무것도 하지 않아도 된다.</p>`:`
    <div class="slots">${Array.from({length:planning?s.slots:Math.max(plan.length,1)},(_,i)=>{ const k=planning?plan[i]:(plan[i]||[])[0]; if(!k) return `<div class="slot"><em>${QUARTER.at(Math.min(i,4))}</em>비어 있음</div>`;
      const label=planning?((acts.find(x=>x[0]===k)||[])[1]||k):plan[i][1];
      if(!planning) return `<div class="slot filled" style="--pc:${PCOLOR[ACT_COLOR[k]]};--r:${rot.at(i)}"><em>${QUARTER.at(Math.min(i,4))}</em>${esc(label)}</div>`;
      return `<button class="slot filled ${i===draft.length-1&&draft.justAdded?"new":""}" data-act="unslot" data-i="${i}" style="--pc:${PCOLOR[ACT_COLOR[k]]};--r:${rot.at(i)}" aria-label="${QUARTER.at(Math.min(i,4))} ${esc(label)} 빼기"><em>${QUARTER.at(Math.min(i,4))}</em>${esc(label)}</button>`; }).join("")}</div>
    <div class="handrow">${acts.map(a=>{ const n=draft.filter(x=>x===a[0]).length, cant=left<=0||(a[0]==="invest"&&s.stats.money<500);
      let sub=SHORT[actKey(s,a[0])]||a[2]; if(a[0]==="craft") sub="진행 "+Math.min(s.prog,4)+"/4"; if(a[0]==="invest"&&s.stats.money<500) sub="현금 500만 필요";
      return `<button class="pc" data-act="add" data-k="${a[0]}" style="--pc:${PCOLOR[ACT_COLOR[a[0]]]}" title="${esc(a[2])}" ${cant?"disabled":""}>${n?`<span class="cnt">${n}</span>`:""}<b>${a[1]}</b><small>${esc(sub)}</small></button>`; }).join("")}</div>`}
    ${pv?`<p class="preview"><span class="muted">이 계획이면</span>${pv.grade?` <b>평가 ${pv.grade} 예상</b>`:""} <span class="${pv.burn>0?"dn":"up"}">번아웃 ${signed(pv.burn)}</span> <span class="${pv.life<0?"dn":"up"}">일상 ${signed(pv.life)}</span>${pv.money?` <span class="${pv.money<0?"dn":"up"}">현금 ${pv.money<0?"-":"+"}${wonShort(Math.abs(pv.money))}</span>`:""}${pv.notes.length?` <span class="muted">(${esc(pv.notes.join(", "))})</span>`:""}</p>`:""}
    <div class="desk-btns">
      <button class="gbtn ${left<=0||s.onLeave?"ready":""}" data-act="commit" ${left>0&&!s.onLeave?"disabled":""}>${s.onLeave?"한 해 쉬기":left>0?left+"칸 더 채우기":"한 해 보내기"}</button>
      <button class="gbtn alt" data-act="ff" ${left>0||s.onLeave?"disabled":""}>사건까지 넘기기</button>
    </div>
    <div class="desk-foot">${planning&&draft.length&&!s.onLeave?`<button class="link" data-act="clear">계획 비우기</button>`:"<span></span>"}${canResign?`<button class="resign-s" data-act="resign">${s.track==="founder"?"회사를 접을까":s.track==="free"?"다른 길 찾기":"사직서"}</button>`:""}</div>
  </section>`;
}
function vGame(){
  return `<div class="game">${hud(S)}<div class="scene">${sceneFor(S)}${eraNow(S)?`<div class="ticker"><span><b>${S.news?"속보":"요즘"}</b>${esc(S.news||eraNow(S).text)}</span></div>`:""}${toastHtml()}${tipHtml()}</div>${statbar(S)}${desk(S)}${rail(S)}</div>`;
}
function vEventModal(){
  const card=cardById(S.current), cat=catOf(card);
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(fill(S,card.title))}"><div class="mcard has-art" style="--pc:${cat[1]}"><span class="cat">${esc(cat[0])}</span><span class="age-tag">${card.when&&card.when.year?yearOf(S)+"년, ":""}${S.age}세</span>${catArt(card,cat,yearOf(S))}
    ${lastToast?`<div class="justnow"><span class="muted">방금</span> <b>${esc(lastToast.title)}</b> ${esc(lastToast.text)}${Object.keys(lastToast.delta||{}).length?` <span class="chips inline">${chipList(lastToast.delta)}</span>`:""}</div>`:""}
    <h2 class="disp">${esc(fill(S,card.title))}</h2><p class="body">${esc(fill(S,card.text))}</p>
    <p class="mstats">${["skill","rep","net","fame","life","burn"].map(k=>`<span>${STAT[k]} <b>${S.stats[k]}</b></span>`).join("")}<span>현금 <b>${won(S.stats.money)}</b></span></p>
    ${visibleChoices(S,card).map((x,n)=>{ const ch=x.c, lk=locked(S,ch), p=choiceChance(S,ch);
      let hint=ch.hint?fill(S,ch.hint):""; if(ch.check) hint=(hint?hint+", ":"")+STAT[ch.check.stat]+" "+ch.check.min+" 이상이면 성공 (지금 "+S.stats[ch.check.stat]+")";
      if(lk) hint="조건 부족: "+Object.keys(ch.require).map(k=>STAT[k]+" "+ch.require[k]).join(", ");
      let luck=""; if(p!=null) luck=`<span class="chip luck">${has(S,"sense")||ch.chanceFn?"성공률 "+p+"%":"운에 달렸다"}</span>`;
      const pv=chipList(previewFx(ch)), chips=pv||luck?`<div class="chips">${pv}${luck}</div>`:"";
      return `<button class="choice ${lk?"locked":""}" data-act="choose" data-i="${x.i}" style="animation-delay:${120+n*70}ms" ${lk?"disabled":""}><span class="key">${n+1}</span><b>${esc(fill(S,ch.text))}</b>${hint?`<small>${esc(hint)}</small>`:""}${chips}</button>`; }).join("")}
  </div></div>`;
}
function vResultModal(){
  const r=S.result, fresh=r!==lastResult, roll=r.roll;
  let meter="";
  if(roll&&roll.p!=null) meter=`<div class="roll ${fresh?"play":""} ${roll.ok?"ok":"no"}"><div class="roll-bar"><i class="zone" style="width:${roll.p}%"></i><u class="needle" style="--to:${Math.min(99,roll.r)}%"></u></div><p class="small"><span class="muted">성공 구간 ${roll.p}%</span> <b class="verdict">${roll.ok?"성공":"실패"}</b></p></div>`;
  else if(roll&&roll.check) meter=`<div class="roll ${roll.ok?"ok":"no"}"><p class="small"><span class="muted">${STAT[roll.stat]} ${roll.min} 필요, 지금 ${roll.have}</span> <b class="verdict">${roll.ok?"성공":"실패"}</b></p></div>`;
  const late=fresh&&roll&&roll.p!=null?"late":"";
  if(fresh&&!reduce){ if(roll&&roll.p!=null){ for(let i=0;i<7;i++) SFX.tick(i*.11); later(()=>{ roll.ok?SFX.good():SFX.bad(); if(!roll.ok) shake(); },900); } else if(roll&&roll.check){ roll.ok?SFX.good():SFX.bad(); } else if(r.shame) SFX.bad(); else if(r.delta.money>0) SFX.coin(); else SFX.tap(); }
  const tone=roll?(roll.ok?"var(--good)":"var(--stamp)"):"var(--ink)";
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(r.title)}"><div class="mcard" style="--pc:${tone}"><span class="age-tag">${S.age}세</span><p class="small muted">${esc(r.pick||"")}</p><h2 class="disp">${esc(r.title)}</h2>
    ${meter}
    <p class="result-text ${late}">${esc(r.text)}</p>
    ${Object.keys(r.delta).length?`<div class="chips float ${late}">${chipList(r.delta)}</div>`:""}
    ${r.shame?`<p class="shame-note ${late}">이력서에는 안 쓴다. 업무 수첩에만 남는다: ${esc(r.shame)}</p>`:""}
    <button class="gbtn dark ${late}" data-act="next-event">다음</button></div></div>`;
}
function vOverlay(f){
  let o=ORDER[f.kind]||["알림","확인","확인"]; if(f.kind==="mp") o=[opusOf(S)+" 완성",o[1],o[2]];
  const peakPath=f.kind==="peak"?(S.peaks.find(p=>p.name===f.title)||{}).path:null;
  let body="";
  const own=S.track==="founder";
  if(f.kind==="promo"||f.kind==="found"||(f.kind==="peak"&&(peakPath==="org"||peakPath==="biz"))) body=`<p class="sub">${f.kind==="promo"?(own?`${esc(S.company)}이(가) 한 단계 컸다. 새 명함을 찍었다.`:`${esc(S.name)} 님을 <b>${esc(cardTitleOf(S))}</b>(으)로 발령함. ${esc(f.sub)}, ${S.age}세.`):esc(f.sub)}</p><div class="card-stage">${cardHtml(cardInfoOf(S),{w:Math.min(330,window.innerWidth-80),cls:"reveal shine"})}</div>`;
  else body=`<p class="sub">${esc(f.sub)}</p>`;
  return `<div class="modal center" role="dialog" aria-modal="true" aria-label="${esc(o[0])}"><div class="order ${f.kind}" style="--pc:${peakPath?PCOLOR[peakPath]:f.kind==="goal"?PCOLOR.life:"var(--ink)"}">
    <div class="bigstamp">${esc(f.kind==="promo"&&S.track==="founder"?"성장":o[1])}</div>${f.kind==="promo"?"":`<span class="kind">${esc(o[0])}</span>`}
    <h2 class="disp">${esc(f.kind==="promo"?(own?"회사가 컸다":"인사발령"):f.kind==="found"?"사업자등록":f.title)}</h2>${body}
    ${f.kind==="peak"&&!(peakPath==="org"||peakPath==="biz")?`<div class="mini-city-wrap">${city({age:S.age,ranks:ranksNow(S),peaks:S.peakAt,mini:true}).replace('class="city"','class="mini-city"')}</div>`:""}
    <button class="gbtn" data-act="dismiss">${esc(o[2])}</button></div></div>`;
}

function vConfirmNoWork(){
  return `<div class="modal center" role="dialog" aria-modal="true" aria-label="업무 없이 보낼까"><div class="order" style="--pc:var(--stamp)"><span class="kind">확인</span><h2 class="disp">업무 칸이 없다</h2><p class="sub">업무 없이 한 해를 보내면 평가가 D로 떨어진다. 2년 연속 D면 권고사직이다.</p>
    <div class="btn-row"><button class="gbtn alt" data-act="confirm-close">계획 고치기</button><button class="gbtn" data-act="commit-anyway">이대로 보낸다</button></div><p class="small muted">이번 인생에서는 다시 묻지 않는다.</p></div></div>`;
}
/* ---------- 명함 크게 보기, 첫 안내 ---------- */
function vCardModal(){
  const c=cardOpen==="cur"?cardInfoOf(S):Object.assign({name:S.name},S.cards[cardOpen]||{});
  const w=Math.min(400,window.innerWidth-48);
  return `<div class="modal center" role="dialog" aria-modal="true" aria-label="명함"><div class="order" style="width:min(460px,100%)"><span class="kind">${c.age}세의 명함</span>
    <div class="card-stage"><button data-act="card-flip" aria-label="명함 뒤집기">${cardHtml(c,{w:w,back:true,flipped:cardFlipped})}</button><p class="card-cap">명함을 누르면 뒤집힌다.</p></div>
    <div class="btn-row"><button class="gbtn alt" data-act="card-flip">뒤집기</button><button class="gbtn" data-act="card-close">닫기</button></div></div></div>`;
}
const GUIDE=[
  ["한 해는 네 칸","책상 위 행동 카드를 눌러 1분기부터 4분기까지 채운다. 업무만 하면 쓰러지고, 쉬기만 하면 뒤처진다. 행동 카드를 누르면 칸에 붙고, 붙은 칸을 누르면 빠진다."],
  ["꼭대기는 여섯 곳","도시의 건물 여섯 동이 회사, 장인, 창업, 명성, 자산, 삶의 길이다. 층이 오를 때마다 불이 켜지고, 5층에 닿으면 깃발이 선다. 건물을 누르면 다음 조건이 보인다."],
  ["명함이 이력이다","승진하거나 회사를 옮기면 새 명함이 나온다. 회사마다, 직급마다 디자인이 다르다. 모은 명함은 수집첩의 명함 도감에 남는다."],
  ["이번 인생의 첫 목표",""]
];
function firstGoalText(s){
  const j=job(s).name;
  if(s.track==="school"&&(s.edu==="gen"||s.edu==="voc")) return j+"에 들어가는 것이 첫 목표다. "+(s.gradAge-1)+"세 끝에 졸업 진로를 고른다. 4년제는 능력 22가 있어야 하니 공부 칸을 먼저 채우자. 책상 위 '다가오는 결정'에 조건이 늘 보인다.";
  if(s.track==="school") return j+"에 들어가는 것이 첫 목표다. "+(s.gradAge-1)+"세 끝에 지원서를 쓴다. 능력과 인맥을 올려 두면 이름 있는 곳에 붙을 확률이 오른다.";
  return j+"에 들어가는 것이 첫 목표다. 올해 끝에 지원서를 쓴다. 취업 준비로 능력을, 인맥으로 합격률을 올리자.";
}
function vGuide(){
  const g=GUIDE[guideStep].slice(), last=guideStep===GUIDE.length-1; if(guideStep===3) g[1]=firstGoalText(S)+" 같은 계획을 이어 가려면 '사건까지 넘기기'를 누른다. 사건이 없는 해는 그 계획대로 저절로 지나간다.";
  return `<div class="modal center" role="dialog" aria-modal="true" aria-label="안내"><div class="order" style="--pc:var(--hl)"><span class="kind">처음 하는 인생 ${guideStep+1}/${GUIDE.length}</span><h2 class="disp">${g[0]}</h2><p class="sub">${g[1]}</p>
    ${guideStep===2?`<div class="guide-art">${cardHtml(cardInfoOf(S),{w:260})}</div>`:""}
    <div class="guide-dots">${GUIDE.map((_,i)=>`<i class="${i===guideStep?"on":""}"></i>`).join("")}</div>
    <div class="btn-row"><button class="gbtn alt" data-act="guide-skip">건너뛰기</button><button class="gbtn" data-act="guide-next">${last?"시작한다":"다음"}</button></div></div></div>`;
}

/* ---------- 기록 패널 ---------- */
function vLogBody(){
  const by={}; for(const l of S.log){ (by[l.age]=by[l.age]||[]).push(l); }
  const ages=Object.keys(by).map(Number).sort((a,b)=>b-a);
  return `<div class="notebook">${ages.length?ages.map(a=>`<div id="log-${a}"><p class="nb-year">${a}세</p>${by[a].map(l=>`<p class="nb-line ${l.shame?"shame":""}">${esc(l.text)}</p>`).join("")}</div>`).join(""):"<p class=\"nb-line\">아직 적힌 것이 없다.</p>"}</div>`;
}
function vRec(){
  const tabs=[["status","내 인생"],["resume","이력서"],["log","업무 수첩"],["cards","명함첩"]];
  let body="";
  if(recTab==="status") body=`<div class="sheet"><div class="sheet-head"><h2 class="disp">지금까지의 인생</h2><span class="aside">${S.age}세</span></div>${storyHtml(makeRecord(S))}</div><div class="sheet"><div class="sheet-head"><h2 class="disp">여섯 갈래</h2><span class="aside">정점 ${S.peaks.length}개</span></div>
      <table class="formtbl">${Object.keys(PATHS).map(p=>{ const r=Math.max(ranksNow(S)[p],0); return `<tr><th style="border-left:4px solid ${PCOLOR[p]}">${PATHS[p]}</th><td><b>${r}층</b> ${r?esc(rankName(S,p,r)):""}<div class="small muted">다음: ${esc(nextReq(S,p))}</div></td></tr>`; }).join("")}</table></div>
    ${goalsBlock(S)}${tags(S)}
    <div class="btn-row"><button class="gbtn alt" data-act="to-title">처음 화면으로</button><button class="gbtn alt" data-act="mute">${M.mute?"소리 켜기":"소리 끄기"}</button></div>
    <p class="small muted">진행은 자동으로 저장된다.</p>`;
  else if(recTab==="resume") body=`<div class="sheet"><div class="sheet-head"><h2 class="disp">이력서</h2></div><p class="small muted">공식 이력만 적는다. 빈 칸의 사연은 업무 수첩에 있다.</p><table class="formtbl">${resumeRows(S)}</table></div>`;
  else if(recTab==="log") body=vLogBody();
  else body=`<p class="small muted">이번 인생에서 받은 명함 ${S.cards.length}장. 누르면 크게 보고 뒤집을 수 있다.</p><div class="card-grid">${S.cards.map((c,i)=>`<div class="card-cell"><button data-act="card" data-i="${i}" aria-label="${c.age}세 명함 크게 보기">${cardHtml(Object.assign({name:S.name},c),{w:170})}</button><span>${c.age}세, ${esc(c.title)}</span></div>`).join("")}</div>`;
  return `<div class="panel-back" data-act="close-rec"></div><div class="panel" role="dialog" aria-modal="true" aria-label="기록"><div class="panel-head"><h2 class="disp">${esc(S.name)}의 기록</h2><button class="hbtn" data-act="close-rec">닫기</button></div>
    <div class="tabs" role="tablist">${tabs.map(t=>`<button class="tab" role="tab" aria-selected="${recTab===t[0]}" data-act="rec" data-tab="${t[0]}">${t[1]}</button>`).join("")}</div>
    <div class="panel-body">${body}</div></div>`;
}
function vCollection(){
  const jobs=Object.keys(JOBS), paths=Object.keys(PATHS), got=Object.keys(M.stamps).length;
  const bar=(label,n,tot)=>`<div class="meter"><span>${label}</span><span class="num">${n}/${tot}</span><i><b style="width:${Math.round(n/tot*100)}%"></b></i></div>`;
  const hist=store.get("careerhigh.history")||[];
  return `<div class="panel-back" data-act="close-col"></div><div class="panel" role="dialog" aria-modal="true" aria-label="수집첩"><div class="panel-head"><h2 class="disp">수집첩</h2><button class="hbtn" data-act="close-col">닫기</button></div><div class="panel-body">
    <div class="sheet"><div class="sheet-head"><h2 class="disp">정점 도장판</h2><span class="aside">${M.runs}번의 인생</span></div>
    <div class="stampgrid" role="img" aria-label="정점 도장 ${got}개, 전체 ${jobs.length*paths.length}개"><span></span>${paths.map(p=>`<span class="sg-h">${PATHS[p]}</span>`).join("")}
      ${jobs.map(jb=>`<span class="sg-j">${JOBS[jb].name.split("·")[0].split(" ")[0]}</span>`+paths.map(p=>{ const a=M.stamps[jb+"|"+p]; return `<span class="sg-c ${a?"on":""}" style="--pc:${PCOLOR[p]}" title="${JOBS[jb].name}, ${PATHS[p]}${a?", "+a+"세에 달성":""}">${a?`정점<small>${a}세</small>`:""}</span>`; }).join("")).join("")}</div>
    ${bar("정점 도장",got,jobs.length*paths.length)}${bar("엔딩",Object.keys(M.endings).length,ENDINGS.length)}${bar("별명",Object.keys(M.nicks).length,NICKS.length)}${bar("사건 카드",Math.min(CARD_TOTAL,Object.keys(M.cards).length),CARD_TOTAL)}${bar("출신",Object.keys(M.origins).length,ORIGINS.length)}${bar("버킷리스트",Object.keys(M.goals).length,GOALS.length)}
    <p class="small"><span class="hl">${esc(nextHint())}</span></p></div>
    <div class="sheet"><div class="sheet-head"><h2 class="disp">명함 도감</h2><span class="aside">${dexCount(M.bcards)}/${CARD_DESIGNS}</span></div>
      <p class="small muted">회사마다, 직급마다 명함이 다르다. 칸 하나가 직급 하나이고, 같은 칸이라도 시대마다 인쇄 양식이 달라서, 다섯 시대를 다 모으면 칸이 꽉 찬다.</p>
      <div class="dex-sum"><span><b>${dexCount(M.bcards)}</b>/${CARD_DESIGNS}<small>명함</small></span><span><b>${eraCount(M.bcards)}</b>/${CARD_DESIGNS*5}<small>시대 양식</small></span><span><b>${RARE.filter(r=>M.bcards["rare|"+r[0]]).length}</b>/${RARE.length}<small>드문 변형</small></span></div>
      <div class="rare-row">${RARE.map(r=>`<span class="rare ${M.bcards["rare|"+r[0]]?"on":""}" title="${esc(r[2])}">${esc(r[1])}</span>`).join("")}</div>
      <div class="dex">${cardGroups().map((g,gi,arr)=>{ const head=(gi===0||(arr[gi-1].job!==g.job)||g.own&&!arr[gi-1].own||g.free||g.misc)&&!(g.own&&arr[gi-1].own)?`<p class="dex-h">${g.own?"내 회사":g.free?"회사 밖":g.misc?"그 밖":JOBS[g.job].name}</p>`:""; const col=g.brand?g.brand.c:"var(--ink)";
        return head+`<div class="dex-row" style="--pc:${col}">${g.brand?markSvg(g.brand.mark,col,"#fff"):markSvg("mono",col,"#fff",g.label.charAt(0))}<span>${esc(g.label)}</span><span class="dex-dots">${g.keys.map(k=>`<i class="${M.bcards[k]?"on":""}" style="--e:${eraOf(M.bcards,k)}"></i>`).join("")}</span></div>`; }).join("")}${(()=>{ const gd=ghostDex(M.bcards), ks=Object.keys(gd); return ks.length?`<p class="dex-h">지난 인생의 회사</p>`+ks.map(co=>{ const col=OWN_COLORS[hashStr(co)%OWN_COLORS.length]; return `<div class="dex-row" style="--pc:${col}">${markSvg(["square","ring","star","arcs","sprout"][hashStr(co)%5],col,"#fff")}<span>${esc(co)}</span><span class="dex-dots">${[1,2,3,4,5,6].map(n=>`<i class="${gd[co][n]?"on":""}"></i>`).join("")}</span></div>`; }).join(""):""; })()}</div></div>
    ${hist.length?`<div class="sheet"><div class="sheet-head"><h2 class="disp">지난 인생들</h2><span class="aside">${hist.length}명</span></div><p class="small muted">누르면 그 인생의 명함과 요약이 나온다.</p>${residentsBlock(hist,140)}</div>`:""}
  </div></div>`;
}

/* ---------- 타이틀, 통지서, 엔딩 ---------- */
function vTitle(){
  const run=store.get("careerhigh.run");
  const demo={org:3,craft:5,biz:2,fame:4,wealth:1,life:5};
  return `<div class="title"><div class="scene">${city({age:23,vb:"0 -170 600 442",ranks:demo,peaks:{craft:1,life:1},label:"여섯 동의 건물이 선 아침의 도시"})}
      <div class="logo"><h1>커리어<br>하이</h1><p>열일곱에 시작해 예순다섯에 끝나는, 한 사람의 하루</p>${(()=>{ const hs=getHist().filter(r=>r.card).slice(0,3); return hs.length?`<button class="title-fan" data-act="town" aria-label="지난 인생 ${getHist().length}명의 명함. 커리어 타운으로">${hs.map((r,i)=>`<span class="fan-card" style="--i:${i-(hs.length-1)/2}">${cardHtml(r.card,{w:118})}</span>`).join("")}</button>`:""; })()}</div></div>
    <div class="title-panel"><div class="inner">
      <p class="lede">출신도 학력도 고를 수 없다. 꼭대기는 여섯 곳이고, 한 해에 쓸 수 있는 칸은 네 개뿐이다.</p>
      <label class="small muted" for="nm" style="text-align:center">이름 (비워 두면 지어 준다)</label>
      <input type="text" id="nm" maxlength="8" value="${esc(nameDraft)}" autocomplete="off">
      <button class="gbtn" data-act="new">새 인생 시작</button>
      ${run&&(run.v===3||run.v===4)&&!run.final?`<button class="gbtn alt" data-act="resume-run">이어하기: ${esc(run.name)}, ${run.age}세</button>`:""}
      <button class="gbtn alt" data-act="town">커리어 타운 (${getHist().length}명이 산다)</button>
      <div class="title-row"><button class="gbtn alt" data-act="col">수집첩</button><button class="gbtn alt" data-act="mute">${M.mute?"소리 켜기":"소리 끄기"}</button></div>
      <p class="small muted" style="text-align:center">다시 뽑기권 ${M.rerolls}장</p>
    </div></div></div>`;
}
function vDraw(){
  const o=origin(S), tg=TRAITS_GOOD.find(t=>t.id===S.traits[0]), tb=TRAITS_BAD.find(t=>t.id===S.traits[1]);
  const eduTxt=S.track==="rest"?EDU[S.edu]+" 졸업, 바로 일을 구한다":EDU[S.edu]+(S.edu==="univ"||S.edu==="college"?" 입학":" 재학");
  const fx0=fixedEra(yearOf(S));
  const rows=[["나이와 해",`${yearOf(S)}년, ${S.age}세${fx0?`<div class="small muted">${fx0.name}의 한가운데</div>`:""}`],["출신",`${o.name}<div class="small muted">${o.desc}</div>`],["학력",eduTxt],
    ["타고난 것",`${tg.name}<div class="small muted">${tg.desc}</div>`],["모자란 것",`${tb.name}<div class="small muted">${tb.desc}</div>`],["하고 싶은 일",job(S).name],
    ["버킷리스트",S.goals.map(id=>esc(GOALS.find(g=>g.id===id).t)).join("<br>")]];
  const last=drawStep>=rows.length-1;
  return `<div class="title"><div class="scene">${city({age:S.age,vb:"0 -170 600 442",ranks:{},peaks:{},label:"아직 아무것도 세우지 않은 새벽의 도시"})}</div><div class="title-panel"></div></div>
    <div class="modal center"><div class="mcard notice" style="--pc:var(--stamp)"><span class="age-tag">${drawStep+1} / ${rows.length}</span>
    <h2 class="disp">통지서</h2>
    <p><b>${esc(S.name)}</b> 님의 출발점을 알려 드립니다. 이의 신청은 받지 않습니다.</p>
    <table class="formtbl">${rows.slice(0,drawStep+1).map((r,i)=>`<tr class="${i===drawStep?"reveal":""}"><th>${r[0]}</th><td>${r[1]}</td></tr>`).join("")}</table>
    ${last?`<button class="gbtn" data-act="draw-done">이 인생으로 시작한다</button>${M.rerolls>0?`<button class="gbtn alt" data-act="reroll">이의 신청: 다시 뽑기 (${M.rerolls}장)</button>`:""}`:`<button class="gbtn dark" data-act="draw-next">다음 장 넘기기</button>`}
    </div></div>`;
}
function vEnding(){
  const f=S.final, finds=f.finds||[];
  const kicker=f.hidden?"숨은 엔딩":f.kind==="burnout"||f.kind==="bankrupt"?"중도 엔딩":f.kind==="self"?S.age+"세, 스스로 내려온 날":S.age+"세, 마지막 출근";
  return `<div class="ending"><div class="scene">${city({age:S.age,vb:"0 -170 600 442",ranks:f.ranks,peaks:S.peakAt,label:"이 인생이 세운 도시"})}
      <div class="end-title"><p class="kicker">${esc(kicker)}</p><h1>${esc(f.hidden||f.title)}</h1>${f.hidden?`<p class="sub">${esc(f.title)}</p>`:""}</div></div>
    <div class="end-body">
      <p class="hand" style="text-align:center">${esc(f.scene)}</p>
      <p class="verdict-line"><span class="hl"><b>${esc(f.verdict)}</b></span></p>
      ${f.cause?`<p class="cause-line">${esc(f.cause)}</p>`:""}
      <div class="card-stage"><button data-act="card" data-i="cur" aria-label="마지막 명함 크게 보기">${cardHtml(cardInfoOf(S),{w:Math.min(360,window.innerWidth-40),cls:"reveal shine"})}</button><p class="card-cap">마지막 명함. 받은 명함은 모두 ${S.cards.length}장.</p></div>
      <section class="sheet finds"><div class="sheet-head"><h2 class="disp">이번 인생이 남긴 것</h2><span class="aside">수집첩에 ${finds.length}개 추가</span></div>
        ${finds.length?`<ul class="lines">${finds.map((x,i)=>`<li class="find" style="animation-delay:${300+i*140}ms">${esc(x)}</li>`).join("")}</ul>`:`<p class="small muted">새로 모은 것은 없다. 다른 길을 걸어 보면 생긴다.</p>`}
        <p class="small"><span class="hl">${esc(nextHint())}</span></p>
        <div class="btn-row"><button class="gbtn alt" data-act="copy">${copied?esc(copied):"결과 복사하기"}</button><button class="gbtn" data-act="again">바로 다음 인생</button></div>
        <button class="gbtn alt" data-act="town">커리어 타운에서 이 사람 만나기</button>
      </section>
      ${goalsBlock(S,false)}
      <section class="sheet"><div class="sheet-head"><h2 class="disp">한 사람의 그래프</h2></div>${lifeChart(S)}</section>
      <section class="sheet"><div class="sheet-head"><h2 class="disp">최종 이력서</h2></div>
        <table class="formtbl">${Object.keys(PATHS).map(p=>`<tr><th style="border-left:4px solid ${PCOLOR[p]}">${PATHS[p]}</th><td>${f.ranks[p]}층 ${f.ranks[p]?esc(rankName(S,p,f.ranks[p])):"<span class=\"muted\">걷지 않은 길</span>"}${S.peakAt[p]?` <b class="bad">정점 (${S.peakAt[p]}세)</b>`:""}</td></tr>`).join("")}
        <tr><th>이직</th><td>${S.counters.jobChanges}회</td></tr><tr><th>순자산</th><td>${won(networth(S))}</td></tr></table>
        <table class="formtbl">${resumeRows(S)}</table></section>
      <section class="notebook"><p class="nb-year">이력서에 못 쓴 이야기</p>${f.shames.length?f.shames.map(l=>`<p class="nb-line shame">${l.age}세, ${esc(l.text)}</p>`).join(""):`<p class="nb-line">놀랍게도 없다. 수첩이 깨끗하다.</p>`}</section>
      <div class="btn-row"><button class="gbtn alt" data-act="rec" data-tab="log">업무 수첩 전체 보기</button><button class="gbtn alt" data-act="to-title">처음 화면으로</button></div>
    </div></div>`;
}

/* ---------- 지난 인생: 기록, 요약, 커리어 타운 ---------- */
let lifeOpen=null, lifeFlip=false, town=null;
const JOB_SHORT={dev:"개발",cook:"요리",office:"회사 일",game:"게임 만드는 일",mech:"공장 일",bank:"은행 일",doctor:"병원 일",tutor:"가르치는 일",sales:"영업",build:"현장 일"};
const JOB_LOOK={dev:["#3b4a6b","laptop"],game:["#5b3fa0","headset"],cook:["#f1f1ec","toque"],office:["#2b3a55","tie"],mech:["#2f6f9e","cap"],bank:["#1f2d3d","tie"],doctor:["#ffffff","cross"],tutor:["#8a5a3c","book"],sales:["#b5452f","bag"],build:["#d9822b","helmet"]};
function josa(w,a,b){ w=String(w); const c=w.charCodeAt(w.length-1); if(c<0xAC00||c>0xD7A3) return w+b; return w+((c-0xAC00)%28?a:b); }
function getHist(){ return store.get("careerhigh.history")||[]; }
function makeRecord(s){
  const f=s.final||{ranks:s.best,peaks:s.peaks,shames:[],title:"아직 사는 중",verdict:"",kind:"live"}, j=job(s);
  let bp="org",bv=-1; for(const p in s.best) if(s.best[p]>bv){ bv=s.best[p]; bp=p; }
  let card=cardInfoOf(s);
  if(s.track==="rest"||s.track==="school"){ for(let i=s.cards.length-1;i>=0;i--){ const c=s.cards[i]; if(c.track==="career"||c.track==="founder"||c.track==="free"){ card=Object.assign({name:s.name},c); break; } } }
  const born=s.born==null?null:s.born, y0=born==null?null:born+(s.resume[0]?s.resume[0].age:s.age);
  const jobs=[]; for(const c of s.cards){ if(c.track!=="career"||!c.co) continue; const y=born==null?null:born+c.age, l=jobs[jobs.length-1]; if(l&&l.co===c.co) continue; if(l&&l.to==null) l.to=y; jobs.push({co:c.co,job:c.job,from:y,to:null,ghost:!!c.ghost}); }
  if(jobs.length&&s.track!=="career"){ const l=jobs[jobs.length-1]; if(l.to==null) l.to=born==null?null:born+s.age; }
  let firm=null; if(s.firm){ firm=Object.assign({},s.firm); firm.top=Math.max(firm.top||1,s.best.biz||0); if(s.track==="founder") firm.status="open"; else if(firm.status==="open") firm.status="left"; }
  return {v:3,born:born,y0:y0,y1:born==null?null:born+s.age,jobs:jobs,firm:firm,home:s.track==="founder"&&firm?"company":"house",name:s.name,age:s.age,jobId:s.job,job:j.name,origin:s.origin,edu:s.edu,nick:s.nickname,path:bp,end:f.hidden||f.title,kind:f.kind,
    title:s.bestTitle||titleOf(s),verdict:f.verdict,ranks:Object.assign({},f.ranks),peaks:(f.peaks||[]).map(p=>({path:p.path,age:p.age,name:p.name})),
    marks:s.marks.slice(0,40),card:card,cards:s.cards.slice(-12),goals:s.goals.map(id=>({t:GOALS.find(g=>g.id===id).t,done:s.goalsDone[id]})),
    nw:networth(s),shames:(f.shames||[]).map(l=>({age:l.age,text:l.text})),shameN:s.log.filter(l=>l.shame).length,jobChanges:s.counters.jobChanges,
    founder:!!s.flags.founder,married:!!s.flags.married,divorced:!!s.flags.divorced,kids:s.kids.length,house:!!s.flags.house,pet:!!s.flags.pet,
    perks:s.perks.map(p=>PERKS.find(x=>x.id===p).name)};
}
function lifeStory(r){
  if(!(r.v>=2)) return [];
  const Y=a=>r.born!=null?(r.born+a)+"년, ":"";
  const o=ORIGINS.find(x=>x.id===r.origin), out=[], first=r.marks.find(m=>m.k==="job"||m.k==="biz");
  out.push(`${o?o.name+" 출신. ":""}${josa(EDU[r.edu]||"학교","을","를")} 나왔다.${r.y0!=null?` ${r.y0}년에 출발했다.`:""}${first?` ${Y(first.age)}${first.age}세에 ${first.t}.`:" 끝내 일자리를 얻지 못했다."}`);
  let s2=`가장 높이 오른 자리는 ${r.title}.`;
  if(first) s2+=r.jobChanges?` 회사는 ${r.jobChanges}번 옮겼다.`:(r.founder?"":" 한 번도 회사를 옮기지 않았다.");
  if(r.firm) s2+=` ${r.firm.from}년에 ${r.firm.name}을(를) 차렸고, `+(r.firm.status==="open"?"끝까지 대표였다.":r.firm.status==="sold"?"회사를 팔았다.":r.firm.status==="closed"?`${r.firm.to}년에 문을 닫았다.`:"대표 자리에서 내려왔다.");
  else if(r.founder) s2+=" 자기 사업을 차려 본 사람이다.";
  out.push(s2);
  const fam=[]; if(r.married) fam.push("결혼했다"); else if(r.divorced) fam.push("결혼했다가 헤어졌다");
  if(r.kids) fam.push(`아이 ${r.kids}명을 키웠다`); if(r.house) fam.push("내 집을 마련했다"); if(r.pet) fam.push("반려동물과 살았다");
  out.push(fam.length?fam.join(", ")+".":"가정은 꾸리지 않았고, 집도 사지 않았다.");
  if(r.peaks.length) out.push(r.peaks.map(p=>`${Y(p.age)}${p.age}세에 ${p.name}의 자리에 올랐다`).join(". ")+".");
  else if(r.verdict) out.push(r.verdict);
  if(r.shameN) out.push(`이력서에 못 쓴 일이 ${r.shameN}건 있다.`);
  if(r.kind!=="live") out.push(`${Y(r.age)}${r.age}세, ${r.end}. 남긴 순자산은 ${won(r.nw)}.`);
  return out;
}
function storyHtml(r){
  const mk={job:"var(--ink)",up:"var(--c-org)",biz:"var(--c-biz)",craft:"var(--c-craft)",peak:"var(--stamp)",life:"var(--c-life)",bad:"var(--muted)"};
  return `${lifeStory(r).map(t=>`<p class="story-p">${esc(t)}</p>`).join("")}
    ${r.marks&&r.marks.length?`<ol class="timeline">${r.marks.map(m=>`<li style="--mc:${mk[m.k]||"var(--ink)"}"><b class="num">${r.born!=null?`<small>${r.born+m.age}</small> `:""}${m.age}세</b><span>${esc(m.t)}</span></li>`).join("")}</ol>`:""}`;
}
function personSvg(r,star){
  const look=JOB_LOOK[r.jobId]||["#4a5568",""], h=hashStr(r.name||"x"), skin=["#f2c9a5","#e8b58a","#f6d7b8"][h%3], hair=["#2a2320","#4a3526","#1d1d24","#6b5a4a","#8f8f97"][(h>>3)%5];
  let acc="";
  switch(look[1]){
    case "toque": acc=`<path d="M12 9c-4-6 5-9 8-5 3-4 12-1 8 5z" fill="#fff" stroke="#c9ccd2"/><rect x="12" y="8" width="16" height="4" fill="#fff" stroke="#c9ccd2"/>`; break;
    case "helmet": acc=`<path d="M10 13a10 10 0 0 1 20 0z" fill="#ffc21a"/><rect x="8" y="12" width="24" height="3" rx="1.5" fill="#e0a800"/>`; break;
    case "cap": acc=`<path d="M11 12a9 9 0 0 1 18 0z" fill="#1f4f78"/><rect x="22" y="10.5" width="11" height="2.6" rx="1.2" fill="#1f4f78"/>`; break;
    case "tie": acc=`<path d="M16 24h8l-4 5z" fill="#fff"/><path d="M20 27l-2.2 3 2.2 9 2.2-9z" fill="#d33a22"/>`; break;
    case "cross": acc=`<path d="M20 29v9M15.500 33.500h9" stroke="#d33a22" stroke-width="2.600"/>`; break;
    case "laptop": acc=`<rect x="23" y="32" width="13" height="9" rx="1.2" fill="#c9d2de" stroke="#8a94a3"/>`; break;
    case "headset": acc=`<path d="M10 15a10 10 0 0 1 20 0" fill="none" stroke="#16181d" stroke-width="2.400"/><rect x="7.500" y="13" width="4.500" height="7" rx="2" fill="#16181d"/>`; break;
    case "book": acc=`<rect x="24" y="30" width="10" height="12" rx="1" fill="#2f66d8"/><path d="M26.500 33.500h5M26.500 36.500h5" stroke="#fff" stroke-width="1.200"/>`; break;
    case "bag": acc=`<path d="M27 36v-3h6v3" fill="none" stroke="#4a3320" stroke-width="1.600"/><rect x="24" y="36" width="12" height="9" rx="1.500" fill="#6b4a2b"/>`; break;
  }
  return `<svg viewBox="0 -9 40 69" aria-hidden="true">${star?`<path d="M20 -8l1.900 3.900 4.300.600-3.100 3 .700 4.300-3.800-2-3.800 2 .700-4.300-3.100-3 4.300-.600z" fill="#ffd21a" stroke="#16213b" stroke-width=".800"/>`:""}
    <rect class="leg l" x="13.500" y="42" width="5.500" height="16" rx="2.500" fill="#232a3a"/><rect class="leg r" x="21" y="42" width="5.500" height="16" rx="2.500" fill="#232a3a"/>
    <rect x="10" y="24" width="20" height="23" rx="7" fill="${look[0]}" stroke="#16213b" stroke-width="1.200"/>
    <circle cx="20" cy="15" r="9" fill="${skin}" stroke="#16213b" stroke-width="1.200"/>
    ${look[1]==="toque"||look[1]==="helmet"||look[1]==="cap"?"":`<path d="M11 14.500a9 9 0 0 1 18 0c-3-3.500-6-4.500-9-4.500s-6 1-9 4.500z" fill="${hair}"/>`}
    <circle cx="18" cy="16.500" r="1.200" fill="#16213b"/><circle cx="24.500" cy="16.500" r="1.200" fill="#16213b"/>${acc}</svg>`.replace(/(\d\.\d)00\b/g,"$1");
}
function residentsBlock(hist,w){
  return `<div class="res-grid">${hist.map((r,i)=>`<button class="res" data-act="life" data-i="${i}" style="--pc:${PCOLOR[r.path]||"var(--ink)"}">
    ${r.card?cardHtml(r.card,{w:w||150}):`<span class="res-old">${esc(r.name)}</span>`}
    <b>${esc(r.name)}</b><span>${esc(r.job)}, ${esc(r.end)}</span></button>`).join("")}</div>`;
}
function vLife(r){
  const w=Math.min(340,window.innerWidth-76);
  const dots=p=>[1,2,3,4,5].map(i=>`<i class="${i<=(r.ranks&&r.ranks[p]||0)?"on":""}"></i>`).join("");
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(r.name)}의 인생"><div class="mcard life" style="--pc:${PCOLOR[r.path]||"var(--ink)"}">
    <span class="age-tag">${r.age}세</span><p class="small muted">${esc(r.job)}${r.nick?`, 별명 ${esc(r.nick)}`:""}</p><h2 class="disp">${esc(r.name)}</h2>
    <p><span class="hl"><b>${esc(r.end)}</b></span></p>
    ${r.card?`<div class="card-stage"><button data-act="life-flip" aria-label="명함 뒤집기">${cardHtml(r.card,{w:w,back:true,flipped:lifeFlip})}</button><p class="card-cap">마지막으로 들고 다닌 명함. 누르면 뒤집힌다.</p></div>`:""}
    ${r.v>=2?`<h3 class="disp life-h">어떻게 살았나</h3>${storyHtml(r)}
    <h3 class="disp life-h">여섯 갈래</h3><div class="rankrows">${Object.keys(PATHS).map(p=>`<div class="rankrow" style="--pc:${PCOLOR[p]}"><span>${PATHS[p]}</span><span class="dots5">${dots(p)}</span><span class="muted">${r.ranks[p]?esc(rankNameRec(r,p)):"걷지 않은 길"}</span></div>`).join("")}</div>
    <h3 class="disp life-h">버킷리스트</h3><div class="goals" style="transform:none">${r.goals.map(g=>`<p class="goal ${g.done!=null?"done":""}"><i></i><span>${esc(g.t)}</span>${g.done!=null?`<em>${g.done}세</em>`:""}</p>`).join("")}</div>
    ${r.shames.length?`<h3 class="disp life-h">이력서에 못 쓴 이야기</h3>${r.shames.map(l=>`<p class="nb-line shame" style="line-height:1.3">${l.age}세, ${esc(l.text)}</p>`).join("")}`:""}
    ${r.cards&&r.cards.length?`<h3 class="disp life-h">거쳐 간 명함 ${r.cards.length}장</h3><div class="card-strip">${r.cards.map(c=>`<div class="card-cell">${cardHtml(Object.assign({name:r.name},c),{w:150})}<span>${c.age}세</span></div>`).join("")}</div>`:""}
    ${r.perks&&r.perks.length?`<div class="tags">${r.perks.map(x=>`<span class="tag perk">${esc(x)}</span>`).join("")}</div>`:""}`
    :`<p class="small muted">예전 판에서 남긴 기록이라 요약이 없다. ${esc(r.title||"")}</p>`}
    <button class="gbtn" data-act="life-close">닫기</button></div></div>`;
}
function rankNameRec(r,p){
  const n=r.ranks[p], J=JOBS[r.jobId]||JOBS.dev;
  if(p==="org") return J.titles[n+1]; if(p==="biz") return J.ftitles[n+1];
  if(n===5&&J.peaks[p]) return J.peaks[p];
  return PATH_RANKS[p][n-1];
}
function talkLines(a,b){
  const c=[["명함 한 장 주시죠.","여기요. 저도 한 장 주세요."],["점심 드셨어요?","아직요. 같이 가시죠."],["요즘 어떻게 지내세요?","그럭저럭요. 덕분에."]];
  if(a.jobId&&a.jobId===b.jobId) c.push([`요즘 ${josa(JOB_SHORT[b.jobId]||"일","은","는")} 어때요?`,"말도 마세요."],["우리 때는 더 힘들었죠?","지금이 더 힘들대요."]);
  else if(a.jobId&&b.jobId) c.push([`${josa(JOB_SHORT[b.jobId],"은","는")} 할 만해요?`,`${josa(JOB_SHORT[a.jobId],"이","가")} 더 낫겠죠, 뭐.`]);
  if(b.peaks&&b.peaks.length) c.push([`${b.peaks[0].name}까지 하셨다면서요?`,"운이 좋았죠."],["꼭대기는 어때요?","바람이 셉니다."]);
  if(a.kind==="burnout") c.push(["쉬엄쉬엄 하세요. 제가 해 봐서 압니다.","명심할게요."]);
  if(a.kind==="bankrupt") c.push(["보증은 절대 서지 마세요.","무슨 일 있으셨어요?"]);
  if(b.nick) c.push([`아, 그 '${b.nick}'!`,"그 얘기는 그만합시다."]);
  if(a.kids&&b.kids) c.push(["애들은 잘 커요?","벌써 저보다 큽니다."]);
  if(b.founder) c.push(["사업은 할 만했어요?","다시 하라면 안 합니다. 아마도."]);
  return c[Math.floor(Math.random()*c.length)];
}
function soloLine(r){
  const c=["오늘은 칼퇴다.","명함이 몇 장 남았더라.","커피나 한잔할까."];
  if(r.title) c.push(`${r.title} 시절이 좋았지.`);
  if(r.nick) c.push(`다들 나를 '${r.nick}'라고 불렀지.`);
  if(r.peaks&&r.peaks.length) c.push("꼭대기는 생각보다 좁더라.");
  if(r.shameN>3) c.push("그 일은 무덤까지 가져간다.");
  return c[Math.floor(Math.random()*c.length)];
}
/* 10판: 타운의 집과 회사. 끝까지 대표였으면 회사, 아니면 자산의 길 단계에 맞는 집 */
function homeOf(r){
  const company=r.home?r.home==="company":!!(r.card&&r.card.tier==="own");
  if(company){ const fl=Math.max(1,Math.min(6,(r.firm&&r.firm.top)||(r.ranks&&r.ranks.biz)||1)); return {kind:"company",fl:fl,name:(r.firm&&r.firm.name)||(r.card&&r.card.org)||"회사",label:((r.firm&&r.firm.name)||(r.card&&r.card.org)||"회사")+", "+fl+"층"}; }
  const w=(r.ranks&&r.ranks.wealth)||0, k=w>=5?"mansion":w===4?"detached":w===3?"house":w===2?"apt":"villa";
  return {kind:k,name:r.name,label:r.name+"의 "+{villa:"빌라",apt:"아파트",house:"주택",detached:"단독주택",mansion:"저택"}[k]};
}
function buildingSvg(h){
  const ink="#16213b", wall="#f3ead9", wall2="#e2d6bf", roof="#b8492f", win="#ffe9a8", W=HEX.wealth, B=HEX.biz;
  const wins=(x0,y0,cols,rows,dx,dy,w,hh,c)=>{ let s=""; for(let r=0;r<rows;r++) for(let k=0;k<cols;k++) s+=`<rect x="${x0+k*dx}" y="${y0+r*dy}" width="${w}" height="${hh}" fill="${c||win}"/>`; return s; };
  let vb, g;
  if(h.kind==="company"){ const fh=11, H=h.fl*fh+10; vb=`0 0 44 ${H}`;
    g=`<rect x="4" y="10" width="36" height="${H-10}" fill="${ink}"/>`+wins(8,13,4,h.fl,7.6,fh,4.4,6,B)+`<rect x="2" y="2" width="40" height="8" rx="1.5" fill="${B}"/><rect x="18" y="${H-7}" width="8" height="7" fill="#dbe4f5"/>`; }
  else if(h.kind==="villa"){ vb="0 0 44 34"; g=`<rect x="4" y="6" width="36" height="28" fill="${wall2}"/><rect x="3" y="4" width="38" height="3" fill="${ink}"/>`+wins(8,10,3,2,11,10,6,6)+`<rect x="19" y="27" width="6" height="7" fill="${ink}"/>`; }
  else if(h.kind==="apt"){ vb="0 0 44 64"; g=`<rect x="9" y="4" width="26" height="60" fill="${wall2}"/><rect x="8" y="2" width="28" height="3" fill="${ink}"/>`+wins(12,8,3,6,7.5,8.6,4.5,5)+`<rect x="19" y="57" width="6" height="7" fill="${ink}"/>`; }
  else if(h.kind==="house"){ vb="0 0 44 40"; g=`<path d="M2 18L22 3L42 18z" fill="${roof}"/><rect x="6" y="17" width="32" height="23" fill="${wall}"/>`+wins(10,22,2,1,18,0,7,7)+`<rect x="19" y="30" width="6" height="10" fill="${ink}"/>`; }
  else if(h.kind==="detached"){ vb="0 0 56 42"; g=`<path d="M2 18L20 4L38 18z" fill="${roof}"/><rect x="5" y="17" width="30" height="25" fill="${wall}"/><rect x="35" y="24" width="18" height="18" fill="${wall2}"/><path d="M33 25h22" stroke="${roof}" stroke-width="3"/><rect x="38" y="30" width="12" height="12" fill="#9aa5b8"/>`+wins(9,22,2,1,15,0,7,7)+`<rect x="17" y="32" width="6" height="10" fill="${ink}"/>`; }
  else { vb="0 0 72 50"; g=`<path d="M10 18L36 3L62 18z" fill="${roof}"/><rect x="2" y="22" width="16" height="28" fill="${wall2}"/><rect x="54" y="22" width="16" height="28" fill="${wall2}"/><rect x="14" y="17" width="44" height="33" fill="${wall}"/>`+wins(18,22,4,2,10,12,5,7)+`<rect x="5" y="28" width="10" height="7" fill="${win}"/><rect x="57" y="28" width="10" height="7" fill="${win}"/><rect x="32" y="40" width="8" height="10" fill="${ink}"/><path d="M14 17h44" stroke="${W}" stroke-width="2"/>`; }
  return `<svg viewBox="${vb}" aria-hidden="true">${g}</svg>`;
}
function vTown(){
  const hist=getHist(), walkers=hist.slice(0,10), best={org:0,craft:0,biz:0,fame:0,wealth:0,life:0}, peaks={};
  for(const r of hist){ if(r.ranks) for(const p in best) best[p]=Math.max(best[p],r.ranks[p]||0); for(const p of (r.peaks||[])) peaks[p.path]=1; }
  const hr=new Date().getHours()+new Date().getMinutes()/60, age=17+Math.max(0,Math.min(1,(hr-6)/15))*48;
  const slot=i=>+((i+.5)/Math.max(1,walkers.length)*100).toFixed(2);
  if(!town||town.n!==walkers.length) town={n:walkers.length,raf:0,last:0,chars:walkers.map((r,i)=>({hx:slot(i),x:slot(i)+((i%2)?3:-3),dir:i%2?1:-1,sp:1.800+(hashStr(r.name||"x")%10)*.160,state:"walk",until:0,cool:0,say:"",say2:null}))};
  return `<div class="town"><header class="hud"><div class="who"><b>커리어 타운</b><span>지금까지 살아 본 ${hist.length}명이 사는 동네</span></div><span></span><div class="hud-btns"><button class="hbtn" data-act="to-title">나가기</button></div></header>
    <div class="scene town-stage"><div class="town-wide" style="--n:${Math.max(3,walkers.length)}">${city({age:age,vb:"0 -60 600 332",ranks:best,peaks:peaks,fade:true,label:"지난 인생들이 올린 층이 모인 도시"})}
      <div class="street" style="--n:${Math.max(3,walkers.length)}">${walkers.map((r,i)=>{ const h=homeOf(r); return `<button class="bld ${h.kind}${walkers.length>5&&i%2?" back":""}${i===0?" first":""}${i===walkers.length-1&&i>0?" last":""}" data-act="life" data-i="${i}" style="left:${slot(i)}%" aria-label="${esc(h.label)}. 인생 요약 보기" title="${esc(h.label)}">${buildingSvg(h)}${h.kind==="company"?`<span class="bsign">${esc(h.name)}</span>`:""}</button>`; }).join("")}</div>
      <div class="walkers">${walkers.map((r,i)=>`<button class="walker" id="wk-${i}" data-act="life" data-i="${i}" style="left:${town.chars[i].x}%;bottom:${4+(i*7)%13}px;z-index:${20-(i*7)%13}" aria-label="${esc(r.name)}, ${esc(r.job)}. 인생 요약 보기"><span class="bub" hidden></span><span class="fig">${personSvg(r,r.peaks&&r.peaks.length)}</span><span class="wname">${esc(r.name)}</span></button>`).join("")}</div>
      </div>${walkers.length*88>window.innerWidth?`<span class="town-hint">밀어서 이웃 보기 →</span>`:""}
      ${hist.length?"":`<div class="town-empty"><b class="disp">아직 아무도 살지 않는다</b><span>한 인생을 끝까지 살면 그 사람이 이 동네로 이사 온다.</span></div>`}</div>
    <div class="town-body">
      ${hist.length?`<p class="small muted">길가의 건물은 그 사람이 사는 집이나 끝까지 이끈 회사다. 집은 자산의 길, 회사는 창업의 길 단계만큼 크다. 뒤쪽 도시의 층은 지금까지의 인생들이 각 길에서 가장 높이 오른 기록이다. 사람이나 건물을 누르면 그 인생의 명함과 요약이 나온다.</p>${residentsBlock(hist)}`:""}
      <div class="btn-row"><button class="gbtn alt" data-act="col">수집첩</button><button class="gbtn" data-act="again">새 인생 시작</button></div>
    </div></div>`;
}
function townStart(){
  if(!town||town.raf||reduce) return; town.last=performance.now();
  const hist=getHist();
  const setBub=(i,t)=>{ const el=document.getElementById("wk-"+i); if(!el) return; const b=el.querySelector(".bub"); b.textContent=t; b.hidden=!t; };
  const tick=now=>{
    const stage=app.querySelector(".walkers");
    if(!stage||view!=="town"||lifeOpen!=null||colOpen){ town.raf=0; return; }
    const dt=Math.min(.1,(now-town.last)/1000); town.last=now; const cs=town.chars;
    for(let i=0;i<cs.length;i++){ const c=cs[i];
      if(c.state==="walk"){ c.x+=c.dir*c.sp*dt; const lo=Math.max(4,(c.hx==null?50:c.hx)-9), hi=Math.min(96,(c.hx==null?50:c.hx)+9); if(c.x<lo){ c.x=lo; c.dir=1; } if(c.x>hi){ c.x=hi; c.dir=-1; }
        if(Math.random()<dt*.060){ c.state="idle"; c.until=now+1400+Math.random()*1800; if(Math.random()<.5){ c.say=soloLine(hist[i]); setBub(i,c.say); } } }
      else{ if(c.say2&&now>c.say2.at){ setBub(c.say2.i,c.say2.t); c.say2=null; }
        if(now>c.until){ c.state="walk"; c.say=""; setBub(i,""); if(Math.random()<.4) c.dir*=-1; } }
    }
    for(let i=0;i<cs.length;i++) for(let k=i+1;k<cs.length;k++){ const a=cs[i], b=cs[k];
      if(a.state==="walk"&&b.state==="walk"&&now>a.cool&&now>b.cool&&Math.abs(a.x-b.x)<7&&Math.abs(a.x-b.x)>3){
        const L=talkLines(hist[i],hist[k]); a.state=b.state="talk"; a.until=b.until=now+3800; a.cool=b.cool=now+12000;
        a.dir=a.x<b.x?1:-1; b.dir=-a.dir; setBub(i,L[0]); a.say2={i:k,t:L[1],at:now+1500}; } }
    for(let i=0;i<cs.length;i++){ const el=document.getElementById("wk-"+i); if(!el) continue; const c=cs[i];
      el.style.left=c.x.toFixed(2)+"%"; el.classList.toggle("flip",c.dir<0); el.classList.toggle("walking",c.state==="walk"); }
    town.raf=requestAnimationFrame(tick);
  };
  town.raf=requestAnimationFrame(tick);
}
function seedLives(n){
  for(let k=0;k<n;k++){
    S=newRun(1234567+k*7919,"",getHist()); beginYear(S); let g=0;
    while(S.phase!=="ending"&&g++<4000){ S.flashes.length=0;
      if(S.phase==="alloc"){ const acts=actionsOf(S).map(a=>a[0]), al={}, seq=acts.indexOf("work")>=0?[["work","work","study","rest"],["work","family","craft","rest"],["work","network","fame","rest"]][k%3]:["study","study","family","rest"]; for(let i=0;i<S.slots;i++){ const a=acts.indexOf(seq[i%4])>=0?seq[i%4]:"rest"; al[a]=(al[a]||0)+1; } commitAlloc(S,al); }
      else if(S.phase==="event"){ const v=visibleChoices(S,cardById(S.current)).filter(x=>!locked(S,x.c)); choose(S,v[(g+k)%v.length].i); }
      else nextEvent(S);
      recordCards(); }
    archive();
  }
  S=null; view="title";
}

/* ---------- 그리기 ---------- */
function fitScenes(){
  app.querySelectorAll("svg.city").forEach(svg=>{ const r=svg.getBoundingClientRect(); if(!r.width||!r.height) return;
    const vb=svg.getAttribute("viewBox").split(" ").map(Number), ar=r.width/r.height, full=vb[2]/vb[3], need=400/vb[3];
    svg.setAttribute("preserveAspectRatio",(ar>=need&&ar<full)?"xMidYMax slice":"xMidYMax meet"); });
}
window.addEventListener("resize",()=>fitScenes());
function render(){
  clearTimers();
  let h="";
  if(view==="town"){ h=vTown(); if(colOpen) h+=vCollection(); }
  else if(view==="title"){ h=vTitle(); if(colOpen) h+=vCollection(); }
  else if(S.phase==="draw") h=vDraw();
  else if(S.phase==="ending"){ h=vEnding(); if(view==="rec") h+=vRec(); }
  else{
    h=vGame();
    if(view==="rec") h+=vRec();
    else{
      const fl=S.flashes&&S.flashes.length?S.flashes[0]:null;
      if(fl) h+=vOverlay(fl);
      else if(S.phase==="event") h+=vEventModal();
      else if(S.phase==="result") h+=vResultModal();
    }
  }
  if(lifeOpen!=null){ const r=getHist()[lifeOpen]; if(r) h+=vLife(r); else lifeOpen=null; }
  if(cardOpen!=null&&S) h+=vCardModal();
  if(confirmNoWork&&S&&view==="game") h+=vConfirmNoWork();
  if(guideStep!=null&&S&&view==="game") h+=vGuide();
  app.innerHTML=h;
  fitScenes();
  if(view==="town") townStart();
  animateStats();
  const fl=S&&view==="game"&&S.phase!=="ending"&&S.phase!=="draw"&&S.flashes&&S.flashes.length?S.flashes[0]:null;
  const fk=fl?fl.kind+"|"+fl.title+"|"+S.age+"|"+S.flashes.length:"";
  if(fk&&fk!==lastFlash) fxFor(fl);
  lastFlash=fk;
  if(S&&S.phase!=="draw"&&S.phase!=="ending"&&view==="game"){ prevRanks=Object.assign({},ranksNow(S)); shownAge=S.age; }
  if(!(S&&S.flashes&&S.flashes.length)) cardFlip=false;
  if(S&&view==="game"&&S.phase==="result") lastResult=S.result;
  if(S&&view==="game"&&S.phase==="alloc") lastSlip=recent.length?recent[recent.length-1]:null;
  if(!slipMini&&app.querySelector(".toast")) later(()=>{ slipMini=true; const t=app.querySelector(".toast"); if(t){ t.classList.add("mini"); t.dataset.act="slip-open"; } },3200);
  if(S&&S.phase==="ending"&&!S.final.fxDone){ S.final.fxDone=true; if(S.final.peaks.length){ SFX.peak(); confetti(140,Object.keys(HEX).map(k=>HEX[k])); } else if(S.final.kind==="retire"||S.final.kind==="clear") SFX.good(); else SFX.bad(); }
  const focus=app.querySelector(".modal .gbtn, .modal .choice:not([disabled])"); if(focus&&!app.querySelector(".panel")) focus.focus({preventScroll:true});
  if(focusAge!=null){ const el=document.getElementById("log-"+focusAge); if(el) el.scrollIntoView({block:"start"}); focusAge=null; }
  const key=view+"|"+(S?S.phase+"|"+S.age:"");
  if(key!==lastKey&&(view==="title"||view==="town"||(S&&S.phase==="ending"))) window.scrollTo(0,0);
  lastKey=key;
}

/* ---------- 입력 ---------- */
function afterStep(){
  if(S.summary&&S.summary!==seenSummary){ recent=[S.summary]; seenSummary=S.summary; slipClosed=false; slipMini=false; if(S.summary.grade&&S.phase==="alloc") SFX.stamp(.12); }
  if(S.phase==="alloc") prefill();
  const t=titleOf(S)+orgOf(S); if(t!==lastTitle){ lastTitle=t; }
  recordCards();
  save();
}
function recordCards(){
  if(!S) return; S.cardFinds=S.cardFinds||[]; let ch=false;
  for(const c of S.cards){ const k=cardKey(c); if(!M.bcards[k]){ M.bcards[k]=1; S.cardFinds.push(k); ch=true; }
    if(k!=="none"&&k.indexOf("stu|")){ const ek="era|"+k+"|"+cardEra(c.year); if(!M.bcards[ek]){ M.bcards[ek]=1; ch=true; } }
    if(c.v&&!M.bcards["rare|"+c.v]){ M.bcards["rare|"+c.v]=1; S.cardFinds.push("rare|"+c.v); ch=true; } }
  const ck=cardKey(cardInfoOf(S)); if(ck!==lastCardKey){ cardFlip=!!lastCardKey; lastCardKey=ck; }
  if(ch) saveMeta();
}
function advanceResult(){
  if(S.resignOpen){ S.resignOpen=false; S.result=null; S.slots=S.onLeave?0:slotsOf(S); if(S.queue.length) nextEvent(S); else S.phase="alloc"; }
  else nextEvent(S);
  if(S.phase==="alloc"&&!S.summary) recent=[];
}
/* 판정도 연출도 없는 결과는 모달 대신 띠로 보여 주고 바로 넘어간다 */
function autoResult(){
  let guard=0;
  while(S.phase==="result"&&S.result&&!S.result.roll&&!(S.flashes&&S.flashes.length)&&guard++<5){
    const r=S.result; lastToast={title:r.title,text:r.text,delta:r.delta,shame:r.shame,age:S.age};
    if(r.shame) SFX.bad(); else if(r.delta&&r.delta.money>0) SFX.coin(); else SFX.tap();
    advanceResult();
  }
}
function startRun(){ S=newRun((Date.now()^(Math.random()*1e9))|0,nameDraft,getHist()); drawStep=0; draft=[]; recent=[]; seenSummary=null; prevRanks=null; shown=null; shownAge=null; selPath=null; lastTitle=""; copied=""; lastResult=null; lastSlip=null; slipClosed=false; colOpen=false; cardOpen=null; lastCardKey=""; lastToast=null; confirmNoWork=false; view="game"; }
function act(a,b){
  draft.justAdded=false;
  if(a==="new"){ const el=document.getElementById("nm"); nameDraft=el?el.value.trim().slice(0,8):""; startRun(); SFX.page(); }
  else if(a==="again"){ startRun(); SFX.page(); }
  else if(a==="reroll"){ if(M.rerolls>0){ M.rerolls--; saveMeta(); const nm=S.name; startRun(); S.name=nameDraft||nm; SFX.page(); } }
  else if(a==="resume-run"){ S=store.get("careerhigh.run"); if(S.born==null){ S.born=2000-S.age; S.ghosts=[]; } view="game"; recent=S.summary?[S.summary]:[]; seenSummary=S.summary; lastSlip=S.summary; lastTitle=titleOf(S)+orgOf(S); shown=null; shownAge=S.age; lastResult=S.result; prefill(); }
  else if(a==="draw-next"){ drawStep++; SFX.stamp(); }
  else if(a==="draw-done"){ beginYear(S); draft=[]; lastTitle=titleOf(S)+orgOf(S); recordCards(); cardFlip=false; save(); SFX.promo(); if(!M.guided) guideStep=0; }
  else if(a==="guide-next"){ if(guideStep<GUIDE.length-1) guideStep++; else { guideStep=null; M.guided=true; saveMeta(); } SFX.tap(); }
  else if(a==="guide-skip"){ guideStep=null; M.guided=true; saveMeta(); SFX.tap(); }
  else if(a==="card"){ cardOpen=b.dataset.i==="cur"?"cur":+b.dataset.i; cardFlipped=false; SFX.page(); }
  else if(a==="card-flip"){ cardFlipped=!cardFlipped; SFX.tap(); }
  else if(a==="card-close"){ cardOpen=null; SFX.tap(); }
  else if(a==="add"){ if(draft.length<S.slots){ draft.push(b.dataset.k); draft.justAdded=true; SFX.post(draft.length-1); } }
  else if(a==="unslot"){ draft.splice(+b.dataset.i,1); SFX.unpost(); }
  else if(a==="clear"){ draft=[]; SFX.unpost(); }
  else if(a==="commit"||a==="commit-anyway"){
    if(a==="commit-anyway"){ S.noWorkOk=true; confirmNoWork=false; }
    if(a==="commit"&&working(S)&&S.track!=="free"&&!S.onLeave&&draft.indexOf("work")<0&&!S.noWorkOk){ confirmNoWork=true; SFX.tap(); render(); return; }
    recent=[]; lastToast=null; SFX.page(); S.planView=draft.map(k=>[k,(actionsOf(S).find(x=>x[0]===k)||[])[1]||k]); commitAlloc(S,counts(draft)); draft=[]; autoResult(); afterStep(); }
  else if(a==="confirm-close"){ confirmNoWork=false; SFX.tap(); }
  else if(a==="toast-close"){ lastToast=null; SFX.tap(); }
  else if(a==="ff"){
    if(working(S)&&S.track!=="free"&&!S.onLeave&&draft.indexOf("work")<0&&!S.noWorkOk){ confirmNoWork=true; SFX.tap(); render(); return; }
    SFX.page(); lastToast=null; S.planView=draft.map(k=>[k,(actionsOf(S).find(x=>x[0]===k)||[])[1]||k]); S.ffLog=[]; commitAlloc(S,counts(draft)); draft=[]; let n=1;
    let m0=S.stats.money;
    while(n<10&&S.phase==="alloc"&&!S.onLeave&&!S.flashes.length&&S.stats.burn<75&&!(m0>=0&&S.stats.money<0)){ const al=autoAlloc(S); if(!al) break; m0=S.stats.money; commitAlloc(S,al); n++; }
    const log=S.ffLog||[]; S.ffLog=null; afterStep(); if(log.length>1&&S.phase==="alloc"){ recent=log; slipClosed=false; slipMini=false; log.forEach((m,i)=>SFX.stamp(.1+i*.11)); }
  }
  else if(a==="choose"){ M.cards[S.current]=1; choose(S,+b.dataset.i); lastToast=null; autoResult(); afterStep(); saveMeta(); }
  else if(a==="next-event"){ advanceResult(); SFX.tap(); afterStep(); }
  else if(a==="resign"){ S.current="resign"; S.resignOpen=true; S.phase="event"; SFX.tap(); }
  else if(a==="dismiss"){ S.flashes.shift(); save(); SFX.tap(); }
  else if(a==="path"){ selPath=selPath===b.dataset.p?null:b.dataset.p; SFX.tap(); }
  else if(a==="slip-close"){ slipClosed=true; SFX.tap(); }
  else if(a==="slip-open"){ slipMini=false; SFX.tap(); }
  else if(a==="mute"){ M.mute=!M.mute; saveMeta(); SFX.tap(); }
  else if(a==="rec"){ recTab=b&&b.dataset.tab||"status"; view="rec"; SFX.tap(); }
  else if(a==="close-rec"){ view="game"; SFX.tap(); }
  else if(a==="col"){ colOpen=true; SFX.tap(); }
  else if(a==="town"){ view="town"; colOpen=false; lifeOpen=null; SFX.page(); }
  else if(a==="life"){ lifeOpen=+b.dataset.i; lifeFlip=false; SFX.page(); }
  else if(a==="life-flip"){ lifeFlip=!lifeFlip; SFX.tap(); }
  else if(a==="life-close"){ lifeOpen=null; SFX.tap(); }
  else if(a==="close-col"){ colOpen=false; SFX.tap(); }
  else if(a==="gap"){ recTab="log"; view="rec"; const want=+b.dataset.age; const ages=S.log.map(l=>l.age).filter(x=>x>=want).sort((x,y)=>x-y); focusAge=ages.length?ages[0]:null; }
  else if(a==="to-title"){ view="title"; colOpen=false; lifeOpen=null; }
  else if(a==="copy"){ const t=shareText(); try{ navigator.clipboard.writeText(t).then(()=>{ copied="복사했다"; render(); },()=>{ copied="복사가 막혀 있다"; render(); }); }catch(err){ copied="복사가 막혀 있다"; } }
  if(S&&S.final) archive();
  render();
}
app.addEventListener("click",e=>{ const b=e.target.closest("[data-act]"); if(!b||b.disabled) return; act(b.dataset.act,b); });
document.addEventListener("keydown",e=>{
  const tgt=e.target;
  if(tgt&&tgt.tagName==="INPUT"){ if(e.key==="Enter"&&view==="title"){ const b=app.querySelector("[data-act=new]"); if(b) act("new",b); } return; }
  if(tgt&&tgt.getAttribute&&tgt.getAttribute("role")==="button"&&tgt.dataset&&tgt.dataset.act&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); act(tgt.dataset.act,tgt); return; }
  if(e.key==="Escape"){ if(confirmNoWork){ act("confirm-close"); return; } if(lifeOpen!=null){ act("life-close"); return; } if(view==="town"&&!colOpen){ act("to-title"); return; } if(cardOpen!=null){ act("card-close"); return; } if(guideStep!=null){ act("guide-skip"); return; } if(view==="rec"){ act("close-rec"); return; } if(colOpen){ act("close-col"); return; } if(S&&S.flashes&&S.flashes.length&&view==="game"){ act("dismiss"); return; } if(selPath){ selPath=null; render(); return; } }
  if(!S||view!=="game") return;
  if(cardOpen!=null||guideStep!=null) return;
  if(S.flashes&&S.flashes.length){ if(e.key==="Enter"){ e.preventDefault(); act("dismiss"); } return; }
  if(S.phase==="event"&&e.key>="1"&&e.key<="9"){ const bs=app.querySelectorAll(".choice"); const b=bs[+e.key-1]; if(b&&!b.disabled) act("choose",b); }
});
function start(data){ if(data&&data.S&&data.S.v===3){ S=data.S; view=data.view==="rec"?"game":(data.view||"game"); draft=data.draft||[]; drawStep=data.drawStep||0; lastTitle=titleOf(S)+orgOf(S); recent=S.summary?[S.summary]:[]; seenSummary=S.summary; lastSlip=S.summary; lastResult=S.result; shownAge=S.age; if(S.flashes&&S.flashes[0]) lastFlash=S.flashes[0].kind+"|"+S.flashes[0].title+"|"+S.age+"|"+S.flashes.length; } render(); }
if(location.protocol==="file:"&&location.hash==="#seed"&&!getHist().length) seedLives(7);
const hot=window.claude&&window.claude.hot;
if(hot&&hot.snapshot) hot.snapshot(()=>({S:S,view:view,draft:Array.from(draft),drawStep:drawStep}));
if(hot&&hot.ready) hot.ready(start); else start((hot&&hot.data)||{});
})();
