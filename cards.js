"use strict";
const escC=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* ============ 명함: 회사, 직무, 직급마다 다른 실물 명함 ============ */
const BRAND={
  "루나게임즈":{tpl:"tech",c:"#8f7bff",mark:"moon",en:"LUNA GAMES",tag:"play after dark"},
  "픽셀원스":{tpl:"block",c:"#e0457b",mark:"pixel",en:"PIXEL ONCE",tag:""},
  "스톰엔진":{tpl:"corp",c:"#1f7ae0",mark:"bolt",en:"STORM ENGINE",tag:""},
  "두더지스튜디오":{tpl:"kraft",c:"#6b4a2b",mark:"mole",en:"MOLE STUDIO",tag:""},
  "새벽세시":{tpl:"tech",c:"#ff7a59",mark:"pad",en:"3AM GAMES",tag:"made at 3 a.m."},
  "종이비행기게임즈":{tpl:"classic",c:"#2b8f9e",mark:"plane",en:"PAPER PLANE GAMES",tag:""},
  "대한정공":{tpl:"corp",c:"#12408a",mark:"gear",en:"DAEHAN PRECISION",tag:""},
  "누리중공업":{tpl:"block",c:"#c8371f",mark:"ibeam",en:"NURI HEAVY INDUSTRIES",tag:""},
  "한길모터스":{tpl:"classic",c:"#20262e",mark:"wheel",en:"HANGIL MOTORS",tag:""},
  "성실기계":{tpl:"home",c:"#44607c",mark:"gear",en:"SEONGSIL MACHINERY",tag:"since 1988"},
  "동방정밀":{tpl:"corp",c:"#0f7f6b",mark:"hex",en:"DONGBANG PRECISION",tag:""},
  "우진금속":{tpl:"block",c:"#55606e",mark:"corner",en:"WOOJIN METAL",tag:""},
  "바른은행":{tpl:"corp",c:"#0a5fb4",mark:"pillar",en:"BARUN BANK",tag:""},
  "동해금융":{tpl:"classic",c:"#0d5c63",mark:"wave",en:"DONGHAE FINANCIAL",tag:""},
  "새한은행":{tpl:"block",c:"#1e8a4c",mark:"sprout",en:"SAEHAN BANK",tag:""},
  "햇살저축은행":{tpl:"block",c:"#e8960c",mark:"sun",en:"HAETSAL SAVINGS BANK",tag:""},
  "마을신협":{tpl:"kraft",c:"#2c6e49",mark:"roof",en:"MAEUL CREDIT UNION",tag:""},
  "든든캐피탈":{tpl:"corp",c:"#5b3fa0",mark:"shield",en:"DEUNDEUN CAPITAL",tag:""},
  "새빛대학병원":{tpl:"corp",c:"#0b7cc1",mark:"cross",en:"SAEBIT UNIVERSITY HOSPITAL",tag:""},
  "한마음의료원":{tpl:"classic",c:"#b23a48",mark:"heart",en:"HANMAEUM MEDICAL CENTER",tag:""},
  "중앙메디컬센터":{tpl:"block",c:"#0f8f8f",mark:"cross",en:"JUNGANG MEDICAL CENTER",tag:""},
  "동네연합의원":{tpl:"home",c:"#3c8d5a",mark:"cross",en:"DONGNE CLINIC",tag:"평일 야간 진료"},
  "튼튼병원":{tpl:"block",c:"#f08a24",mark:"shield",en:"TEUNTEUN HOSPITAL",tag:""},
  "우리가족의원":{tpl:"kraft",c:"#a6523a",mark:"heart",en:"OUR FAMILY CLINIC",tag:""},
  "으뜸에듀":{tpl:"block",c:"#d62839",mark:"star",en:"EUDDEUM EDU",tag:""},
  "정상학원":{tpl:"corp",c:"#23408e",mark:"mount",en:"JEONGSANG ACADEMY",tag:""},
  "하늘교육":{tpl:"classic",c:"#2a7fbf",mark:"cap",en:"HANEUL EDUCATION",tag:""},
  "샛별학원":{tpl:"block",c:"#6a4fd8",mark:"star",en:"SAETBYEOL ACADEMY",tag:""},
  "공부습관학원":{tpl:"corp",c:"#1f9d76",mark:"book",en:"STUDY HABIT ACADEMY",tag:""},
  "동네보습학원":{tpl:"home",c:"#7a5c3e",mark:"pencil",en:"DONGNE ACADEMY",tag:"초중등 전 과목"},
  "가온유통":{tpl:"corp",c:"#e2531d",mark:"box",en:"GAON RETAIL",tag:""},
  "한결리테일":{tpl:"block",c:"#11806a",mark:"tag",en:"HANGYEOL RETAIL",tag:""},
  "세진상사":{tpl:"classic",c:"#27364f",mark:"ring",en:"SEJIN TRADING",tag:""},
  "오늘마켓":{tpl:"block",c:"#ff5a7a",mark:"cart",en:"ONEUL MARKET",tag:"오늘 주문, 오늘 도착"},
  "동네유통":{tpl:"kraft",c:"#7b4f2c",mark:"box",en:"DONGNE DISTRIBUTION",tag:""},
  "바로물산":{tpl:"corp",c:"#3567d6",mark:"arrow",en:"BARO TRADING",tag:""},
  "태산건설":{tpl:"corp",c:"#0e4c92",mark:"mount",en:"TAESAN E&C",tag:""},
  "한솔이앤씨":{tpl:"block",c:"#1d8348",mark:"crane",en:"HANSOL E&C",tag:""},
  "대륙건설":{tpl:"classic",c:"#7a3b12",mark:"ibeam",en:"DAERYUK CONSTRUCTION",tag:""},
  "믿음건축":{tpl:"kraft",c:"#5d4a36",mark:"brick",en:"MIDEUM BUILDERS",tag:""},
  "성실시공":{tpl:"home",c:"#d98a00",mark:"helmet",en:"SEONGSIL BUILD",tag:"견적 무료"},
  "우리집건설":{tpl:"block",c:"#c94f2e",mark:"roof",en:"OUR HOUSE CONSTRUCTION",tag:""},
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
const TEAMLEAD={dev:1,office:1,game:1,mech:1};
const TRAINEE={cook:"견습",doctor:"수련",build:"신입",tutor:"보조",bank:"수습",sales:"신입"};
const FREE_MOTTO={dev:"> 문제를 코드로 바꿉니다_",cook:"출장 요리, 메뉴 개발, 쿠킹 클래스",office:"전략, 조직, 숫자를 정리합니다",game:"기획부터 출시까지 함께합니다",mech:"설계, 해석, 시제품 제작",bank:"자산 관리와 은퇴 설계 상담",doctor:"야간, 주말 대진 가능",tutor:"수학 전문, 출강과 교재 집필",sales:"판로 개척, 입점 대행",build:"목공, 타일, 방수, 견적 무료"};
const ROLES={
  game:[["클라이언트","클라이언트팀","Client"],["기획","게임디자인팀","Game Design"],["아트","아트팀","Art"]],
  mech:[["설계","설계팀","Design"],["생산","생산기술팀","Production"],["품질","품질관리팀","Quality"]],
  bank:[["기업","기업금융부","Corporate Banking"],["개인","개인금융부","Retail Banking"],["외환","외환사업부","FX"]],
  doctor:[["내과","내과","Internal Medicine"],["외과","외과","Surgery"],["소아과","소아청소년과","Pediatrics"]],
  tutor:[["수학","수학과","Math"],["영어","영어과","English"],["국어","국어과","Korean"]],
  sales:[["법인","법인영업팀","B2B Sales"],["리테일","리테일영업팀","Retail Sales"],["해외","해외영업팀","Global Sales"]],
  build:[["골조","골조공사팀","Structure"],["목공","목공팀","Carpentry"],["전기","전기설비팀","Electrical"]],
  dev:[["백엔드","플랫폼개발팀","Platform"],["프론트엔드","서비스개발팀","Web Service"],["데이터","데이터팀","Data"]],
  cook:[["한식","한식 주방","Korean Kitchen"],["양식","양식 주방","Western Kitchen"],["제과","페이스트리","Pastry"]],
  office:[["기획","전략기획팀","Strategy"],["재무","재무팀","Finance"],["영업","영업1팀","Sales"]]
};
const HQ={game:["개발본부",""],mech:["생산본부",""],bank:["영업본부",""],doctor:["진료부",""],tutor:["교육본부",""],sales:["영업본부",""],build:["공사본부",""],dev:["기술본부","Technology Division"],cook:["조리본부","Culinary Division"],office:["경영본부","Management Division"]};
const EN_TITLE={
  game:["","QA Tester","Junior Developer","Senior Developer","Lead Developer","Game Director","Chief Executive Officer"],
  mech:["","Trainee Engineer","Engineer","Senior Engineer","Principal Engineer","Plant Manager","Chief Executive Officer"],
  bank:["","Trainee","Teller","Assistant Manager","Branch Manager","Division Head","President"],
  doctor:["","Intern, M.D.","Resident, M.D.","Specialist, M.D.","Department Chief, M.D.","Hospital Director, M.D.","Chief Medical Officer"],
  tutor:["","Teaching Assistant","Instructor","Senior Instructor","Lead Instructor","Vice Director","Chief Executive Officer"],
  sales:["","Sales Associate","Senior Associate","Sales Manager","Branch Manager","Head of Sales","Chief Executive Officer"],
  build:["","Apprentice","Craftsman","Foreman","Site Manager","Head of Construction","Chief Executive Officer"],
  dev:["","Intern Developer","Junior Developer","Senior Developer","Team Lead","Chief Technology Officer","Chief Executive Officer"],
  cook:["","Commis","Line Cook","Sous Chef","Head Chef","Executive Chef","Chief Executive Officer"],
  office:["","Associate","Assistant Manager","Manager","General Manager","Executive Director","President & CEO"]
};
const EN_OWN={game:["","Indie Developer","Founder","Studio Head","CEO","CEO","Chairman"],mech:["","Owner","Owner","Founder & CEO","CEO","CEO","Chairman"],bank:["","Adviser","Founder","Founder & CEO","CEO","CEO","Chairman"],doctor:["","Director, M.D.","Director, M.D.","Hospital Director","Chairman of the Board","Chairman of the Board","Chairman of the Foundation"],tutor:["","Director","Director","Founder & CEO","CEO","CEO","Chairman"],sales:["","Seller","Founder","Founder & CEO","CEO","CEO","Chairman"],build:["","Builder","Owner","Founder & CEO","CEO","CEO","Chairman"],dev:["","Indie Developer","Founder","Founder & CEO","CEO","CEO","Chairman"],cook:["","Owner Chef","Owner Chef","Owner & CEO","CEO","CEO","Chairman"],office:["","Owner","Founder","Founder & CEO","CEO","CEO","Chairman"]};
const EN_FREE={game:"Freelance Game Developer",mech:"Freelance Design Engineer",bank:"Independent Financial Planner",doctor:"Locum Physician",tutor:"Freelance Instructor",sales:"Sales Agent",build:"Freelance Builder",dev:"Freelance Developer",cook:"Freelance Chef",office:"Independent Consultant"};
const CARD_TITLE={game:["","QA 테스터","주니어 개발자","시니어 개발자","리드 개발자","총괄 디렉터","대표이사"],mech:["","수습 엔지니어","엔지니어","선임 엔지니어","책임 엔지니어","공장장","대표이사"],bank:["","수습 행원","행원","대리","지점장","본부장","은행장"],doctor:["","인턴","레지던트","전문의","진료과장","병원장","의료원장"],tutor:["","보조 강사","강사","전임 강사","대표 강사","부원장","대표이사"],sales:["","영업 사원","주임","과장","지점장","영업 본부장","대표이사"],build:["","현장 기사","기능공","반장","현장 소장","공사 본부장","대표이사"],dev:["","수습 개발자","주니어 개발자","시니어 개발자","개발 팀장","기술 이사","대표이사"],cook:["","조리사","라인 쿡","수셰프","헤드 셰프","총괄 셰프","대표이사"],office:["","사원","대리","과장","부장","상무이사","대표이사 사장"]};
const CARD_OWN_TITLE={game:["","대표 개발자","대표","대표","대표이사","대표이사","회장"],mech:["","대표","사장","대표이사","대표이사","대표이사","회장"],bank:["","대표","대표","대표이사","대표이사","대표이사","회장"],doctor:["","원장","원장","병원장","이사장","이사장","이사장"],tutor:["","원장","원장","대표이사","대표이사","대표이사","회장"],sales:["","대표","대표","대표이사","대표이사","대표이사","회장"],build:["","대표","대표","대표이사","대표이사","대표이사","회장"],dev:["","대표 개발자","대표","대표이사","대표이사","대표이사","회장"],cook:["","사장 겸 셰프","오너 셰프","대표이사","대표이사","대표이사","회장"],office:["","대표","대표","대표이사","대표이사","대표이사","회장"]};
const MINE_EN={"게임즈":"Games","스튜디오":"Studio","인터랙티브":"Interactive","정밀":"Precision","기계":"Machinery","자산운용":"Asset","파트너스":"Partners","인베스트":"Invest","의원":"Clinic","클리닉":"Clinic","메디컬":"Medical","에듀":"Edu","학원":"Academy","러닝":"Learning","마켓":"Market","유통":"Retail","트레이딩":"Trading","건설":"Construction","시공":"Build","이앤씨":"E&C","랩스":"Labs","소프트":"Soft","테크":"Tech","식당":"Sikdang","키친":"Kitchen","집":"House","컴퍼니":"Company","상사":"Trading","홀딩스":"Holdings"};
function ownEn(co){ if(co==="부모님 가게") return "FAMILY SHOP"; for(const k in MINE_EN) if(co.endsWith(k)) return (cap(rrWord(co.slice(0,-k.length)))+" "+MINE_EN[k]).toUpperCase(); return rrWord(co.replace(/\s/g,"")).toUpperCase(); }
const OWN_COLORS=["#7d5cff","#e0455f","#0f8b8d","#d9822b","#3a6ff0","#2f9e5b","#b04fd1"];
const OWN_TPL={game:["","home","tech","tech","block","block","lux"],mech:["","home","corp","corp","block","block","lux"],bank:["","home","classic","classic","classic","classic","lux"],doctor:["","corp","corp","corp","classic","classic","lux"],tutor:["","home","block","block","block","block","lux"],sales:["","home","corp","corp","block","block","lux"],build:["","home","kraft","kraft","block","block","lux"],dev:["","home","tech","tech","block","block","lux"],cook:["","home","kraft","kraft","block","block","lux"],office:["","home","corp","corp","classic","classic","lux"]};

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
    case "cross": b=`<rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="${c}"/><path d="M12 7v10M7 12h10" stroke="${P}" stroke-width="3.2" stroke-linecap="round"/>`; break;
    case "heart": b=`<path d="M12 21C5 16 2.5 12.5 2.5 8.8A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 9.5 2.2c0 3.7-2.5 7.2-9.5 12.2z" fill="${c}"/><path d="M6 12h3l1.5-3 2.5 6 1.5-3h3.5" fill="none" stroke="${P}" stroke-width="1.6" stroke-linejoin="round"/>`; break;
    case "pad": b=`<rect x="2" y="7" width="20" height="11" rx="5.5" fill="${c}"/><path d="M7.5 10.5v4M5.5 12.5h4" stroke="${P}" stroke-width="1.6" stroke-linecap="round"/><circle cx="15.5" cy="11.2" r="1.3" fill="${P}"/><circle cx="18" cy="13.8" r="1.3" fill="${P}"/>`; break;
    case "pixel": b=`<g fill="${c}"><rect x="3" y="3" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/></g>`; break;
    case "bolt": b=`<path d="M13.5 2L4 13.5h6.5L9.5 22 20 9.5h-6.5z" fill="${c}"/>`; break;
    case "moon": b=`<path d="M20 14.5A9 9 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="${c}"/><circle cx="17" cy="6" r="1.3" fill="${c}"/>`; break;
    case "plane": b=`<path d="M2.5 11L21.5 3l-6 18-3.5-7.5z" fill="${c}"/><path d="M12 13.5L21.5 3" stroke="${P}" stroke-width="1.2"/>`; break;
    case "mole": b=`<path d="M3 20a9 9 0 0 1 18 0z" fill="${c}"/><circle cx="9" cy="15" r="1.2" fill="${P}"/><circle cx="15" cy="15" r="1.2" fill="${P}"/><ellipse cx="12" cy="17.6" rx="1.6" ry="1.1" fill="${P}"/><rect x="1.5" y="20" width="21" height="2" fill="${c}"/>`; break;
    case "hex": b=`<path d="M12 2l8.7 5v10L12 22l-8.7-5V7z" fill="${c}"/><circle cx="12" cy="12" r="3.4" fill="${P}"/>`; break;
    case "ibeam": b=`<path d="M4 3h16v4h-6v10h6v4H4v-4h6V7H4z" fill="${c}"/>`; break;
    case "wheel": b=`<circle cx="12" cy="12" r="9" fill="none" stroke="${c}" stroke-width="3.2"/><circle cx="12" cy="12" r="2.4" fill="${c}"/><path d="M12 3v6M12 15v6M3 12h6M15 12h6" stroke="${c}" stroke-width="1.8"/>`; break;
    case "pillar": b=`<path d="M12 2l10 5.5H2z" fill="${c}"/><g fill="${c}"><rect x="4" y="9" width="3" height="9"/><rect x="10.5" y="9" width="3" height="9"/><rect x="17" y="9" width="3" height="9"/><rect x="2" y="19" width="20" height="3"/></g>`; break;
    case "wave": b=`<circle cx="12" cy="12" r="10" fill="${c}"/><path d="M4.5 13c2.5-3.5 5-3.5 7.5 0s5 3.5 7.5 0" fill="none" stroke="${P}" stroke-width="2.2" stroke-linecap="round"/>`; break;
    case "coin": b=`<circle cx="12" cy="12" r="9.5" fill="none" stroke="${c}" stroke-width="2.4"/><path d="M8 8l2 8 2-6 2 6 2-8M7 11.5h10" fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round"/>`; break;
    case "shield": b=`<path d="M12 2l8.5 3v6.5c0 5-3.6 8.6-8.5 10.5-4.9-1.9-8.5-5.5-8.5-10.5V5z" fill="${c}"/><path d="M8 12l3 3 5-6" fill="none" stroke="${P}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`; break;
    case "book": b=`<path d="M2.5 5c3.5-1.5 6.5-1.2 9.5.8 3-2 6-2.3 9.5-.8v13.5c-3.5-1.4-6.5-1.1-9.5.9-3-2-6-2.3-9.5-.9z" fill="${c}"/><path d="M12 5.8v13.6" stroke="${P}" stroke-width="1.4"/>`; break;
    case "pencil": b=`<path d="M4 20l1.2-5.2L16.5 3.5l4 4L9.2 18.8z" fill="${c}"/><path d="M14.2 5.8l4 4" stroke="${P}" stroke-width="1.4"/>`; break;
    case "cap": b=`<path d="M12 4L1.5 9.5 12 15l10.5-5.5z" fill="${c}"/><path d="M6 12.5V17c3.5 2.6 8.5 2.6 12 0v-4.5" fill="none" stroke="${c}" stroke-width="2.2"/>`; break;
    case "cart": b=`<path d="M2 4h3.2l2.3 10.5h10.2L20 7H7" fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="9" cy="19" r="1.9" fill="${c}"/><circle cx="17" cy="19" r="1.9" fill="${c}"/>`; break;
    case "box": b=`<path d="M12 2l9 4.5v11L12 22l-9-4.500v-11z" fill="${c}"/><path d="M3 6.5l9 4.5 9-4.5M12 11v11" fill="none" stroke="${P}" stroke-width="1.5"/>`; break;
    case "tag": b=`<path d="M3 3h9l9 9-9 9-9-9z" fill="${c}"/><circle cx="8" cy="8" r="2" fill="${P}"/>`; break;
    case "mount": b=`<path d="M1.5 20L9 6l4 7 2.5-4L22.5 20z" fill="${c}"/>`; break;
    case "crane": b=`<path d="M6 22V4h3v18M6 4l14 3v2.500H9M17 9.500V14" fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/><rect x="15" y="14" width="4" height="3.5" fill="${c}"/><rect x="3" y="20" width="9" height="2.5" fill="${c}"/>`; break;
    case "brick": b=`<g fill="${c}"><rect x="2" y="4" width="9" height="4.6"/><rect x="13" y="4" width="9" height="4.6"/><rect x="2" y="15.4" width="9" height="4.6"/><rect x="13" y="15.4" width="9" height="4.6"/><rect x="7.5" y="9.7" width="9" height="4.6"/><rect x="2" y="9.7" width="3.5" height="4.6"/><rect x="18.5" y="9.7" width="3.5" height="4.6"/></g>`; break;
    case "helmet": b=`<path d="M3.5 16a8.5 8.5 0 0 1 17 0z" fill="${c}"/><rect x="2" y="16" width="20" height="3.2" rx="1.2" fill="${c}"/><rect x="10.5" y="5.5" width="3" height="7" fill="${P}" opacity=".85"/>`; break;
    default: b=`<circle cx="12" cy="12" r="10.5" fill="${c}"/><text x="12" y="16.3" text-anchor="middle" font-size="12" font-weight="700" fill="${P}" font-family="IBM Plex Sans KR,sans-serif">${initial||"?"}</text>`;
  }
  return `<svg class="bc-mark" viewBox="0 0 24 24" aria-hidden="true">${b}</svg>`;
}

