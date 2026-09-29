(function(){
"use strict";
/* ================= time helpers ================= */
const M0 = 1936*12;
const mi = s => { const y=+s.slice(0,4), m=+s.slice(5,7); return y*12+m-1-M0; };
const MMAX = mi("1991-12");
const yOfM = m => Math.floor((m+M0)/12), moOfM = m => ((m+M0)%12)+1;
const fmtM = m => `${yOfM(m)}년 ${moOfM(m)}월`;
const fmtMshort = m => `${yOfM(m)}.${String(moOfM(m)).padStart(2,"0")}`;
const fmtD = d => { const [y,m,dd]=d.split("-"); return `${y}년 ${+m}월 ${+dd}일`; };
const fmtDshort = d => d.slice(0,7).replace("-",".");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function parseTL(s){
  return s.split("|").map((e,i)=>{
    const m = e.match(/^(\d{4}-\d{2}):(.*)$/);
    return m ? {m:mi(m[1]), v:m[2]} : {m:-99999, v:e};
  });
}
function at(tl, m){ let r=null; for(const e of tl){ if(e.m<=m) r=e; else break; } return r || {m:-99999, v:null, o:null}; }

/* ================= data prep ================= */
const EV = [...EV1, ...EV2].sort((a,b)=> a.d<b.d?-1:a.d>b.d?1:0);
const EVI = Object.fromEntries(EV.map(e=>[e.id,e]));
const PPL = {...PPL1, ...PPL2};
EV.forEach((e,i)=>{ e.m = mi(e.d); e.fx=[]; e.mf = e.m + (+e.d.slice(8,10)-1)/31 + i*1e-6; });
EV.forEach(e=>e.k.forEach(k=>EVI[k] && EVI[k].fx.push(e.id)));

const NATONLY = new Set(["KOR","VIE","PSE","GRL","HKG","TWN","PUR","ESP","ACC","WSA"]);
for(const [id,e] of Object.entries(ENT)){
  e.id=id;
  e.fT = parseTL(e.f||"NE"); e.iT = parseTL(e.i||"N");
  e.nmT = e.nm ? parseTL(e.nm) : null;
  e.snT = e.sn ? parseTL(e.sn) : null;
  e.ptT = e.pt ? parseTL(e.pt) : null;
  e.Lp = (e.L||[]).map(s=>{ const [d,name,title,slot]=s.split("|"); return {m:mi(d),name,title,slot:slot||"a"}; }).sort((a,b)=>a.m-b.m);
  e.endM = e.end ? mi(e.end) : 99999;
}
const E = id => ENT[id] || {id, n:id, fT:[{m:-1e5,v:"NE"}], iT:[{m:-1e5,v:"N"}], Lp:[], endM:99999};
const M_USSR_END = mi("1991-12");
const facAt = (id,m) => { const v = at(E(id).fT,m).v || "NE"; return (m >= M_USSR_END && (v==="EB"||v==="WP")) ? "NE" : v; };
const ideAt = (id,m) => at(E(id).iT,m).v || "N";
const shortAt = (id,m) => { const e=E(id); return (e.snT && at(e.snT,m).v) || e.n; };
const nameAt = (id,m) => { const e=E(id); return (e.nmT && at(e.nmT,m).v) || e.n; };
const partyAt = (id,m) => { const e=E(id); if(!e.ptT) return null; const v=at(e.ptT,m).v; return (v && v!=="—" && GRP[v]) ? v : null; };
function leadersAt(id,m){
  const e=E(id), out={};
  for(const l of e.Lp){ if(l.m<=m) out[l.slot]=l; }
  return ["a","b","c"].map(s=>out[s]).filter(l=>l && l.name!=="—");
}

const TT = {};
for(const [k,s] of Object.entries(TERR)){
  let nat=null, body=s;
  if(s.includes("#")) [nat,body]=s.split("#");
  const tl = parseTL(body).map(x=>{ const [ow,st]=x.v.split(":"); const [o,oc]=ow.split("/"); return {m:x.m,o,oc:oc||null,c:st==="c"}; });
  TT[k]={nat, tl};
}
function terrAt(k,m){
  const t = TT[k];
  if(!t) return {o:k, oc:null, c:false, nat:k};
  let r = at(t.tl,m); if(!r.o) r = t.tl[0];
  return {o:r.o, oc:r.oc, c:r.c, nat:t.nat||r.o};
}

const FACN = {AX:"추축국",AA:"추축 협력국",AL:"연합국",CO:"코민테른 · 소련 진영",NE:"중립국",WE:"서방 진영",NA:"NATO",WP:"바르샤바 조약기구",EB:"친소 공산권",CN:"중국 노선 공산권",NM:"비동맹 운동"};
const FACD = {AX:"독일·이탈리아·일본 중심의 동맹",AA:"추축국과 함께 싸웠거나 협력한 나라",AL:"추축국과 싸운 나라들",CO:"소련과 그 위성국·공산 정권",NE:"어느 진영에도 속하지 않은 나라",WE:"미국과 동맹 관계를 맺은 NATO 밖의 나라",NA:"북대서양 조약기구 회원국",WP:"소련 주도 군사동맹 회원국",EB:"조약 밖의 소련 동맹 공산국가",CN:"소련과 결별하고 독자 노선을 걸은 공산국가",NM:"비동맹 운동에 참여한 나라"};
const IDEN = {D:"민주주의",F:"파시즘",C:"공산주의",N:"권위주의 · 비동맹"};
const LANES = [["AM","아메리카"],["EU","서·중부 유럽"],["GL","국제 관계"],["EE","소련·동유럽"],["ME","중동·아프리카"],["SA","남·동남아·태평양"],["EA","동아시아"]];
const LANEN = Object.fromEntries(LANES);
const ERAS = [
  {a:"1929-10",b:"1936-01",n:"배경: 대공황과 팽창"},
  {a:"1936-01",b:"1939-09",n:"전간기 말: 위기의 시대"},
  {a:"1939-09",b:"1945-09",n:"제2차 세계대전"},
  {a:"1945-09",b:"1953-07",n:"냉전의 시작"},
  {a:"1953-07",b:"1962-11",n:"해빙과 위기"},
  {a:"1962-11",b:"1979-12",n:"공존과 데탕트"},
  {a:"1979-12",b:"1985-03",n:"신냉전"},
  {a:"1985-03",b:"1992-01",n:"냉전의 종식"},
].map(x=>({...x, ma:mi(x.a), mb:mi(x.b)}));
const eraAt = m => ERAS.find(e=>m>=e.ma && m<e.mb) || ERAS[ERAS.length-1];
const HOI = {[mi("1936-01")]:"HOI4 · 1936년 시작 시점", [mi("1939-08")]:"HOI4 · 1939년 시작 시점"};

/* ================= theme colors ================= */
let COL = {};
function readColors(){
  const cs = getComputedStyle(document.documentElement);
  const g = n => cs.getPropertyValue(n).trim();
  COL = {f:{}, i:{}};
  Object.keys(FACN).forEach(k=>COL.f[k]=g("--f-"+k));
  Object.keys(IDEN).forEach(k=>COL.i[k]=g("--i-"+k));
  ["ocean-1","ocean-2","grat","rim","border","coast","halo","fg","fg-2","fg-3","bg","accent","accent-2","colony-mix","none","line"].forEach(k=>COL[k]=g("--"+k));
  patCache.clear();
}
const patCache = new Map();

/* ================= geo ================= */
const SNAPS = [["s38",-99999],["s45",mi("1945-09")],["s60",mi("1960-01")],["s94",mi("1991-01")]];
const snapAt = m => { let s=SNAPS[0][0]; for(const [k,a] of SNAPS) if(m>=a) s=k; return s; };
const FEAT = {};
for(const [s] of SNAPS){
  const obj = GEO.objects[s];
  FEAT[s] = topojson.feature(GEO, obj).features.map((f,i)=>{
    f.k = f.properties.k; f.idx=i;
    f.area = d3.geoArea(f);
    // label point: centroid of the largest polygon part
    let best=null, ba=-1;
    const polys = f.geometry.type==="Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    for(const p of polys){ const g={type:"Polygon",coordinates:p}; const a=d3.geoArea(g); if(a>ba){ba=a;best=g;} }
    f.lp = d3.geoCentroid(best||f);
    f.b = d3.geoBounds(f);
    return f;
  });
}
const coastCache = {};
function coastOf(s){ return coastCache[s] || (coastCache[s] = topojson.mesh(GEO, GEO.objects[s], (a,b)=>a===b)); }

/* ================= state ================= */
const S = {
  m: 0, mode: "f", snap: "s38",
  st: {}, meshSig:"", ownerMesh:null, occMesh:null,
  rot: [-22,-40,0], k: 1, base: 300, w: 800, h: 600, dpr: 1,
  hover: null, hoverEv: null,
  sel: null,           // {type, id, terr?}
  hist: [],
  playing: false, timer: null, t: 0,
  fills: {}, fillsSnap: null, tr: null, flash: null,
};

function computeState(){
  const prevSnap = S.snap, prevSt = S.st;
  S.snap = snapAt(S.m);
  const st = {};
  for(const f of FEAT[S.snap]) st[f.k] = terrAt(f.k, S.m);
  S.st = st;
  const sig = S.snap + "|" + FEAT[S.snap].map(f=>{const x=st[f.k]; return x.o+"/"+(x.oc||"")+(x.c?"c":"");}).join(",");
  if(sig !== S.meshSig){
    S.meshSig = sig;
    const obj = GEO.objects[S.snap];
    S.ownerMesh = topojson.mesh(GEO, obj, (a,b)=> a!==b && st[a.properties.k].o !== st[b.properties.k].o);
    S.occMesh = topojson.mesh(GEO, obj, (a,b)=> a!==b && st[a.properties.k].o === st[b.properties.k].o && ((st[a.properties.k].oc||"") !== (st[b.properties.k].oc||"") || st[a.properties.k].c !== st[b.properties.k].c));
  }
  const changed = new Set();
  if(prevSnap === S.snap && prevSt) for(const k in st){ const a=prevSt[k], b=st[k]; if(a && (a.o!==b.o || a.oc!==b.oc || a.c!==b.c)) changed.add(k); }
  refreshFills(true, changed);
}
const TR_MS = 750, FLASH_MS = 1800;
function targetFills(){ const out={}; for(const f of FEAT[S.snap]){ const x=S.st[f.k]; out[f.k]={c:fillOf(x), s:stripeOf(x)}; } return out; }
const trP = now => d3.easeCubicInOut(Math.max(0, Math.min(1, (now - S.tr.t0)/TR_MS)));
function currentFill(k, now){
  const tr = S.tr;
  if(tr && tr.from[k] && tr.to[k]){ const p = trP(now); return {c: p>=1 ? tr.to[k].c : d3.interpolateRgb(tr.from[k].c, tr.to[k].c)(p), s: p<.5 ? tr.from[k].s : tr.to[k].s}; }
  return S.fills[k];
}
function refreshFills(animate, changed){
  const now = performance.now(), to = targetFills();
  if(animate && !reduceMotion && S.fillsSnap === S.snap){
    const from = {}; for(const k in to){ from[k] = currentFill(k, now) || to[k]; }
    S.tr = {from, to, t0: now};
  } else S.tr = null;
  S.fills = to; S.fillsSnap = S.snap;
  if(changed && changed.size && !reduceMotion) S.flash = {keys: changed, t0: now};
}
function colorOf(id){
  if(!id) return COL.none;
  const e = E(id);
  if(S.m >= e.endM && !NATONLY.has(id)) { /* defunct state still listed as owner: neutral */ }
  if(NATONLY.has(id)) return COL.none;
  return S.mode==="f" ? (COL.f[facAt(id,S.m)]||COL.none) : (COL.i[ideAt(id,S.m)]||COL.none);
}
function fillOf(x){
  if(x.oc){ return colorOf(x.oc); }
  const c = colorOf(x.o);
  return x.c ? d3.interpolateRgb(c, COL["colony-mix"])(0.48) : c;
}
function stripeOf(x){ return x.oc ? colorOf(x.o) : null; }
function patternFor(ctx, color){
  const key = color+"|"+S.dpr;
  if(patCache.has(key)) return patCache.get(key);
  const s = Math.round(7*S.dpr), c = document.createElement("canvas"); c.width=c.height=s;
  const g = c.getContext("2d");
  g.strokeStyle = color; g.lineWidth = 2.2*S.dpr; g.globalAlpha=.95;
  g.beginPath(); g.moveTo(-1,s+1); g.lineTo(s+1,-1); g.moveTo(-1,1); g.lineTo(1,-1); g.moveTo(s-1,s+1); g.lineTo(s+1,s-1); g.stroke();
  const p = ctx.createPattern(c,"repeat"); patCache.set(key,p); return p;
}

/* ================= globe rendering ================= */
const baseC = $("#base"), overC = $("#overlay"), wrap = $("#globeWrap");
const bctx = baseC.getContext("2d"), octx = overC.getContext("2d");
const proj = d3.geoOrthographic().clipAngle(90).precision(0.4);
const pathB = d3.geoPath(proj, bctx), pathO = d3.geoPath(proj, octx);
const grat = d3.geoGraticule10();
let labelFont = "600 12px 'IBM Plex Sans KR', sans-serif";

function sizeGlobe(){
  const r = wrap.getBoundingClientRect();
  S.w = r.width; S.h = r.height; S.dpr = Math.min(window.devicePixelRatio||1, 2);
  for(const c of [baseC, overC]){ c.width = Math.round(S.w*S.dpr); c.height = Math.round(S.h*S.dpr); }
  const narrow = S.w < 620;
  S.base = Math.min(S.w, S.h) / 2 * (narrow ? 0.9 : 0.86);
  S.cx = S.w/2 + (narrow ? 0 : S.w*0.04); S.cy = S.h/2 + (narrow ? S.h*0.06 : S.h*0.03);
  patCache.clear();
  drawAll();
}
function setProj(){ proj.scale(S.base*S.k).translate([S.cx, S.cy]).rotate(S.rot); }
const center = () => [-S.rot[0], -S.rot[1]];
const visible = p => d3.geoDistance(p, center()) < Math.PI/2 - 0.05;

function drawBase(now){
  now = now || performance.now();
  setProj();
  const ctx = bctx, dpr = S.dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,S.w,S.h);
  const R = proj.scale(), [cx,cy] = proj.translate();
  // atmosphere
  const glow = ctx.createRadialGradient(cx,cy,R*0.95,cx,cy,R*1.12);
  glow.addColorStop(0, COL.rim); glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx,cy,R*1.12,0,Math.PI*2); ctx.fill();
  // ocean
  const oc = ctx.createRadialGradient(cx-R*0.35, cy-R*0.4, R*0.1, cx, cy, R);
  oc.addColorStop(0, COL["ocean-1"]); oc.addColorStop(1, COL["ocean-2"]);
  ctx.beginPath(); pathB({type:"Sphere"}); ctx.fillStyle = oc; ctx.fill();
  ctx.beginPath(); pathB(grat); ctx.strokeStyle = COL.grat; ctx.lineWidth = 1; ctx.stroke();
  // land grouped by color
  const feats = FEAT[S.snap], groups = new Map(), stripes = [];
  for(const f of feats){
    const fl = currentFill(f.k, now) || {c:fillOf(S.st[f.k]), s:stripeOf(S.st[f.k])};
    const c = fl.c;
    if(!groups.has(c)) groups.set(c, []);
    groups.get(c).push(f);
    if(fl.s) stripes.push([f, fl.s]);
  }
  for(const [c, fs] of groups){ ctx.beginPath(); for(const f of fs) pathB(f); ctx.fillStyle = c; ctx.fill(); }
  for(const [f, sc] of stripes){ ctx.beginPath(); pathB(f); ctx.fillStyle = patternFor(ctx, sc); ctx.fill(); }
  // borders
  ctx.lineJoin = "round";
  ctx.beginPath(); pathB(S.occMesh); ctx.strokeStyle = COL.border; ctx.globalAlpha=.55; ctx.lineWidth = .7; ctx.setLineDash([2,2]); ctx.stroke();
  ctx.setLineDash([]); ctx.globalAlpha = 1;
  ctx.beginPath(); pathB(S.ownerMesh); ctx.strokeStyle = COL.border; ctx.lineWidth = Math.min(1.6, .8 + S.k*0.12); ctx.stroke();
  ctx.beginPath(); pathB(coastOf(S.snap)); ctx.strokeStyle = COL.coast; ctx.lineWidth = .7; ctx.stroke();
  drawLabels(ctx);
}

