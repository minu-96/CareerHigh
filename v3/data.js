"use strict";
/* ============ 데이터 (웹 버전에서 JSON 파일로 분리) ============ */
const RULES = {
  retireAge:65,
  grade:[["S",40,4,8,3],["A",30,3,5,2],["B",18,2,3,1],["C",8,1,0,0],["D",-999,0,0,-2]],
  promo:[null,
    {pp:4,min:{skill:20}},{pp:7,min:{skill:30}},{pp:10,min:{skill:40,rep:32}},
    {pp:13,min:{skill:45,rep:48,net:50}},{pp:16,min:{skill:50,rep:64,net:70}}],
  promoTO:[0,100,85,65,48,35],
  bizNeed:[null,{net:15},{net:30},{net:45,rep:35},{net:60,rep:52},{net:72,rep:66}],
  salary:[0,3000,4500,6500,9000,15000,30000],
  profitUnit:[0,2000,5000,15000,50000,200000,500000],
  craft:[[30,0],[50,0],[65,1],[78,2],[90,3]],
  fame:[15,35,55,75,88],
  wealth:[5000,30000,100000,300000,700000],
  lifeYears:[5,12,19,26,33]
};
const STAT={skill:"능력",rep:"평판",net:"인맥",fame:"명성",life:"일상",burn:"번아웃",money:"현금",assets:"집·자산",pp:"승진 점수"};
const PATHS={org:"조직",craft:"장인",biz:"창업",fame:"명성",wealth:"자산",life:"삶"};
const PATH_RANKS={
  craft:["견습","숙련","전문가","대가",""],
  fame:["아는 사람은 아는","업계 유명인","단골 강연자","전국구",""],
  wealth:["종잣돈","중산층","자산가","부자","경제적 자유"],
  life:["소소한 행복","단단한 일상","화목한 집","충만한 삶","잘 산 인생"]
};
const ORIGINS=[
  {id:"chaebol",name:"재벌가 막내",w:2,fx:{money:50000,net:20},edu:{univ:6,college:2,work:1},hs:{gen:8,voc:1},desc:"현금 5억, 인맥 +20. 부모님 찬스를 쓸 수 있다."},
  {id:"pro",name:"전문직 집안",w:8,fx:{skill:10,money:5000},edu:{univ:6,college:2,work:1},hs:{gen:8,voc:1},desc:"능력 +10, 현금 5,000만 원."},
  {id:"shop",name:"자영업 집안",w:14,fx:{money:2000},edu:{univ:3,college:3,work:3},hs:{gen:5,voc:4},desc:"현금 2,000만 원. 가업을 이을 기회가 온다."},
  {id:"civil",name:"공무원 집안",w:10,fx:{rep:5,life:5},edu:{univ:5,college:3,work:1},hs:{gen:7,voc:2},desc:"평판 +5, 일상 +5."},
  {id:"office",name:"평범한 회사원 집안",w:26,fx:{},edu:{univ:4,college:3,work:2},hs:{gen:6,voc:3},desc:"보정 없음. 제약도 없다."},
  {id:"working",name:"맞벌이 서민 집안",w:20,fx:{},edu:{univ:3,college:3,work:3},hs:{gen:5,voc:4},desc:"번아웃이 10% 덜 쌓인다."},
  {id:"farm",name:"시골 농가",w:10,fx:{net:-5,life:8},edu:{univ:2,college:3,work:4},hs:{gen:4,voc:5},desc:"인맥 -5, 일상 +8."},
  {id:"poor",name:"형편이 어려운 집",w:10,fx:{money:-1000},edu:{univ:2,college:3,work:5},hs:{gen:4,voc:5},desc:"학자금 빚 1,000만 원. 능력이 10% 빨리 자란다."}
];
const TRAITS_GOOD=[
  {id:"steel",name:"강철 체력",desc:"업무로 쌓이는 번아웃 -25%"},
  {id:"talk",name:"말발",desc:"인맥 행동 효과 +50%"},
  {id:"hands",name:"금손",desc:"능력 성장 +25%"},
  {id:"sense",name:"눈치 백단",desc:"확률 선택지의 성공률이 보인다"},
  {id:"lucky",name:"운빨",desc:"확률 판정 +10%p"},
  {id:"thrift",name:"짠돌이",desc:"저축률 +5%p"}
];
const TRAITS_BAD=[
  {id:"glass",name:"유리 멘탈",desc:"사건으로 쌓이는 번아웃 +50%"},
  {id:"sleepy",name:"아침잠",desc:"가끔 지각해서 성과가 깎인다"},
  {id:"gullible",name:"팔랑귀",desc:"투자 결과가 나빠진다"},
  {id:"blunt",name:"직설 화법",desc:"가끔 말실수로 평판이 깎인다"},
  {id:"workaholic",name:"워커홀릭",desc:"휴식과 일상 행동 효과 -30%"},
  {id:"softie",name:"사람 좋음",desc:"가끔 남의 일을 떠맡는다"}
];
const PERKS=[
  {id:"night",name:"밤샘 체질",desc:"업무 번아웃 -30%"},
  {id:"speaker",name:"발표의 달인",desc:"대외 활동의 명성 +50%"},
  {id:"politics",name:"사내 정치 9단",desc:"승진 경쟁 +15%p"},
  {id:"eye",name:"사람 보는 눈",desc:"사업 이익 +20%"},
  {id:"compound",name:"복리의 마법",desc:"투자 수익 +25%"},
  {id:"lifelong",name:"평생 학습",desc:"능력이 낡지 않는다"},
  {id:"master",name:"장인의 손",desc:"대표작 성공률 +15%p"},
  {id:"calm",name:"칼퇴 선언",desc:"휴식·일상 효과 +40%, 성과 -10%"},
  {id:"mad",name:"마당발",desc:"인맥 행동 효과 +50%"},
  {id:"nerve",name:"강심장",desc:"확률 판정 +8%p"},
  {id:"frugal",name:"짠물 살림",desc:"저축률 +8%p"},
  {id:"multi",name:"멀티태스커",desc:"행동력 +1칸, 매년 번아웃 +6"},
  {id:"family",name:"가정적",desc:"일상 행동 효과 2배"},
  {id:"crisis",name:"위기에 강함",desc:"불황 페널티 없음, 구조조정에서 살아남기 쉽다"},
  {id:"body",name:"몸이 재산",desc:"매년 번아웃 회복 +5"},
  {id:"loyal",name:"한 우물",desc:"한 회사 5년 이상이면 성과 +15%"}
];
const EDU={gen:"일반고",voc:"특성화고",univ:"4년제 대학",college:"전문대"};
const JOBS={
  dev:{name:"소프트웨어 개발",rate:1.2,cost:2000,
    titles:["","수습 개발자","주니어 개발자","시니어 개발자","개발 팀장","기술 이사","테크 기업 대표"],
    ftitles:["","1인 개발자","스타트업 대표","법인 대표","중소 IT기업 대표","중견 IT기업 대표","테크 기업 회장"],
    free:"프리랜서 개발자",peaks:{org:"테크 기업 대표",craft:"기술 명장",biz:"테크 기업 회장",fame:"업계의 얼굴"},
    works:["오픈소스 프레임워크","천만 명이 쓰는 앱의 엔진","업계 표준이 된 라이브러리","모두가 쓰는 개발 도구","새 프로그래밍 언어"],
    big:["네모소프트","한빛테크","오로라랩스"],small:["코드공방","바닐라스튜디오","모서리소프트"],mine:["랩스","소프트","테크"],
    eduW:{univ:3,college:2,voc:2,gen:1},eduBonus:{univ:15,college:8,voc:6,gen:0}},
  cook:{name:"요리·외식",rate:0.75,cost:5000,
    titles:["","주방 막내","라인 쿡","수셰프","헤드 셰프","총괄 셰프","외식 그룹 총괄 대표"],
    ftitles:["","작은 가게 사장","맛집 사장","다점포 사장","프랜차이즈 대표","외식 기업 대표","외식 그룹 회장"],
    free:"프리랜서 셰프",peaks:{org:"외식 그룹 총괄 대표",craft:"별 셋의 셰프",biz:"외식 그룹 회장",fame:"국민 셰프"},
    works:["시그니처 코스","10년 묵힌 장","계절 테이스팅 메뉴","줄 세우는 한 접시","교과서가 된 요리책"],
    big:["호텔 그랑서울","미식당 본점","라메종"],small:["골목식당 온기","동네밥상","한그릇"],mine:["식당","키친","집"],
    eduW:{univ:1,college:3,voc:3,gen:2},eduBonus:{univ:6,college:10,voc:10,gen:2}},
  office:{name:"기업 경영·사무",rate:1.0,cost:3000,
    titles:["","사원","대리","과장","부장","임원","대표이사"],
    ftitles:["","1인 사업자","소규모 팀 대표","법인 대표","중소기업 대표","중견기업 대표","대기업 회장"],
    free:"독립 컨설턴트",peaks:{org:"대기업 대표이사",craft:"전설의 전략가",biz:"대기업 회장",fame:"경영 구루"},
    works:["회사를 살린 회생안","신사업 기획","업계 교과서가 된 보고서","해외 진출 전략","세기의 인수합병"],
    big:["대성그룹","한울물산","미래홀딩스"],small:["새봄상사","다온기획","우리산업"],mine:["컴퍼니","상사","홀딩스"],
    eduW:{univ:3,college:2,voc:1,gen:1},eduBonus:{univ:15,college:8,voc:3,gen:0}}
};
const BOSSES={
  mentor:{name:"멘토형",desc:"매년 능력 +2"},
  credit:{name:"공 가로채기형",desc:"성과 -15%"},
  handsoff:{name:"방임형",desc:"간섭도 도움도 없다"},
  overtime:{name:"야근형",desc:"성과 +10%, 업무 번아웃 +2"}
};
const ERAS=[
  {id:"recession",text:"경기 불황. 채용이 얼어붙고 구조조정 소문이 돈다.",perf:{dev:.8,cook:.8,office:.8}},
  {id:"boom",text:"경기 호황. 어디든 사람이 모자라다.",perf:{dev:1.1,cook:1.1,office:1.1}},
  {id:"tech",text:"신기술 붐. 개발자 몸값이 치솟는다.",perf:{dev:1.25,cook:1,office:1}},
  {id:"food",text:"미식 열풍. 식당마다 줄이 늘어섰다.",perf:{dev:1,cook:1.25,office:1}},
  {id:"bubble",text:"자산 시장 과열. 다들 투자 얘기만 한다.",perf:{dev:1,cook:1,office:1}}
];
const SURNAMES=["김","이","박","최","정","강","조","윤","장","임","한","오"];
const GIVEN=["서연","민준","지우","도윤","하은","준호","수아","현우","예린","태양","소희","건우","유나","재민","다은","시우"];
const A={
  work:["업무","성과 ↑, 번아웃 +8"],bizwork:["사업","회사 성과 ↑, 번아웃 +8"],gig:["일감","수입 ↑, 번아웃 +8"],
  study:["자기계발","능력 ↑, 번아웃 +3"],prep:["취업 준비","능력 ↑, 번아웃 +3"],school:["공부","능력 ↑, 번아웃 +3"],
  network:["인맥","인맥 +5, 평판 +1, 현금 -100만"],fame:["대외 활동","명성 ↑, 회사 성과 -3, 번아웃 +3"],
  craft:["대표작","진행 +1 (4가 되면 도전), 번아웃 +4"],invest:["투자","현금의 25%를 건다"],
  family:["가족·일상","일상 ↑ (높을수록 덜 오른다), 번아웃 -6"],rest:["휴식","번아웃 -15"],
  part:["알바","현금 +300만, 번아웃 +5"],club:["대외활동","인맥 +4, 평판 +2"],friends:["연애·친구","일상 ↑, 번아웃 -6"]
};
const ACTIONS={
  school:[["study","school"],["part","part"],["club","club"],["family","friends"],["rest","rest"]],
  rest:[["study","prep"],["part","part"],["network","network"],["family","family"],["rest","rest"]],
  career:[["work","work"],["study","study"],["network","network"],["fame","fame"],["craft","craft"],["invest","invest"],["family","family"],["rest","rest"]],
  founder:[["work","bizwork"],["study","study"],["network","network"],["fame","fame"],["craft","craft"],["invest","invest"],["family","family"],["rest","rest"]],
  free:[["work","gig"],["study","study"],["network","network"],["fame","fame"],["craft","craft"],["invest","invest"],["family","family"],["rest","rest"]]
};
const WORKING=["career","founder","free"];

