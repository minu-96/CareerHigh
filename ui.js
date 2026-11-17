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
  const nc=(S.cardFinds||[]).length; if(nc) finds.push("새 명함 "+nc+"장 (명함 도감 "+Object.keys(M.bcards).length+"/"+CARD_DESIGNS+")");
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
function resumeRows(s){
  let out="", prev=null;
  for(const r of s.resume){
    if(prev!=null&&r.age-prev>=3) out+=`<tr class="gap-row"><th class="num">&nbsp;</th><td>기록 없는 ${r.age-prev-1}년 <button data-act="gap" data-age="${prev+1}">수첩에서 보기</button></td></tr>`;
    out+=`<tr><th class="num">${r.age}세</th><td>${esc(r.text)}</td></tr>`; prev=r.age;
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
    const tag=o.interactive?`g class="tw${o.sel===p?" sel":""}" data-act="path" data-p="${p}" tabindex="0" role="button" aria-label="${PATHS[p]}의 길 ${rank}층${peaked?", 정점":""}"`:`g`;
    g+=`<${tag}><rect class="hit" x="${x-4}" y="${base-5*fl-30}" width="${w+8}" height="${5*fl+30}" fill="transparent" rx="4"/>`;
    for(let f=0;f<5;f++){ const y=base-(f+1)*fl;
      if(f<rank){ const top=fresh&&f===rank-1; g+=`<g class="${top?"drop":""}"><rect class="body" x="${x}" y="${y}" width="${w}" height="${fl}" fill="#16213b"/>`;
        for(let k=0;k<4;k++) g+=`<rect class="${top?"lit":""}" style="animation-delay:${.35+k*.1}s" x="${x+6+k*12.5}" y="${y+6}" width="8" height="11" fill="${HEX[p]}"/>`; g+=`</g>`; }
      else g+=`<rect x="${x+.5}" y="${y+.5}" width="${w-1}" height="${fl-1}" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-dasharray="3 3"/>`;
    }
    if(peaked) g+=`<line x1="${x+w/2}" y1="${base-5*fl}" x2="${x+w/2}" y2="${base-5*fl-24}" stroke="#d33a22" stroke-width="2"/><path class="flag" d="M${x+w/2} ${base-5*fl-24}h16l-5 5 5 5h-16z" fill="#d33a22"/>`;
    g+=`<text class="tw-label" x="${x+w/2}" y="253" text-anchor="middle">${PATHS[p]}</text></${o.interactive?"g":"g"}>`;
  });
  g+=`<rect x="-1400" y="232" width="3400" height="300" fill="#232a3a"/><rect x="-1400" y="232" width="3400" height="3" fill="#16213b"/>`;
  for(let i=0;i<64;i++) g+=`<rect x="${-1400+i*50}" y="264" width="24" height="2" fill="#ffe14d" opacity=".55"/>`;
  return g+`</svg>`;
}
function freshRanks(){ if(!prevRanks) return null; const r=ranksNow(S), o={}; for(const p in r) if(r[p]>(prevRanks[p]||0)) o[p]=1; return o; }
function sceneFor(s,extra){ return city({age:s.age,ranks:ranksNow(s),peaks:s.peakAt,fresh:freshRanks(),interactive:true,sel:selPath,label:null})+(extra||""); }

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
    <div class="who-wrap"><button class="hud-card ${cardFlip?"flip":""}" data-act="card" data-i="cur" aria-label="지금 명함 크게 보기">${cardHtml(cardInfoOf(s),{w:window.innerWidth<520?78:96})}</button><div class="who"><b>${esc(s.name)}</b><span>${esc(cardTitleOf(s))}${s.track==="career"||s.track==="founder"?", "+esc(s.company):""}</span>${s.nickname?`<span class="nick">${esc(s.nickname)}</span>`:""}</div></div>
    <div class="clock"><div class="age num"><span class="${tick?"tick":""}">${s.age}</span><small>세</small></div>${hudRuler(s)}</div>
    <div class="hud-btns"><button class="hbtn" data-act="rec" data-tab="status">기록</button><button class="hbtn" data-act="mute" aria-label="${M.mute?"소리 켜기":"소리 끄기"}">${M.mute?"소리 끔":"소리 켬"}</button></div>
  </header>`;
}
function statbar(s){
  const TIP={skill:"일을 잘하는 정도. 승진, 대표작, 판정에 쓰인다",rep:"업계와 회사의 평가. 평가 점수와 스카우트에 쓰인다",net:"아는 사람. 높은 직급과 회사 성장에 필요하다",fame:"세상이 아는 정도. 명성의 길과 강연, 출간",life:"일 밖의 삶. 높으면 피로가 잘 풀린다",burn:"쌓인 피로. 70부터 칸이 줄고 100이면 쓰러진다"};
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
function rail(s){ return `<aside class="rail"><button data-act="card" data-i="cur" aria-label="지금 명함 크게 보기">${cardHtml(cardInfoOf(s),{w:298,cls:cardFlip?"reveal":""})}</button>${towerDetail(s)}${goalsBlock(s)}${tags(s)}</aside>`; }
const QUARTER=["1분기","2분기","3분기","4분기","야근"];
function desk(s){
  const acts=actionsOf(s), left=s.slots-draft.length, notes=slotNotes(s), rot=["-1.5deg","1deg","-.5deg","1.6deg","-1deg"];
  let warn="";
  if(s.stats.burn>=85) warn="번아웃 "+s.stats.burn+". 100이 되면 쓰러진다. 휴식이 필요하다.";
  else if(s.stats.burn>=70) warn="번아웃 "+s.stats.burn+". 행동력이 한 칸 줄었다.";
  else if(s.stats.money<0) warn="현금이 바닥났다. 빚이 계속되면 파산한다.";
  else if(s.track==="career"&&draft.length===s.slots&&draft.indexOf("work")<0) warn="업무 칸이 없으면 평가가 D로 떨어진다.";
  else if(notes.length) warn="칸이 줄었다: "+notes.join(", ");
  const canResign=(s.track==="career"||s.track==="free"||s.track==="founder")&&s.stage<6&&!s.onLeave;
  return `<section class="desk">
    <div class="desk-head"><h2 class="disp">${s.age}세의 한 해</h2><span class="aside">${s.onLeave?"쉬는 해":"행동력 "+s.slots+"칸"} <button class="bucket-chip" data-act="rec" data-tab="status">버킷리스트 ${Object.keys(s.goalsDone||{}).length}/3</button></span></div>
    ${warn?`<p class="warnline">${esc(warn)}</p>`:""}
    ${s.onLeave?`<p class="small">올해는 쉰다. 아무것도 하지 않아도 된다.</p>`:`
    <div class="slots">${Array.from({length:s.slots},(_,i)=>{ const k=draft[i]; if(!k) return `<div class="slot"><em>${QUARTER.at(Math.min(i,4))}</em>비어 있음</div>`; const a=acts.find(x=>x[0]===k);
      return `<button class="slot filled ${i===draft.length-1&&draft.justAdded?"new":""}" data-act="unslot" data-i="${i}" style="--pc:${PCOLOR[ACT_COLOR[k]]};--r:${rot.at(i)}" aria-label="${QUARTER.at(Math.min(i,4))} ${a?a[1]:k} 빼기"><em>${QUARTER.at(Math.min(i,4))}</em>${a?a[1]:k}</button>`; }).join("")}</div>
    <div class="handrow">${acts.map(a=>{ const n=draft.filter(x=>x===a[0]).length, cant=left<=0||(a[0]==="invest"&&s.stats.money<500);
      let sub=a[2]; if(a[0]==="craft") sub="진행 "+Math.min(s.prog,4)+"/4, 다 차면 도전"; if(a[0]==="invest"&&s.stats.money<500) sub="현금 500만 원 이상 필요";
      return `<button class="pc" data-act="add" data-k="${a[0]}" style="--pc:${PCOLOR[ACT_COLOR[a[0]]]}" title="${esc(a[2])}" ${cant?"disabled":""}>${n?`<span class="cnt">${n}</span>`:""}<b>${a[1]}</b><small>${esc(sub)}</small></button>`; }).join("")}</div>`}
    <div class="desk-btns">
      <button class="gbtn ${left<=0||s.onLeave?"ready":""}" data-act="commit" ${left>0&&!s.onLeave?"disabled":""}>${s.onLeave?"한 해 쉬기":left>0?left+"칸 더 채우기":"한 해 보내기"}</button>
      <button class="gbtn alt" data-act="ff" ${left>0||s.onLeave?"disabled":""}>사건까지 반복</button>
    </div>
    <div class="desk-foot">${draft.length&&!s.onLeave?`<button class="link" data-act="clear">계획 비우기</button>`:"<span></span>"}${canResign?`<button class="resign-s" data-act="resign">${s.track==="founder"?"회사를 접을까":s.track==="free"?"다른 길 찾기":"사직서"}</button>`:""}</div>
  </section>`;
}
function vGame(){
  return `<div class="game">${hud(S)}<div class="scene">${sceneFor(S)}${S.era?`<div class="ticker"><span><b>${S.news?"속보":"요즘"}</b>${esc(ERAS.find(e=>e.id===S.era).text)}</span></div>`:""}${toastHtml()}${tipHtml()}</div>${statbar(S)}${desk(S)}${rail(S)}</div>`;
}
function vEventModal(){
  const card=cardById(S.current), cat=catOf(card);
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(fill(S,card.title))}"><div class="mcard" style="--pc:${cat[1]}"><span class="cat">${esc(cat[0])}</span><span class="age-tag">${S.age}세</span>
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
  const o=ORDER[f.kind]||["알림","확인","확인"];
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

/* ---------- 명함 크게 보기, 첫 안내 ---------- */
function vCardModal(){
  const c=cardOpen==="cur"?cardInfoOf(S):Object.assign({name:S.name},S.cards[cardOpen]||{});
  const w=Math.min(400,window.innerWidth-48);
  return `<div class="modal center" role="dialog" aria-modal="true" aria-label="명함"><div class="order" style="width:min(460px,100%)"><span class="kind">${c.age}세의 명함</span>
    <div class="card-stage"><button data-act="card-flip" aria-label="명함 뒤집기">${cardHtml(c,{w:w,back:true,flipped:cardFlipped})}</button><p class="card-cap">명함을 누르면 뒤집힌다.</p></div>
    <div class="btn-row"><button class="gbtn alt" data-act="card-flip">뒤집기</button><button class="gbtn" data-act="card-close">닫기</button></div></div></div>`;
}
const GUIDE=[
  ["한 해는 네 칸","책상 위 행동 카드를 눌러 1분기부터 4분기까지 채운다. 업무만 하면 쓰러지고, 쉬기만 하면 뒤처진다. 같은 계획을 이어 가려면 '사건까지 반복'을 누른다."],
  ["꼭대기는 여섯 곳","도시의 건물 여섯 동이 회사, 장인, 창업, 명성, 자산, 삶의 길이다. 층이 오를 때마다 불이 켜지고, 5층에 닿으면 깃발이 선다. 건물을 누르면 다음 조건이 보인다."],
  ["명함이 이력이다","승진하거나 회사를 옮기면 새 명함이 나온다. 회사마다, 직급마다 디자인이 다르다. 모은 명함은 수집첩의 명함 도감에 남는다."]
];
function vGuide(){
  const g=GUIDE[guideStep], last=guideStep===GUIDE.length-1;
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
  if(recTab==="status") body=`<div class="sheet"><div class="sheet-head"><h2 class="disp">여섯 갈래</h2><span class="aside">정점 ${S.peaks.length}개</span></div>
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
      ${jobs.map(jb=>`<span class="sg-j">${JOBS[jb].name.split("·")[0].split(" ")[0]}</span>`+paths.map(p=>{ const a=M.stamps[jb+"|"+p]; return `<span class="sg-c ${a?"on":""}" style="--pc:${PCOLOR[p]}" title="${JOBS[jb].name}, ${PATHS[p]}${a?", "+a+"세에 달성":""}">${a?"정점":""}</span>`; }).join("")).join("")}</div>
    ${bar("정점 도장",got,jobs.length*paths.length)}${bar("엔딩",Object.keys(M.endings).length,ENDINGS.length)}${bar("별명",Object.keys(M.nicks).length,NICKS.length)}${bar("사건 카드",Math.min(CARD_TOTAL,Object.keys(M.cards).length),CARD_TOTAL)}${bar("출신",Object.keys(M.origins).length,ORIGINS.length)}${bar("버킷리스트",Object.keys(M.goals).length,GOALS.length)}
    <p class="small"><span class="hl">${esc(nextHint())}</span></p></div>
    <div class="sheet"><div class="sheet-head"><h2 class="disp">명함 도감</h2><span class="aside">${Object.keys(M.bcards).length}/${CARD_DESIGNS}</span></div>
      <p class="small muted">회사마다, 직급마다 명함이 다르다. 칸 하나가 직급 하나다.</p>
      <div class="dex">${cardGroups().map((g,gi,arr)=>{ const head=(gi===0||(arr[gi-1].job!==g.job)||g.own&&!arr[gi-1].own||g.free||g.misc)&&!(g.own&&arr[gi-1].own)?`<p class="dex-h">${g.own?"내 회사":g.free?"회사 밖":g.misc?"그 밖":JOBS[g.job].name}</p>`:""; const col=g.brand?g.brand.c:"var(--ink)";
        return head+`<div class="dex-row" style="--pc:${col}">${g.brand?markSvg(g.brand.mark,col,"#fff"):markSvg("mono",col,"#fff",g.label.charAt(0))}<span>${esc(g.label)}</span><span class="dex-dots">${g.keys.map(k=>`<i class="${M.bcards[k]?"on":""}"></i>`).join("")}</span></div>`; }).join("")}</div></div>
    ${hist.length?`<div class="sheet"><div class="sheet-head"><h2 class="disp">지난 인생들</h2><span class="aside">${hist.length}명</span></div><div class="mini-cards">${hist.map(x=>`<div class="mini-card" style="--pc:${PCOLOR[x.path]||"var(--ink)"}"><span class="muted">${esc(x.job)}, ${x.age}세</span><b>${esc(x.name)}</b><span>${esc(x.end)}</span>${x.nick?`<span class="muted">${esc(x.nick)}</span>`:""}</div>`).join("")}</div></div>`:""}
  </div></div>`;
}

/* ---------- 타이틀, 통지서, 엔딩 ---------- */
function vTitle(){
  const run=store.get("careerhigh.run");
  const demo={org:3,craft:5,biz:2,fame:4,wealth:1,life:5};
  return `<div class="title"><div class="scene">${city({age:23,vb:"0 -170 600 442",ranks:demo,peaks:{craft:1,life:1},label:"여섯 동의 건물이 선 아침의 도시"})}
      <div class="logo"><h1>커리어<br>하이</h1><p>열일곱에 시작해 예순다섯에 끝나는, 한 사람의 하루</p></div></div>
    <div class="title-panel"><div class="inner">
      <p class="lede">출신도 학력도 고를 수 없다. 꼭대기는 여섯 곳이고, 한 해에 쓸 수 있는 칸은 네 개뿐이다.</p>
      <label class="small muted" for="nm" style="text-align:center">이름 (비워 두면 지어 준다)</label>
      <input type="text" id="nm" maxlength="8" value="${esc(nameDraft)}" autocomplete="off">
      <button class="gbtn" data-act="new">새 인생 시작</button>
      ${run&&run.v===3&&!run.final?`<button class="gbtn alt" data-act="resume-run">이어하기: ${esc(run.name)}, ${run.age}세</button>`:""}
      <div class="title-row"><button class="gbtn alt" data-act="col">수집첩</button><button class="gbtn alt" data-act="mute">${M.mute?"소리 켜기":"소리 끄기"}</button></div>
      <p class="small muted" style="text-align:center">다시 뽑기권 ${M.rerolls}장</p>
    </div></div></div>`;
}
function vDraw(){
  const o=origin(S), tg=TRAITS_GOOD.find(t=>t.id===S.traits[0]), tb=TRAITS_BAD.find(t=>t.id===S.traits[1]);
  const eduTxt=S.track==="rest"?EDU[S.edu]+" 졸업, 바로 일을 구한다":EDU[S.edu]+(S.edu==="univ"||S.edu==="college"?" 입학":" 재학");
  const rows=[["나이",`${S.age}세`],["출신",`${o.name}<div class="small muted">${o.desc}</div>`],["학력",eduTxt],
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
  const kicker=f.hidden?"숨은 엔딩":f.kind==="burnout"||f.kind==="bankrupt"?"중도 엔딩":S.age+"세, 마지막 출근";
  return `<div class="ending"><div class="scene">${city({age:S.age,vb:"0 -170 600 442",ranks:f.ranks,peaks:S.peakAt,label:"이 인생이 세운 도시"})}
      <div class="end-title"><p class="kicker">${esc(kicker)}</p><h1>${esc(f.hidden||f.title)}</h1>${f.hidden?`<p class="sub">${esc(f.title)}</p>`:""}</div></div>
    <div class="end-body">
      <p class="hand" style="text-align:center">${esc(f.scene)}</p>
      <p class="verdict-line"><span class="hl"><b>${esc(f.verdict)}</b></span></p>
      <div class="card-stage"><button data-act="card" data-i="cur" aria-label="마지막 명함 크게 보기">${cardHtml(cardInfoOf(S),{w:Math.min(360,window.innerWidth-40),cls:"reveal shine"})}</button><p class="card-cap">마지막 명함. 받은 명함은 모두 ${S.cards.length}장.</p></div>
      <section class="sheet finds"><div class="sheet-head"><h2 class="disp">이번 인생이 남긴 것</h2><span class="aside">수집첩에 ${finds.length}개 추가</span></div>
        ${finds.length?`<ul class="lines">${finds.map((x,i)=>`<li class="find" style="animation-delay:${300+i*140}ms">${esc(x)}</li>`).join("")}</ul>`:`<p class="small muted">새로 모은 것은 없다. 다른 길을 걸어 보면 생긴다.</p>`}
        <p class="small"><span class="hl">${esc(nextHint())}</span></p>
        <div class="btn-row"><button class="gbtn alt" data-act="copy">${copied?esc(copied):"결과 복사하기"}</button><button class="gbtn" data-act="again">바로 다음 인생</button></div>
      </section>
      ${goalsBlock(S)}
      <section class="sheet"><div class="sheet-head"><h2 class="disp">한 사람의 그래프</h2></div>${lifeChart(S)}</section>
      <section class="sheet"><div class="sheet-head"><h2 class="disp">최종 이력서</h2></div>
        <table class="formtbl">${Object.keys(PATHS).map(p=>`<tr><th style="border-left:4px solid ${PCOLOR[p]}">${PATHS[p]}</th><td>${f.ranks[p]}층 ${f.ranks[p]?esc(rankName(S,p,f.ranks[p])):"<span class=\"muted\">걷지 않은 길</span>"}${S.peakAt[p]?` <b class="bad">정점 (${S.peakAt[p]}세)</b>`:""}</td></tr>`).join("")}
        <tr><th>이직</th><td>${S.counters.jobChanges}회</td></tr><tr><th>순자산</th><td>${won(networth(S))}</td></tr></table>
        <table class="formtbl">${resumeRows(S)}</table></section>
      <section class="notebook"><p class="nb-year">이력서에 못 쓴 이야기</p>${f.shames.length?f.shames.map(l=>`<p class="nb-line shame">${l.age}세, ${esc(l.text)}</p>`).join(""):`<p class="nb-line">놀랍게도 없다. 수첩이 깨끗하다.</p>`}</section>
      <div class="btn-row"><button class="gbtn alt" data-act="rec" data-tab="log">업무 수첩 전체 보기</button><button class="gbtn alt" data-act="to-title">처음 화면으로</button></div>
    </div></div>`;
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
  if(view==="title"){ h=vTitle(); if(colOpen) h+=vCollection(); }
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
  if(cardOpen!=null&&S) h+=vCardModal();
  if(guideStep!=null&&S&&view==="game") h+=vGuide();
  app.innerHTML=h;
  fitScenes();
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
  if(key!==lastKey&&(view==="title"||(S&&S.phase==="ending"))) window.scrollTo(0,0);
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
  for(const c of S.cards){ const k=cardKey(c); if(!M.bcards[k]){ M.bcards[k]=1; S.cardFinds.push(k); ch=true; } }
  const ck=cardKey(cardInfoOf(S)); if(ck!==lastCardKey){ cardFlip=!!lastCardKey; lastCardKey=ck; }
  if(ch) saveMeta();
}
function startRun(){ S=newRun((Date.now()^(Math.random()*1e9))|0,nameDraft); drawStep=0; draft=[]; recent=[]; seenSummary=null; prevRanks=null; shown=null; shownAge=null; selPath=null; lastTitle=""; copied=""; lastResult=null; lastSlip=null; slipClosed=false; colOpen=false; cardOpen=null; lastCardKey=""; view="game"; }
function act(a,b){
  draft.justAdded=false;
  if(a==="new"){ const el=document.getElementById("nm"); nameDraft=el?el.value.trim().slice(0,8):""; startRun(); SFX.page(); }
  else if(a==="again"){ startRun(); SFX.page(); }
  else if(a==="reroll"){ if(M.rerolls>0){ M.rerolls--; saveMeta(); const nm=S.name; startRun(); S.name=nameDraft||nm; SFX.page(); } }
  else if(a==="resume-run"){ S=store.get("careerhigh.run"); view="game"; recent=S.summary?[S.summary]:[]; seenSummary=S.summary; lastSlip=S.summary; lastTitle=titleOf(S)+orgOf(S); shown=null; shownAge=S.age; lastResult=S.result; prefill(); }
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
  else if(a==="commit"){ recent=[]; SFX.page(); commitAlloc(S,counts(draft)); afterStep(); }
  else if(a==="ff"){
    SFX.page(); S.ffLog=[]; commitAlloc(S,counts(draft)); let n=1;
    let m0=S.stats.money;
    while(n<10&&S.phase==="alloc"&&!S.onLeave&&!S.flashes.length&&S.stats.burn<75&&!(m0>=0&&S.stats.money<0)){ const al=autoAlloc(S); if(!al) break; m0=S.stats.money; commitAlloc(S,al); n++; }
    const log=S.ffLog||[]; S.ffLog=null; afterStep(); if(log.length>1&&S.phase==="alloc"){ recent=log; slipClosed=false; slipMini=false; log.forEach((m,i)=>SFX.stamp(.1+i*.11)); }
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
  else if(a==="slip-close"){ slipClosed=true; SFX.tap(); }
  else if(a==="slip-open"){ slipMini=false; SFX.tap(); }
  else if(a==="mute"){ M.mute=!M.mute; saveMeta(); SFX.tap(); }
  else if(a==="rec"){ recTab=b&&b.dataset.tab||"status"; view="rec"; SFX.tap(); }
  else if(a==="close-rec"){ view="game"; SFX.tap(); }
  else if(a==="col"){ colOpen=true; SFX.tap(); }
  else if(a==="close-col"){ colOpen=false; SFX.tap(); }
  else if(a==="gap"){ recTab="log"; view="rec"; const want=+b.dataset.age; const ages=S.log.map(l=>l.age).filter(x=>x>=want).sort((x,y)=>x-y); focusAge=ages.length?ages[0]:null; }
  else if(a==="to-title"){ view="title"; colOpen=false; }
  else if(a==="copy"){ const t=shareText(); try{ navigator.clipboard.writeText(t).then(()=>{ copied="복사했다"; render(); },()=>{ copied="복사가 막혀 있다"; render(); }); }catch(err){ copied="복사가 막혀 있다"; } }
  if(S&&S.final) archive();
  render();
}
app.addEventListener("click",e=>{ const b=e.target.closest("[data-act]"); if(!b||b.disabled) return; act(b.dataset.act,b); });
document.addEventListener("keydown",e=>{
  const tgt=e.target;
  if(tgt&&tgt.tagName==="INPUT"){ if(e.key==="Enter"&&view==="title"){ const b=app.querySelector("[data-act=new]"); if(b) act("new",b); } return; }
  if(tgt&&tgt.getAttribute&&tgt.getAttribute("role")==="button"&&tgt.dataset&&tgt.dataset.act&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); act(tgt.dataset.act,tgt); return; }
  if(e.key==="Escape"){ if(cardOpen!=null){ act("card-close"); return; } if(guideStep!=null){ act("guide-skip"); return; } if(view==="rec"){ act("close-rec"); return; } if(colOpen){ act("close-col"); return; } if(S&&S.flashes&&S.flashes.length&&view==="game"){ act("dismiss"); return; } if(selPath){ selPath=null; render(); return; } }
  if(!S||view!=="game") return;
  if(cardOpen!=null||guideStep!=null) return;
  if(S.flashes&&S.flashes.length){ if(e.key==="Enter"){ e.preventDefault(); act("dismiss"); } return; }
  if(S.phase==="event"&&e.key>="1"&&e.key<="9"){ const bs=app.querySelectorAll(".choice"); const b=bs[+e.key-1]; if(b&&!b.disabled) act("choose",b); }
});
function start(data){ if(data&&data.S&&data.S.v===3){ S=data.S; view=data.view==="rec"?"game":(data.view||"game"); draft=data.draft||[]; drawStep=data.drawStep||0; lastTitle=titleOf(S)+orgOf(S); recent=S.summary?[S.summary]:[]; seenSummary=S.summary; lastSlip=S.summary; lastResult=S.result; shownAge=S.age; if(S.flashes&&S.flashes[0]) lastFlash=S.flashes[0].kind+"|"+S.flashes[0].title+"|"+S.age+"|"+S.flashes.length; } render(); }
const hot=window.claude&&window.claude.hot;
if(hot&&hot.snapshot) hot.snapshot(()=>({S:S,view:view,draft:Array.from(draft),drawStep:drawStep}));
if(hot&&hot.ready) hot.ready(start); else start((hot&&hot.data)||{});
})();