function drawLabels(ctx){
  const R = proj.scale();
  const own = new Map();
  for(const f of FEAT[S.snap]){
    const x = S.st[f.k];
    let id, kind;
    if(x.oc) continue;
    if(x.c){ id = x.nat; kind="c"; if(!id || id===x.o) continue; }
    else { id = x.o; kind="o"; }
    const g = own.get(id+kind) || {id, kind, area:0, best:null, ba:0};
    g.area += f.area; if(f.area > g.ba){ g.ba=f.area; g.best=f; }
    own.set(id+kind, g);
  }
  const list = [...own.values()].sort((a,b)=>b.area-a.area);
  const placed = [];
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for(const g of list){
    const p = g.best.lp;
    if(!visible(p)) continue;
    const lin = Math.sqrt(g.area) * R;          // rough on-screen size in px
    if(lin < (g.kind==="c" ? 46 : 30)) continue;
    const fs = Math.max(10, Math.min(g.kind==="c"?12:15.5, 8 + lin/26));
    const txt = shortAt(g.id, S.m);
    ctx.font = `${g.kind==="c"?500:600} ${fs}px 'IBM Plex Sans KR', sans-serif`;
    const w = ctx.measureText(txt).width;
    if(w > lin*1.6) continue;
    const xy = proj(p); if(!xy) continue;
    const r = [xy[0]-w/2-3, xy[1]-fs/2-2, xy[0]+w/2+3, xy[1]+fs/2+2];
    if(placed.some(q=> r[0]<q[2] && r[2]>q[0] && r[1]<q[3] && r[3]>q[1])) continue;
    placed.push(r);
    ctx.lineWidth = 3; ctx.strokeStyle = COL.halo; ctx.globalAlpha = g.kind==="c" ? .8 : 1;
    ctx.strokeText(txt, xy[0], xy[1]);
    ctx.fillStyle = g.kind==="c" ? COL["fg-2"] : COL.fg; ctx.fillText(txt, xy[0], xy[1]);
    ctx.globalAlpha = 1;
  }
}

