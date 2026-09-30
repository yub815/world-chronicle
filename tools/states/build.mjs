// data/states.js 빌드: 현대 행정구역 도형을 받아 "그 달에 실제로 있던 구역" 단위로 묶고,
// 서로 다른 구역 사이의 선만 골라 유효 기간(월 인덱스 범위)을 붙여 저장한다.
//
//   cd tools/states && npm i && npm run build
//
// 원본(.cache/에 내려받음):
//   Natural Earth 1:10m admin-1 (공개 도메인) — 전 세계
//   geoBoundaries gbOpen — 중국 현(ADM2, PDDL), 독일 크라이스(ADM3, dl-de/by-2-0), 폴란드 포비아트(ADM2, ODbL)
// 규칙은 rules/*.mjs. 단위(unit)마다 label(u, m)이 "당시 나라|구역 이름"을 돌려준다.
// 두 단위의 라벨이 다르고 당시 나라가 같으면 그 사이 선을 그 달에 그린다(나라 경계는 borders.js가 그린다).
import fs from "node:fs";
import path from "node:path";
import { geoCentroid, geoContains, geoDistance } from "d3-geo";
import { topology } from "topojson-server";
import { mesh } from "topojson-client";
import { presimplify, simplify, quantile, sphericalTriangleArea } from "topojson-simplify";
import { labelFor, FINE } from "./rules/index.mjs";
import { M_END, ym, REF } from "./rules/util.mjs";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const CACHE = path.join(HERE, ".cache");
const OUT = path.join(HERE, "../../data/states.js");
const KEEP = +(process.env.KEEP || 0.12);   // 단순화 후 NE 점 중 남길 비율. 세부 원본에도 같은 무게 기준을 쓴다

const SRC = {
  ne: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson",
  CHN: "https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/CHN/ADM2/geoBoundaries-CHN-ADM2.geojson",
  DEU: "https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/DEU/ADM3/geoBoundaries-DEU-ADM3.geojson",
  POL: "https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/POL/ADM2/geoBoundaries-POL-ADM2.geojson",
};

async function load(id){
  fs.mkdirSync(CACHE, {recursive: true});
  const f = path.join(CACHE, id + ".geojson");
  if(!fs.existsSync(f)){
    console.log("download", SRC[id]);
    const r = await fetch(SRC[id]);
    if(!r.ok) throw new Error(`${SRC[id]}: ${r.status}`);
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(f, "utf8"));
}

// d3-geo는 바깥 고리가 시계 방향이어야 한다(GeoJSON 표준은 반대). 방향이 거꾸로면 무게중심이 지구 반대편에 찍힌다
function rewind(geom){
  const area = r => { let s = 0; for(let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[i][0] - r[j][0]) * (r[i][1] + r[j][1]); return s; };  // >0: 시계 방향
  const fix = poly => poly.map((r, k) => ((area(r) > 0) === (k === 0)) ? r : r.slice().reverse());
  if(geom.type === "Polygon") geom.coordinates = fix(geom.coordinates);
  else if(geom.type === "MultiPolygon") geom.coordinates = geom.coordinates.map(fix);
  return geom;
}

// ---------- 단위 만들기 ----------
const ne = await load("ne");
const neUnits = ne.features.map(f => {
  rewind(f.geometry);
  const p = f.properties, [lon, lat] = geoCentroid(f);
  return {src: "ne", key: p.adm1_code, cc: p.adm0_a3, name: p.name, region: p.region, gu: p.geonunit, lon, lat, f};
});

// 세부 원본의 단위에는 현대 1급 구역 이름(parent)을 붙인다(무게중심이 들어가는 NE 도형, 없으면 가장 가까운 것)
function attachParent(units, cc){
  const cands = neUnits.filter(u => u.cc === cc);
  for(const u of units){
    let best = cands.find(c => geoContains(c.f, [u.lon, u.lat]));
    if(!best){ let d = Infinity; for(const c of cands){ const x = geoDistance([u.lon,u.lat],[c.lon,c.lat]); if(x < d){ d = x; best = c; } } }
    u.parent = best.name;
  }
}
const fine = {};
for(const cc of FINE){
  const g = await load(cc);
  const units = g.features.map((f, i) => {
    rewind(f.geometry);
    const [lon, lat] = geoCentroid(f);
    return {src: cc, key: cc + "-" + i, cc, name: f.properties.shapeName, lon, lat, f};
  });
  attachParent(units, cc);
  fine[cc] = units;
}

// ---------- 라벨 계산 ----------
const MISSING = new Set();
function labels(units){
  const intern = new Map([[null, 0]]), names = [null];
  const L = units.map(u => {
    const row = new Int32Array(M_END);
    for(let m = 0; m < M_END; m++){
      let s = labelFor(u, m, MISSING);
      if(s != null && !s.includes("|")) s = u.cc + "|" + s;
      if(s == null) s = null;
      let id = intern.get(s);
      if(id === undefined){ id = names.length; intern.set(s, id); names.push(s); }
      row[m] = id;
    }
    return row;
  });
  const prefix = names.map(s => s && s.slice(0, s.indexOf("|")));
  return {L, prefix, names};
}

