/* 10판: 시작 연도와 고정 시대, 시대 카드, 지난 인생의 회사 카드 */

/* 그해가 이 범위에 있으면 이 시대다. strong이면 무작위 시대 뉴스를 막고, 아니면 무작위 뉴스가 위에 겹친다(배율은 곱한다). kind는 기존 불황·호황·거품 규칙을 빌려 쓴다 */
const FIXED_ERAS=[
  {id:"growth",from:1975,to:1989,kind:"boom",name:"고도성장",text:"고도성장기. 공장 굴뚝마다 연기가 오르고 수출 실적이 날마다 신문에 난다.",def:1,perf:{mech:1.15,build:1.15,sales:1.15}},
  {id:"pc",from:1990,to:1996,name:"PC 보급",text:"집집마다 컴퓨터가 들어온다. PC 통신 요금 고지서가 부모님을 놀라게 한다.",def:1,perf:{dev:1.1,game:1.1}},
  {id:"imf",strong:true,from:1997,to:1998,kind:"recession",name:"외환위기",text:"외환위기. 환율이 하루아침에 두 배가 됐고, 회사마다 명단이 돈다.",def:.8,perf:{doctor:.95}},
  {id:"dotcom",strong:true,from:1999,to:2000,kind:"bubble",name:"닷컴 붐",text:"닷컴 붐. 회사 이름에 '닷컴'만 붙으면 투자가 들어온다.",def:1,perf:{dev:1.25,game:1.15}},
  {id:"dotcrash",from:2001,to:2001,name:"닷컴 붕괴",text:"거품이 꺼졌다. 어제의 벤처가 오늘 사무실을 뺀다.",def:1,perf:{dev:.85,game:.9}},
  {id:"gfc",strong:true,from:2008,to:2009,kind:"recession",name:"세계 금융위기",text:"세계 금융위기. 바다 건너 은행이 무너지자 펀드 수익률이 반토막 났다.",def:.9,perf:{bank:.8}},
  {id:"mobile",from:2010,to:2019,name:"모바일 시대",text:"스마트폰이 손에 들렸다. 앱 하나로 회사가 생기고 사라진다.",def:1,perf:{dev:1.15,game:1.15}},
  {id:"covid",from:2020,to:2021,name:"감염병 유행",text:"감염병이 돈다. 거리는 비고 회의는 화면 속으로 들어갔다.",def:1,perf:{cook:.8,doctor:1.2}},
  {id:"ai",from:2022,to:2026,name:"AI 확산",text:"AI가 문서를 쓰고 코드를 짠다. 다들 내 자리는 괜찮을지 묻는다.",def:1,perf:{dev:1.1,office:.95}}
];
/* 직군이 열리는 해. 없으면 처음부터 열려 있다 */
JOBS.game.open=1990;

