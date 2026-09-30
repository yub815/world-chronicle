// 규칙 작성용 도구
export const M_END = 672;                       // 1936-01 … 1991-12 (끝 제외)
export const mi = s => { const [y, m] = s.split("-").map(Number); return (y - 1936) * 12 + (m - 1); };
export const ym = i => `${1936 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, "0")}`;

// 규칙에 적힌 이름 모음 — build.mjs가 원본에 실제로 있는지 확인한다. cc가 "CHN2"처럼 끝에 2가 붙으면 세부 원본의 이름
export const REF = [];
export const ref = (cc, names) => { for(const n of names) REF.push([cc, n]); return names; };

// 시기별 규칙: [[시작 "YYYY-MM", 규칙], ...]. 규칙은 (u, m) => 라벨 | null, 또는 문자열·null 상수. 첫 시작 전은 null
export function era(list){
  const L = list.map(([s, f]) => [mi(s), f]).sort((a, b) => a[0] - b[0]);
  return (u, m) => {
    let f;
    for(const [s, g] of L) if(m >= s) f = g;
    if(f === undefined) return null;
    return typeof f === "function" ? f(u, m) : f;
  };
}

// 현대 단위를 그대로 쓴다
export const KEEP = u => u.name;
// 나라 안쪽 선을 그리지 않는다(나라 전체가 한 구역)
export const WHOLE = () => "*";

// 분리 연표: [[자식, 부모, "YYYY-MM"], ...] — 그 달 전에는 자식을 부모로 합친다(연쇄 가능)
export function splits(cc, rows){
  ref(cc, rows.map(r => r[0]));   // 부모는 옛 이름일 수 있어 확인하지 않는다
  const T = new Map(rows.map(([c, p, d]) => [c, [p, mi(d)]]));
  return (name, m) => { let n = name, x; while((x = T.get(n)) && m < x[1]) n = x[0]; return n; };
}

// 이름 → 구역 표. 표에 없으면 dflt(기본은 이름 그대로)
export function table(cc, map, dflt = n => n){
  ref(cc, Object.keys(map));
  return name => (name in map) ? map[name] : dflt(name);
}
// { 구역: [이름, ...] } 형태를 이름 → 구역 표로
export function groups(cc, g, dflt){
  const map = {};
  for(const [k, names] of Object.entries(g)) for(const n of names) map[n] = k;
  return table(cc, map, dflt);
}

// 평면 점-다각형 판정(손으로 그린 마스크용). ring = [[경도, 위도], ...]
export function inRing(ring, x, y){
  let c = false;
  for(let i = 0, j = ring.length - 1; i < ring.length; j = i++){
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
export const inMask = (u, ring) => inRing(ring, u.lon, u.lat);

// 가장 가까운 중심 도시의 구역으로(당시 구역이 중심 도시 둘레로 모여 있을 때 쓰는 근사)
export function nearest(caps){
  const E = Object.entries(caps);
  return u => {
    let best, d = Infinity;
    const cl = Math.cos(u.lat * Math.PI / 180);
    for(const [k, [x, y]] of E){ const dx = (u.lon - x) * cl, dy = u.lat - y, e = dx*dx + dy*dy; if(e < d){ d = e; best = k; } }
    return best;
  };
}