function markerEvents(){
  return EV.filter(e => e.m <= S.m && e.m >= S.m - 12);
}
let pulseT0 = performance.now();
function drawOverlay(now){
  setProj();
  const ctx = octx, dpr = S.dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,S.w,S.h);
  // selection outline
  const selIds = selectedEntities();
  if(selIds.size){
    ctx.beginPath();
    for(const f of FEAT[S.snap]){ const x=S.st[f.k]; if(selIds.has(x.o) || selIds.has(x.nat) && (x.c||x.oc)) pathO(f); }
    ctx.strokeStyle = COL.accent; ctx.lineWidth = 2.2; ctx.stroke();
  }
  if(S.flash){
    const p = Math.min(1, ((now||performance.now()) - S.flash.t0)/FLASH_MS);
    if(p < 1){
      ctx.beginPath(); for(const f of FEAT[S.snap]) if(S.flash.keys.has(f.k)) pathO(f);
      ctx.globalAlpha = (1-p)*0.28; ctx.fillStyle = COL["accent-2"]; ctx.fill();
      ctx.globalAlpha = 1-p; ctx.strokeStyle = COL["accent-2"]; ctx.lineWidth = 2.5; ctx.stroke(); ctx.globalAlpha = 1;
    }
  }
  if(S.hover){ ctx.beginPath(); pathO(S.hover); ctx.strokeStyle = COL.fg; ctx.lineWidth = 1.4; ctx.stroke(); }
  // event markers
  const t = ((now||performance.now()) - pulseT0)/1000;
  const selEv = S.sel && S.sel.type==="event" ? S.sel.id : null;
  for(const e of markerEvents()){
    if(!visible(e.loc)) continue;
    const xy = proj(e.loc); if(!xy) continue;
    const age = S.m - e.m, fresh = age <= 2, isSel = e.id===selEv;
    if(fresh && !reduceMotion){
      const ph = (t*0.8 + e.m*0.13) % 1;
      ctx.beginPath(); ctx.arc(xy[0], xy[1], 5 + ph*16, 0, Math.PI*2);
      ctx.strokeStyle = COL.accent; ctx.globalAlpha = (1-ph)*0.8; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = 1;
    }
    ctx.beginPath(); ctx.arc(xy[0], xy[1], isSel ? 6.5 : fresh ? 5 : 3.2, 0, Math.PI*2);
    ctx.fillStyle = fresh||isSel ? COL.accent : COL["fg-2"]; ctx.globalAlpha = fresh||isSel ? 1 : Math.max(.35, 1-age/14);
    ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineWidth = 1.5; ctx.strokeStyle = COL.bg; ctx.stroke();
    if(isSel){ ctx.beginPath(); ctx.arc(xy[0], xy[1], 10, 0, Math.PI*2); ctx.strokeStyle=COL.accent; ctx.lineWidth=1.5; ctx.stroke(); }
  }
}
let rafAnim = 0;
function tick(now){
  rafAnim = 0;
  const trActive = S.tr && now - S.tr.t0 < TR_MS + 40;
  if(S.tr){ drawBase(now); if(!trActive) S.tr = null; }
  const flashActive = S.flash && now - S.flash.t0 < FLASH_MS;
  drawOverlay(now);
  if(S.flash && !flashActive) S.flash = null;
  const pulses = !reduceMotion && markerEvents().some(e => S.m - e.m <= 2 && visible(e.loc));
  if(trActive || flashActive || pulses) kickOverlay();
}
function kickOverlay(){ if(!rafAnim) rafAnim = requestAnimationFrame(tick); }
function drawAll(){ const now = performance.now(); drawBase(now); drawOverlay(now); kickOverlay(); }
let rafBase = 0;
function requestDraw(){ if(!rafBase) rafBase = requestAnimationFrame(()=>{ rafBase=0; drawAll(); }); }

/* ================= globe interaction ================= */
let lastT = null, dragMoved = false;
const zoom = d3.zoom().scaleExtent([0.8, 9]).clickDistance(5)
  .on("start", ev => { lastT = ev.transform; dragMoved=false; if(ev.sourceEvent && ev.sourceEvent.type!=="wheel") overC.classList.add("dragging"); stopFly(); })
  .on("zoom", ev => {
    const t = ev.transform, se = ev.sourceEvent;
    S.k = t.k;
    const isWheel = se && se.type==="wheel";
    const multi = se && se.touches && se.touches.length > 1;
    if(se && !isWheel && !multi && lastT){
      const dx = t.x - lastT.x, dy = t.y - lastT.y;
      if(Math.abs(dx)+Math.abs(dy) > 0.5) dragMoved = true;
      const sens = 75 / (S.base*S.k);
      S.rot[0] += dx * sens; S.rot[1] = Math.max(-88, Math.min(88, S.rot[1] - dy * sens));
    }
    lastT = t; hideTip(); requestDraw();
  })
  .on("end", () => { overC.classList.remove("dragging"); });
d3.select(overC).call(zoom).on("dblclick.zoom", null);
$("#zin").onclick = () => d3.select(overC).transition().duration(reduceMotion?0:300).call(zoom.scaleBy, 1.5);
$("#zout").onclick = () => d3.select(overC).transition().duration(reduceMotion?0:300).call(zoom.scaleBy, 1/1.5);

function pick(px, py){
  setProj();
  // markers first
  for(const e of markerEvents().slice().reverse()){
    if(!visible(e.loc)) continue;
    const xy = proj(e.loc); if(!xy) continue;
    if((xy[0]-px)**2 + (xy[1]-py)**2 < 100) return {ev:e};
  }
  const p = proj.invert([px,py]);
  if(!p || d3.geoDistance(p, center()) > Math.PI/2) return null;
  for(const f of FEAT[S.snap]){
    const b = f.b; const [lo,la] = p;
    if(la < b[0][1]-0.5 || la > b[1][1]+0.5) continue;
    if(b[0][0] <= b[1][0] && (lo < b[0][0]-0.5 || lo > b[1][0]+0.5)) continue;
    if(d3.geoContains(f, p)) return {f};
  }
  return null;
}
const tip = $("#tip");
function hideTip(){ tip.hidden = true; }
function showTip(html, px, py){
  tip.innerHTML = html; tip.hidden = false;
  const r = tip.getBoundingClientRect();
  let x = px + 14, y = py + 14;
  if(x + r.width > S.w - 4) x = px - r.width - 14;
  if(y + r.height > S.h - 4) y = py - r.height - 14;
  tip.style.left = x+"px"; tip.style.top = y+"px";
}
function terrLabel(x){
  const own = E(x.o);
  if(x.oc) return {t1: shortAt(x.nat||x.o, S.m), t2: `${shortAt(x.oc,S.m)} 점령 下` + (x.nat && x.nat!==x.o ? ` · 주권: ${shortAt(x.o,S.m)}` : "")};
  if(x.c) return {t1: shortAt(x.nat,S.m), t2: `${shortAt(x.o,S.m)}의 식민지·보호령`};
  return {t1: nameAt(x.o,S.m), t2: `${FACN[facAt(x.o,S.m)]} · ${IDEN[ideAt(x.o,S.m)]}`};
}
let moveRaf = 0, lastMove = null;
overC.addEventListener("pointermove", ev => {
  if(ev.pointerType==="touch") return;
  lastMove = ev;
  if(moveRaf) return;
  moveRaf = requestAnimationFrame(()=>{
    moveRaf = 0;
    if(overC.classList.contains("dragging")) return;
    const r = overC.getBoundingClientRect(), px = lastMove.clientX - r.left, py = lastMove.clientY - r.top;
    const h = pick(px, py);
    const prevHover = S.hover;
    S.hover = h && h.f ? h.f : null;
    overC.classList.toggle("pointing", !!h);
    if(h && h.ev) showTip(`<div class="t2 mono">${fmtD(h.ev.d)}</div><div class="t1">${esc(h.ev.t)}</div>`, px, py);
    else if(h && h.f){ const l = terrLabel(S.st[h.f.k]); showTip(`<div class="t1">${esc(l.t1)}</div><div class="t2">${esc(l.t2)}</div>`, px, py); }
    else hideTip();
    if(prevHover !== S.hover) drawOverlay();
  });
});
overC.addEventListener("pointerleave", ()=>{ S.hover=null; hideTip(); drawOverlay(); });
overC.addEventListener("click", ev => {
  if(dragMoved) return;
  const r = overC.getBoundingClientRect();
  const h = pick(ev.clientX - r.left, ev.clientY - r.top);
  if(!h) return;
  if(h.ev) select({type:"event", id:h.ev.id}, {noDate:true});
  else if(h.f){ const x = S.st[h.f.k]; select({type:"ent", id: (x.c||x.oc) ? (x.nat||x.o) : x.o, terr:h.f.k}); }
});