/* 지금 상태에서 명함 정보 */
function cardInfoOf(s){ const base={name:s.name,age:s.age,title:titleOf(s),org:orgOf(s),job:s.job,track:s.track,stage:s.stage,co:s.company,tier:s.track==="career"?(s.companyMult>=1.2?"big":"small"):s.track==="founder"?"own":"",edu:s.edu,ghost:s.track==="career"&&!!s.company&&s.company===s.ghostCo}; const l=s.cards[s.cards.length-1]; return l&&l.title===base.title&&l.org===base.org?Object.assign({},l,{name:s.name,age:s.age}):Object.assign(base,{year:yearOf(s)}); }
function cardKey(c){
  if(!c.track) return "old|"+c.title+"|"+c.org;
  if(c.track==="career"&&c.ghost) return "gh|"+c.co+"|"+c.stage;
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
/* 10판: 지난 인생의 회사 명함은 도감 433종과 따로 센다 */
function dexCount(bc){ return Object.keys(bc).filter(k=>k.indexOf("gh|")&&k.indexOf("era|")&&k.indexOf("rare|")).length; }
/* 11판: 시대 양식과 드문 변형 */
function eraCount(bc){ return Object.keys(bc).filter(k=>!k.indexOf("era|")&&k.indexOf("era|gh|")).length; }
function eraOf(bc,k){ let n=0; for(const e of ["e80","e90","e00","e10","e20"]) if(bc["era|"+k+"|"+e]) n++; return n; }
const RARE=[["pen","펜 정정","승진하고 받은 명함에 옛 직함을 펜으로 고쳤다"],["typo","오타","이름 한 글자가 틀려 스티커를 붙였다"],["coffee","커피 자국","지친 해에 받은 명함에 컵 자국이 남았다"],["nick","별명","이름 아래 별명을 누가 적어 놓았다"],["abroad","해외 지사","해외 근무 때 받은 영문 명함"]];
function ghostDex(bc){ const g={}; for(const k in bc){ if(k.indexOf("gh|")) continue; const p=k.split("|"); (g[p[1]]=g[p[1]]||{})[p[2]]=1; } return g; }

/* ---- 11판: 시대 양식, 신분증, 드문 변형 ---- */
function cardEra(y){ if(!y) return "e10"; return y<1990?"e80":y<2000?"e90":y<2010?"e00":y<2020?"e10":"e20"; }
const ERA_NAME={e80:"활판",e90:"PC 통신",e00:"닷컴",e10:"모바일",e20:"미니멀"};
const HANJA={"김":"金","이":"李","박":"朴","최":"崔","정":"鄭","강":"姜","조":"趙","윤":"尹","장":"張","임":"林","한":"韓","오":"吳"};
const BADGE={game:[1,2,"lanyard"],doctor:[1,3,"gown"],build:[1,2,"site"],cook:[1,2,"apron"],tutor:[1,3,"tutor"],bank:[1,2,"desk"]};
function qrSvg(seed){ let r=""; let x=seed>>>0; for(let i=0;i<9;i++) for(let j=0;j<9;j++){ x=(x*1103515245+12345)>>>0; const fin=(i<3&&j<3)||(i<3&&j>5)||(i>5&&j<3); if(fin?((i%3!==1||j%3!==1)&&!(i%3===1&&j%3===1)):(x>>16)&1) r+=`<rect x="${j}" y="${i}" width="1" height="1"/>`; } return `<svg class="bc-qr" viewBox="-1 -1 11 11" aria-hidden="true"><rect x="-1" y="-1" width="11" height="11" fill="#fff"/><g fill="#111">${r}</g></svg>`; }
function eraContact(era,h,nm,coEn,coName){
  const id=(rrWord(nm.slice(1)).toLowerCase()||"me"), dom=(coEn||"mail").toLowerCase().replace(/[^a-z]/g,"")||"mail", d4=n=>String(1000+(h>>n)%9000);
  if(era==="e80") return `TEL. (02) ${700+h%90}-${d4(3)} (交換 ${100+h%800})<br>${escC(coName||"")} 本社`;
  if(era==="e90") return `직통 (02) 3${String(h%900+100)}-${d4(2)}<br>삐삐 01${h%2?2:5}-${String(200+h%700)}-${d4(4)}<br>하이텔 ${id}${h%90}`;
  if(era==="e00") return `H.P 01${[1,6,7,9][h%4]}-${String(200+h%700)}-${d4(5)}<br>E-mail ${id}@${dom}.co.kr<br>www.${dom}.co.kr`;
  if(era==="e20") return `${id}@${dom}.com<br>@${id}.${(SUR[nm.charAt(0)]||"k").toLowerCase()}`;
  return null;
}
function badgeHtml(c,kind,nm,h,job,title,color,coName,wrap){
  const photo=`<div class="bd-photo"><svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4.5" fill="currentColor"/><path d="M3 23c0-5 4-8 9-8s9 3 9 8z" fill="currentColor"/></svg></div>`;
  const role=(ROLES[c.job]||ROLES.dev)[hashStr(nm+c.job)%3];
  if(kind==="lanyard") return wrap("badge b-lanyard",color,`<div class="bd-strap"></div><div class="bd-hole"></div>${photo}<div class="bd-who"><span class="bd-co">${escC(coName)}</span><b class="bd-name">${escC(nm)}</b><span class="bd-role">${escC(role[1])} · ${escC(title)}</span></div><div class="bd-bar"></div><span class="bd-staff">STAFF</span>`,"");
  if(kind==="gown") return wrap("badge b-gown",color,`<div class="bd-top"><span>${escC(coName)}</span></div><div class="bd-who"><b class="bd-name">${escC(nm)}</b><span class="bd-role">${escC(role[1])} ${escC(title)}</span><span class="bd-lic">면허 제 ${String(10000+h%89999)} 호</span></div>`,"");
  if(kind==="site") return wrap("badge b-site",color,`<div class="bd-in"><span class="bd-big">출입증</span><span class="bd-co">${escC(coName)} ${escC(String(1+h%7))}공구</span><b class="bd-name">${escC(nm)}</b><span class="bd-role">${escC(title)} · 혈액형 Rh+ ${"ABO"[h%3]}형</span><span class="bd-sos">비상 010-●●●●-${String(1000+h%9000)}</span><svg class="bd-hat" viewBox="0 0 24 24"><path d="M3.5 16a8.5 8.5 0 0 1 17 0z" fill="#ffd400"/><rect x="2" y="16" width="20" height="3.2" rx="1.2" fill="#ffd400"/><rect x="10.5" y="5.5" width="3" height="7" fill="#e0a800"/></svg></div>`,"");
  if(kind==="apron") return wrap("badge b-apron",color,`<div class="bd-patch"><b class="bd-name">${escC(nm)}</b><span class="bd-role">${escC(["찬 파트","라인","디저트","그릴"][h%4])} · ${escC(title)}</span></div><span class="bd-co">${escC(coName)}</span>`,"");
  if(kind==="tutor") return wrap("badge b-tutor",color,`${photo}<div class="bd-who"><span class="bd-co">${escC(coName)}</span><b class="bd-name">${escC(nm)} <small>${escC(["국어","영어","수학","과학","사회"][h%5])}</small></b><span class="bd-quote">"${escC(["포기만 안 하면 됩니다","개념부터 다시","오늘 푼 문제가 시험에 나온다","질문은 언제든"][h%4])}"</span><span class="bd-role">${escC(title)}</span></div>`,"");
  return wrap("badge b-desk",color,`<div class="bd-plate"><span class="bd-co">${escC(coName)} · 창구 ${1+h%9}번</span><b class="bd-name">${escC(nm)}</b><span class="bd-role">${escC(title)}</span></div>`,"");
}

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
      <div class="bc-who"><b class="bc-name">${escC(nm)}</b><span class="bc-title">${uni?((job.needUniv?"의과대학":job.name.split(/[· ]/)[0]+" 계열")):"재학생"}</span></div>
      <div class="bc-contact">학번 ${String(h%90000+10000)}<br>${c.age}세</div>`,"");
  }
  if(c.track==="rest"||!c.track&&c.org==="소속 없음"){
    return wrap("none","#16213b",`<p class="bc-hand">명함이 없다.</p><p class="bc-hand small">${escC(nm)}, ${c.age}세. 구직 중.</p><p class="bc-hand tiny">연락은 010-●●●●-${String(1000+h%9000)}로</p>`,"");
  }
  if(c.track==="free"){
    tpl="free"; color=OWN_COLORS[h%OWN_COLORS.length]; title=job.free; titleEn=EN_FREE[c.job]||"Freelancer"; coName=nm;
    const motto=FREE_MOTTO[c.job]||"";
    return wrap(tpl,color,`<div class="bc-side"><span class="bc-mono">${escC(mono)}</span></div>
      <div class="bc-who"><b class="bc-name">${escC(nm)}</b><span class="bc-title">${escC(title)}</span><span class="bc-en">${escC(en)}, ${escC(titleEn)}</span></div>
      <div class="bc-motto">${escC(motto)}</div><div class="bc-contact">${eraContact(cardEra(c.year),h,nm,"hello","")||`${phone}<br>E. hello@${escC(rrWord(nm.slice(1)).toLowerCase()||"me")}.example`}</div>`,cardEra(c.year));
  }
  if(c.track==="founder"){
    tpl=OWN_TPL[c.job][st]||"corp"; color=OWN_COLORS[hashStr(c.co||"")%OWN_COLORS.length]; mark=st>=3?["square","ring","star","arcs","sprout"][hashStr(c.co||"")%5]:"mono"; mono=(c.co||"?").charAt(0);
    coName=c.co||c.org; coEn=ownEn(c.co||""); titleEn=EN_OWN[c.job][st]||"CEO"; title=(CARD_OWN_TITLE[c.job]||CARD_OWN_TITLE.dev)[st]||title;
    if(st===1) tagline="직접 인쇄한 명함";
    cls="own s"+st+(st>=6?" co6":"");
  } else if(c.track==="career"){
    const bdg=BADGE[c.job]; if(bdg&&st>=bdg[0]&&st<=bdg[1]&&!opt.noBadge){ const bb=c.ghost?{c:OWN_COLORS[hashStr(c.co||"")%OWN_COLORS.length]}:BRAND[c.co]||{c:"#16213b"}; return badgeHtml(c,bdg[2],nm,h,job,(CARD_TITLE[c.job]||CARD_TITLE.dev)[st]||title,bb.c,c.co,wrap); }
    const b=c.ghost?{tpl:"corp",c:OWN_COLORS[hashStr(c.co||"")%OWN_COLORS.length],mark:["square","ring","star","arcs","sprout"][hashStr(c.co||"")%5],en:ownEn(c.co||""),tag:"지난 인생이 세운 회사"}:BRAND[c.co]||{tpl:"corp",c:"#16213b",mark:"mono",en:(c.co||"").toUpperCase()};
    tpl=st>=6?"lux":b.tpl; color=b.c; mark=b.mark; coName=c.co; coEn=b.en; tagline=b.tag; titleEn=(EN_TITLE[c.job]||EN_TITLE.dev)[st]||""; title=(CARD_TITLE[c.job]||CARD_TITLE.dev)[st]||title;
    dept=st>=6?"":st===5?HQ[c.job][0]:role[1]; cls="s"+st+(st>=6?" co6":"");
    if(st===1) extra=`<span class="bc-tag">${TRAINEE[c.job]||"수습"}</span>`;
  } else if(!c.track){ tpl="home"; }
  const email=`E. ${rrWord(nm.slice(1)).toLowerCase()||"me"}.${(SUR[nm.charAt(0)]||"").toLowerCase()}@${(coEn||"mail").toLowerCase().replace(/[^a-z]/g,"")}.example`;
  const era=cardEra(c.year), ec=eraContact(era,h,nm,coEn,coName);
  let titleLine=st===4&&c.track==="career"&&TEAMLEAD[c.job]?`${escC(dept)} 팀장`:escC(title);
  let shownName=escC(nm);
  if(c.v==="pen"&&c.prev) titleLine=`<s>${escC(c.prev)}</s> <span class="bc-pen">${titleLine}</span>`;
  if(c.v==="typo"&&nm.length>1){ const alt={"준":"쥰","민":"민","서":"셔","우":"유","윤":"융","은":"응","호":"효","연":"얀","나":"냐","린":"림","아":"야","희":"휘","진":"짐"}; const last=nm.charAt(nm.length-1); shownName=escC(nm.slice(0,-1))+`<span class="bc-typo">${alt[last]||last+"̇"}</span>`; extra+=`<span class="bc-sticker">${escC(last)}</span>`; }
  if(era==="e80"&&HANJA[nm.charAt(0)]) shownName+=`<small class="bc-hj">${HANJA[nm.charAt(0)]}</small>`;
  if(c.v==="coffee") extra+=`<svg class="bc-coffee" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="none" stroke="#7a4a1e" stroke-width="3.2" stroke-dasharray="70 8 14 6"/><circle cx="20" cy="20" r="15" fill="#7a4a1e" opacity=".07"/></svg>`;
  if(c.v==="nick"&&c.nick) extra+=`<span class="bc-nick">"${escC(c.nick)}"</span>`;
  if(era==="e10"&&st>=2&&(c.track==="career"||c.track==="founder")&&tpl!=="lux") extra+=qrSvg(h);
  cls+=" "+era+(c.v?" v-"+c.v:"");
  const body=`<div class="bc-logo">${markSvg(mark,tpl==="lux"?"url(#gold)":tpl==="tech"||tpl==="block"?(tpl==="block"?"#fff":color):color,tpl==="block"?color:tpl==="tech"?"#12151c":tpl==="lux"?"#141414":"#fff",escC(mono))}<span class="bc-co">${escC(coName)}</span>${coEn?`<span class="bc-coen">${escC(coEn)}</span>`:""}</div>
    <div class="bc-who">${dept&&!(st===4&&TEAMLEAD[c.job])?`<span class="bc-dept">${escC(dept)}</span>`:""}<b class="bc-name">${shownName}</b><span class="bc-title">${titleLine}</span>${st>1||c.track!=="career"?`<span class="bc-en">${escC(en)}${titleEn?", "+escC(titleEn):""}</span>`:""}</div>
    <div class="bc-contact">${ec||`${phone}<br>${escC(email)}`}${tagline?`<br><i>${escC(tagline)}</i>`:""}</div>${extra}`;
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
