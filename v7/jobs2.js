"use strict";
/* ============ 직군 확장: 3개에서 10개로 ============ */
Object.assign(JOBS,{
  game:{name:"게임 개발",rate:1.05,cost:3000,
    titles:["","QA 테스터","주니어 개발자","시니어 개발자","리드 개발자","개발 총괄 디렉터","게임사 대표"],
    ftitles:["","1인 개발자","인디 팀 대표","스튜디오 대표","중소 게임사 대표","중견 게임사 대표","게임사 회장"],
    free:"프리랜서 게임 개발자",peaks:{org:"게임사 대표",craft:"전설의 디렉터",biz:"게임사 회장",fame:"스타 개발자"},
    works:["게임잼 수상작","입소문 난 인디 게임","백만 장 팔린 게임","올해의 게임","장르를 만든 게임"],
    big:["루나게임즈","픽셀원스","스톰엔진"],small:["두더지스튜디오","새벽세시","종이비행기게임즈"],mine:["게임즈","스튜디오","인터랙티브"],
    eduW:{univ:3,college:3,voc:2,gen:2},eduBonus:{univ:12,college:9,voc:6,gen:2}},
  mech:{name:"기계·제조",rate:1.0,cost:6000,
    titles:["","수습 엔지니어","엔지니어","선임 엔지니어","책임 엔지니어","공장장","제조 기업 대표"],
    ftitles:["","1인 공방 대표","작은 공장 사장","법인 대표","중소 제조사 대표","중견 제조사 대표","제조 그룹 회장"],
    free:"프리랜서 설계 엔지니어",peaks:{org:"제조 기업 대표",craft:"기계 명장",biz:"제조 그룹 회장",fame:"스타 엔지니어"},
    works:["불량률을 반으로 줄인 공정","특허 낸 부품","수출 효자 설비","국산화한 핵심 장비","업계 표준이 된 설계"],
    big:["대한정공","누리중공업","한길모터스"],small:["성실기계","동방정밀","우진금속"],mine:["정밀","기계","테크"],
    eduW:{univ:3,college:3,voc:3,gen:1},eduBonus:{univ:14,college:10,voc:10,gen:0}},
  bank:{name:"은행·금융",rate:1.25,cost:5000,
    titles:["","수습 행원","행원","대리","지점장","본부장","은행장"],
    ftitles:["","1인 자문사 대표","투자자문사 대표","법인 대표","자산운용사 대표","중견 금융사 대표","금융 그룹 회장"],
    free:"독립 재무설계사",peaks:{org:"은행장",craft:"전설의 뱅커",biz:"금융 그룹 회장",fame:"경제 해설가"},
    works:["부실을 막아 낸 심사 보고서","히트 금융 상품","대형 인수금융 거래","위기를 넘긴 구조조정안","교과서에 실린 거래"],
    big:["바른은행","동해금융","새한은행"],small:["햇살저축은행","마을신협","든든캐피탈"],mine:["자산운용","파트너스","인베스트"],
    eduW:{univ:4,college:2,voc:1,gen:1},eduBonus:{univ:16,college:8,voc:4,gen:0}},
  doctor:{name:"의료",rate:1.8,cost:10000,needUniv:true,
    titles:["","인턴","레지던트","전문의","진료과장","병원장","의료원장"],
    ftitles:["","동네 의원 원장","의원 원장","병원 원장","중형 병원 이사장","종합병원 이사장","의료재단 이사장"],
    free:"대진 의사",peaks:{org:"의료원장",craft:"명의",biz:"의료재단 이사장",fame:"국민 주치의"},
    works:["어려운 수술 성공","새 수술법","국제 학술지 논문","표준이 된 치료 지침","교과서에 이름이 실린 술기"],
    big:["새빛대학병원","한마음의료원","중앙메디컬센터"],small:["동네연합의원","튼튼병원","우리가족의원"],mine:["의원","클리닉","메디컬"],
    eduW:{univ:3,college:0,voc:0,gen:2},eduBonus:{univ:20,college:0,voc:0,gen:0}},
  tutor:{name:"교육·학원",rate:0.9,cost:4000,
    titles:["","보조 강사","강사","전임 강사","대표 강사","부원장","교육 기업 대표"],
    ftitles:["","공부방 원장","학원 원장","법인 대표","프랜차이즈 학원 대표","교육 기업 대표","교육 그룹 회장"],
    free:"프리랜서 강사",peaks:{org:"교육 기업 대표",craft:"전설의 강사",biz:"교육 그룹 회장",fame:"일타 강사"},
    works:["족집게 모의고사","베스트셀러 교재","전설의 여름 특강","커리큘럼 한 세트","한 세대가 본 인강"],
    big:["으뜸에듀","정상학원","하늘교육"],small:["샛별학원","공부습관학원","동네보습학원"],mine:["에듀","학원","러닝"],
    eduW:{univ:4,college:2,voc:1,gen:1},eduBonus:{univ:15,college:8,voc:2,gen:0}},
  sales:{name:"영업·유통",rate:0.95,cost:3000,
    titles:["","영업 사원","주임","영업 과장","지점장","영업 본부장","유통 기업 대표"],
    ftitles:["","1인 셀러","쇼핑몰 대표","법인 대표","유통사 대표","중견 유통사 대표","유통 그룹 회장"],
    free:"프리랜서 영업 대행",peaks:{org:"유통 기업 대표",craft:"판매왕",biz:"유통 그룹 회장",fame:"완판의 아이콘"},
    works:["분기 판매 1위","전설의 계약 한 건","연간 판매왕","새 시장 개척","업계가 베낀 영업 방식"],
    big:["가온유통","한결리테일","세진상사"],small:["오늘마켓","동네유통","바로물산"],mine:["마켓","유통","트레이딩"],
    eduW:{univ:2,college:3,voc:2,gen:3},eduBonus:{univ:10,college:8,voc:6,gen:4}},
  build:{name:"건설 현장",rate:1.0,cost:6000,
    titles:["","현장 막내","기능공","반장","현장 소장","공사 본부장","건설사 대표"],
    ftitles:["","1인 시공업자","시공팀 대표","법인 대표","중소 건설사 대표","중견 건설사 대표","건설 그룹 회장"],
    free:"프리랜서 기술자",peaks:{org:"건설사 대표",craft:"건축 명장",biz:"건설 그룹 회장",fame:"집 짓는 유명인"},
    works:["하자 없는 첫 현장","공기를 한 달 당긴 공법","상 받은 건물","랜드마크 시공","교본이 된 현장"],
    big:["태산건설","한솔이앤씨","대륙건설"],small:["믿음건축","성실시공","우리집건설"],mine:["건설","시공","이앤씨"],
    eduW:{univ:1,college:2,voc:4,gen:3},eduBonus:{univ:6,college:8,voc:12,gen:4}}
});