let flyTimer = null;
function stopFly(){ if(flyTimer){ flyTimer.stop(); flyTimer=null; } }
function flyTo(lonlat, k){
  stopFly();
  const r0 = S.rot.slice(), r1 = [-lonlat[0], Math.max(-70, Math.min(70, -lonlat[1])), 0];
  // shortest longitude path
  let d = r1[0]-r0[0]; d = ((d+540)%360)-180; r1[0] = r0[0]+d;
  const k0 = S.k, k1 = k || S.k;
  if(reduceMotion){ S.rot = r1; setZoomK(k1); requestDraw(); return; }
  const ip = d3.interpolate(r0, r1), dur = 900;
  flyTimer = d3.timer(el => {
    const t = Math.min(1, el/dur), e = d3.easeCubicInOut(t);
    S.rot = ip(e); S.k = k0 + (k1-k0)*e; drawAll();
    if(t>=1){ stopFly(); setZoomK(k1); }
  });
}
function setZoomK(k){ const t = d3.zoomTransform(overC); d3.select(overC).call(zoom.transform, d3.zoomIdentity.translate(t.x,t.y).scale(k)); S.k = k; }

/* ================= HUD & legend ================= */
function renderHUD(){
  const era = eraAt(S.m);
  $("#hud").innerHTML = `<div><span class="year">${yOfM(S.m)}</span><span class="month">${moOfM(S.m)}월</span></div>
    <div class="era">${esc(era.n)}</div>${HOI[S.m] ? `<span class="hoi">${HOI[S.m]}</span>` : ""}`;
}
function renderLegend(){
  const cnt = {};
  for(const f of FEAT[S.snap]){
    const x = S.st[f.k];
    const id = x.oc || x.o; if(NATONLY.has(id)) continue;
    const key = S.mode==="f" ? facAt(id,S.m) : ideAt(id,S.m);
    cnt[key] = (cnt[key]||0) + f.area;
  }
  const names = S.mode==="f" ? FACN : IDEN, cols = S.mode==="f" ? COL.f : COL.i;
  const order = S.mode==="f" ? ["AX","AA","AL","CO","WP","EB","CN","NA","WE","NM","NE"] : ["D","F","C","N"];
  const rows = order.filter(k=>cnt[k]).map(k=>`<div class="row"><span class="sw" style="background:${cols[k]}"></span><b>${names[k]}</b></div>`).join("");
  const cmix = d3.interpolateRgb(COL.f.AL, COL["colony-mix"])(.48);
  $("#legend").innerHTML = rows + `<div class="sep"></div>
    <div class="row"><span class="sw" style="background:${cmix}"></span>식민지·보호령</div>
    <div class="row"><span class="sw" style="background:repeating-linear-gradient(135deg,${COL.f.CO} 0 3px,${COL.f.AL} 3px 6px)"></span>점령지 (빗금 = 원래 주인)</div>
    <div class="row"><span class="sw" style="background:${COL.accent};border-radius:50%;width:10px;height:10px"></span>최근 사건</div>`;
}
$("#mFac").onclick = () => setMode("f");
$("#mIde").onclick = () => setMode("i");
$("#mLeg").onclick = () => { const l=$("#legend"); const on=!l.classList.contains("show"); l.classList.toggle("show",on); $("#mLeg").setAttribute("aria-pressed", on); };
function setMode(m){
  S.mode = m;
  $("#mFac").setAttribute("aria-pressed", m==="f"); $("#mIde").setAttribute("aria-pressed", m==="i");
  refreshFills(true); renderLegend(); drawAll();
}

/* ================= timeline bar ================= */
const range = $("#range");
function renderTrack(){
  const svg = d3.select("#tracksvg"); svg.selectAll("*").remove();
  const W = $("#track").clientWidth; if(!W) return;
  const pad = 2; const x = m => pad + (W-2*pad) * m / MMAX;
  const g = svg.append("g");
  const bandCol = i => i%2 ? "var(--bg-3)" : "var(--line)";
  ERAS.filter(e=>e.mb>0).forEach((e,i)=>{
    const a = Math.max(0,e.ma), b = Math.min(MMAX+1,e.mb);
    g.append("rect").attr("class","era-band").attr("x",x(a)).attr("y",18).attr("width",Math.max(0,x(b)-x(a))).attr("height",10).attr("fill", bandCol(i)).append("title").text(e.n);
  });
  for(let y=1936;y<=1991;y++){
    const m = (y-1936)*12, big = y%5===0 || y===1936;
    g.append("line").attr("x1",x(m)).attr("x2",x(m)).attr("y1", big?14:16).attr("y2",30).attr("stroke","var(--fg-3)").attr("stroke-opacity", big?.7:.3);
    if(big && (W>560 || (y%10===0 && y!==1940) || y===1936)) g.append("text").attr("class","yr").attr("x",x(m)).attr("y",46).attr("text-anchor", y===1936?"start":"middle").text(y);
  }
  const ev = EV.filter(e=>e.m>=0);
  g.selectAll(".tick-ev").data(ev).join("rect").attr("class","tick-ev").attr("x",d=>x(d.m)-1).attr("y",4).attr("width",2).attr("height",9).attr("rx",1)
    .on("click",(e,d)=>select({type:"event",id:d.id})).append("title").text(d=>`${fmtDshort(d.d)} ${d.t}`);
  Object.keys(HOI).forEach(m=>{ g.append("path").attr("class","hoi-mark").attr("d",`M${x(+m)-4},0 L${x(+m)+4},0 L${x(+m)},6 Z`).append("title").text(HOI[m]); });
}
range.addEventListener("input", ()=> setT(+range.value, {fromRange:true}));
$("#prev").onclick = () => { setPlaying(false); setDate(Math.max(0, Math.ceil(S.t)-1)); };
$("#next").onclick = () => { setPlaying(false); setDate(Math.min(MMAX, Math.floor(S.t)+1)); };
const OPT = {pause: true, follow: true};
function bindToggle(id, key){ const b=$(id); b.onclick=()=>{ OPT[key]=!OPT[key]; b.setAttribute("aria-pressed", OPT[key]); }; }
bindToggle("#optPause","pause"); bindToggle("#optFollow","follow");
function setT(t, opt={}){
  t = Math.max(0, Math.min(MMAX + 0.999, t));
  S.t = t;
  if(!opt.fromRange) range.value = t;
  const m = Math.floor(t);
  if(m !== S.m) setDate(m, {fromRange:true, keepT:true, playing:S.playing});
  else updateNowLine();
}
const playBtn = $("#play");
const PLAY_ICON = '<svg viewBox="0 0 14 14"><path d="M3 1.5v11l9-5.5z"/></svg>', PAUSE_ICON = '<svg viewBox="0 0 14 14"><path d="M3 1.5h3v11H3zM8 1.5h3v11H8z"/></svg>';
let playLast = null, hold = 0;
function setPlaying(on){
  if(S.playing === on) return;
  S.playing = on;
  playBtn.innerHTML = on ? PAUSE_ICON : PLAY_ICON; playBtn.setAttribute("aria-label", on?"일시정지":"재생");
  if(on){
    if(S.t >= MMAX + 0.99) setT(0);
    playLast = null; hold = 0;
    requestAnimationFrame(playFrame);
  }
}
const holdFor = sp => sp <= 0.5 ? 3.4 : sp <= 1 ? 2.8 : sp <= 2 ? 2.1 : 1.4;
function playFrame(ts){
  if(!S.playing) return;
  const dt = playLast === null ? 0 : Math.min(0.1, (ts - playLast)/1000);
  playLast = ts;
  if(hold > 0) hold -= dt;
  else {
    const sp = +$("#speed").value;
    let nt = S.t + dt*sp;
    const ev = EV.find(e => e.mf > S.t && e.mf <= nt);
    if(ev){ nt = ev.mf; announce(ev); if(OPT.pause) hold = holdFor(sp); }
    setT(nt);
    if(S.t >= MMAX + 0.999){ setPlaying(false); return; }
  }
  requestAnimationFrame(playFrame);
}
playBtn.onclick = () => setPlaying(!S.playing);

