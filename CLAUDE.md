# 세계 정세 연대기 — 프로젝트 안내 (Claude Code용)

1936–1991년 세계 판도를 월 단위로 보여주는 지구본 + 사건 인과 연결망("사건의 뿌리") 웹사이트.
하츠 오브 아이언 4(HOI4)를 하며 역사 배경을 알고 싶은 사람을 위해 만들었다. GitHub Pages로 배포한다
(https://yub815.github.io/world-chronicle/). 빌드 단계 없음 — 파일을 고치고 커밋·푸시하면 끝.
사용자와는 한국어로 대화한다.

## 구조
- `index.html` — 마크업. 라이브러리: d3 7.9.0(cdnjs), topojson-client 3.1.0(jsdelivr), Google Fonts(Black Han Sans, IBM Plex Sans KR, IBM Plex Mono)
- `css/style.css` — 디자인 토큰(:root). 기본 다크, `prefers-color-scheme: light`와 `[data-theme]`으로 라이트 테마. 지도 색도 여기(`--f-XX` 진영, `--i-X` 이념)
- `js/app.js` — 전체 동작 (IIFE 하나). 주요 부분:
  - 시간: 월 인덱스 `m` (0 = 1936-01, 671 = 1991-12), 재생용 실수 `S.t`. `mi("YYYY-MM")`로 변환
  - 지구본: canvas 두 장(`#base` 지형, `#overlay` 마커·강조). d3.geoOrthographic, d3.zoom으로 회전/확대
  - 영토 주인이 바뀌면 색 보간(TR_MS) + 금색 플래시(FLASH_MS)
  - 재생: requestAnimationFrame 연속 진행, 사건 날짜를 지나면 `announce()`로 사건 카드 + 카메라 이동, OPT.pause면 잠시 멈춤
  - 오른쪽 패널: overview / event / ent(국가) / person / grp(정당) 렌더 함수
  - "사건의 뿌리": SVG. 레인 7개(AM, EU, GL, EE, ME, SA, EA), y는 날짜 + 같은 레인 최소 간격. 선택 시 직접 원인·결과만 강조
  - 사진: `data/wiki-photos.js`의 영어 위키백과 문서명으로 런타임에 pageimages API(pilicense=free) 호출
- `data/borders.js` — `GEO` TopoJSON (객체 s38/s45/s60/s94 = 1936–45.8 / 1945.9–59 / 1960–90 / 1991 스냅샷). 각 도형의 `properties.k`가 영토 키. **직접 수정 금지** (원본: historical-basemaps, GPL-3.0; 점령·전선 구역은 손으로 그린 마스크로 분할)
  - 예외(2026-09, 사용자 허락): 마스크로 자를 때 엉뚱한 키에 붙은 조각 43개를 좌표 변경 없이 올바른 키로 옮겼다(topojson `mergeArcs`로 합쳐 가짜 해안선 없음). 예: POL_W 동쪽 띠 → POL_E, 내몽골 동부 CHI → MAN, 쿠웨이트 JOR → KUW(s38에 새로 만듦). 다시 할 일이 생기면 좌표는 건드리지 말고 조각 소속만 바꾼다
- `data/territories.js` — `TERR[영토키] = "NAT#항목|YYYY-MM:항목|..."`. 항목 = `주인[/점령국][:c]` (`:c` = 식민지·보호령, `/X` = X가 군사 점령). NAT = 그 땅의 본래 민족/국가. 없는 키는 키 자체가 주인
- `data/countries.js` — `ENT[id]`: `n` 짧은 이름, `sn` 짧은 이름 연표, `nm` 정식 이름 연표, `h:1` HOI4 태그 여부, `f` 진영 연표, `i` 이념 연표, `L` 지도자 `"YYYY-MM|이름|직함[|b|c]"`(b·c = 두 번째·세 번째 칸), `pt` 집권 정당 연표, `end` 소멸 시점
  - 진영 코드: AX 추축국, AA 추축 협력국, AL 연합국, CO 코민테른·소련 진영, NE 중립, WE 서방 진영, NA NATO, WP 바르샤바 조약, EB 친소 공산권, CN 중국 노선 공산권, NM 비동맹
  - 이념 코드: D 민주주의, F 파시즘, C 공산주의, N 권위주의·비동맹
- `data/events-1929-1949.js`(EV1), `data/events-1950-1991.js`(EV2) — 사건 `{id, d:"YYYY-MM-DD", t 제목, r 레인, loc:[경도,위도], c 국가id[], p 인물id[], g 정당id[], k 원인 사건id[], s 요약, q 쟁점(선택)}`
- `data/people-1.js`, `people-2.js` — `id: [이름, 원어, 생몰, 국가id, 역할, 소개, 정당id]`
- `data/parties.js` — `GRP[id] = [이름, 종류, 국가id, 이념, 활동기간, 설명]`
- `data/wiki-photos.js` — `WIKI[사건id] = "English Wikipedia article title"`
- `data/cities.js` — `CITY = [[이름 연표, 경도, 위도, 등급 1–3, 수도 연표], ...]`. 이름 연표로 개명 표시(첫 칸이 비면 그 전엔 숨김), 수도 연표 `"1|YYYY-MM:0"`. 등급이 높을수록 더 확대해야 보이고, 그 시점의 수도는 최소 2등급. `drawCities()`가 나라 이름과 겹치지 않게 배치
- `data/states.js` — `STATES` TopoJSON. 나라 안쪽 행정구역(주·성·도) 경계선. 도형마다 `t = "YYYY-MM|YYYY-MM,..."`(그 선이 있던 기간, 끝 달 제외). **직접 고치지 말고** `tools/states`에서 `npm i && npm run build`로 다시 만든다. 현대 구역(Natural Earth admin-1 공개 도메인 + geoBoundaries 중국 현 PDDL·독일 크라이스 dl-de/by-2-0·폴란드 포비아트 ODbL)을 `tools/states/rules/*.mjs`의 규칙으로 달마다 당시 구역에 묶는다(근사치). 규칙 없는 나라·시기는 선을 안 그린다. `drawStates()`가 확대 시(STATE_R0–R1)에 그 달의 선만 옅게 그림

## 데이터 수정 규칙
- 사건 추가 시: id 고유, 원인(k)은 반드시 더 이른 날짜의 기존 사건, c/p/g의 id는 각 파일에 존재해야 함. 새 인물·정당도 함께 추가
- 사진이 없거나 틀리면 `wiki-photos.js`의 문서명만 바꾼다 (자유 라이선스 이미지만 표시됨)
- 문체: 사건 요약 2–3문장, 사실 위주, "~했다" 체. 해석이 갈리는 내용은 `q`(쟁점)에 분리
- 국경은 근사치임을 페이지 하단에 명시해 둠. GPL 출처 문구 유지

## 배포 시 주의
- `css/style.css`나 `js/app.js`를 고치면 `index.html`의 `?v=숫자`를 하나 올린다. GitHub Pages가 10분간 캐시해서, 안 올리면 새 HTML + 예전 JS가 섞여 깨져 보인다

## 확인 방법
VS Code Live Server로 index.html을 열어 콘솔 오류 확인. `window.__app` (S, setDate, select, setT, setPlaying)로 디버깅 가능.