/* 이벤트 카드. when의 조건을 모두 만족해야 나온다. */
const CARDS=[
 /* ---- 필수 ---- */
 {id:"after_high",required:true,title:"졸업을 앞두고",text:"담임이 진로 희망서를 나눠 준다. 칸은 하나뿐이다.",choices:[
   {text:"4년제 대학에 간다",hint:"능력 22 이상, 등록금 2,000만 원",require:{skill:22},effects:{money:-2000,do:"go_univ"},result:"합격 통지서가 왔다. 4년이 시작된다."},
   {text:"전문대에 간다",hint:"등록금 1,000만 원",effects:{money:-1000,do:"go_college"},result:"2년 뒤에는 현장에 있을 것이다."},
   {text:"바로 일을 시작한다",effects:{do:"go_work"},result:"교복을 벗자마자 이력서를 쓴다."}]},
 {id:"job_apply",required:true,title:"지원서를 쓴다",text:"{jobname} 분야에서 일하려 한다. 어디에 낼까.",choices:[
   {text:"이름 있는 곳에 지원한다",hint:"붙으면 연봉이 높다",chance:30,chanceFn:"apply",success:{effects:{do:"join_big"},result:"합격. 사원증에 내 이름이 찍혔다."},fail:{effects:{do:"apply_fail"},result:"최종 면접 탈락. 1년을 더 준비한다.",shame:"최종 면접에서 떨어졌다"}},
   {text:"작은 곳에서 시작한다",hint:"확정 합격, 연봉은 낮다",effects:{do:"join_small"},result:"면접 본 날 바로 출근 날짜가 잡혔다."},
   {text:"부모님 찬스를 쓴다",hint:"재벌가 전용, 평판 -8",when:{origin:"chaebol"},effects:{rep:-8,do:"join_big",flag:"nepo"},result:"면접은 없었다. 다들 내가 누구 자식인지 안다.",shame:"낙하산으로 입사했다"},
   {text:"프리랜서로 뛴다",hint:"소속 없이 일감을 받는다",when:{min:{skill:30}},effects:{do:"go_free"},result:"명함에 회사 이름 대신 내 이름을 크게 넣었다."},
   {text:"다른 분야로 방향을 튼다",hint:"지망을 바꾸고 작은 곳에 입사",effects:{do:"switch_job"},result:"계획에 없던 길이다."}]},
 {id:"peak_review",required:true,title:"마지막 한 자리",text:"{peakname} 자리를 두고 표결이 열린다. 후보는 셋이다.",choices:[
   {text:"정면으로 나선다",chance:35,chanceFn:"peak",success:{effects:{do:"peak"},result:"만장일치는 아니었다. 그래도 내 이름이 불렸다."},fail:{effects:{pp:-8},result:"다른 이름이 불렸다. 몇 년 더 기다려야 한다.",shame:"마지막 표결에서 밀렸다"}},
   {text:"인맥을 총동원한다",hint:"인맥 85 이상",require:{net:85},effects:{do:"peak",net:-15},result:"전화 스무 통. 표는 미리 정해져 있었다."},
   {text:"올해는 물러선다",effects:{pp:-3,rep:2},result:"때가 아니라고 판단했다."}]},
 {id:"peak_choice",required:true,title:"정점에서",text:"{lastpeak}. 올라올 곳은 다 올라왔다. 이제 어떻게 할까.",choices:[
   {text:"박수 칠 때 떠난다",effects:{do:"retire_now"},result:"마지막 인사는 짧게 했다."},
   {text:"정년까지 계속한다",hint:"다른 길의 정점도 노릴 수 있다",effects:{},result:"아직 할 일이 남았다."}]},
 {id:"resign",required:true,title:"사직서",text:"서랍 속 봉투를 꺼냈다. 정말 낼까.",choices:[
   {text:"내고 이직을 준비한다",hint:"올해 다시 지원한다",when:{track:["career","free"]},effects:{do:"quit_move"},result:"책상을 비우는 데 20분이 걸렸다."},
   {text:"내고 창업한다",hint:"창업 자금 {cost}",when:{track:["career","free"]},effects:{do:"found"},result:"퇴직금이 곧 자본금이다."},
   {text:"회사를 정리하고 취업한다",hint:"남은 자산을 정리한다",when:{track:"founder"},effects:{do:"close_biz"},result:"간판을 내리던 날, 직원들과 마지막으로 점심을 먹었다."},
   {text:"내고 프리랜서가 된다",hint:"능력 30 이상, 수입은 실력과 명성에 달렸다",when:{track:"career"},require:{skill:30},effects:{do:"go_free"},result:"월요일 아침에 알람이 울리지 않았다."},
   {text:"없던 일로 한다",effects:{},result:"봉투는 서랍으로 돌아갔다."}]},
 {id:"perk",required:true,title:"몸에 밴 것",text:"몇 해를 지나며 한 가지가 손에 익었다. 무엇일까.",choices:[]},
 /* ---- 학창 시절 ---- */
 {id:"exam",when:{track:"school"},w:10,title:"시험 전날 밤",text:"범위는 넓고 밤은 짧다.",choices:[
   {text:"밤을 새운다",effects:{skill:3,burn:6},result:"아침 해를 보며 마지막 장을 넘겼다."},
   {text:"그냥 잔다",effects:{burn:-5},result:"컨디션은 최고였다. 점수는 아니었다."}]},
 {id:"club",when:{track:"school"},once:true,w:8,title:"동아리 권유",text:"선배가 전단지를 내민다. \"우리 분위기 좋아.\"",choices:[
   {text:"가입한다",effects:{net:6,life:5,burn:2},result:"분위기는 정말 좋았다. 일도 많았다."},
   {text:"공부할 시간이 없다",effects:{skill:2},result:"도서관 자리를 지켰다."}]},
 {id:"contest",when:{track:"school",age:[19,24]},w:8,title:"공모전 팀원 모집",text:"상금 300만 원. 마감은 2주 뒤.",choices:[
   {text:"참가한다",check:{stat:"skill",min:24},effects:{burn:5},success:{effects:{rep:5,money:100,resume:"공모전 수상"},result:"장려상. 이력서에 쓸 한 줄이 생겼다."},fail:{effects:{},result:"예선 탈락. 2주가 사라졌다.",shame:"공모전 예선에서 떨어졌다"}},
   {text:"넘긴다",effects:{},result:"다음 기회에."}]},
 {id:"part_boss",when:{track:"school"},w:7,title:"알바 사장님의 부탁",text:"\"이번 달만 주말 풀타임 좀 해 줘. 시급 올려 줄게.\"",choices:[
   {text:"한다",effects:{money:400,burn:7,life:-3},result:"통장은 불었고 주말은 사라졌다."},
   {text:"시험 기간이라고 한다",effects:{skill:1},result:"사장님은 한숨을 쉬었다."}]},
 /* ---- 인생: 20대 ---- */
 {id:"first_love",when:{age:[17,24],noflag:["partner","married"]},once:true,w:9,title:"고백할까",text:"같이 걷는 길이 자꾸 짧게 느껴진다.",choices:[
   {text:"고백한다",chance:50,chanceStat:"life",success:{effects:{life:12,flag:"partner"},result:"\"나도.\" 두 글자였다."},fail:{effects:{life:-6},result:"\"좋은 친구로 지내자.\"",shame:"고백했다가 친구로 남았다"}},
   {text:"말하지 않는다",effects:{},result:"그 길은 여전히 짧다."}]},
 {id:"friend_trip",when:{age:[19,27]},once:true,w:7,title:"배낭여행",text:"친구가 항공권 캡처를 보냈다. \"지금 아니면 못 가.\"",choices:[
   {text:"간다",hint:"현금 -300만 원",effects:{money:-300,life:12,burn:-10,net:2},result:"사진 2천 장과 빈 통장이 남았다."},
   {text:"자격증 공부를 한다",effects:{skill:3,life:-3},result:"친구의 사진에 '좋아요'를 눌렀다."}]},
 {id:"scam_job",when:{age:[19,27]},once:true,w:5,title:"고수익 보장",text:"선배가 카페로 불렀다. \"너니까 알려 주는 거야.\"",choices:[
   {text:"설명회에 간다",chance:20,success:{effects:{money:500},result:"운 좋게 빠져나왔다. 수당도 받았다."},fail:{effects:{money:-600,net:-3},result:"정수기 여섯 대가 집에 왔다.",shame:"다단계에 넘어가 정수기를 여섯 대 샀다"}},
   {text:"커피만 마시고 나온다",effects:{},result:"커피값은 선배가 냈다."}]},
 {id:"first_room",when:{age:[22,30],track:WORKING},once:true,w:8,title:"독립",text:"통근에 왕복 세 시간이 걸린다. 방을 구할까.",choices:[
   {text:"회사 근처 원룸을 구한다",hint:"현금 -1,000만 원",effects:{money:-1000,life:6,burn:-8},result:"처음으로 내 열쇠가 생겼다."},
   {text:"본가에서 버틴다",effects:{burn:6,money:300},result:"지하철에서 서서 자는 법을 익혔다."}]},
 {id:"car",when:{age:[26,40],track:WORKING},once:true,w:6,title:"첫 차",text:"대리점 앞을 세 번째 지나간다.",choices:[
   {text:"새 차를 뽑는다",hint:"현금 -3,000만 원",effects:{money:-3000,life:6,rep:1},result:"새 차 냄새는 석 달 갔다. 할부는 5년 간다."},
   {text:"중고를 산다",hint:"현금 -800만 원",effects:{money:-800,life:3},result:"잘 굴러간다. 그러면 됐다."},
   {text:"계속 걷는다",effects:{burn:1},result:"교통카드를 충전했다."}]},
 {id:"blind_date",when:{age:[25,40],noflag:["partner","married"]},cd:4,w:9,title:"소개팅",text:"\"사람 괜찮아. 이번 주 토요일 어때?\"",choices:[
   {text:"나간다",chance:45,chanceStat:"life",success:{effects:{life:10,flag:"partner"},result:"두 번째 약속을 그 자리에서 잡았다."},fail:{effects:{money:-10},result:"파스타는 맛있었다."}},
   {text:"토요일에도 일한다",effects:{perf:2,life:-4},result:"주선자는 다시 묻지 않았다."}]},
 {id:"propose",when:{flag:"partner",noflag:"married",age:[26,45]},cd:3,w:14,title:"결혼 이야기",text:"\"우리 앞으로 어떻게 할 거야?\"",choices:[
   {text:"결혼한다",hint:"현금 -3,000만 원",effects:{money:-3000,life:15,do:"marry"},result:"축의금을 세다가 날이 샜다."},
   {text:"조금만 더 있다가",chance:65,success:{effects:{life:-3},result:"\"알았어.\" 대답은 짧았다."},fail:{effects:{life:-15,unflag:"partner"},result:"기다리지 않겠다고 했다.",shame:"미루다가 헤어졌다"}},
   {text:"헤어지자고 한다",effects:{life:-10,unflag:"partner"},result:"짐은 상자 두 개였다."}]},
 {id:"wedding",when:{age:[27,36],track:WORKING},once:true,w:6,title:"청첩장 러시",text:"이번 달에만 모바일 청첩장이 다섯 장 왔다.",choices:[
   {text:"다 간다",effects:{money:-500,net:6,life:2},result:"뷔페 메뉴를 외웠다."},
   {text:"가까운 사람만 챙긴다",effects:{money:-200,net:2},result:"적당한 선을 지켰다."},
   {text:"읽지 않는다",effects:{net:-4,life:-2},result:"단체방이 조용해졌다."}]},
 /* ---- 인생: 30~40대 ---- */
 {id:"baby",when:{flag:"married",age:[27,43],maxKids:1},cd:4,w:12,title:"아이",text:"배우자가 말했다. \"우리도 슬슬 생각해 볼까?\"",choices:[
   {text:"낳는다",hint:"5년간 행동력 -1칸, 매년 양육비",effects:{life:12,do:"baby"},result:"3.2kg. 세상에서 제일 작은 손이었다."},
   {text:"아직은 아니다",effects:{life:-3},result:"그 얘기는 다음으로 미뤘다."}]},
 {id:"childcare",when:{timer:"childcare",track:WORKING},cd:3,w:14,title:"어린이집 대기 400번",text:"아이는 아프고, 회의는 9시고, 둘 다 미룰 수 없다.",choices:[
   {text:"도우미를 구한다",hint:"현금 -1,500만 원, 행동력을 되찾는다",effects:{money:-1500,do:"nanny"},result:"이모님이 오셨다. 숨이 쉬어진다."},
   {text:"육아휴직을 쓴다",hint:"1년 쉰다, 승진 점수 -2",when:{track:"career"},effects:{pp:-2,life:14,do:"leave"},result:"아이의 첫걸음을 직접 봤다."},
   {text:"둘이 어떻게든 한다",effects:{burn:8,life:4},result:"교대 근무하듯 살았다."}]},
 {id:"house",when:{age:[28,52],noflag:"house",min:{money:5000}},cd:5,w:10,title:"내 집 마련",text:"부동산 사장님이 말했다. \"지금이 제일 싸요.\" 작년에도 그 말을 했다.",choices:[
   {text:"대출을 끼고 산다",hint:"현금 -5,000만 원, 15년간 매년 800만 원 상환",effects:{money:-5000,life:8,do:"buy_house"},result:"등기부에 내 이름이 올랐다. 은행 이름도 같이."},
   {text:"전세로 더 산다",effects:{},result:"이삿짐 센터 번호는 저장해 뒀다."}]},
 {id:"jeonse",when:{age:[25,45],noflag:["house","scammed"],min:{money:2000}},once:true,w:4,title:"집주인이 전화를 안 받는다",text:"만기가 지났다. 보증금 얘기를 꺼내자 연락이 끊겼다.",choices:[
   {text:"소송을 건다",chance:50,effects:{money:-300,flag:"scammed"},success:{effects:{},result:"2년 걸려 돌려받았다."},fail:{effects:{money:-2500,life:-10},result:"집은 이미 경매에 넘어가 있었다.",shame:"전세 보증금을 떼였다"}},
   {text:"절반만 받고 합의한다",effects:{money:-1500,life:-5,flag:"scammed"},result:"수업료라고 생각하기로 했다."}]},
 {id:"parents_sick",when:{age:[36,56]},once:true,w:9,title:"병원에서 온 전화",text:"어머니가 쓰러지셨다. 간병이 필요하다고 한다.",choices:[
   {text:"직접 돌본다",hint:"3년간 행동력 -1칸",effects:{life:8,do:"care_self"},result:"병원 보호자 침대에서 자는 법을 배웠다."},
   {text:"간병인을 쓴다",hint:"현금 -3,600만 원",effects:{money:-3600,life:-2},result:"주말마다 병원에 갔다."},
   {text:"형제에게 미룬다",effects:{life:-12,net:-3},result:"명절이 불편해졌다.",shame:"부모 간병을 형제에게 떠넘겼다"}]},
 {id:"parent_passing",when:{age:[46,63]},once:true,w:7,title:"부고",text:"새벽에 전화가 왔다. 아버지였다.",choices:[
   {text:"충분히 애도한다",effects:{perf:-6,burn:-5,life:3},result:"아버지의 서랍에서 내 초등학교 상장이 나왔다."},
   {text:"사흘 만에 출근한다",effects:{burn:12,life:-10},result:"책상 위에 조화가 놓여 있었다."}]},
 {id:"kid_school",when:{kids:true,age:[38,56]},cd:6,w:9,title:"학원비 고지서",text:"옆집 아이는 벌써 세 군데를 다닌다고 한다.",choices:[
   {text:"남들 하는 만큼 시킨다",hint:"현금 -2,000만 원",effects:{money:-2000,life:1},result:"아이는 밤 10시에 집에 온다."},
   {text:"하나만 보낸다",hint:"현금 -600만 원",effects:{money:-600},result:"적당한 선에서 타협했다."},
   {text:"아이가 하고 싶은 걸 시킨다",effects:{money:-300,life:7},result:"아이는 드럼을 골랐다. 아랫집에 귤을 돌렸다."}]},
 {id:"kid_trouble",when:{kids:true,age:[38,58],max:{life:45}},once:true,w:12,title:"그림 일기",text:"아이의 가족 그림에 내가 없다. \"아빠, 엄마는 회사에 살잖아.\"",choices:[
   {text:"휴가를 내고 여행을 간다",effects:{money:-500,perf:-4,life:14},result:"아이는 바다를 처음 봤다. 나도 오랜만에 봤다."},
   {text:"다음 달에 꼭 가자고 한다",effects:{life:-10},result:"다음 달에도 바빴다.",shame:"아이와의 약속을 또 미뤘다"}]},
 {id:"kid_wedding",when:{kids:true,age:[56,64]},once:true,w:10,title:"자식의 결혼",text:"\"인사드릴 사람이 있어요.\"",choices:[
   {text:"힘닿는 대로 보탠다",hint:"현금 -5,000만 원",effects:{money:-5000,life:10},result:"식장에서 울지 않으려고 천장을 봤다."},
   {text:"알아서 하라고 한다",effects:{life:-4},result:"축사는 짧게 했다."}]},
 {id:"divorce_risk",when:{flag:"married",max:{life:20}},cd:5,w:18,title:"\"우리 얘기 좀 해\"",text:"식탁에 마주 앉은 게 석 달 만이다.",choices:[
   {text:"부부 상담을 받는다",effects:{money:-300,perf:-4,life:16},result:"매주 수요일 저녁을 비웠다."},
   {text:"요즘 일이 바쁘다고 한다",chance:45,success:{effects:{life:-4},result:"한숨 소리만 남았다."},fail:{effects:{do:"divorce"},result:"도장을 찍었다. 재산은 반으로 나눴다.",shame:"일 핑계를 대다가 이혼했다"}}]},
 {id:"lonely",when:{noflag:["married","partner"],age:[40,64],max:{life:25}},cd:6,w:12,title:"혼자 먹는 저녁",text:"편의점 도시락을 데우다가, 오늘 누구와도 말하지 않았다는 걸 알았다.",choices:[
   {text:"동호회에 나간다",effects:{life:14,net:3},result:"등산복을 샀다. 생각보다 재밌다."},
   {text:"고양이를 들인다",effects:{life:12,money:-200,flag:"pet"},result:"집에 가면 누가 기다린다."},
   {text:"일로 채운다",effects:{perf:4,burn:6,life:-3},result:"사무실이 제일 편하다."}]},
 {id:"hobby",when:{age:[28,60],track:WORKING},once:true,w:6,title:"취미",text:"퇴근하고 뭐 하냐는 질문에 대답을 못 했다.",choices:[
   {text:"달리기를 시작한다",effects:{burn:-10,life:6,flag:"hobby"},result:"10km를 처음 완주한 날, 메달을 걸고 출근했다."},
   {text:"직장인 밴드에 들어간다",effects:{life:9,net:3,flag:"hobby"},result:"베이스는 인기가 없어서 바로 붙었다."},
   {text:"그럴 시간이 없다",effects:{perf:2},result:"대답은 여전히 못 한다."}]},
 {id:"guarantee",when:{age:[30,56],min:{money:3000}},once:true,w:5,title:"친구의 부탁",text:"20년 지기가 서류를 내밀었다. \"도장만 찍어 주면 돼.\"",choices:[
   {text:"찍어 준다",chance:45,success:{effects:{net:8,life:4},result:"친구는 재기했다. 한우를 샀다."},fail:{effects:{money:-4000,life:-8},result:"친구는 연락이 안 된다. 은행은 연락이 잘 된다.",shame:"보증을 섰다가 4,000만 원을 물었다"}},
   {text:"거절한다",effects:{net:-5,life:-4},result:"친구는 커피를 다 마시지 않고 일어났다."}]},
 {id:"inherit",when:{age:[42,63]},once:true,w:4,title:"상속",text:"시골 땅이 있었다고 한다. 형제가 셋이다.",choices:[
   {text:"내 몫을 받는다",effects:{money:3000,life:-4},result:"통장에 찍힌 숫자를 한참 봤다."},
   {text:"형제에게 양보한다",effects:{life:8,net:3},result:"누나가 김치를 보내왔다."}]},
 {id:"big_illness",when:{age:[45,64],minBurnYears:7},once:true,w:16,title:"조직 검사 결과",text:"의사가 모니터를 돌려 보여 줬다. \"더 미루시면 안 됩니다.\"",choices:[
   {text:"수술을 받고 1년 쉰다",hint:"현금 -2,000만 원",effects:{money:-2000,life:5,do:"sick_leave"},result:"병실 창밖으로 계절이 한 번 바뀌었다."},
   {text:"약으로 버틴다",chance:35,success:{effects:{burn:5},result:"수치가 내려갔다. 이번에는 운이 좋았다."},fail:{effects:{do:"collapse"},result:"회의 중에 쓰러졌다.",shame:"수술을 미루다 회의실에서 쓰러졌다"}}]},
 {id:"checkup",when:{track:WORKING,age:[35,64],min:{burn:50}},w:8,title:"건강검진 결과",text:"빨간 글씨가 세 줄이다.",choices:[
   {text:"운동을 시작한다",effects:{money:-200,burn:-15},result:"헬스장 사물함에 운동화를 넣었다."},
   {text:"다음에 본다",effects:{burn:8},result:"결과지는 서랍 맨 아래에 넣었다.",shame:"건강검진 결과를 모른 척했다"}]},
 {id:"midlife",when:{age:[43,53],track:WORKING},once:true,w:8,title:"마흔 몇 살의 밤",text:"퇴근길 신호 대기 중에 문득 생각했다. 이게 다인가.",choices:[
   {text:"오토바이를 산다",hint:"현금 -1,500만 원",effects:{money:-1500,life:9,burn:-8},result:"가족은 반대했다. 헬멧은 두 개 샀다."},
   {text:"한 해를 통째로 쉰다",hint:"승진 점수 -3",effects:{pp:-3,life:18,do:"sabbatical"},result:"산티아고 길을 걸었다. 답은 없었지만 다리가 튼튼해졌다."},
   {text:"신호가 바뀌어서 출발한다",effects:{burn:6},result:"집에 도착하니 잊어버렸다."}]},
 {id:"reunion",when:{age:[30,62]},cd:10,w:5,title:"동창회",text:"20년 만에 단체방이 살아났다.",choices:[
   {text:"나간다",effects:{life:4,net:4,money:-50},result:"명함을 열두 장 받았다. 절반은 보험이었다."},
   {text:"안 나간다",effects:{},result:"사진만 구경했다."}]},
 {id:"lotto",w:1,once:true,title:"로또 3등",text:"번호 다섯 개가 맞았다.",choices:[
   {text:"조용히 찾는다",effects:{money:150,life:3},result:"세금 떼고 150만 원. 하루 동안은 부자였다."}]},
 {id:"coin",when:{age:[22,55],min:{money:1000}},cd:8,w:6,title:"\"너만 알고 있어\"",text:"옆자리 동료가 화면을 보여 준다. 그래프가 수직이다.",choices:[
   {text:"넣는다",hint:"현금의 30%",chance:30,success:{effects:{do:"coin_win"},result:"세 배가 됐다. 동료는 다섯 배에 팔았다고 한다."},fail:{effects:{do:"coin_lose"},result:"상장 폐지 공지가 올라왔다.",shame:"동료 말만 듣고 코인에 넣었다가 날렸다"}},
   {text:"안 넣는다",effects:{},result:"그래프는 다음 주에 반대로 수직이 됐다."}]},
 {id:"phishing",when:{age:[30,64],min:{money:2000}},once:true,w:4,title:"검찰입니다",text:"\"고객님 명의의 계좌가 범죄에 연루됐습니다.\"",choices:[
   {text:"끊는다",effects:{},result:"검찰은 카톡으로 연락하지 않는다."},
   {text:"일단 들어 본다",chance:60,success:{effects:{},result:"안전 계좌 얘기가 나오자 끊었다."},fail:{effects:{money:-2000},result:"안전 계좌는 안전하지 않았다.",shame:"보이스피싱에 2,000만 원을 보냈다"}}]},
 {id:"volunteer",when:{age:[30,64],track:WORKING,min:{skill:40}},once:true,w:5,title:"재능 기부",text:"모교에서 진로 특강을 부탁해 왔다. 강의료는 없다.",choices:[
   {text:"간다",effects:{fame:4,life:6,burn:3},result:"질문은 하나였다. \"연봉이 얼마예요?\""},
   {text:"바쁘다고 한다",effects:{},result:"기념품 볼펜만 받았다."}]},
 {id:"retire_prep",when:{age:[57,63]},once:true,w:10,title:"퇴직 이후",text:"인사팀이 '인생 2막 설계' 교육 안내문을 보냈다.",choices:[
   {text:"귀촌을 준비한다",hint:"현금 -3,000만 원",effects:{money:-3000,life:12},result:"주말마다 내려가 텃밭을 일군다."},
   {text:"연금을 더 붓는다",effects:{money:-2000,assets:2600},result:"숫자는 든든해졌다."},
   {text:"그때 가서 생각한다",effects:{},result:"안내문은 재활용함에 들어갔다."}]},
 {id:"grandkid",when:{kids:true,age:[58,64]},once:true,w:8,title:"손주",text:"영상 통화 너머에서 누가 옹알거린다.",choices:[
   {text:"주말마다 보러 간다",effects:{life:14,burn:-5},result:"휴대폰 배경 화면을 바꿨다."},
   {text:"사진으로 본다",effects:{life:4},result:"사진첩 용량이 찼다."}]},
 {id:"friend_death",when:{age:[50,64]},once:true,w:6,title:"친구의 부고",text:"지난달에 같이 밥 먹은 친구다.",choices:[
   {text:"장례식장에서 밤을 새운다",effects:{life:-4,net:4,burn:4},result:"영정 사진은 10년 전 것이었다."},
   {text:"조의금만 보낸다",effects:{life:-9},result:"송금 완료 화면을 오래 봤다."}]},
 /* ---- 커리어 공통 ---- */
 {id:"fri_report",when:{track:"career",stage:[1,3]},w:9,title:"금요일 6시의 보고서",text:"퇴근 5분 전, 상사가 말했다. \"이거 월요일 아침까지.\"",choices:[
   {text:"남아서 고친다",effects:{perf:5,burn:6,life:-3},result:"사무실 불은 내가 껐다."},
   {text:"월요일에 하겠다고 한다",effects:{do:"fri_refuse"},result:"가방을 들었다."},
   {text:"동기에게 부탁한다",when:{hasRival:true},effects:{net:-3,like:-1},result:"{rival}의 답장은 한 글자였다. \"하.\""}]},
 {id:"dinner",when:{track:"career",stage:[1,4]},w:8,title:"회식 자리 배치",text:"고깃집 긴 테이블. 빈자리는 두 곳이다.",choices:[
   {text:"상사 옆에 앉는다",effects:{net:4,rep:2,burn:5},result:"고기는 내가 다 구웠다."},
   {text:"구석에 앉는다",effects:{burn:1},result:"조용히 먹고 조용히 빠졌다."},
   {text:"선약이 있다고 한다",effects:{burn:-4,net:-3,life:3},result:"집에 가서 라면을 끓였다."}]},
 {id:"headhunter",when:{track:"career",stage:[2,5],min:{rep:35}},w:8,title:"헤드헌터의 전화",text:"\"지금 통화 괜찮으세요? 좋은 자리가 있어서요.\"",choices:[
   {text:"옮긴다",hint:"연봉 +20%, 승진 점수는 0부터",effects:{do:"move"},result:"새 사원증, 새 자리, 새 상사."},
   {text:"연봉 협상 카드로 쓴다",chance:45,chanceStat:"rep",success:{effects:{salaryPct:8},result:"인사팀이 숫자를 고쳐 왔다."},fail:{effects:{rep:-6,pp:-1},result:"\"그럼 가셔도 됩니다.\" 못 들은 걸로 했다.",shame:"이직 카드로 협상하다 망신당했다"}},
   {text:"끊는다",effects:{rep:1},result:"번호는 저장해 뒀다."}]},
 {id:"reorg",when:{track:"career",stage:[1,5]},w:7,title:"갑작스러운 조직개편",text:"월요일 아침, 조직도가 통째로 바뀌었다.",choices:[
   {text:"새 상사에게 먼저 인사한다",effects:{net:3,do:"reboss"},result:"새 상사는 {bossname}이다."},
   {text:"하던 일을 한다",effects:{perf:3,do:"reboss"},result:"자리만 옮겼다. 새 상사는 {bossname}이다."}]},
 {id:"mentee",when:{track:"career",stage:[2,4]},w:6,title:"신입의 사수",text:"신입이 내 옆자리에 앉았다. 질문이 많다.",choices:[
   {text:"하나하나 가르친다",effects:{rep:4,net:2,perf:-3,burn:4},result:"1년 뒤 신입은 내 일을 절반 가져갔다."},
   {text:"매뉴얼을 준다",chance:70,success:{effects:{},result:"알아서 잘 컸다."},fail:{effects:{rep:-5},result:"신입이 석 달 만에 나갔다. 다들 나를 본다.",shame:"맡은 신입이 석 달 만에 퇴사했다"}}]},
 {id:"mistake",when:{track:"career",stage:[1,4]},w:9,title:"내 실수로 터진 사고",text:"아직 아무도 모른다. 원인은 내가 지난주에 한 작업이다.",choices:[
   {text:"바로 보고한다",effects:{rep:2,perf:-5},result:"혼났다. 그리고 끝났다."},
   {text:"조용히 덮는다",chance:50,success:{effects:{},result:"아무도 몰랐다."},fail:{effects:{rep:-14,perf:-8},result:"기록에 내 이름이 남아 있었다.",shame:"사고를 덮으려다 들켰다"}},
   {text:"동기에게 SOS를 친다",when:{hasRival:true},effects:{like:-1,perf:-1},result:"{rival} 덕에 새벽에 수습했다. 빚이 생겼다."}]},
 {id:"inhouse",when:{track:"career",stage:[1,3]},w:6,title:"사내 공모전",text:"대상은 특진 가점. 마감은 다음 주.",choices:[
   {text:"낸다",check:{stat:"skill",min:42},effects:{burn:6},success:{effects:{pp:2,rep:5,resume:"사내 공모전 대상"},result:"대상. 사장과 악수하는 사진이 사보에 실렸다."},fail:{effects:{},result:"참가상으로 텀블러를 받았다."}},
   {text:"본업에 집중한다",effects:{perf:2},result:"텀블러는 이미 세 개 있다."}]},
 {id:"vacation",when:{track:"career",min:{burn:60}},w:9,title:"연차가 20일 남았다",text:"인사팀 메일. \"미사용 연차는 소멸됩니다.\"",choices:[
   {text:"2주를 통째로 쓴다",effects:{burn:-22,perf:-6,life:6},result:"돌아오니 메일이 412통이었다."},
   {text:"안 쓴다",effects:{perf:3,burn:8},result:"연차는 소멸됐다. 나도 조금 소멸됐다."}]},
 {id:"politics",when:{track:"career",stage:[3,5]},w:9,title:"두 임원의 줄",text:"엘리베이터에서 전무가 물었다. \"자네는 누구 사람인가?\"",choices:[
   {text:"전무 쪽에 선다",chance:45,chanceStat:"net",success:{effects:{pp:3,net:5},result:"전무가 부사장이 됐다. 나도 같이 올라간다."},fail:{effects:{pp:-4,rep:-5},result:"전무가 먼저 집에 갔다.",shame:"줄을 잘못 섰다"}},
   {text:"\"회사 사람입니다\"",effects:{rep:2},result:"전무는 웃었다. 무슨 뜻의 웃음인지는 모른다."}]},
 {id:"gradschool",when:{track:"career",stage:[1,4],age:[25,45]},once:true,w:6,title:"야간 대학원",text:"합격하면 2년간 저녁이 없다.",choices:[
   {text:"다닌다",hint:"현금 -1,500만 원",effects:{money:-1500,skill:8,burn:10,life:-6,resume:"야간 대학원 석사"},result:"졸업식 날에도 야근이 있었다."},
   {text:"지금도 벅차다",effects:{burn:-2},result:"원서는 넣지 않았다."}]},
 {id:"startup_itch",when:{track:"career",stage:[2,5],age:[28,52]},cd:9,w:6,title:"창업의 유혹",text:"퇴근길에 '임대 문의'가 붙은 자리를 봤다. 자꾸 계산기를 두드리게 된다.",choices:[
   {text:"사표 내고 창업한다",hint:"창업 자금 {cost}",effects:{do:"found"},result:"명함을 새로 팠다. 직함은 대표다."},
   {text:"주말에만 해 본다",effects:{skill:2,burn:7,money:300,life:-4},result:"주말이 없어졌다. 통장은 조금 불었다."},
   {text:"접는다",effects:{},result:"'임대 문의'는 다음 달에 떼어졌다."}]},
 {id:"rival_offer",when:{track:"career",age:[28,42],rivalLike:3,min:{money:3000}},once:true,w:9,title:"동기의 사업 제안",text:"{rival}이 소주잔을 내려놓고 말했다. \"나랑 나가서 하나 차리자.\"",choices:[
   {text:"같이 나간다",hint:"창업 자금 {cost}",effects:{do:"found_with_rival"},result:"사무실은 작았다. 책상은 둘이었다."},
   {text:"돈만 넣는다",hint:"현금 -2,000만 원",effects:{money:-2000,flag:"rival_invest",like:1},result:"2,000만 원을 보냈다. 결과는 몇 년 뒤에 안다."},
   {text:"거절한다",effects:{like:-1,do:"rival_leaves"},result:"{rival}은 혼자 나갔다."}]},
 {id:"rival_result",when:{flag:"rival_invest",noflag:"rival_paid",age:[33,64]},once:true,w:30,title:"동기 회사의 소식",text:"{rival}에게서 오랜만에 전화가 왔다.",choices:[
   {text:"받는다",chance:45,success:{effects:{money:12000,flag:"rival_paid"},result:"\"상장했어. 네 몫 보낸다.\""},fail:{effects:{flag:"rival_paid"},result:"\"미안하다.\" 그게 전부였다.",shame:"동기 회사에 넣은 2,000만 원이 사라졌다"}}]},
 {id:"team_exit",when:{track:"career",stage:[4,4],min:{net:45}},once:true,w:8,title:"팀을 데리고 나갈까",text:"임원 심사를 앞두고 팀원 셋이 따로 보자고 했다. \"나가시면 저희도 갑니다.\"",choices:[
   {text:"팀과 함께 독립한다",hint:"창업 자금 {cost}",effects:{do:"found_team"},result:"첫날부터 직원이 셋이다."},
   {text:"남아서 승진을 노린다",effects:{pp:2},result:"그 얘기는 없던 일이 됐다."}]},
 {id:"layoff",when:{track:"career",era:"recession",stage:[1,5]},cd:3,w:22,title:"구조조정 명단",text:"인사팀 회의실에 한 명씩 불려 들어간다. 내 차례다.",choices:[
   {text:"버틴다",chance:55,chanceFn:"layoff",success:{effects:{burn:8},result:"명단에 없었다. 옆자리는 비었다."},fail:{effects:{do:"fired"},result:"상자 하나에 10년이 다 들어갔다.",shame:"구조조정으로 회사를 나왔다"}},
   {text:"희망퇴직을 받는다",hint:"위로금 1년 치 연봉",effects:{do:"severance"},result:"위로금 명세서를 접어 주머니에 넣었다."}]},
 {id:"junior_boss",when:{track:"career",age:[42,60],stage:[1,3]},once:true,w:10,title:"새 팀장",text:"새 팀장이 인사를 돌았다. 5년 전 내가 가르친 신입이다.",choices:[
   {text:"받아들인다",effects:{burn:6,life:-3},result:"\"팀장님\"이라고 부르는 데 일주일이 걸렸다."},
   {text:"다른 회사를 알아본다",effects:{do:"quit_move"},result:"이력서를 10년 만에 고쳤다."}]},
 {id:"wage_peak",when:{track:"career",age:[55,62],stage:[1,4]},once:true,w:16,title:"임금피크 안내",text:"\"내년부터 급여의 80%가 지급됩니다. 명예퇴직도 접수합니다.\"",choices:[
   {text:"깎인 월급으로 남는다",effects:{salaryPct:-20,life:4},result:"자리는 창가로 옮겨졌다."},
   {text:"명예퇴직하고 독립한다",hint:"위로금 2년 치 연봉, 프리랜서가 된다",effects:{do:"honor_retire"},result:"30년 만에 명함에서 회사 이름이 빠졌다."}]},
 {id:"relocate",when:{track:"career",stage:[2,4]},once:true,w:6,title:"발령",text:"3년, 아는 사람 없는 도시. 다녀오면 가점이 붙는다.",choices:[
   {text:"간다",effects:{skill:4,net:-5,pp:3,life:-12,resume:"지방·해외 근무"},result:"돌아올 때는 캐리어가 세 개였다."},
   {text:"고사한다",effects:{rep:-3,pp:-1},result:"발령은 옆자리 동료가 받았다."}]},
 /* ---- 명성·장인 ---- */
 {id:"lecture",when:{track:WORKING,min:{fame:20}},cd:5,w:8,title:"강연 요청",text:"행사 담당자의 메일. \"연사로 모시고 싶습니다.\"",choices:[
   {text:"수락한다",effects:{fame:5,money:200,burn:4},result:"슬라이드는 전날 밤에 완성했다."},
   {text:"거절한다",effects:{},result:"다음 기회에, 라고 답했다."}]},
 {id:"book",when:{track:WORKING,min:{fame:35}},once:true,w:10,title:"출간 제안",text:"편집자가 찾아왔다. \"책 한 권 쓰시죠.\"",choices:[
   {text:"쓴다",chance:45,chanceStat:"skill",effects:{burn:10,perf:-5,life:-4},success:{effects:{fame:15,money:1500,flag:"hit",resume:"저서 출간, 베스트셀러"},result:"3쇄를 찍었다. 서점 매대에 내 이름이 누워 있다."},fail:{effects:{fame:3,resume:"저서 출간"},result:"초판 300부. 절반은 내가 샀다.",shame:"책을 냈는데 300부가 나갔다"}},
   {text:"사양한다",effects:{},result:"명함만 받았다."}]},
 {id:"tv",when:{track:WORKING,min:{fame:55}},once:true,w:10,title:"방송 고정 출연",text:"작가의 전화. \"시즌 내내 함께해 주셨으면 해요.\"",choices:[
   {text:"출연한다",effects:{fame:16,burn:9,perf:-7,life:-5,flag:"hit",resume:"방송 고정 출연"},result:"길에서 알아보는 사람이 생겼다."},
   {text:"본업이 먼저다",effects:{rep:3},result:"그 자리는 다른 사람이 채웠다."}]},
 {id:"scandal",when:{min:{fame:45}},cd:8,w:8,title:"온라인 논란",text:"10년 전에 쓴 글이 캡처돼 돌아다닌다. 댓글이 3천 개다.",choices:[
   {text:"사과문을 올린다",effects:{fame:-8,burn:5},result:"사흘 뒤 다른 논란이 터졌다."},
   {text:"침묵한다",chance:50,success:{effects:{},result:"조용히 지나갔다."},fail:{effects:{fame:-22,rep:-8},result:"침묵이 기사 제목이 됐다.",shame:"논란에 침묵하다 일을 키웠다"}},
   {text:"정면으로 반박한다",chance:30,success:{effects:{fame:8},result:"원문 전체가 공개되자 여론이 돌아섰다."},fail:{effects:{fame:-28,rep:-10},result:"반박문이 더 큰 불을 지폈다.",shame:"반박문으로 논란을 키웠다"}}]},
 {id:"award",when:{track:WORKING,minMp:1,min:{skill:65}},once:true,w:8,title:"올해의 상",text:"협회에서 연락이 왔다. 수상자로 뽑혔다고 한다.",choices:[
   {text:"시상식에 간다",effects:{rep:8,fame:8,resume:"업계 올해의 상 수상"},result:"수상 소감은 준비한 것의 반만 말했다."}]},
 {id:"master_call",when:{track:WORKING,age:[24,40],min:{skill:45}},once:true,w:7,title:"스승",text:"업계에서 이름난 어른이 말했다. \"내 밑에서 3년만 굴러 볼 텐가.\"",choices:[
   {text:"들어간다",hint:"수입이 줄지만 능력 한계가 오른다",effects:{skill:6,burn:8,money:-1500,do:"cap_up"},result:"처음 석 달은 청소만 했다."},
   {text:"내 방식대로 한다",effects:{rep:1},result:"어른은 고개만 끄덕였다."}]},
 {id:"obsolete",when:{track:WORKING,age:[35,58],max:{skill:60}},once:true,w:9,title:"세상이 바뀌었다",text:"내가 10년 쓴 방식이 구식이 됐다. 신입이 더 잘 안다.",choices:[
   {text:"처음부터 다시 배운다",effects:{skill:7,burn:10,life:-4},result:"자존심을 접고 신입에게 물었다."},
   {text:"관리 쪽으로 옮긴다",when:{track:"career"},effects:{pp:2,skill:-8,net:4},result:"이제 직접 만들지 않는다. 회의를 한다."},
   {text:"하던 대로 한다",effects:{skill:-10,rep:-3},result:"일감이 조금씩 줄었다."}]},
 /* ---- 프리랜서 ---- */
 {id:"free_client",when:{track:"free"},cd:4,w:12,title:"수정 요청 14차",text:"\"처음 시안이 더 나은 것 같아요.\"",choices:[
   {text:"참고 끝까지 한다",effects:{money:800,burn:11},result:"입금 문자가 왔다. 그러면 됐다."},
   {text:"계약을 끊는다",effects:{rep:-3,life:4,burn:-4},result:"그 번호는 차단했다."}]},
 {id:"free_dry",when:{track:"free"},cd:5,w:12,title:"일감 가뭄",text:"석 달째 메일함이 조용하다.",choices:[
   {text:"단가를 내린다",effects:{money:400,rep:-4},result:"일은 들어왔다. 단가는 다시 못 올린다."},
   {text:"버틴다",effects:{money:-800,burn:5},result:"통장 잔액을 하루에 세 번 봤다."},
   {text:"회사로 돌아간다",effects:{do:"quit_move"},result:"이력서에 공백을 뭐라고 쓸지 고민했다."}]},
 {id:"free_big",when:{track:"free",min:{fame:35}},once:true,w:10,title:"큰 건",text:"대기업에서 1년짜리 프로젝트를 통째로 맡기고 싶다고 한다.",choices:[
   {text:"맡는다",effects:{money:6000,burn:16,rep:5,life:-6},result:"1년 동안 달력에 빈칸이 없었다."},
   {text:"내 속도를 지킨다",effects:{life:4},result:"그 건은 다른 사람이 했다."}]},
 /* ---- 창업 ---- */
 {id:"first_deal",when:{track:"founder",stage:[1,1]},once:true,w:20,title:"첫 손님",text:"개업 3주째. 드디어 문이 열렸다.",choices:[
   {text:"남는 게 없어도 퍼 준다",effects:{rep:6,money:-200},result:"그 손님이 다음 주에 일행을 데려왔다."},
   {text:"정가대로 받는다",effects:{money:200,perf:3},result:"첫 매출 영수증을 벽에 붙였다."}]},
 {id:"key_leave",when:{track:"founder",stage:[2,5]},w:9,title:"핵심 인력의 사표",text:"제일 믿던 직원이 봉투를 내밀었다.",choices:[
   {text:"연봉을 올려 붙잡는다",effects:{do:"pay_unit"},result:"봉투는 돌려줬다. 통장이 가벼워졌다."},
   {text:"보내 준다",effects:{perf:-10,rep:2},result:"송별회는 크게 했다."}]},
 {id:"invest_offer",when:{track:"founder",stage:[2,4],min:{rep:40}},once:true,w:8,title:"투자 제안",text:"명함에 '파트너'라고 적힌 사람이 찾아왔다.",choices:[
   {text:"받는다",effects:{do:"take_invest",pp:2},result:"통장에 0이 늘었다. 보고할 사람도 늘었다."},
   {text:"내 속도로 간다",effects:{rep:3},result:"명함은 받아 뒀다."}]},
 {id:"acquire",when:{track:"founder",stage:[3,5]},once:true,w:6,title:"인수 제안",text:"큰 회사가 숫자를 불렀다. 생각보다 큰 숫자다.",choices:[
   {text:"판다",hint:"큰돈을 받고 임원으로 합류한다",effects:{do:"sell"},result:"간판이 바뀌었다. 나는 임원실로 출근한다."},
   {text:"안 판다",effects:{rep:4},result:"\"다음에 다시 오겠습니다.\""}]},
 {id:"tax",when:{track:"founder",stage:[2,5]},cd:9,w:7,title:"세무조사 통지",text:"등기 우편이 왔다. 봉투가 두껍다.",choices:[
   {text:"세무사를 쓴다",effects:{do:"pay_small"},result:"돈으로 해결되는 문제였다."},
   {text:"직접 대응한다",check:{stat:"skill",min:55},success:{effects:{rep:2},result:"영수증 상자 열두 개를 직접 들고 갔다. 문제없음."},fail:{effects:{do:"pay_unit",rep:-4},result:"추징금이 나왔다.",shame:"세무조사에서 추징금을 맞았다"}}]},
 {id:"copycat",when:{track:"founder",stage:[2,5]},cd:9,w:8,title:"대기업이 베꼈다",text:"우리 것과 똑같은 게 반값에 나왔다.",choices:[
   {text:"소송한다",chance:35,effects:{do:"pay_small"},success:{effects:{rep:8,fame:6},result:"3년 만에 이겼다. 기사 제목은 '다윗'이었다."},fail:{effects:{do:"pay_unit",burn:8},result:"상대 변호사는 열두 명이었다.",shame:"대기업과 소송하다 졌다"}},
   {text:"더 빨리 달린다",effects:{burn:11,perf:6},result:"베낀 쪽이 따라오다 지쳤다."},
   {text:"업종을 살짝 튼다",effects:{perf:-6,skill:2},result:"간판 글씨를 한 줄 바꿨다."}]},
 {id:"payroll",when:{track:"founder",stage:[2,6],moneyNeg:true},cd:3,w:20,title:"월급날",text:"25일이다. 통장이 비어 있다.",choices:[
   {text:"집을 담보로 잡힌다",when:{flag:"house"},effects:{do:"mortgage"},result:"배우자에게는 나중에 말하기로 했다."},
   {text:"직원들에게 양해를 구한다",effects:{rep:-7,perf:-6},result:"다음 달 사표가 두 장 들어왔다.",shame:"직원 월급을 밀렸다"},
   {text:"급전을 쓴다",effects:{do:"loanshark"},result:"이자는 생각하지 않기로 했다."}]},
 {id:"partner_fight",when:{track:"founder",flag:"with_rival"},once:true,w:10,title:"동업자",text:"{rival}과 회의실에서 목소리가 높아졌다. 방향이 다르다.",choices:[
   {text:"내가 양보한다",effects:{perf:-6,like:1,burn:4},result:"회식에서 풀었다. 풀린 척했다."},
   {text:"지분을 정리하고 갈라선다",effects:{do:"pay_unit",like:-3,unflag:"with_rival"},result:"책상 하나가 비었다."}]},
 /* ---- 직군: 개발 ---- */
 {id:"dev_bug",when:{job:"dev",track:"career",stage:[2,4]},w:9,title:"출시 3일 전, 치명적 버그",text:"QA에서 결제가 두 번 되는 버그가 올라왔다.",choices:[
   {text:"출시를 미룬다",effects:{rep:3,perf:-6},result:"일정은 밀렸지만 사고는 없었다."},
   {text:"밤새워 고친다",check:{stat:"skill",min:55},effects:{burn:12},success:{effects:{perf:10},result:"새벽 4시, 버그가 잡혔다."},fail:{effects:{rep:-9},result:"고친 줄 알았던 버그가 출시 날 터졌다.",shame:"출시 날 결제 버그를 터뜨렸다"}},
   {text:"일단 내고 패치한다",chance:45,success:{effects:{perf:4},result:"아무도 눈치채지 못했다."},fail:{effects:{rep:-12},result:"환불 문의가 2천 건 들어왔다.",shame:"버그를 알고도 출시했다"}}]},
 {id:"dev_oncall",when:{job:"dev",track:"career",stage:[1,4]},w:8,title:"새벽 3시의 장애 호출",text:"휴대폰이 운다. 서버가 죽었다.",choices:[
   {text:"바로 접속한다",effects:{perf:5,burn:8,life:-2},result:"해 뜰 때 복구했다."},
   {text:"무음으로 돌린다",chance:35,success:{effects:{burn:-2},result:"아침에 보니 누가 고쳐 놨다."},fail:{effects:{rep:-9},result:"아침 회의의 주제는 나였다.",shame:"장애 호출을 무음으로 돌렸다"}}]},
 {id:"dev_legacy",when:{job:"dev",track:WORKING,stage:[2,4]},w:6,title:"10년 묵은 코드",text:"주석에 적혀 있다. \"건드리지 마시오. 이유는 모름.\"",choices:[
   {text:"갈아엎자고 제안한다",check:{stat:"skill",min:52},effects:{burn:6},success:{effects:{rep:6,perf:6,prog:1},result:"석 달 뒤 배포 시간이 절반이 됐다."},fail:{effects:{perf:-7},result:"건드리지 말라는 데는 이유가 있었다.",shame:"레거시를 갈아엎다 서비스를 멈췄다"}},
   {text:"주석을 한 줄 보탠다",effects:{},result:"\"나도 모름.\""}]},
 {id:"dev_oss",when:{job:"dev",min:{skill:45}},once:true,w:6,title:"오픈소스가 화제",text:"주말에 올린 라이브러리에 별이 3천 개 달렸다.",choices:[
   {text:"컨퍼런스 발표를 수락한다",effects:{fame:8,net:5,burn:4,resume:"개발자 컨퍼런스 발표"},result:"발표 자료의 첫 장은 고양이 사진이었다."},
   {text:"조용히 다듬는다",effects:{skill:2,prog:1},result:"이슈가 200개 쌓였다."}]},
 /* ---- 직군: 요리 ---- */
 {id:"cook_critic",when:{job:"cook",stage:[2,5]},w:8,title:"평론가의 방문",text:"7번 테이블. 혼자 와서 메모를 한다.",choices:[
   {text:"시그니처 메뉴를 낸다",check:{stat:"skill",min:58},success:{effects:{rep:8,fame:6,perf:8},result:"별 넷. 예약 전화가 멈추지 않는다."},fail:{effects:{rep:-7,fame:-3},result:"\"의욕은 접시 밖으로 넘쳤다.\"",shame:"평론가에게 혹평을 받았다"}},
   {text:"늘 하던 대로 낸다",effects:{rep:2},result:"\"무난하다.\" 무난한 평이었다."}]},
 {id:"cook_burn",when:{job:"cook",track:"career",stage:[1,3]},w:8,title:"튀김 솥 앞에서",text:"기름이 튀었다. 손등이 벌겋다. 주문은 열두 개가 밀렸다.",choices:[
   {text:"찬물에 대고 계속한다",effects:{perf:4,burn:10},result:"흉터가 하나 늘었다."},
   {text:"병원에 간다",effects:{perf:-4,burn:-2},result:"돌아오니 선배가 내 자리를 메우고 있었다."}]},
 {id:"cook_rent",when:{job:"cook",track:"founder",stage:[1,3],noflag:"landlord"},w:9,title:"건물주의 통보",text:"\"다음 달부터 월세 50 올려요.\"",choices:[
   {text:"받아들인다",effects:{money:-600},result:"계약서에 도장을 찍었다."},
   {text:"옆 동네로 옮긴다",effects:{money:-3000,rep:-3},result:"단골 절반이 따라왔다."},
   {text:"무리해서 건물을 산다",hint:"현금 -5,000만 원, 다시는 월세 걱정이 없다",effects:{money:-5000,assets:5000,perf:8,flag:"landlord"},result:"이제 내가 건물주다. 은행의 건물이기도 하다."}]},
 {id:"cook_price",when:{job:"cook",track:"founder"},cd:8,w:7,title:"식자재 값 폭등",text:"양파 한 망이 두 배가 됐다.",choices:[
   {text:"가격을 올린다",effects:{rep:-4,perf:4},result:"메뉴판에 스티커를 덧붙였다."},
   {text:"그대로 버틴다",effects:{do:"pay_small",rep:3},result:"단골이 \"여긴 안 올렸네\" 했다."}]},
 {id:"cook_inspect",when:{job:"cook",track:"founder"},cd:9,w:6,title:"위생 점검",text:"점심 피크에 공무원 두 명이 들어왔다.",choices:[
   {text:"주방을 다 보여 준다",check:{stat:"skill",min:45},success:{effects:{rep:4},result:"\"모범 업소로 추천하겠습니다.\""},fail:{effects:{rep:-8,do:"pay_small"},result:"냉장고 뒤에서 뭔가 나왔다.",shame:"위생 점검에 걸려 영업정지를 받았다"}}]},
 /* ---- 직군: 사무 ---- */
 {id:"off_pt",when:{job:"office",track:"career",stage:[2,4]},w:8,title:"임원 보고",text:"내일 9시. 장표는 40장. 임원은 3장에서 질문할 것이다.",choices:[
   {text:"밤새 예상 질문을 뽑는다",check:{stat:"skill",min:45},effects:{burn:7},success:{effects:{perf:10,rep:4},result:"3장에서 질문이 나왔다. 준비한 답이었다."},fail:{effects:{perf:-4},result:"질문은 39장에서 나왔다."}},
   {text:"무난하게 넘긴다",effects:{perf:2},result:"\"수고했어요.\" 그게 끝이었다."}]},
 {id:"off_excel",when:{job:"office",track:"career",stage:[1,3]},w:8,title:"엑셀 한 칸",text:"이미 보낸 견적서에서 0이 하나 빠진 걸 발견했다.",choices:[
   {text:"거래처에 전화한다",effects:{rep:-2,perf:-2},result:"\"저희도 이상하다 했어요.\""},
   {text:"정정 메일만 보낸다",chance:45,success:{effects:{},result:"아무도 원본을 안 봤다."},fail:{effects:{rep:-10,perf:-6},result:"거래처는 원본 금액으로 결재를 올린 뒤였다.",shame:"견적서에서 0을 하나 빼먹었다"}}]},
 {id:"off_whistle",when:{job:"office",track:"career",stage:[3,5]},once:true,w:8,title:"숫자가 맞지 않는다",text:"결산 자료를 보다가 알았다. 누군가 3년째 숫자를 만지고 있다.",choices:[
   {text:"감사실에 알린다",chance:45,chanceStat:"rep",success:{effects:{rep:12,fame:8,pp:3},result:"임원 둘이 나갔다. 내 이름은 기사에 '내부 관계자'로 실렸다."},fail:{effects:{rep:6,fame:6,do:"fired"},result:"석 달 뒤 내 자리가 없어졌다. 사유는 '조직 효율화'였다.",shame:"내부 고발 뒤 회사에서 밀려났다"}},
   {text:"못 본 척한다",effects:{pp:2,flag:"dirty",life:-5},result:"파일을 닫았다. 닫히지 않는 것도 있었다."}]},
 {id:"off_probe",when:{flag:"dirty",noflag:"probed"},once:true,w:14,title:"압수수색",text:"아침 9시, 정장 입은 사람들이 상자를 들고 들어왔다.",choices:[
   {text:"아는 대로 말한다",effects:{rep:-10,pp:-4,flag:"probed"},result:"참고인 조사는 여덟 시간 걸렸다.",shame:"회계 부정을 알고도 덮었던 게 드러났다"},
   {text:"모른다고 한다",chance:40,effects:{flag:"probed"},success:{effects:{},result:"내 이름은 조서에 없었다."},fail:{effects:{rep:-25,do:"fired"},result:"메일 기록이 남아 있었다.",shame:"조사에서 거짓말하다 해고됐다"}}]},

 /* ---- 추가 카드 ---- */
 {id:"workshop",when:{track:"career",stage:[1,3]},once:true,w:7,title:"워크숍 장기자랑",text:"신입은 무조건 한다고 한다. 팀장이 이미 음악을 골라 놨다.",choices:[
   {text:"제대로 준비한다",check:{stat:"net",min:30},effects:{burn:4},success:{effects:{rep:6,net:5},result:"사장이 앙코르를 외쳤다. 다음 날부터 다들 내 이름을 안다."},fail:{effects:{rep:-3},result:"반응이 차가웠다. 영상은 사내 메신저에 3년 돌았다.",shame:"워크숍 장기자랑 영상이 3년 돌았다"}},
   {text:"배탈 났다고 한다",effects:{net:-3},result:"아무도 믿지 않았다."}]},
 {id:"office_love",when:{track:"career",age:[24,38],noflag:["partner","married"]},once:true,w:6,title:"옆 팀의 그 사람",text:"엘리베이터에서 세 번째 마주쳤다. 오늘은 먼저 말을 걸어 왔다.",choices:[
   {text:"퇴근 후 밥을 먹자고 한다",chance:55,chanceStat:"life",success:{effects:{life:12,flag:"partner"},result:"사내 연애가 시작됐다. 메신저 상태를 두 번 확인하는 습관이 생겼다."},fail:{effects:{life:-4,rep:-2},result:"\"아, 저 다음 달에 결혼해요.\"",shame:"결혼 앞둔 사람에게 데이트 신청을 했다"}},
   {text:"인사만 한다",effects:{},result:"엘리베이터는 오늘도 조용했다."}]},
 {id:"ai_wave",when:{track:WORKING,age:[30,60]},once:true,w:7,title:"AI가 내 일을 한다",text:"회사가 새 도구를 들였다. 내가 사흘 걸리던 일을 10분에 한다.",choices:[
   {text:"누구보다 먼저 배운다",effects:{skill:5,perf:6,burn:5},result:"팀에서 제일 잘 쓰는 사람이 됐다. 일은 더 늘었다."},
   {text:"내 방식이 낫다고 버틴다",chance:40,success:{effects:{rep:3},result:"결국 사람 손이 필요한 일이 있었다."},fail:{effects:{perf:-8,skill:-5},result:"내 업무가 조직도에서 사라졌다.",shame:"AI 도구를 거부하다 업무를 잃었다"}}]},
 {id:"youtube",when:{track:WORKING,age:[22,50],max:{fame:30}},once:true,w:6,title:"채널을 열까",text:"후배가 말했다. \"선배 얘기 진짜 재밌는데 영상으로 찍어 보세요.\"",choices:[
   {text:"찍어 본다",chance:30,chanceStat:"skill",effects:{burn:6},success:{effects:{fame:14,money:300,resume:"구독자 10만 채널 운영"},result:"세 번째 영상이 터졌다. 구독자 10만."},fail:{effects:{fame:2},result:"조회수 47. 그중 30은 엄마다."}},
   {text:"일이나 하자",effects:{},result:"후배는 자기가 찍었다."}]},
 {id:"pet",when:{age:[25,60],noflag:"pet"},once:true,w:5,title:"보호소 공고",text:"눈이 마주쳤다. '임시 보호 급구'라고 적혀 있다.",choices:[
   {text:"데려온다",effects:{life:10,money:-200,flag:"pet"},result:"소파는 이제 고양이 것이다."},
   {text:"사진만 저장한다",effects:{},result:"가끔 그 사진을 본다."}]},
 {id:"house_boom",when:{flag:"house",age:[35,64]},once:true,w:6,title:"집값이 뛰었다",text:"부동산 앱 알림. 우리 아파트 실거래가가 올랐다.",choices:[
   {text:"팔고 갈아탄다",chance:50,success:{effects:{assets:6000},result:"타이밍이 좋았다. 이사 업체에 팁을 줬다."},fail:{effects:{assets:-3000},result:"판 다음 달에 더 올랐다.",shame:"집을 판 다음 달에 집값이 더 올랐다"}},
   {text:"그냥 산다",effects:{life:3},result:"숫자보다 동네가 좋다."}]},
 {id:"sideline",when:{track:"career",age:[28,55]},cd:10,w:5,title:"주말 부업",text:"지인이 주말에만 일 좀 봐 달라고 한다. 회사에는 비밀이다.",choices:[
   {text:"한다",chance:75,effects:{burn:8,life:-3},success:{effects:{money:1200},result:"통장이 두꺼워졌다. 주말이 얇아졌다."},fail:{effects:{money:600,rep:-8},result:"인사팀이 알았다. 경위서를 썼다.",shame:"몰래 하던 부업이 회사에 걸렸다"}},
   {text:"거절한다",effects:{},result:"주말에 늦잠을 잤다."}]},
 {id:"speech",when:{age:[28,45]},once:true,w:5,title:"결혼식 축사",text:"친구가 축사를 부탁했다. 하객은 400명이다.",choices:[
   {text:"맡는다",check:{stat:"fame",min:15},success:{effects:{net:5,fame:3,life:3},result:"하객 절반이 울었다. 나머지는 웃었다."},fail:{effects:{net:2,life:-2},result:"준비한 농담 셋이 전부 조용했다.",shame:"결혼식 축사에서 농담이 전부 실패했다"}},
   {text:"말주변이 없다고 사양한다",effects:{net:-2},result:"축사는 사촌 형이 했다."}]},
 {id:"health_good",when:{flag:"hobby",age:[40,64]},once:true,w:8,title:"건강검진, 전부 정상",text:"의사가 차트를 다시 봤다. \"운동하시죠? 10년은 젊게 나오네요.\"",choices:[
   {text:"메달 사진을 보여 준다",effects:{burn:-10,life:6},result:"의사도 달리기를 한다고 했다."}]},
 {id:"conf_poach",when:{track:"career",stage:[3,5],min:{fame:40}},once:true,w:8,title:"경쟁사의 러브콜",text:"경쟁사 대표가 직접 저녁을 샀다. \"우리 회사에서 한 단계 위로 오세요.\"",choices:[
   {text:"옮긴다",hint:"직급이 한 단계 오른다, 승진 점수는 0부터",effects:{do:"poached"},result:"새 회사 첫날, 내 방이 생겼다."},
   {text:"의리를 지킨다",effects:{rep:5,pp:2},result:"사장이 그 얘기를 들었다고 한다."}]},
 /* ---- 출신 ---- */
 {id:"family_biz",when:{origin:"shop",age:[25,38],track:"career"},once:true,w:12,title:"가업을 이으라는 전화",text:"아버지가 말했다. \"허리가 예전 같지 않다.\"",choices:[
   {text:"내려가서 잇는다",hint:"창업 자금 없이 2단계로 시작",effects:{life:6,do:"found_family"},result:"간판은 그대로 두고 대표 이름만 바꿨다."},
   {text:"내 길을 간다",effects:{life:-5},result:"전화를 끊고 한참 서 있었다."}]},
 {id:"parent_expect",when:{origin:"pro",track:"career",stage:[1,2]},once:true,w:10,title:"명절의 질문",text:"\"그래서 그 일은 언제까지 할 거니?\"",choices:[
   {text:"웃고 넘긴다",effects:{burn:4,life:-3},result:"전을 세 접시 부쳤다."},
   {text:"보여 주겠다고 한다",effects:{skill:3,burn:6},result:"연휴 내내 일했다."}]},
 {id:"chaebol_war",when:{origin:"chaebol",age:[35,55]},once:true,w:10,title:"후계 구도",text:"형이 말했다. \"너는 지분만 받고 빠져라.\"",choices:[
   {text:"지분을 받고 빠진다",effects:{money:30000,net:-10,life:4},result:"가족 식사 자리가 편해졌다."},
   {text:"싸운다",chance:30,chanceStat:"net",success:{effects:{net:15,rep:10,pp:6},result:"주총에서 이겼다. 형은 인사를 받지 않는다."},fail:{effects:{net:-15,rep:-8,life:-12},result:"호적만 남았다.",shame:"집안 경영권 싸움에서 졌다"}}]}
];