/* ================= event card (shown as events happen during playback) ================= */
const card = $("#evcard"); let cardTimer = 0;
function announce(e){
  card.innerHTML = `<figure class="ph" data-ph="${e.id}" hidden></figure>
    <div class="cb"><div class="kicker">${fmtD(e.d)} · ${LANEN[e.r]}</div>
    <div class="ct">${esc(e.t)}</div><p>${esc(firstSentence(e.s))}</p>
    <button class="abtn" data-ev="${e.id}">자세히 보기</button></div>`;
  card.hidden = false; card.classList.remove("show"); void card.offsetWidth; card.classList.add("show");
  hydratePhotos(card, true);
  if(OPT.follow) flyTo(e.loc);
  clearTimeout(cardTimer);
  cardTimer = setTimeout(()=>{ card.classList.remove("show"); }, 9000);
}
const firstSentence = s => { const i = s.search(/다\.\s/); return i > 0 ? s.slice(0, i+2) : s; };
card.addEventListener("click", ev => { const b = ev.target.closest("[data-ev]"); if(b){ setPlaying(false); select({type:"event", id:b.dataset.ev}); } });

/* ================= date change ================= */
function setDate(m, opt={}){
  m = Math.max(0, Math.min(MMAX, m|0));
  const changed = m !== S.m;
  S.m = m;
  if(!opt.keepT) S.t = m;
  if(!opt.fromRange) range.value = S.t;
  computeState(); renderHUD(); renderLegend(); drawAll();
  updateNowLine();
  if(changed || opt.force) refreshPanel(opt.playing);
}

/* ================= photos (Wikipedia lead images, free-licensed only) ================= */
const PHOTO = {}; let photoReq = null;
function loadPhotos(){
  if(photoReq) return photoReq;
  const ids = Object.keys(WIKI).filter(id=>EVI[id]);
  const titles = [...new Set(ids.map(id=>WIKI[id]))];
  const batches = []; for(let i=0;i<titles.length;i+=45) batches.push(titles.slice(i,i+45));
  const found = {};
  photoReq = Promise.all(batches.map(b =>
    fetch("https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail%7Cname&pithumbsize=640&pilicense=free&titles=" + encodeURIComponent(b.join("|")))
      .then(r=>r.json()).then(j=>{
        const q = j.query || {}; const norm = {}, red = {};
        (q.normalized||[]).forEach(x=>norm[x.from]=x.to); (q.redirects||[]).forEach(x=>red[x.from]=x.to);
        const pages = {}; Object.values(q.pages||{}).forEach(p=>pages[p.title]=p);
        b.forEach(t=>{ const t1 = norm[t]||t, t2 = red[t1]||t1, p = pages[t2]; if(p && p.thumbnail) found[t] = {src:p.thumbnail.source, file:p.pageimage, page:t2}; });
      }).catch(()=>{})
  )).then(()=>{ ids.forEach(id=>{ PHOTO[id] = found[WIKI[id]] || null; }); return PHOTO; });
  return photoReq;
}
function hydratePhotos(root, compact){
  root.querySelectorAll("[data-ph]").forEach(fig=>{
    loadPhotos().then(()=>{
      const p = PHOTO[fig.dataset.ph]; if(!p) return;
      const img = new Image(); img.alt = ""; img.decoding = "async"; img.referrerPolicy = "no-referrer";
      img.onload = () => { fig.hidden = false; };
      img.src = p.src;
      fig.innerHTML = "";
      if(compact) fig.appendChild(img);
      else { const fr = document.createElement("div"); fr.className = "frame"; fr.style.setProperty("--ph", `url("${p.src}")`); fr.appendChild(img); fig.appendChild(fr); }
      if(!compact){ const cap = document.createElement("figcaption");
        cap.innerHTML = `위키백과 「${esc(p.page)}」 대표 이미지 · <a href="https://en.wikipedia.org/wiki/File:${encodeURIComponent(p.file)}" target="_blank" rel="noopener">출처·라이선스</a>`;
        fig.appendChild(cap); }
    });
  });
}

/* ================= selection & panel ================= */
function selectedEntities(){
  const s = S.sel; const out = new Set();
  if(!s) return out;
  if(s.type==="ent") out.add(s.id);
  return out;
}
function select(sel, opt={}){
  if(S.sel && !opt.fromBack) S.hist.push(S.sel);
  if(S.hist.length > 30) S.hist.shift();
  S.sel = sel;
  if(sel && sel.type==="event" && !opt.noDate){
    const e = EVI[sel.id];
    setPlaying(false);
    if(e.m >= 0) setDate(e.m); else setDate(0);
    if(!opt.noFly) flyTo(e.loc);
  } else if(sel && sel.type==="ent" && opt.fly){
    const f = largestFeatureOf(sel.id); if(f) flyTo(f.lp);
  }
  renderPanel(); openSheet(!!sel);
  highlightRoots();
  drawOverlay();
}
function largestFeatureOf(id){
  let best=null;
  for(const f of FEAT[S.snap]){ const x=S.st[f.k]; if((x.o===id && !x.c) || x.nat===id){ if(!best || f.area>best.area) best=f; } }
  return best;
}
$("#back").onclick = () => { const p = S.hist.pop(); S.sel = p || null; renderPanel(); highlightRoots(); drawOverlay(); openSheet(!!S.sel); };
$("#close").onclick = (ev) => { ev.stopPropagation(); S.hist=[]; S.sel=null; renderPanel(); highlightRoots(); drawOverlay(); openSheet(false); };
$("#sideHead").addEventListener("click", ev => { if(window.innerWidth<=1100 && ev.target.id!=="back" && ev.target.id!=="close") $("#side").classList.toggle("open"); });
function openSheet(on){ if(window.innerWidth<=1100) $("#side").classList.toggle("open", on); }

let panelThrottle = 0;
function refreshPanel(playing){
  if(playing){ const now=performance.now(); if(now-panelThrottle<300 && S.sel) return; panelThrottle=now; }
  if(!S.sel || S.sel.type==="ent") renderPanel(); else updateNowLabels();
}
function updateNowLabels(){}

const chipEnt = (id, m) => `<button class="chip" data-ent="${id}"><span class="dot" style="background:${colorOf(id)}"></span>${esc(shortAt(id, m===undefined?S.m:m))}</button>`;
const chipPerson = id => PPL[id] ? `<button class="chip person" data-person="${id}">${esc(PPL[id][0])}</button>` : "";
const chipGrp = id => GRP[id] ? `<button class="chip" data-grp="${id}">${esc(GRP[id][0])}</button>` : "";
function evItem(e, cur){
  return `<li><button data-ev="${e.id}" class="${cur?"now":""}"><span class="d">${fmtDshort(e.d)}</span><span class="t">${esc(e.t)}</span></button></li>`;
}
function renderPanel(){
  const s = S.sel, P = $("#panel");
  $("#back").hidden = !S.hist.length || !s;
  $("#close").hidden = !s;
  let html = "", crumb = "";
  if(!s){ crumb = "이 시점의 세계"; html = panelOverview(); }
  else if(s.type==="event"){ crumb = "사건 · " + LANEN[EVI[s.id].r]; html = panelEvent(EVI[s.id]); }
  else if(s.type==="ent"){ crumb = "국가 · 세력"; html = panelEnt(s.id, s.terr); }
  else if(s.type==="person"){ crumb = "인물"; html = panelPerson(s.id); }
  else if(s.type==="grp"){ crumb = "정당 · 조직"; html = panelGrp(s.id); }
  $("#crumb").textContent = crumb;
  P.innerHTML = html;
  hydratePhotos(P);
  if(!(S.playing && !s)) P.scrollTop = 0;
}
$("#panel").addEventListener("click", ev => {
  const b = ev.target.closest("[data-ev],[data-ent],[data-person],[data-grp],[data-date],[data-act]");
  if(!b) return;
  if(b.dataset.ev) select({type:"event", id:b.dataset.ev});
  else if(b.dataset.ent) select({type:"ent", id:b.dataset.ent}, {fly:true});
  else if(b.dataset.person) select({type:"person", id:b.dataset.person});
  else if(b.dataset.grp) select({type:"grp", id:b.dataset.grp});
  else if(b.dataset.date){ setPlaying(false); setDate(+b.dataset.date); if(S.sel && S.sel.type==="ent"){ const f=largestFeatureOf(S.sel.id); if(f) flyTo(f.lp);} }
  else if(b.dataset.act==="globe"){ const e=EVI[S.sel.id]; setDate(Math.max(0,e.m)); flyTo(e.loc, Math.max(S.k,1.6)); document.querySelector(".stage").scrollIntoView({behavior: reduceMotion?"auto":"smooth"}); }
  else if(b.dataset.act==="roots"){ scrollToRoots(); }
});