/* 시대: 직군이 늘어서 기본값(def)과 직군별 보정으로 바꿨다 */
ERAS.length=0;
ERAS.push(
  {id:"recession",text:"경기 불황. 채용이 얼어붙고 구조조정 소문이 돈다.",def:.8,perf:{doctor:.95,tutor:.9}},
  {id:"boom",text:"경기 호황. 어디든 사람이 모자라다.",def:1.1,perf:{}},
  {id:"tech",text:"신기술 붐. 개발자 몸값이 치솟는다.",def:1,perf:{dev:1.25,game:1.1}},
  {id:"food",text:"미식 열풍. 식당마다 줄이 늘어섰다.",def:1,perf:{cook:1.25}},
  {id:"bubble",text:"자산 시장 과열. 다들 투자 얘기만 한다.",def:1,perf:{bank:1.2}},
  {id:"gameboom",text:"게임 붐. 신작마다 화제가 된다.",def:1,perf:{game:1.25}},
  {id:"export",text:"수출 호조. 공장이 3교대로 돈다.",def:1,perf:{mech:1.25,sales:1.15}},
  {id:"buildboom",text:"개발 붐. 크레인이 도시를 덮었다.",def:1,perf:{build:1.25,bank:1.1}},
  {id:"edu",text:"사교육 열풍. 학원가 불이 꺼지지 않는다.",def:1,perf:{tutor:1.25}},
  {id:"aging",text:"고령화 가속. 병원마다 대기 줄이 길다.",def:1,perf:{doctor:1.2}}
);