function ranges(bits){
  const out = []; let a = -1;
  for(let m = 0; m <= M_END; m++){
    const on = m < M_END && bits[m];
    if(on && a < 0) a = m;
    if(!on && a >= 0){ out.push([a, m]); a = -1; }
  }
  return out;
}

// ---------- 원본 하나 처리: 선 + 유효 기간 ----------
function build(units, skipPair){
  const fc = {type: "FeatureCollection", features: units.map((u, i) => ({type: "Feature", id: i, properties: {i}, geometry: u.f.geometry}))};
  let topo = topology({u: fc});
  topo = presimplify(topo, sphericalTriangleArea);
  topo = simplify(topo, quantile(topo, KEEP));   // quantile(p): 점의 p만큼 남기는 무게
  const {L, prefix} = labels(units);
  const sigCache = new Map(), bySig = new Map();
  const sigOf = (a, b) => {
    const i = Math.min(a, b), j = Math.max(a, b), k = i * 65536 + j;
    let s = sigCache.get(k);
    if(s !== undefined) return s;
    s = "";
    if(!skipPair(units[i], units[j])){
      const bits = new Uint8Array(M_END), A = L[i], B = L[j];
      for(let m = 0; m < M_END; m++) bits[m] = A[m] && B[m] && A[m] !== B[m] && prefix[A[m]] === prefix[B[m]] ? 1 : 0;
      const r = ranges(bits);
      s = r.length ? JSON.stringify(r) : "";
    }
    sigCache.set(k, s);
    return s;
  };
  // 먼저 어떤 기간 조합이 있는지 모은다
  mesh(topo, topo.objects.u, (a, b) => { if(a !== b){ const s = sigOf(a.properties.i, b.properties.i); if(s) bySig.set(s, 1); } return false; });
  const feats = [];
  for(const s of bySig.keys()){
    const g = mesh(topo, topo.objects.u, (a, b) => a !== b && sigOf(a.properties.i, b.properties.i) === s);
    if(g.coordinates.length) feats.push({type: "Feature", properties: {t: JSON.parse(s)}, geometry: g});
  }
  return feats;
}

const feats = [];
const fineSet = new Set(FINE);
feats.push(...build(neUnits, (a, b) => a.cc === b.cc && fineSet.has(a.cc)));
for(const cc of FINE) feats.push(...build(fine[cc], (a, b) => false));

// 규칙에 적힌 이름이 실제 원본에 있는지 확인(오타 방지)
const have = new Set([...neUnits, ...Object.values(fine).flat()].map(u => (u.src === "ne" ? u.cc : u.src + "2") + ":" + u.name));
for(const [cc, n] of REF) if(!have.has(cc + ":" + n)) MISSING.add(cc + ":" + n);
if(MISSING.size){ console.error("규칙에 적힌 이름이 원본에 없음:\n  " + [...MISSING].join("\n  ")); process.exitCode = 1; }

// ---------- 저장 ----------
// 같은 기간 조합끼리 합쳐 도형 수를 줄인다
const merged = new Map();
for(const f of feats){
  const k = JSON.stringify(f.properties.t);
  if(!merged.has(k)) merged.set(k, {type: "Feature", properties: f.properties, geometry: {type: "MultiLineString", coordinates: []}});
  merged.get(k).geometry.coordinates.push(...f.geometry.coordinates);
}
const outTopo = topology({adm1: {type: "FeatureCollection", features: [...merged.values()]}}, 3e4);
for(const g of outTopo.objects.adm1.geometries){ g.properties = {t: g.properties.t.map(([a, b]) => ym(a) + "|" + ym(b)).join(",")}; }
const head = `// 나라 안쪽 행정구역(주·성·도) 경계선. 도형마다 t = "YYYY-MM|YYYY-MM,..." 그 선이 실제로 있던 기간(끝 달은 제외).
// tools/states/build.mjs로 만든다. 원본: Natural Earth 1:10m admin-1(공개 도메인), geoBoundaries — 중국(PDDL),
// 독일(© GeoBasis-DE / BKG, dl-de/by-2-0), 폴란드(© OpenStreetMap contributors, ODbL). 옛 구역은 현대 구역을 묶어 만든 근사치다
`;
fs.writeFileSync(OUT, head + "const STATES = " + JSON.stringify(outTopo) + ";\n");
const nLines = [...merged.values()].reduce((s, f) => s + f.geometry.coordinates.length, 0);
console.log(`wrote ${OUT}: ${(fs.statSync(OUT).size/1024).toFixed(0)} KB, ${merged.size} 기간 조합, ${nLines} 선`);