function panelOverview(){
  const m = S.m;
  const recent = EV.filter(e => e.m <= m && e.m >= m-2).reverse();
  let evHtml;
  if(recent.length) evHtml = `<ul class="evlist">${recent.map(e=>evItem(e, e.m===m)).join("")}</ul>`;
  else {
    const prev = EV.filter(e=>e.m<m).slice(-2).reverse(), next = EV.filter(e=>e.m>m).slice(0,2);
    evHtml = `<p class="muted">최근 석 달 사이 기록된 사건은 없습니다.</p>
      ${next.length?`<div class="muted" style="margin-top:8px">다가오는 사건</div><ul class="evlist">${next.map(e=>evItem(e)).join("")}</ul>`:""}
      ${prev.length?`<div class="muted" style="margin-top:8px">지나간 사건</div><ul class="evlist">${prev.map(e=>evItem(e)).join("")}</ul>`:""}`;
  }
  // blocs
  const area = {};
  for(const f of FEAT[S.snap]){ const x=S.st[f.k]; if(NATONLY.has(x.o) || m >= E(x.o).endM) continue; area[x.o]=(area[x.o]||0)+f.area; }
  const byF = {};
  Object.keys(area).forEach(id=>{ const fc = facAt(id,m); (byF[fc]=byF[fc]||[]).push(id); });
  const order = ["AX","AA","AL","CO","WP","EB","CN","NA","WE","NM","NE"];
  const blocs = order.filter(k=>byF[k]).map(k=>{
    const ids = byF[k].sort((a,b)=>area[b]-area[a]);
    const shown = ids.slice(0, 10);
    return `<div class="bloc"><div class="bh"><span class="sw" style="background:${COL.f[k]}"></span>${FACN[k]}<span class="n">${ids.length}</span></div>
      <div class="chips">${shown.map(id=>chipEnt(id,m)).join("")}${ids.length>10?`<span class="chip tag">외 ${ids.length-10}</span>`:""}</div></div>`;
  }).join("");
  // leaders
  const cands = [["USA"],["SOV","RUS"],["ENG"],["FRA","VIC"],["GER","FRG"],["ITA"],["JAP"],["CHI"],["PRC"],["ROK","KOR"]];
  const exists = id => (area[id] || (id==="KOR")) && m < E(id).endM;
  const lead = cands.map(c=>{
    const id = c.find(exists); if(!id) return "";
    const L = leadersAt(id,m)[0]; if(!L) return "";
    return `<button class="leader" data-ent="${id}"><div class="c">${esc(shortAt(id,m))}</div><div class="nm">${esc(L.name)}</div><div class="ti">${esc(L.title)}</div></button>`;
  }).join("");
  return `<div class="kicker">${fmtM(m)}</div>
    <h2 class="ptitle">이 시점의 세계</h2>
    <p class="psub">${esc(eraAt(m).n)}. 지구본의 나라나 사건 점을 누르면 자세한 내용이 이곳에 나옵니다.</p>
    <div class="sec"><h3>최근 사건</h3>${evHtml}</div>
    <div class="sec"><h3>진영 판도</h3>${blocs}</div>
    <div class="sec"><h3>주요국 지도자</h3><div class="leaders">${lead}</div></div>`;
}

function panelEvent(e){
  const causes = e.k.map(id=>EVI[id]).filter(Boolean), effects = e.fx.map(id=>EVI[id]);
  return `<figure class="photo" data-ph="${e.id}" hidden></figure>
    <div class="kicker">${fmtD(e.d)}</div>
    <h2 class="ptitle">${esc(e.t)}</h2>
    <div class="chips" style="margin-bottom:14px"><span class="chip tag">${LANEN[e.r]}</span>${e.m<0?'<span class="chip tag">1936년 이전 배경</span>':""}</div>
    <p class="body-text">${esc(e.s)}</p>
    ${e.q ? `<div class="issue"><div class="lbl">쟁점</div><p>${esc(e.q)}</p></div>` : ""}
    <div class="actions"><button class="abtn primary" data-act="globe">지구본에서 보기</button><button class="abtn" data-act="roots">뿌리에서 보기</button></div>
    ${causes.length?`<div class="sec"><h3>원인 · 배경</h3><ul class="evlist">${causes.map(x=>evItem(x)).join("")}</ul></div>`:""}
    ${effects.length?`<div class="sec"><h3>이어진 사건</h3><ul class="evlist">${effects.map(x=>evItem(x)).join("")}</ul></div>`:""}
    ${e.c.length?`<div class="sec"><h3>관련 국가</h3><div class="chips">${e.c.map(id=>chipEnt(id)).join("")}</div></div>`:""}
    ${e.p.length?`<div class="sec"><h3>인물</h3><div class="chips">${e.p.map(chipPerson).join("")}</div></div>`:""}
    ${e.g.length?`<div class="sec"><h3>정당 · 조직</h3><div class="chips">${e.g.map(chipGrp).join("")}</div></div>`:""}`;
}

function eventsOfEnt(id){ return EV.filter(e => e.c.includes(id)); }
function panelEnt(id, terr){
  const m = S.m, e = E(id);
  let x = null;
  if(terr && TT[terr] !== undefined || terr && S.st[terr]) x = S.st[terr] || terrAt(terr, m);
  // header naming
  let title = nameAt(id, m), statusLine = "";
  const ownerId = x ? x.o : id;
  if(x && x.oc){ statusLine = `${esc(shortAt(x.oc,m))} 점령 下${x.o!==id?` · 주권: ${esc(shortAt(x.o,m))}`:""}`; }
  else if(x && x.c){ statusLine = `${esc(nameAt(x.o,m))}의 식민지·보호령`; }
  else if(x && x.o !== id){ statusLine = `${esc(nameAt(x.o,m))}의 영토`; title = E(id).n; }
  else if(m >= e.endM){ statusLine = "이 시점에는 존재하지 않음"; }
  else if(NATONLY.has(id)){ statusLine = "독립 국가가 없는 민족·지역"; }
  else {
    let free=0, occ=0;
    for(const f of FEAT[S.snap]){ const y=S.st[f.k]; if(y.o===id && !y.c){ if(y.oc) occ++; else free++; } }
    statusLine = free ? (occ ? "독립국 · 일부 영토 점령됨" : "독립국") : occ ? "전 영토가 점령됨 · 망명 정부" : "이 시점에는 영토를 가진 국가가 아님";
  }
  const govId = (x && (x.oc||x.c||x.o!==id)) ? null : id;
  const fc = facAt(govId||ownerId, m), ic = ideAt(govId||ownerId, m);
  const L = leadersAt(id, m);
  const pt = partyAt(id, m);
  const evs = eventsOfEnt(id).concat(x && x.o!==id ? eventsOfEnt(x.o).filter(ev=>!ev.c.includes(id)) : []);
  const seen = new Set(), uniq = evs.filter(v=>!seen.has(v.id)&&seen.add(v.id)).sort((a,b)=>a.m-b.m);
  const before = uniq.filter(v=>v.m<=m).slice(-6).reverse(), after = uniq.filter(v=>v.m>m).slice(0,4);
  // territory history
  let hist = "";
  if(terr && TT[terr]){
    const tl = TT[terr].tl, curE = at(tl, m);
    hist = `<div class="sec"><h3>이 지역의 주인 변천</h3><ul class="tlist">${tl.map(t=>{
      const tm = Math.max(0,t.m); const lbl = t.oc ? `${shortAt(t.oc,tm)} 점령 (${shortAt(t.o,tm)})` : t.c ? `${shortAt(t.o,tm)} 식민지·보호령` : nameAt(t.o,tm);
      const d = t.m < 0 ? 0 : t.m;
      return `<li class="${t===curE?"cur":""}"><button data-date="${d}"><span class="d">${t.m<0?"1936.01":fmtMshort(t.m)}</span>${esc(lbl)}</button></li>`;
    }).join("")}</ul></div>`;
  }
  const swc = (x && x.oc) ? colorOf(x.oc) : colorOf(govId||ownerId);
  return `<div class="kicker">${fmtM(m)}${e.h?` · HOI4 <span class="mono">${id}</span>`:""}</div>
    <h2 class="ptitle">${esc(title)}</h2>
    <div class="status"><span class="sw" style="background:${swc}"></span>${statusLine}</div>
    <dl class="kv">
      ${govId?`<dt>진영</dt><dd>${FACN[fc]}</dd><dt>이념</dt><dd>${IDEN[ic]}</dd>`:(x&&x.oc?`<dt>점령국</dt><dd>${chipEnt(x.oc)}</dd>`:`<dt>지배국</dt><dd>${chipEnt(ownerId)}</dd>`)}
      ${L.map(l=>`<dt>${esc(l.title.length>6?"지도자":l.title)}</dt><dd>${esc(l.name)}${l.title.length>6?` <span class="muted">${esc(l.title)}</span>`:""}</dd>`).join("")}
      ${pt?`<dt>집권 세력</dt><dd>${chipGrp(pt)}</dd>`:""}
    </dl>
    ${!govId && (x) ? `<div class="sec"><h3>${esc(E(x.oc||x.o).n)} 현황</h3><dl class="kv"><dt>진영</dt><dd>${FACN[facAt(x.oc||x.o,m)]}</dd><dt>이념</dt><dd>${IDEN[ideAt(x.oc||x.o,m)]}</dd>${leadersAt(x.oc||x.o,m).slice(0,1).map(l=>`<dt>지도자</dt><dd>${esc(l.name)}</dd>`).join("")}</dl></div>`:""}
    <div class="actions"><button class="abtn" data-act="roots">이 나라의 뿌리 보기</button></div>
    <div class="sec"><h3>지금까지의 사건</h3>${before.length?`<ul class="evlist">${before.map(v=>evItem(v, v.m===m)).join("")}</ul>`:'<p class="muted">이 시점 이전에 기록된 사건이 없습니다.</p>'}</div>
    ${after.length?`<div class="sec"><h3>다가올 사건</h3><ul class="evlist">${after.map(v=>evItem(v)).join("")}</ul></div>`:""}
    ${hist}`;
}
function panelPerson(id){
  const p = PPL[id]; const evs = EV.filter(e=>e.p.includes(id));
  return `<div class="kicker">${esc(p[2])}</div>
    <h2 class="ptitle">${esc(p[0])}</h2>
    <p class="psub">${esc(p[1])} · ${esc(p[4])}</p>
    <div class="chips" style="margin-bottom:14px">${p[3]?chipEnt(p[3]):""}${p[6]?chipGrp(p[6]):""}</div>
    <p class="body-text">${esc(p[5])}</p>
    <div class="actions"><button class="abtn" data-act="roots">인물의 뿌리 보기</button></div>
    <div class="sec"><h3>관련 사건 ${evs.length}</h3><ul class="evlist">${evs.map(e=>evItem(e, e.m===S.m)).join("")}</ul></div>`;
}
function panelGrp(id){
  const g = GRP[id]; const evs = EV.filter(e=>e.g.includes(id));
  const mem = Object.entries(PPL).filter(([k,p])=>p[6]===id).map(([k])=>k);
  const ents = Object.values(ENT).filter(e=>e.pt && e.pt.includes(id)).map(e=>e.id);
  return `<div class="kicker">${esc(g[1])} · ${esc(g[4])}</div>
    <h2 class="ptitle">${esc(g[0])}</h2>
    <div class="chips" style="margin-bottom:14px">${g[2]?chipEnt(g[2]):""}${g[3]&&g[3]!=="-"?`<span class="chip tag">${IDEN[g[3]]}</span>`:""}</div>
    <p class="body-text">${esc(g[5])}</p>
    <div class="actions"><button class="abtn" data-act="roots">관련 사건 뿌리 보기</button></div>
    ${mem.length?`<div class="sec"><h3>주요 인물</h3><div class="chips">${mem.map(chipPerson).join("")}</div></div>`:""}
    ${ents.length&&!g[2]?`<div class="sec"><h3>집권 국가</h3><div class="chips">${ents.map(x=>chipEnt(x)).join("")}</div></div>`:""}
    <div class="sec"><h3>관련 사건 ${evs.length}</h3>${evs.length?`<ul class="evlist">${evs.map(e=>evItem(e, e.m===S.m)).join("")}</ul>`:'<p class="muted">직접 연결된 사건이 없습니다.</p>'}</div>`;
}

