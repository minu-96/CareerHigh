"use strict";
const escC=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* ============ 명함: 회사, 직무, 직급마다 다른 실물 명함 ============ */
const BRAND={
  "네모소프트":{tpl:"block",c:"#2f66d8",mark:"square",en:"NEMOSOFT",tag:"Software that fits"},
  "한빛테크":{tpl:"corp",c:"#e2572b",mark:"sun",en:"HANBIT TECH",tag:""},
  "오로라랩스":{tpl:"tech",c:"#19c39a",mark:"aurora",en:"AURORA LABS",tag:"research & product"},
  "코드공방":{tpl:"tech",c:"#ffb000",mark:"brackets",en:"CODE WORKSHOP",tag:"handmade software"},
  "바닐라스튜디오":{tpl:"classic",c:"#c58b2e",mark:"flower",en:"VANILLA STUDIO",tag:""},
  "모서리소프트":{tpl:"corp",c:"#6b5bd2",mark:"corner",en:"MOSEORI SOFT",tag:""},
  "호텔 그랑서울":{tpl:"classic",c:"#1e2a4a",mark:"crest",en:"HOTEL GRAND SEOUL",tag:"since 1974"},
  "미식당 본점":{tpl:"block",c:"#b3261e",mark:"bowl",en:"MISIKDANG",tag:"flagship"},
  "라메종":{tpl:"classic",c:"#2e5e4e",mark:"roof",en:"LA MAISON",tag:"cuisine française"},
  "골목식당 온기":{tpl:"kraft",c:"#8a4b2a",mark:"steam",en:"ONGI",tag:""},
  "동네밥상":{tpl:"kraft",c:"#3d6b35",mark:"table",en:"DONGNE BAPSANG",tag:""},
  "한그릇":{tpl:"block",c:"#e48a1f",mark:"bowl2",en:"HANGEUREUT",tag:""},
  "대성그룹":{tpl:"corp",c:"#0b4ea2",mark:"star",en:"DAESUNG GROUP",tag:""},
  "한울물산":{tpl:"classic",c:"#0f6e75",mark:"ring",en:"HANUL CORPORATION",tag:""},
  "미래홀딩스":{tpl:"block",c:"#4b3fa8",mark:"arrow",en:"MIRAE HOLDINGS",tag:""},
  "새봄상사":{tpl:"corp",c:"#3f9a4a",mark:"sprout",en:"SAEBOM TRADING",tag:""},
  "다온기획":{tpl:"block",c:"#e05a7a",mark:"arcs",en:"DAON PLANNING",tag:""},
  "우리산업":{tpl:"home",c:"#5a6472",mark:"gear",en:"WOORI INDUSTRIAL",tag:""}
};
const ROLES={
  dev:[["백엔드","플랫폼개발팀","Platform"],["프론트엔드","서비스개발팀","Web Service"],["데이터","데이터팀","Data"]],
  cook:[["한식","한식 주방","Korean Kitchen"],["양식","양식 주방","Western Kitchen"],["제과","페이스트리","Pastry"]],
  office:[["기획","전략기획팀","Strategy"],["재무","재무팀","Finance"],["영업","영업1팀","Sales"]]
};
const HQ={dev:["기술본부","Technology Division"],cook:["조리본부","Culinary Division"],office:["경영본부","Management Division"]};
const EN_TITLE={
  dev:["","Intern Developer","Junior Developer","Senior Developer","Team Lead","Chief Technology Officer","Chief Executive Officer"],
  cook:["","Commis","Line Cook","Sous Chef","Head Chef","Executive Chef","Chief Executive Officer"],
  office:["","Associate","Assistant Manager","Manager","General Manager","Executive Director","President & CEO"]
};
const EN_OWN={dev:["","Indie Developer","Founder","Founder & CEO","CEO","CEO","Chairman"],cook:["","Owner Chef","Owner Chef","Owner & CEO","CEO","CEO","Chairman"],office:["","Owner","Founder","Founder & CEO","CEO","CEO","Chairman"]};
const EN_FREE={dev:"Freelance Developer",cook:"Freelance Chef",office:"Independent Consultant"};
const CARD_TITLE={dev:["","수습 개발자","주니어 개발자","시니어 개발자","개발 팀장","기술 이사","대표이사"],cook:["","조리사","라인 쿡","수셰프","헤드 셰프","총괄 셰프","대표이사"],office:["","사원","대리","과장","부장","상무이사","대표이사 사장"]};
const CARD_OWN_TITLE={dev:["","대표 개발자","대표","대표이사","대표이사","대표이사","회장"],cook:["","사장 겸 셰프","오너 셰프","대표이사","대표이사","대표이사","회장"],office:["","대표","대표","대표이사","대표이사","대표이사","회장"]};
const MINE_EN={"랩스":"Labs","소프트":"Soft","테크":"Tech","식당":"Sikdang","키친":"Kitchen","집":"House","컴퍼니":"Company","상사":"Trading","홀딩스":"Holdings"};
function ownEn(co){ if(co==="부모님 가게") return "FAMILY SHOP"; for(const k in MINE_EN) if(co.endsWith(k)) return (cap(rrWord(co.slice(0,-k.length)))+" "+MINE_EN[k]).toUpperCase(); return rrWord(co.replace(/\s/g,"")).toUpperCase(); }
const OWN_COLORS=["#7d5cff","#e0455f","#0f8b8d","#d9822b","#3a6ff0","#2f9e5b","#b04fd1"];
const OWN_TPL={dev:["","home","tech","tech","block","block","lux"],cook:["","home","kraft","kraft","block","block","lux"],office:["","home","corp","corp","classic","classic","lux"]};