CARDS.push(
 {id:"era_gold",when:{year:[1997,1998]},once:true,w:14,title:"금 모으기",text:"나라 빚을 갚자며 동네 은행 앞에 줄이 섰다. 서랍 속에 돌반지가 있다.",choices:[
   {text:"돌반지를 낸다",effects:{money:-300,rep:2,life:3},result:"영수증 한 장을 받았다. 이상하게 뿌듯했다."},
   {text:"그냥 둔다",effects:{},result:"뉴스 화면 속 긴 줄을 오래 봤다."}]},
 {id:"era_imf_exit",when:{year:[1997,1998],track:"career",stage:[1,5]},once:true,w:18,title:"IMF 희망퇴직",text:"\"희망\"퇴직이라는데 희망을 묻는 사람은 없다. 내 이름도 후보에 있다고 한다.",choices:[
   {text:"버틴다",chance:55,chanceFn:"layoff",success:{effects:{burn:8,life:-3},result:"남았다. 남은 사람 몫의 일도 내 것이 됐다."},fail:{effects:{do:"fired"},result:"책상 위 화분까지 상자에 넣었다."}},
   {text:"위로금을 받고 나온다",hint:"위로금 1년 치 연봉",effects:{do:"severance"},result:"위로금 봉투가 생각보다 얇았다."}]},
 {id:"era_venture",when:{year:[1999,2000],track:"career",stage:[1,4]},once:true,w:16,title:"벤처 스톡옵션",text:"대학 동기가 차린 벤처에서 연락이 왔다. 연봉은 깎이지만 스톡옵션을 준다고 한다.",choices:[
   {text:"벤처로 옮긴다",hint:"연봉 -20%, 결과는 몇 해 뒤",effects:{salaryPct:-20,flag:"venture",net:3,life:2},result:"사무실은 좁았지만 다들 눈이 반짝였다."},
   {text:"남는다",effects:{},result:"동기는 \"후회할걸\" 하고 웃었다."}]},
 {id:"era_crash",when:{year:[2001,2003],flag:"venture"},once:true,w:40,title:"거품이 꺼졌다",text:"그 벤처가 문을 닫았다. 스톡옵션 계약서는 이제 종이일 뿐이다.",choices:[
   {text:"액자에 넣어 둔다",effects:{life:2,unflag:"venture"},result:"다음 회사 책상에 그 액자를 올려 뒀다."},
   {text:"찢어 버린다",effects:{burn:4,unflag:"venture"},shame:"스톡옵션으로 집 산다고 동네방네 자랑했다",result:"종이는 생각보다 잘 찢어지지 않았다."}]},
 {id:"era_fund",when:{year:[2008,2009],min:{money:3000}},once:true,w:16,title:"펀드 반토막",text:"적립식 펀드 수익률이 -48%다. 은행 직원은 \"장기 투자\"를 말한다.",choices:[
   {text:"손절한다",effects:{money:-800},result:"손실을 확정하니 잠은 잘 왔다."},
   {text:"버틴다",chance:50,success:{effects:{money:1500},result:"3년 뒤 원금을 넘겼다. 그때 판 사람들이 생각났다."},fail:{effects:{money:-1500,life:-3},result:"반토막에서 다시 반토막이 났다."}}]},
 {id:"era_app",when:{year:[2010,2015],age:[20,45]},once:true,w:12,title:"앱 하나로 대박",text:"주말에 만든 앱으로 회사를 차린 사람이 신문에 났다. 나도 아이디어는 있다.",choices:[
   {text:"주말마다 앱을 만든다",chance:25,chanceStat:"skill",success:{effects:{money:3000,fame:4,burn:6},result:"다운로드 10만. 광고 수익이 월급만큼 들어온다."},fail:{effects:{burn:6,money:-200},result:"다운로드 37. 그중 10번은 내가 눌렀다."}},
   {text:"생각만 한다",effects:{},result:"그 아이디어는 몇 년 뒤 남이 냈다."}]},
 {id:"era_remote",when:{year:[2020,2021],track:["career","founder"]},once:true,w:18,title:"재택근무",text:"출근이 사라졌다. 거실이 사무실이 되고, 회의는 카메라를 끈 얼굴들로 가득하다.",choices:[
   {text:"집에서 일에 몰두한다",effects:{perf:5,life:-3,burn:3},result:"퇴근도 사라졌다는 걸 석 달 뒤에 알았다."},
   {text:"점심에 산책을 한다",effects:{life:5,burn:-3},result:"동네에 이런 길이 있는 줄 처음 알았다."}]},
 {id:"era_ai",when:{year:[2022,2026],track:["career","free"]},once:true,w:16,title:"자동화 바람",text:"팀장이 AI 도구로 보고서를 뽑아 왔다. \"이거 우리 일 반은 줄겠는데?\"",choices:[
   {text:"도구를 먼저 익힌다",effects:{skill:3,perf:3,burn:3},result:"어느새 팀에서 제일 잘 쓰는 사람이 됐다."},
   {text:"하던 대로 한다",chance:60,success:{effects:{},result:"아직은 사람이 할 일이 많았다."},fail:{effects:{rep:-4},result:"내 일을 도구가 하루 만에 끝냈다."}}]},

 /* ---- 지난 인생의 회사. {gco}는 회사 이름, {gname}은 그 인생의 이름. 고르는 건 engine의 ghostFor ---- */
 {id:"ghost_rival",when:{ghost:"rival",track:"founder"},once:true,w:30,title:"경쟁사 {gco}",text:"같은 업계에 만만찮은 경쟁사가 생겼다. 이름은 {gco}. 대표 {gname}의 인터뷰가 업계지 1면에 실렸다. 어디서 본 듯한 얼굴이다.",choices:[
   {text:"정면으로 붙는다",chance:45,chanceStat:"rep",success:{effects:{perf:10,rep:4,burn:6},result:"그해 업계 순위에서 처음으로 {gco}보다 위에 섰다."},fail:{effects:{perf:-6,burn:8},result:"{gco} 쪽이 한 수 위였다. 지난 인생의 내가 만든 회사답다."}},
   {text:"틈새로 비켜 간다",effects:{perf:3,burn:-2},result:"{gco} 쪽이 안 하는 일을 골랐다. 손님이 조금씩 늘었다."},
   {text:"{gname} 대표를 만나 본다",effects:{net:5,life:2},result:"{gname} 대표가 웃었다. \"처음 만난 것 같지 않네요.\""}]},
 {id:"ghost_merge",when:{ghost:"news"},once:true,w:16,title:"{gco}의 인수 합병",text:"{gco}, 또 회사를 사들였다는 뉴스다. 창업자 {gname}의 이름이 경제면에 오래 남았다.",choices:[
   {text:"그 회사 주식을 조금 산다",effects:{money:-500,assets:600},result:"주식 앱 관심 목록에 {gco} 한 줄이 생겼다."},
   {text:"기사만 읽는다",effects:{},result:"그런 회사를 누가 처음 차렸을까 잠깐 생각했다."}]},
 {id:"ghost_fall",when:{ghost:"fall"},once:true,w:16,title:"{gco} 몰락",text:"누구나 아는 이름이던 {gco}. 결국 회생 절차에 들어갔다. 창업자 {gname} 시절을 그리워하는 기사가 나왔다.",choices:[
   {text:"기사를 끝까지 읽는다",effects:{skill:1,life:-1},result:"큰 회사도 저렇게 무너진다."}]},
 {id:"ghost_sign",when:{ghost:"past"},once:true,w:10,title:"옛 간판",text:"골목 안쪽 낡은 건물에 '{gco}' 간판이 반쯤 떨어져 있다. 이상하게 발이 멈췄다.",choices:[
   {text:"사진을 찍는다",effects:{life:2},result:"이유는 모르겠지만 그 사진은 오래 지우지 않았다."},
   {text:"그냥 지나간다",effects:{},result:"몇 걸음 가다 한 번 돌아봤다."}]},
 {id:"ghost_memoir",when:{ghost:"past"},once:true,w:8,title:"창업자 회고록",text:"서점 매대에 {gname}의 회고록이 있다. 띠지에 '{gco} 창업자'라고 적혀 있다.",choices:[
   {text:"사서 읽는다",effects:{skill:2,money:-2},result:"어떤 문장은 내가 쓴 것처럼 익숙했다."},
   {text:"제목만 보고 나온다",effects:{},result:"그 이름이 하루 종일 맴돌았다."}]},
 {id:"ghost_alum",when:{ghost:"past",age:[25,65]},once:true,w:8,title:"{gco}에 다녔던 사람",text:"회식 자리 옆사람이 젊을 때 {gco}에 다녔다고 한다. 대표 {gname} 씨가 어떤 사람이었는지 신나게 이야기한다.",choices:[
   {text:"끝까지 듣는다",effects:{net:3},result:"\"좋은 회사였어요. 그 사람이 있을 때는.\""},
   {text:"화제를 돌린다",effects:{},result:"다음 날 그 회사 이름을 검색해 봤다."}]},
 {id:"ghost_kid",when:{ghost:"kid"},once:true,w:12,title:"놀이터의 아이",text:"놀이터에서 엄마가 아이를 부른다. \"{gname}! 밥 먹자!\" 나뭇가지로 땅에 회사 간판 같은 걸 그리던 아이가 뛰어간다.",choices:[
   {text:"그 그림을 들여다본다",effects:{life:3},result:"삐뚤빼뚤한 글씨로 '{gco}'라고 적혀 있었다."},
   {text:"그냥 지나간다",effects:{},result:"어디서 들어 본 이름이었다."}]}
);