/* ================= roots (chronological cause-effect map) ================= */
const RT = {nodes:[], y:null, W:0, H:0, top:70, breaks:[]};
const rsvg = d3.select("#rootsvg");
const measure = document.createElement("canvas").getContext("2d");
function trunc(txt, max, font){
  measure.font = font; if(measure.measureText(txt).width <= max) return txt;
  let t = txt; while(t.length > 1 && measure.measureText(t+"…").width > max) t = t.slice(0,-1);
  return t + "…";
}
const monthF = d => { const y=+d.slice(0,4), m=+d.slice(5,7), dd=+(d.slice(8,10)||1); return (y-1929)*12 + (m-1) + (dd-1)/31; };
function layoutRoots(){
  const holder = $(".roots-scroll");
  const narrow = window.innerWidth <= 720;
  const W = Math.max(narrow ? 900 : 0, holder.clientWidth);
  RT.W = W;
  const axisW = 58, laneW = (W - axisW - 6) / LANES.length;
  RT.axisW = axisW; RT.laneW = laneW;
  const laneIx = Object.fromEntries(LANES.map(([k],i)=>[k,i]));
  const px = 4.2, gap = 28, top = RT.top;
  const last = {}; let off = 0; RT.breaks = [];
  RT.nodes = EV.map(e=>{
    const mf = monthF(e.d);
    let y = top + mf*px + off;
    const L = laneIx[e.r];
    if(last[L] !== undefined && y < last[L] + gap){ off += last[L] + gap - y; y = top + mf*px + off; }
    last[L] = y; RT.breaks.push([mf, off]);
    return {e, x: axisW + L*laneW + 12, y, lane:L, deg: e.k.length + e.fx.length};
  });
  RT.px = px;
  RT.yAt = mf => { let o=0; for(const [b,v] of RT.breaks){ if(b<=mf) o=v; else break; } return top + mf*px + o; };
  RT.H = RT.nodes[RT.nodes.length-1].y + 90;
  $("#lanes").style.gridTemplateColumns = `${axisW}px repeat(${LANES.length}, 1fr)`;
  $("#lanes").innerHTML = `<span></span>` + LANES.map(([k,n])=>`<span>${n}</span>`).join("");
}
function renderRoots(){
  layoutRoots();
  const {W,H,axisW,laneW} = RT;
  rsvg.attr("viewBox",`0 0 ${W} ${H}`).attr("height",H).style("min-width", window.innerWidth<=720? "900px" : null);
  rsvg.selectAll("*").remove();
  const gGrid = rsvg.append("g");
  // era bands
  ERAS.forEach((er,i)=>{
    const y0 = RT.yAt(monthF(er.a+"-01")), y1 = RT.yAt(monthF(er.b+"-01"));
    if(i%2) gGrid.append("rect").attr("x",0).attr("y",y0).attr("width",W).attr("height",Math.max(0,y1-y0)).attr("fill","var(--bg-2)").attr("opacity",.6);
    gGrid.append("text").attr("class","r-era").attr("x",axisW+6).attr("y",y0+18).text(er.n);
  });
  // year grid
  let lastLbl = -99;
  for(let y=1929;y<=1992;y++){
    const yy = RT.yAt((y-1929)*12), dec = y%10===0;
    gGrid.append("line").attr("class","r-grid"+(dec?" dec":"")).attr("x1",axisW-6).attr("x2",W).attr("y1",yy).attr("y2",yy).attr("stroke-opacity", dec?.9:.45);
    if(yy - lastLbl > 16){ gGrid.append("text").attr("class","r-year"+(dec?" dec":"")).attr("x",axisW-10).attr("y",yy+4).attr("text-anchor","end").text(y); lastLbl=yy; }
    if(dec && window.innerWidth<=720) LANES.forEach(([k,n],i)=> gGrid.append("text").attr("class","r-lanelbl").attr("x",axisW+i*laneW+10).attr("y",yy-6).text(n));
  }
  for(let i=1;i<LANES.length;i++) gGrid.append("line").attr("x1",axisW+i*laneW).attr("x2",axisW+i*laneW).attr("y1",RT.top-20).attr("y2",H).attr("stroke","var(--line)").attr("stroke-dasharray","1 5");
  // edges
  const NI = Object.fromEntries(RT.nodes.map(n=>[n.e.id,n]));
  RT.NI = NI;
  const edges = [];
  RT.nodes.forEach(n=> n.e.k.forEach(k=>{ const a=NI[k]; if(a) edges.push({a, b:n}); }));
  RT.edges = edges;
  rsvg.append("g").attr("class","r-edges").selectAll("path").data(edges).join("path").attr("class","r-edge")
    .attr("d", d=>{ const {a,b}=d; const my=(a.y+b.y)/2; const bend = a.lane===b.lane ? Math.min(40, (b.y-a.y)*0.08) : 0;
      return `M${a.x},${a.y} C${a.x+bend},${my} ${b.x+bend},${my} ${b.x},${b.y}`; });
  rsvg.append("g").attr("class","r-thread-g");
  rsvg.append("g").attr("class","r-lets");
  // nodes
  const font = "12px 'IBM Plex Sans KR', sans-serif";
  const ng = rsvg.append("g").attr("class","r-nodes").selectAll("g").data(RT.nodes).join("g").attr("class","r-node")
    .attr("transform", d=>`translate(${d.x},${d.y})`).attr("tabindex",0).attr("role","button").attr("aria-label", d=>`${fmtD(d.e.d)} ${d.e.t}`);
  ng.append("circle").attr("r", d=>3.8 + Math.min(4.2, d.deg*0.55));
  ng.each(d=>{ d.lbl = trunc(d.e.t, laneW-26, font); });
  ng.append("text").attr("x",11).attr("y",4).text(d=>d.lbl);
  ng.append("title").text(d=>`${fmtD(d.e.d)} · ${d.e.t}`);
  ng.on("click", (ev,d)=> select({type:"event", id:d.e.id}))
    .on("keydown", (ev,d)=>{ if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); select({type:"event", id:d.e.id}); } });
  // now line
  const now = rsvg.append("g").attr("class","r-now");
  now.append("line").attr("x1",axisW-6).attr("x2",W);
  now.append("rect").attr("x",0).attr("y",-9).attr("width",axisW-8).attr("height",18).attr("rx",3);
  now.append("text").attr("x",(axisW-8)/2).attr("y",4).attr("text-anchor","middle");
  RT.now = now;
  updateNowLine(); highlightRoots();
}
function updateNowLine(){
  if(!RT.now) return;
  const mf = (S.t + M0 - 1929*12);
  const y = RT.yAt(mf);
  RT.now.attr("transform",`translate(0,${y})`); RT.now.select("text").text(fmtMshort(S.m));
  const nearIds = new Set(EV.filter(e=>Math.abs(e.m - S.m) <= 6).map(e=>e.id));
  rsvg.selectAll(".r-node").classed("near", d=>nearIds.has(d.e.id));
}
function lineage(id, depth){
  const up = new Map(), down = new Map();
  const walk = (start, dir, map) => { let fr=[start], d=0; while(fr.length && d<depth){ d++; const nx=[]; for(const x of fr){ for(const y of (dir==="up"?EVI[x].k:EVI[x].fx)){ if(!map.has(y) && EVI[y]){ map.set(y,d); nx.push(y);} } } fr=nx; } };
  walk(id,"up",up); walk(id,"down",down);
  return {up, down};
}
function highlightRoots(){
  if(!RT.nodes.length) return;
  const s = S.sel;
  const nodes = rsvg.selectAll(".r-node"), edges = rsvg.selectAll(".r-edge");
  rsvg.select(".r-lets").selectAll("*").remove(); rsvg.select(".r-thread-g").selectAll("*").remove();
  nodes.classed("hl",false).classed("hl2",false).classed("sel",false).classed("dim",false);
  nodes.select("text").text(d=>d.lbl);
  edges.classed("hl",false).classed("hl2",false).classed("dim",false);
  if(!s) return;
  let set = new Map();   // id -> level (0 sel, 1 direct, 2 indirect)
  if(s.type==="event"){
    const e0 = EVI[s.id];
    set.set(s.id, 0); e0.k.forEach(k=>EVI[k]&&set.set(k,1)); e0.fx.forEach(k=>set.set(k,1));
  } else {
    const evs = s.type==="ent" ? eventsOfEnt(s.id) : s.type==="person" ? EV.filter(e=>e.p.includes(s.id)) : EV.filter(e=>e.g.includes(s.id));
    evs.forEach(e=>set.set(e.id, 1));
  }
  nodes.filter(d=>set.has(d.e.id)).raise().select("text").text(d=>d.e.t);
  nodes.classed("sel", d=>set.get(d.e.id)===0).classed("hl", d=>set.get(d.e.id)===1).classed("hl2", d=>set.get(d.e.id)===2).classed("dim", d=>!set.has(d.e.id));
  if(s.type==="event"){
    edges.classed("hl", d=> d.a.e.id===s.id || d.b.e.id===s.id)
         .classed("dim", d=> !(d.a.e.id===s.id || d.b.e.id===s.id));
    rsvg.select(".r-edges").selectAll(".r-edge.hl").raise();
  } else {
    edges.classed("dim", true);
    const pts = RT.nodes.filter(n=>set.has(n.e.id));
    if(pts.length>1){
      const line = d3.line().x(d=>d.x).y(d=>d.y).curve(d3.curveCatmullRom.alpha(.6));
      rsvg.select(".r-thread-g").append("path").attr("class","r-thread").attr("d", line(pts));
    }
  }
}
function scrollToRoots(){
  const s = S.sel; let target = null;
  if(s && s.type==="event") target = RT.NI[s.id];
  else if(s){ const n = RT.nodes.find(n=>rsvg.selectAll(".r-node").filter(d=>d===n).classed("hl")); target = n; }
  const svgTop = $("#rootsvg").getBoundingClientRect().top + window.scrollY;
  const y = target ? target.y : RT.yAt(S.m + M0 - 1929*12);
  window.scrollTo({top: svgTop + y - window.innerHeight*0.35, behavior: reduceMotion?"auto":"smooth"});
}
$("#toNow").onclick = () => { const svgTop = $("#rootsvg").getBoundingClientRect().top + window.scrollY; window.scrollTo({top: svgTop + RT.yAt(S.m + M0 - 1929*12) - window.innerHeight*0.35, behavior: reduceMotion?"auto":"smooth"}); };
$("#clearSel").onclick = () => { S.sel=null; S.hist=[]; renderPanel(); highlightRoots(); drawOverlay(); openSheet(false); };