function hashStr(t){ let h=2166136261; for(let i=0;i<t.length;i++){ h^=t.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }
const RR_I=["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
const RR_V=["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
const RR_F=["","k","k","k","n","n","n","t","l","k","m","l","l","l","l","l","m","p","p","t","t","ng","t","t","k","t","p","t"];
const SUR={"김":"Kim","이":"Lee","박":"Park","최":"Choi","정":"Jung","강":"Kang","조":"Cho","윤":"Yoon","장":"Jang","임":"Lim","한":"Han","오":"Oh","서":"Seo","신":"Shin","권":"Kwon","황":"Hwang","안":"Ahn","송":"Song","류":"Ryu","홍":"Hong"};
function rrWord(t){ let o=""; for(const ch of t){ const c=ch.charCodeAt(0)-0xAC00; if(c<0||c>11171){ o+=ch; continue; } o+=RR_I.at(Math.floor(c/588))+RR_V.at(Math.floor((c%588)/28))+RR_F.at(c%28); } return o; }
function cap(t){ return t?t.charAt(0).toUpperCase()+t.slice(1):t; }
function enName(nm){
  if(!/^[가-힣]{2,4}$/.test(nm)) return nm;
  const s=nm.charAt(0), g=nm.slice(1);
  return cap(rrWord(g))+" "+(SUR[s]||cap(rrWord(s)));
}
function markSvg(kind,c,paper,initial){
  const P=paper||"#fff"; let b="";
  switch(kind){
    case "square": b=`<rect x="3" y="3" width="18" height="18" rx="2.5" fill="${c}"/><rect x="8.5" y="8.5" width="7" height="7" fill="${P}"/>`; break;
    case "sun": b=`<path d="M3 16a9 9 0 0 1 18 0z" fill="${c}"/><rect x="2" y="17.5" width="20" height="2.6" fill="${c}"/><path d="M12 3v2.5M4.5 6.5l1.8 1.8M19.5 6.5l-1.8 1.8" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`; break;
    case "aurora": b=`<path d="M2 15c4-6 8 2 12-4s6-3 8-3M2 19c4-5 8 1 12-3s6-2 8-2" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><circle cx="18" cy="5" r="2" fill="${c}"/>`; break;
    case "brackets": b=`<path d="M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`; break;
    case "flower": b=`<g fill="${c}"><ellipse cx="12" cy="6.5" rx="3.2" ry="5"/><ellipse cx="12" cy="17.5" rx="3.2" ry="5"/><ellipse cx="6.5" cy="12" rx="5" ry="3.2"/><ellipse cx="17.5" cy="12" rx="5" ry="3.2"/></g><circle cx="12" cy="12" r="2.6" fill="${P}"/>`; break;
    case "corner": b=`<path d="M3 3h18v6H9v12H3z" fill="${c}"/><rect x="13" y="13" width="8" height="8" fill="${c}" opacity=".45"/>`; break;
    case "crest": b=`<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M12 7l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z" fill="${c}"/>`; break;
    case "bowl": b=`<path d="M3 11h18a9 9 0 0 1-18 0z" fill="${c}"/><path d="M9 3.5c-1.2 1.5 1.2 2.5 0 4M14.5 3.5c-1.2 1.5 1.2 2.5 0 4" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round"/>`; break;
    case "roof": b=`<path d="M2 12L12 3l10 9" fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round"/><rect x="6" y="12" width="12" height="9" fill="${c}"/><rect x="10.5" y="15" width="3" height="6" fill="${P}"/>`; break;
    case "steam": b=`<path d="M7 20c-2-3 2-5 0-8s2-5 0-8M12 20c-2-3 2-5 0-8s2-5 0-8M17 20c-2-3 2-5 0-8s2-5 0-8" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`; break;
    case "table": b=`<rect x="2" y="9" width="20" height="3.2" rx="1" fill="${c}"/><path d="M5 12v9M19 12v9" stroke="${c}" stroke-width="2.4"/><path d="M8 9a4 4 0 0 1 8 0z" fill="${c}"/>`; break;
    case "bowl2": b=`<circle cx="12" cy="12" r="9.5" fill="${c}"/><circle cx="12" cy="12" r="4.2" fill="${P}"/>`; break;
    case "star": b=`<path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z" fill="${c}"/>`; break;
    case "ring": b=`<circle cx="12" cy="12" r="8.5" fill="none" stroke="${c}" stroke-width="3"/><circle cx="12" cy="12" r="3" fill="${c}"/>`; break;
    case "arrow": b=`<rect x="2" y="2" width="20" height="20" rx="4" fill="${c}"/><path d="M7 17L16 8M9.5 8H16v6.5" fill="none" stroke="${P}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`; break;
    case "sprout": b=`<path d="M12 21V11" stroke="${c}" stroke-width="2.2"/><path d="M12 11c0-4.5 3-7.5 8.5-7.5 0 5.5-3.2 7.5-8.5 7.5zM12 13.5c0-3.5-2.4-5.5-7.5-5.5 0 4.3 2.4 5.5 7.5 5.5z" fill="${c}"/>`; break;
    case "arcs": b=`<path d="M3 18a9 9 0 0 1 18 0" fill="none" stroke="${c}" stroke-width="3"/><path d="M7.5 18a4.5 4.5 0 0 1 9 0" fill="none" stroke="${c}" stroke-width="3" opacity=".55"/>`; break;
    case "gear": b=`<g fill="${c}">${[0,45,90,135].map(a=>`<rect x="10.3" y="1.5" width="3.4" height="21" rx="1" transform="rotate(${a} 12 12)"/>`).join("")}<circle cx="12" cy="12" r="7.2"/></g><circle cx="12" cy="12" r="3" fill="${P}"/>`; break;
    default: b=`<circle cx="12" cy="12" r="10.5" fill="${c}"/><text x="12" y="16.3" text-anchor="middle" font-size="12" font-weight="700" fill="${P}" font-family="IBM Plex Sans KR,sans-serif">${initial||"?"}</text>`;
  }
  return `<svg class="bc-mark" viewBox="0 0 24 24" aria-hidden="true">${b}</svg>`;
}

/* 지금 상태에서 명함 정보 */
function cardInfoOf(s){ return {name:s.name,age:s.age,title:titleOf(s),org:orgOf(s),job:s.job,track:s.track,stage:s.stage,co:s.company,tier:s.track==="career"?(s.companyMult>=1.2?"big":"small"):s.track==="founder"?"own":"",edu:s.edu}; }
function cardKey(c){
  if(!c.track) return "old|"+c.title+"|"+c.org;
  if(c.track==="career") return "co|"+c.co+"|"+c.stage;
  if(c.track==="founder") return "own|"+c.job+"|"+c.stage;
  if(c.track==="free") return "free|"+c.job;
  if(c.track==="school") return "stu|"+(c.edu==="univ"||c.edu==="college"?"u":"h");
  return "none";
}
function cardGroups(){
  const g=[];
  for(const jb of Object.keys(JOBS)) for(const co of JOBS[jb].big.concat(JOBS[jb].small)) g.push({label:co,job:jb,brand:BRAND[co],keys:[1,2,3,4,5,6].map(n=>"co|"+co+"|"+n)});
  for(const jb of Object.keys(JOBS)) g.push({label:"내 회사 ("+JOBS[jb].name+")",job:jb,own:true,keys:[1,2,3,4,5,6].map(n=>"own|"+jb+"|"+n)});
  g.push({label:"프리랜서",free:true,keys:Object.keys(JOBS).map(j=>"free|"+j)});
  g.push({label:"학생증과 빈손",misc:true,keys:["stu|h","stu|u","none"]});
  return g;
}
const CARD_DESIGNS=cardGroups().reduce((n,g)=>n+g.keys.length,0);

function cardHtml(c,opt){
  opt=opt||{}; const w=opt.w||340, job=JOBS[c.job]||JOBS.dev, st=c.stage||0;
  const nm=c.name||"", en=enName(nm), h=hashStr(nm+"|"+(c.co||"")+"|"+c.job);
  const role=(ROLES[c.job]||ROLES.dev)[hashStr(nm+c.job)%3];
  const phone=`M. 010-●●●●-${String(1000+h%9000)}`;
  let tpl="corp", color="#16213b", mark="mono", coName=c.org, coEn="", tagline="", dept="", title=c.title, titleEn="", cls="", extra="", mono=nm.charAt(0);
  if(c.track==="school"){
    const uni=c.edu==="univ"||c.edu==="college";
    return wrap("student","#2f66d8",`<div class="bc-strip"><span>${uni?(c.edu==="univ"?"누리대학교":"누리전문대학"):(c.edu==="voc"?"누리특성화고등학교":"누리고등학교")}</span><span>${uni?"STUDENT ID":"학생증"}</span></div>
      <div class="bc-photo"><svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4.5" fill="currentColor"/><path d="M3 23c0-5 4-8 9-8s9 3 9 8z" fill="currentColor"/></svg></div>
      <div class="bc-who"><b class="bc-name">${escC(nm)}</b><span class="bc-title">${uni?(job.name.split("·")[0]+" 계열"):"재학생"}</span></div>
      <div class="bc-contact">학번 ${String(h%90000+10000)}<br>${c.age}세</div>`,"");
  }
  if(c.track==="rest"||!c.track&&c.org==="소속 없음"){
    return wrap("none","#16213b",`<p class="bc-hand">명함이 없다.</p><p class="bc-hand small">${escC(nm)}, ${c.age}세. 구직 중.</p><p class="bc-hand tiny">연락은 010-●●●●-${String(1000+h%9000)}로</p>`,"");
  }
  if(c.track==="free"){
    tpl="free"; color=OWN_COLORS[h%OWN_COLORS.length]; title=job.free; titleEn=EN_FREE[c.job]||"Freelancer"; coName=nm;
    const motto={dev:"> 문제를 코드로 바꿉니다_",cook:"출장 요리, 메뉴 개발, 쿠킹 클래스",office:"전략, 조직, 숫자를 정리합니다"}[c.job]||"";
    return wrap(tpl,color,`<div class="bc-side"><span class="bc-mono">${escC(mono)}</span></div>
      <div class="bc-who"><b class="bc-name">${escC(nm)}</b><span class="bc-title">${escC(title)}</span><span class="bc-en">${escC(en)}, ${escC(titleEn)}</span></div>
      <div class="bc-motto">${escC(motto)}</div><div class="bc-contact">${phone}<br>E. hello@${escC(rrWord(nm.slice(1)).toLowerCase()||"me")}.example</div>`,"");
  }
  if(c.track==="founder"){
    tpl=OWN_TPL[c.job][st]||"corp"; color=OWN_COLORS[hashStr(c.co||"")%OWN_COLORS.length]; mark=st>=3?["square","ring","star","arcs","sprout"][hashStr(c.co||"")%5]:"mono"; mono=(c.co||"?").charAt(0);
    coName=c.co||c.org; coEn=ownEn(c.co||""); titleEn=EN_OWN[c.job][st]||"CEO"; title=(CARD_OWN_TITLE[c.job]||CARD_OWN_TITLE.dev)[st]||title;
    if(st===1) tagline="직접 인쇄한 명함";
    cls="own s"+st;
  } else if(c.track==="career"){
    const b=BRAND[c.co]||{tpl:"corp",c:"#16213b",mark:"mono",en:(c.co||"").toUpperCase()};
    tpl=st>=6?"lux":b.tpl; color=b.c; mark=b.mark; coName=c.co; coEn=b.en; tagline=b.tag; titleEn=(EN_TITLE[c.job]||EN_TITLE.dev)[st]||""; title=(CARD_TITLE[c.job]||CARD_TITLE.dev)[st]||title;
    dept=st>=6?"":st===5?HQ[c.job][0]:role[1]; cls="s"+st;
    if(st===1) extra=`<span class="bc-tag">${c.job==="cook"?"견습":"수습"}</span>`;
  } else if(!c.track){ tpl="home"; }
  const email=`E. ${rrWord(nm.slice(1)).toLowerCase()||"me"}.${(SUR[nm.charAt(0)]||"").toLowerCase()}@${(coEn||"mail").toLowerCase().replace(/[^a-z]/g,"")}.example`;
  const titleLine=st===4&&c.track==="career"&&c.job!=="cook"?`${escC(dept)} 팀장`:escC(title);
  const body=`<div class="bc-logo">${markSvg(mark,tpl==="lux"?"url(#gold)":tpl==="tech"||tpl==="block"?(tpl==="block"?"#fff":color):color,tpl==="block"?color:tpl==="tech"?"#12151c":tpl==="lux"?"#141414":"#fff",escC(mono))}<span class="bc-co">${escC(coName)}</span>${coEn?`<span class="bc-coen">${escC(coEn)}</span>`:""}</div>
    <div class="bc-who">${dept&&!(st===4&&c.job!=="cook")?`<span class="bc-dept">${escC(dept)}</span>`:""}<b class="bc-name">${escC(nm)}</b><span class="bc-title">${titleLine}</span>${st>1||c.track!=="career"?`<span class="bc-en">${escC(en)}${titleEn?", "+escC(titleEn):""}</span>`:""}</div>
    <div class="bc-contact">${phone}<br>${escC(email)}${tagline?`<br><i>${escC(tagline)}</i>`:""}</div>${extra}`;
  return wrap(tpl,color,body,cls);
  function wrap(t,col,inner,k){
    const back=opt.back?`<div class="bc bc-back t-${t} ${k}" style="--b:${col};--w:${w}px" aria-hidden="true"><div class="bk-mark">${t==="none"||t==="student"?"":markSvg(mark,"#fff",col,escC(mono))}</div><div class="bk-en"><b>${escC(en)}</b><span>${escC(titleEn||"")}</span><span>${escC(coEn||"")}</span></div></div>`:"";
    const gold=t==="lux"?`<svg width="0" height="0" style="position:absolute"><defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e27a"/><stop offset=".5" stop-color="#b8860b"/><stop offset="1" stop-color="#f3d36b"/></linearGradient></defs></svg>`:"";
    const front=`<div class="bc t-${t} ${k} ${opt.cls||""}" style="--b:${col};--w:${w}px" role="img" aria-label="${escC(nm)}의 명함: ${escC(title)}, ${escC(coName.replace(/<[^>]+>/g,""))}">${gold}${inner}</div>`;
    return opt.back?`<div class="bc-flip ${opt.flipped?"flipped":""}" style="--w:${w}px">${front}${back}</div>`:front;
  }
}

function cardTitleOf(s){
  if(s.track==="career") return (CARD_TITLE[s.job]||CARD_TITLE.dev)[s.stage]||titleOf(s);
  if(s.track==="founder") return (CARD_OWN_TITLE[s.job]||CARD_OWN_TITLE.dev)[s.stage]||titleOf(s);
  return titleOf(s);
}