CARDS.push(
 /* ---- 게임 개발 ---- */
 {id:"game_crunch",when:{job:"game",track:"career",stage:[1,4]},w:9,title:"크런치 모드",text:"출시가 두 달 남았다. PD가 말했다. \"이번 달만 달리자.\" 지난달에도 들은 말이다.",choices:[
   {text:"같이 달린다",effects:{perf:8,burn:14,life:-4},result:"사무실 간이침대에 내 이름표가 붙었다."},
   {text:"정시에 퇴근한다",effects:{rep:-3,burn:-2,life:3},result:"눈치는 보였지만 주말은 지켰다."}]},
 {id:"game_review",when:{job:"game",track:WORKING,stage:[2,5]},w:8,title:"출시 첫날 평가",text:"스토어에 평가가 올라오기 시작했다. 새로 고침을 멈출 수 없다.",choices:[
   {text:"밤새 패치한다",check:{stat:"skill",min:55},effects:{burn:10},success:{effects:{rep:8,fame:5,perf:8},result:"'대체로 긍정적'이 '매우 긍정적'으로 바뀌었다."},fail:{effects:{rep:-6},result:"패치가 세이브 파일을 날렸다.",shame:"패치로 유저 세이브를 날렸다"}},
   {text:"지켜본다",effects:{},result:"'복합적'. 복합적인 기분이었다."}]},
 {id:"game_jam",when:{job:"game",min:{skill:35}},once:true,w:7,title:"게임잼",text:"48시간 안에 게임 하나. 주말을 통째로 써야 한다.",choices:[
   {text:"나간다",chance:40,chanceStat:"skill",effects:{burn:6},success:{effects:{fame:6,prog:1,net:4,resume:"게임잼 대상"},result:"대상. 심사평은 \"이게 48시간?\"이었다."},fail:{effects:{net:3,skill:1},result:"완성은 못 했다. 그래도 캐릭터는 걸었다."}},
   {text:"주말에는 쉰다",effects:{burn:-5},result:"남이 만든 게임을 했다."}]},
 {id:"game_gacha",when:{job:"game",track:"career",stage:[3,5]},once:true,w:8,title:"확률형 아이템",text:"사업팀이 장표를 가져왔다. 뽑기 확률을 낮추면 매출이 30% 오른다고 한다.",choices:[
   {text:"넣는다",effects:{perf:10,rep:-6,pp:1},result:"매출 그래프가 섰다. 커뮤니티도 들고일어났다.",shame:"뽑기 확률을 낮추는 데 찬성했다"},
   {text:"반대한다",effects:{rep:5,perf:-4,fame:3},result:"\"그 개발자는 믿을 만하다\"는 글이 올라왔다."}]},
 {id:"game_publisher",when:{job:"game",track:"founder",stage:[1,3]},once:true,w:12,title:"퍼블리셔의 제안",text:"큰 회사가 유통을 맡겠다고 한다. 수익의 절반을 가져간다.",choices:[
   {text:"계약한다",effects:{do:"take_invest",rep:2},result:"출시일이 확정됐다. 내 게임이 절반만 내 것이 됐다."},
   {text:"직접 낸다",chance:35,chanceStat:"skill",success:{effects:{fame:10,perf:10},result:"입소문이 났다. 첫 주에 5만 장."},fail:{effects:{perf:-6},result:"첫 주 판매량은 212장이었다."}}]},
 /* ---- 기계·제조 ---- */
 {id:"mech_line",when:{job:"mech",track:"career",stage:[1,4]},w:9,title:"라인이 멈췄다",text:"새벽 2시, 3호기에서 이상한 소리가 난다. 세우면 하루 손실이 2억이다.",choices:[
   {text:"세우고 점검한다",effects:{rep:3,perf:-5},result:"베어링이 반쯤 갈려 있었다. 세우길 잘했다."},
   {text:"일단 돌린다",chance:45,success:{effects:{perf:6},result:"아침 교대까지 버텼다."},fail:{effects:{rep:-10,perf:-8},result:"축이 부러졌다. 손실은 열흘 치가 됐다.",shame:"이상한 소리를 무시하고 돌리다 설비를 망가뜨렸다"}}]},
 {id:"mech_defect",when:{job:"mech",track:WORKING,stage:[2,5]},w:8,title:"출하 직전의 불량",text:"검사에서 0.2mm 오차가 나왔다. 납기는 내일이다.",choices:[
   {text:"전량 재작업한다",effects:{perf:-6,rep:5,burn:8},result:"납기는 사흘 늦었다. 거래처는 다음 계약도 우리와 했다."},
   {text:"허용 오차라고 우긴다",chance:40,success:{effects:{perf:5},result:"아무 말도 돌아오지 않았다."},fail:{effects:{rep:-12},result:"리콜 공문이 왔다.",shame:"불량을 알고 출하했다가 리콜을 맞았다"}}]},
 {id:"mech_patent",when:{job:"mech",track:WORKING,min:{skill:50}},once:true,w:7,title:"특허",text:"내가 고친 치구가 옆 공장에서도 쓰이기 시작했다.",choices:[
   {text:"내 이름으로 출원한다",check:{stat:"skill",min:55},success:{effects:{fame:6,rep:5,prog:1,resume:"특허 등록"},result:"등록증이 액자에 들어갔다."},fail:{effects:{money:-300},result:"이미 비슷한 기술이 있었다. 변리사 비용만 나갔다."}},
   {text:"회사 이름으로 낸다",effects:{pp:2,rep:2},result:"포상금 50만 원과 표창장을 받았다."}]},
 {id:"mech_safety",when:{job:"mech",track:"career",stage:[2,5]},cd:10,w:7,title:"안전 점검 전날",text:"안전 덮개를 떼어 놓고 작업하는 라인이 있다. 내일 점검이 나온다.",choices:[
   {text:"지금 다 세우고 고친다",effects:{perf:-4,rep:4},result:"잔소리꾼 소리를 들었다. 다친 사람은 없었다."},
   {text:"점검 때만 붙인다",chance:60,success:{effects:{},result:"점검은 15분 만에 끝났다."},fail:{effects:{rep:-14,life:-6},result:"그다음 주에 사고가 났다.",shame:"안전 덮개를 떼고 돌리다 사고가 났다"}}]},
 {id:"mech_overseas",when:{job:"mech",track:"founder",stage:[2,5]},once:true,w:10,title:"해외 바이어",text:"독일에서 메일이 왔다. 샘플을 보내 달라고 한다.",choices:[
   {text:"무리해서 샘플을 만든다",hint:"현금 -800만 원",chance:45,chanceStat:"skill",effects:{money:-800},success:{effects:{perf:12,rep:6,fame:4},result:"첫 컨테이너가 부산항을 떠났다."},fail:{effects:{},result:"답장은 오지 않았다."}},
   {text:"국내에 집중한다",effects:{perf:2},result:"메일은 보관함으로 옮겼다."}]},
 /* ---- 은행·금융 ---- */
 {id:"bank_window",when:{job:"bank",track:"career",stage:[1,2]},once:true,w:10,title:"창구의 할머니",text:"할머니가 통장을 내밀며 전 재산을 \"아들이 말한 계좌\"로 보내 달라고 한다.",choices:[
   {text:"붙잡고 확인한다",effects:{rep:5,perf:-2,life:3,resume:"금융 사기 예방 감사장"},result:"아들은 그런 전화를 한 적이 없었다. 경찰서에서 감사장이 왔다."},
   {text:"요청대로 처리한다",effects:{perf:1,life:-5},result:"송금은 3분 만에 끝났다. 그 3분이 오래 남았다.",shame:"수상한 송금을 그냥 처리했다"}]},
 {id:"bank_quota",when:{job:"bank",track:"career",stage:[1,4]},w:9,title:"분기 말 실적",text:"카드 30장, 펀드 20좌가 모자란다. 지점장이 내 책상 옆에 서 있다.",choices:[
   {text:"가족과 친구에게 돌린다",effects:{perf:7,net:-5,life:-3},result:"명절에 카드 얘기는 금지어가 됐다."},
   {text:"발로 뛴다",effects:{perf:4,burn:9},result:"상가 한 바퀴를 세 번 돌았다."},
   {text:"못 채웠다고 보고한다",effects:{perf:-5,burn:-2},result:"지점장의 한숨은 길었다."}]},
 {id:"bank_loan",when:{job:"bank",track:"career",stage:[2,5]},w:8,title:"대출 심사",text:"30년 거래한 공장 사장이 왔다. 숫자는 안 되는데 사람은 믿을 만하다.",choices:[
   {text:"승인한다",chance:50,chanceStat:"skill",success:{effects:{rep:8,net:5,perf:6},result:"공장은 살아났다. 명절마다 사과 상자가 온다."},fail:{effects:{rep:-10,pp:-2},result:"부실 채권 서류에 내 도장이 찍혀 있다.",shame:"정으로 내준 대출이 부실이 됐다"}},
   {text:"규정대로 거절한다",effects:{life:-4,rep:1},result:"사장은 고개를 숙이고 나갔다."}]},
 {id:"bank_close",when:{job:"bank",track:"career",stage:[3,5]},once:true,w:7,title:"지점 통폐합",text:"내 지점이 없어진다. 본점 발령과 희망퇴직 중에 고르라고 한다.",choices:[
   {text:"본점으로 간다",effects:{pp:2,burn:6,net:3},result:"본점 엘리베이터는 사원증을 두 번 찍어야 탄다."},
   {text:"희망퇴직을 받는다",hint:"위로금 1년 치 연봉",effects:{do:"severance"},result:"간판을 떼는 날, 단골 고객이 떡을 들고 왔다."}]},
 {id:"bank_vip",when:{job:"bank",track:"career",stage:[2,5],min:{net:40}},once:true,w:7,title:"큰손의 부탁",text:"예금 300억 고객이 말했다. \"이 서류, 날짜만 좀 고쳐 줘요.\"",choices:[
   {text:"거절한다",effects:{rep:4,perf:-4},result:"고객은 예금을 옮겼다. 감사팀은 내 이름을 기억했다."},
   {text:"고쳐 준다",effects:{perf:8,flag:"dirty"},result:"아무 일도 없었다. 아직은.",shame:"고객 부탁으로 서류 날짜를 고쳤다"}]},
 /* ---- 의료 ---- */
 {id:"doc_night",when:{job:"doctor",track:"career",stage:[1,2]},w:10,title:"36시간째 당직",text:"호출기가 또 울린다. 눈앞이 두 겹으로 보인다.",choices:[
   {text:"뛰어간다",effects:{perf:6,burn:13,skill:1},result:"환자는 살았다. 나는 계단에서 10분 잤다."},
   {text:"동기에게 부탁한다",when:{hasRival:true},effects:{like:-1,burn:-3},result:"{rival}은 말없이 일어났다. 다음은 내 차례다."}]},
 {id:"doc_error",when:{job:"doctor",track:"career",stage:[1,4]},w:8,title:"차트의 실수",text:"투약 용량을 잘못 적은 걸 발견했다. 아직 투여 전이다.",choices:[
   {text:"바로 고치고 보고한다",effects:{rep:3,perf:-3},result:"교수는 30분 혼냈고, 마지막에 \"잘했다\"고 했다."},
   {text:"조용히 고친다",chance:60,success:{effects:{},result:"아무도 몰랐다."},fail:{effects:{rep:-10},result:"간호사가 이미 기록을 본 뒤였다.",shame:"투약 실수를 몰래 고치려다 들켰다"}}]},
 {id:"doc_surgery",when:{job:"doctor",track:WORKING,stage:[3,5]},cd:9,w:8,title:"아무도 맡지 않는 수술",text:"성공률 30%. 다른 병원 세 곳이 거절한 환자다.",choices:[
   {text:"맡는다",check:{stat:"skill",min:70},effects:{burn:10},success:{effects:{rep:12,fame:8,prog:1,perf:8},result:"열네 시간. 환자는 걸어서 퇴원했다."},fail:{effects:{rep:-6,life:-8},result:"가족에게 설명하는 데 한 시간이 걸렸다."}},
   {text:"더 큰 병원으로 보낸다",effects:{rep:1},result:"의뢰서를 길게 썼다."}]},
 {id:"doc_pharma",when:{job:"doctor",track:WORKING,stage:[2,5]},once:true,w:7,title:"제약사 영업 사원",text:"봉투가 책상 위에 놓였다. \"학회 참가비 지원입니다.\"",choices:[
   {text:"돌려보낸다",effects:{rep:4},result:"영업 사원은 다음 주에 음료수만 들고 왔다."},
   {text:"받는다",effects:{money:1500,flag:"dirty"},result:"봉투는 생각보다 두꺼웠다.",shame:"제약사 봉투를 받았다"}]},
 {id:"doc_rural",when:{job:"doctor",track:WORKING,age:[30,52]},once:true,w:6,title:"의사 없는 섬",text:"섬마을 보건소에 의사가 없다고 한다. 2년 근무 제안이 왔다.",choices:[
   {text:"간다",effects:{life:10,fame:6,rep:6,pp:-2,money:-1000,resume:"도서 지역 진료 2년"},result:"할머니들이 문 앞에 생선을 놓고 갔다."},
   {text:"남는다",effects:{},result:"공문은 다른 사람에게 갔다."}]},
 /* ---- 교육·학원 ---- */
 {id:"tut_parent",when:{job:"tutor",track:WORKING,stage:[1,4]},w:9,title:"학부모 상담",text:"\"우리 애 성적이 왜 안 오르죠? 옆 학원으로 옮길까 봐요.\"",choices:[
   {text:"숙제 관리까지 떠맡는다",effects:{perf:5,burn:9,rep:3},result:"밤 11시에 인증 사진을 받는다."},
   {text:"솔직하게 말한다",chance:50,success:{effects:{rep:6},result:"\"이런 말 해 주는 선생님은 처음이에요.\""},fail:{effects:{perf:-5,rep:-3},result:"다음 달, 그 학생 자리는 비어 있었다."}}]},
 {id:"tut_poach",when:{job:"tutor",track:"career",stage:[2,4]},cd:9,w:7,title:"길 건너 학원의 제안",text:"길 건너 원장이 불렀다. \"학생들 데리고 오면 7대 3으로 나눕시다.\"",choices:[
   {text:"옮긴다",hint:"연봉 +20%, 승진 점수는 0부터",effects:{do:"move",rep:-5},result:"학생 절반이 따라왔다. 전 원장은 인사를 받지 않는다."},
   {text:"남는다",effects:{rep:3,pp:1},result:"원장이 그 얘기를 들었는지 회식을 샀다."}]},
 {id:"tut_online",when:{job:"tutor",track:WORKING,min:{skill:45}},once:true,w:8,title:"인강 촬영 제안",text:"플랫폼에서 연락이 왔다. 카메라 앞에서 혼자 세 시간을 떠들어야 한다.",choices:[
   {text:"찍는다",chance:40,chanceStat:"skill",effects:{burn:8},success:{effects:{fame:15,money:2000,flag:"hit",resume:"온라인 강의 1위"},result:"수강생 3만 명. 댓글은 \"목소리가 좋다\"가 제일 많다."},fail:{effects:{fame:3},result:"수강생 41명. 댓글은 \"판서가 안 보여요\"였다."}},
   {text:"교실이 좋다",effects:{rep:2},result:"분필을 새로 샀다."}]},
 {id:"tut_exam",when:{job:"tutor",track:WORKING,stage:[1,5]},cd:8,w:8,title:"시험 전날 밤",text:"학생들이 줄을 서서 마지막 질문을 한다. 밤 11시다.",choices:[
   {text:"끝까지 남는다",effects:{rep:5,burn:8,life:-2},result:"마지막 학생이 \"쌤, 감사해요\" 하고 갔다."},
   {text:"예상 문제를 찍어 준다",chance:30,success:{effects:{fame:8,rep:8,perf:8},result:"3번 문제가 그대로 나왔다. 전화기에 불이 났다."},fail:{effects:{rep:-4},result:"하나도 안 나왔다."}}]},
 {id:"tut_leak",when:{job:"tutor",track:WORKING,stage:[3,5]},once:true,w:6,title:"문제 거래",text:"아는 교사가 말했다. 내신 문제를 미리 줄 수 있다고.",choices:[
   {text:"거절한다",effects:{rep:3},result:"그 번호는 지웠다."},
   {text:"산다",hint:"현금 -1,000만 원",effects:{perf:10,money:-1000,flag:"dirty"},result:"우리 반 평균이 20점 올랐다.",shame:"내신 문제를 돈 주고 샀다"}]},
 /* ---- 영업·유통 ---- */
 {id:"sal_cold",when:{job:"sales",track:WORKING,stage:[1,3]},w:9,title:"문전박대",text:"오늘만 열한 번째 \"안 사요\"다. 구두 굽이 닳았다.",choices:[
   {text:"한 군데 더 간다",chance:35,chanceStat:"net",effects:{burn:6},success:{effects:{perf:10,net:4},result:"열두 번째 집이 계약서를 꺼냈다."},fail:{effects:{},result:"열두 번째도 안 샀다."}},
   {text:"오늘은 접는다",effects:{burn:-3},result:"편의점 앞에서 컵라면을 먹었다."}]},
 {id:"sal_drink",when:{job:"sales",track:"career",stage:[1,4]},w:8,title:"접대",text:"거래처 부장이 2차를 가자고 한다. 내일 아침 7시에 회의가 있다.",choices:[
   {text:"끝까지 간다",effects:{net:7,perf:5,burn:10,life:-3},result:"부장의 18번은 트로트였다. 세 번 불렀다."},
   {text:"1차에서 빠진다",effects:{burn:1,net:-2},result:"택시 안에서 내일 자료를 봤다."}]},
 {id:"sal_bigdeal",when:{job:"sales",track:WORKING,stage:[2,5]},w:8,title:"큰 계약",text:"경쟁사가 우리보다 8% 싸게 불렀다. 결정은 내일이다.",choices:[
   {text:"가격을 맞춘다",effects:{perf:9,rep:-3},result:"계약은 땄다. 남는 건 명함뿐이라고 재무팀이 말했다."},
   {text:"사람으로 승부한다",check:{stat:"net",min:50},success:{effects:{perf:12,rep:6},result:"\"가격은 저쪽이 싼데, 당신이라 합니다.\""},fail:{effects:{perf:-6},result:"저쪽 가격이 이겼다."}}]},
 {id:"sal_push",when:{job:"sales",track:"career",stage:[2,5]},once:true,w:7,title:"밀어내기",text:"분기 마감 사흘 전. 대리점에 물건을 떠넘기면 숫자는 맞는다.",choices:[
   {text:"밀어낸다",effects:{perf:10,rep:-4,flag:"dirty"},result:"대리점 창고가 우리 물건으로 찼다.",shame:"대리점에 물량을 떠넘겼다"},
   {text:"못 한다고 한다",effects:{perf:-6,rep:4},result:"숫자는 모자랐다. 대리점 사장이 밥을 샀다."}]},
 {id:"sal_live",when:{job:"sales",track:WORKING},once:true,w:7,title:"라이브 방송 판매",text:"회사가 라이브 커머스를 해 보라고 한다. 진행자는 나다.",choices:[
   {text:"한다",chance:45,success:{effects:{fame:10,perf:10,resume:"라이브 방송 완판"},result:"40분 만에 완판. 채팅창이 내 이름을 불렀다."},fail:{effects:{fame:2,rep:-2},result:"시청자 17명. 그중 12명이 직원이었다."}},
   {text:"카메라는 사양한다",effects:{},result:"진행은 신입이 했다."}]},
 /* ---- 건설 현장 ---- */
 {id:"bld_rain",when:{job:"build",track:WORKING,stage:[1,4]},w:9,title:"장마",text:"비가 열흘째 온다. 공정은 2주 밀렸고 발주처는 매일 전화한다.",choices:[
   {text:"우비 입고 강행한다",chance:50,effects:{burn:8},success:{effects:{perf:8},result:"공정표를 따라잡았다."},fail:{effects:{rep:-8},result:"콘크리트에 금이 갔다. 다 깨고 다시 쳤다.",shame:"빗속에 타설했다가 다 깨고 다시 쳤다"}},
   {text:"그칠 때까지 기다린다",effects:{perf:-5,rep:2},result:"함바집에서 고스톱 실력이 늘었다."}]},
 {id:"bld_hook",when:{job:"build",track:"career",stage:[1,5]},cd:8,w:8,title:"안전고리",text:"15층 외벽. 고리를 걸면 작업이 두 배로 느려진다. 다들 안 건다.",choices:[
   {text:"걸고, 남들도 걸게 한다",effects:{perf:-3,rep:4},result:"잔소리꾼이라고 불렸다. 그해 우리 현장은 무재해였다."},
   {text:"안 건다",chance:80,success:{effects:{perf:4},result:"오늘도 무사했다."},fail:{effects:{burn:30,life:-8,perf:-10},result:"3층 높이에서 떨어졌다. 석 달을 누워 있었다.",shame:"안전고리 없이 일하다 떨어졌다"}}]},
 {id:"bld_rebar",when:{job:"build",track:WORKING,stage:[3,5]},once:true,w:7,title:"철근이 모자라다",text:"원청이 말했다. \"도면보다 좀 덜 넣어도 안 무너져.\"",choices:[
   {text:"도면대로 한다",effects:{perf:-6,rep:6},result:"원청과 사이가 틀어졌다. 건물은 100년 갈 것이다."},
   {text:"시키는 대로 한다",effects:{perf:8,flag:"dirty"},result:"준공 검사는 통과했다.",shame:"철근을 빼라는 지시를 따랐다"}]},
 {id:"bld_license",when:{job:"build",track:WORKING,age:[19,45]},once:true,w:8,title:"기사 자격증",text:"퇴근 후 학원에 다니면 2년 뒤 시험을 볼 수 있다.",choices:[
   {text:"다닌다",effects:{skill:7,burn:9,life:-4,pp:2,resume:"건축기사 자격 취득"},result:"안전모 대신 형광펜을 쥐었다. 합격."},
   {text:"현장이 학교다",effects:{skill:1},result:"반장이 못 박는 법을 다시 가르쳐 줬다."}]},
 {id:"bld_unpaid",when:{job:"build",track:["founder","free"]},once:true,w:12,title:"떼인 공사 대금",text:"원청이 부도를 냈다. 받을 돈은 못 받고, 인부들 임금은 내가 줘야 한다.",choices:[
   {text:"내 돈으로 임금을 준다",hint:"현금 -2,000만 원",effects:{money:-2000,rep:8,net:6},result:"다음 현장에 부르지도 않은 사람들이 왔다. \"사장님 일이면 합니다.\""},
   {text:"나도 못 준다고 한다",effects:{rep:-10,net:-6},result:"현장 사무실 앞에 사람들이 모였다.",shame:"인부들 임금을 못 줬다"}]}
);