/* ================= search ================= */
const q = $("#q"), res = $("#results");
const IDX = [
  ...EV.map(e=>({k:"사건", t:e.t, d:fmtDshort(e.d), s:(e.t+" "+e.s).toLowerCase(), go:()=>select({type:"event",id:e.id})})),
  ...Object.entries(PPL).map(([id,p])=>({k:"인물", t:p[0], d:p[2], s:(p[0]+" "+p[1]+" "+p[4]).toLowerCase(), go:()=>select({type:"person",id})})),
  ...Object.values(ENT).filter(e=>!["ACC"].includes(e.id)).map(e=>({k:"국가", t:e.n, d:e.h?e.id:"", s:(e.n+" "+(e.nm||"")+" "+e.id).toLowerCase(), go:()=>select({type:"ent",id:e.id},{fly:true})})),
  ...Object.entries(GRP).map(([id,g])=>({k:"정당·조직", t:g[0], d:g[4], s:(g[0]+" "+id).toLowerCase(), go:()=>select({type:"grp",id})})),
];
let resSel = 0, resList = [];
function runSearch(){
  const v = q.value.trim().toLowerCase();
  if(!v){ res.hidden = true; return; }
  const score = x => { const t = x.t.toLowerCase(); return t===v?0 : t.startsWith(v)?1 : t.includes(v)?2 : x.s.includes(v)?3 : 9; };
  resList = IDX.map(x=>[score(x),x]).filter(a=>a[0]<9).sort((a,b)=>a[0]-b[0]).slice(0,14).map(a=>a[1]);
  resSel = 0;
  res.innerHTML = resList.length ? resList.map((x,i)=>`<button data-i="${i}" class="${i===0?"on":""}"><span class="k">${x.k}</span><span class="t">${esc(x.t)}</span><span class="d">${esc(x.d)}</span></button>`).join("") : `<div class="none">검색 결과가 없습니다.</div>`;
  res.hidden = false;
}
q.addEventListener("input", runSearch);
q.addEventListener("keydown", ev=>{
  if(res.hidden) return;
  if(ev.key==="ArrowDown"||ev.key==="ArrowUp"){ ev.preventDefault(); resSel = (resSel + (ev.key==="ArrowDown"?1:-1) + resList.length) % Math.max(1,resList.length); res.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("on",i===resSel)); }
  else if(ev.key==="Enter" && resList[resSel]){ resList[resSel].go(); res.hidden=true; q.blur(); }
  else if(ev.key==="Escape"){ res.hidden=true; }
});
res.addEventListener("click", ev=>{ const b=ev.target.closest("button[data-i]"); if(!b) return; resList[+b.dataset.i].go(); res.hidden=true; });
document.addEventListener("click", ev=>{ if(!ev.target.closest("#search")) res.hidden = true; });

/* ================= boot ================= */
function onTheme(){ readColors(); renderLegend(); drawAll(); }
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", onTheme);
new MutationObserver(onTheme).observe(document.documentElement, {attributes:true, attributeFilter:["data-theme"]});
readColors();
computeState();
renderHUD(); renderLegend(); renderPanel();
new ResizeObserver(()=>{ sizeGlobe(); }).observe(wrap);
let rw = 0;
new ResizeObserver(()=>{ const w=$("#track").clientWidth; if(w!==rw){ rw=w; renderTrack(); } }).observe($("#track"));
let lastRootsW = 0;
new ResizeObserver(()=>{ const w=$(".roots-scroll").clientWidth; if(Math.abs(w-lastRootsW)>2){ lastRootsW=w; renderRoots(); } }).observe($(".roots-scroll"));
sizeGlobe();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{ renderRoots(); drawAll(); });
window.__app = {S, setDate, select, setT, setPlaying};
(window.requestIdleCallback||setTimeout)(()=>loadPhotos());
})();
