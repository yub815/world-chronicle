// 세부 원본(geoBoundaries) 규칙: 독일 크라이스, 폴란드 포비아트, 중국 현.
// 옛 구역을 현대 기초 단위의 묶음으로 나타낸다. u.parent = 그 단위가 속한 현대 1급 구역(NE 이름)
import { ref, mi, nearest } from "./util.mjs";

export const R = {};
const set = (cc, names) => new Set(ref(cc, names));

// ======================= 독일 =======================
const KS = ", Kreisfreie Stadt";
// 무게중심이 이웃 주에 찍히는 크라이스(바다 쪽 조각 등)의 주를 바로잡는다
const LAND_FIX = {"Bergstraße": "Hessen", ["Emden" + KS]: "Niedersachsen", "Aurich": "Niedersachsen", "Leer": "Niedersachsen", "Wittmund": "Niedersachsen",
  "Stade": "Niedersachsen", "Pinneberg": "Schleswig-Holstein", "Cuxhaven": "Niedersachsen", ["Wilhelmshaven" + KS]: "Niedersachsen", "Friesland (DE)": "Niedersachsen",
  "Dithmarschen": "Schleswig-Holstein", "Nordfriesland": "Schleswig-Holstein", "Hamburg": "Hamburg", ["Bremen" + KS]: "Bremen", ["Bremerhaven" + KS]: "Bremen"};
ref("DEU2", Object.keys(LAND_FIX));
const land = u => LAND_FIX[u.name] || u.parent;

const BADEN = set("DEU2", ["Baden-Baden, Stadtkreis", "Karlsruhe, Stadtkreis", "Karlsruhe, Landkreis", "Rastatt", "Heidelberg, Stadtkreis", "Mannheim, Stadtkreis",
  "Neckar-Odenwald-Kreis", "Rhein-Neckar-Kreis", "Pforzheim, Stadtkreis", "Enzkreis", "Freiburg im Breisgau, Stadtkreis", "Breisgau-Hochschwarzwald", "Emmendingen",
  "Ortenaukreis", "Schwarzwald-Baar-Kreis", "Konstanz", "Lörrach", "Waldshut", "Main-Tauber-Kreis"]);
const HOHENZOLLERN = set("DEU2", ["Sigmaringen"]);
// 1945–52년 뷔르템베르크-바덴(미군)·남바덴·뷔르템베르크-호엔촐레른(프랑스군)
const WB_NORTH = set("DEU2", ["Stuttgart, Stadtkreis", "Böblingen", "Esslingen", "Göppingen", "Ludwigsburg", "Rems-Murr-Kreis", "Heilbronn, Stadtkreis", "Heilbronn, Landkreis",
  "Hohenlohekreis", "Schwäbisch Hall", "Main-Tauber-Kreis", "Heidenheim", "Ostalbkreis", "Karlsruhe, Stadtkreis", "Karlsruhe, Landkreis", "Heidelberg, Stadtkreis",
  "Mannheim, Stadtkreis", "Neckar-Odenwald-Kreis", "Rhein-Neckar-Kreis", "Pforzheim, Stadtkreis", "Enzkreis", "Ulm, Stadtkreis", "Alb-Donau-Kreis"]);
const VOLKSSTAAT_HESSEN = set("DEU2", ["Darmstadt" + KS, "Offenbach am Main" + KS, "Bergstraße", "Darmstadt-Dieburg", "Groß-Gerau", "Odenwaldkreis",
  "Offenbach, Landkreis", "Gießen, Landkreis", "Vogelsbergkreis", "Wetteraukreis"]);
const KURHESSEN = set("DEU2", ["Kassel" + KS, "Kassel, Landkreis", "Fulda", "Hersfeld-Rotenburg", "Schwalm-Eder-Kreis", "Waldeck-Frankenberg", "Werra-Meißner-Kreis",
  "Marburg-Biedenkopf", "Main-Kinzig-Kreis"]);
const PFALZ = set("DEU2", ["Frankenthal (Pfalz)" + KS, "Kaiserslautern" + KS, "Landau in der Pfalz" + KS, "Ludwigshafen am Rhein" + KS, "Neustadt an der Weinstraße" + KS,
  "Pirmasens" + KS, "Speyer" + KS, "Zweibrücken" + KS, "Bad Dürkheim", "Donnersbergkreis", "Germersheim", "Kaiserslautern, Landkreis", "Kusel", "Südliche Weinstraße",
  "Rhein-Pfalz-Kreis", "Südwestpfalz"]);
const RHEINHESSEN = set("DEU2", ["Mainz" + KS, "Worms" + KS, "Alzey-Worms", "Mainz-Bingen"]);
const MONTABAUR = set("DEU2", ["Rhein-Lahn-Kreis", "Westerwaldkreis"]);
const WESTFALEN = set("DEU2", ["Bottrop" + KS, "Gelsenkirchen" + KS, "Münster" + KS, "Borken", "Coesfeld", "Recklinghausen", "Steinfurt", "Warendorf", "Bielefeld" + KS,
  "Gütersloh", "Herford", "Höxter", "Minden-Lübbecke", "Paderborn", "Bochum" + KS, "Dortmund" + KS, "Hagen" + KS, "Hamm" + KS, "Herne" + KS, "Ennepe-Ruhr-Kreis",
  "Hochsauerlandkreis", "Märkischer Kreis", "Olpe", "Siegen-Wittgenstein", "Soest", "Unna"]);
const OLDENBURG = set("DEU2", ["Oldenburg (Oldenburg)" + KS, "Delmenhorst" + KS, "Wilhelmshaven" + KS, "Ammerland", "Cloppenburg", "Vechta", "Wesermarsch", "Friesland (DE)", "Oldenburg, Landkreis"]);
const BRAUNSCHWEIG = set("DEU2", ["Braunschweig" + KS, "Salzgitter" + KS, "Wolfsburg" + KS, "Wolfenbüttel", "Helmstedt", "Goslar", "Holzminden"]);
const VORPOMMERN = set("DEU2", ["Vorpommern-Rügen", "Vorpommern-Greifswald"]);
const ANHALT = set("DEU2", ["Dessau-Roßlau" + KS, "Anhalt-Bitterfeld"]);
const RB_MAGDEBURG = set("DEU2", ["Magdeburg" + KS, "Altmarkkreis Salzwedel", "Stendal", "Jerichower Land", "Börde", "Harz", "Salzlandkreis"]);
const RB_ERFURT = set("DEU2", ["Erfurt" + KS, "Eichsfeld", "Nordhausen", "Sömmerda"]);
const LIPPE = set("DEU2", ["Lippe"]);

// 옛 프로이센 주 이름(개편 시점 반영)
const silesia = (m, part) => (m >= mi("1938-04") && m < mi("1941-01")) ? "Schlesien" : part;
const grenzmark = (m, later) => m < mi("1938-10") ? "Grenzmark Posen-Westpreußen" : later;
const hessenNassau = (u, m) => m < mi("1944-07") ? "Hessen-Nassau" : (KURHESSEN.has(u.name) ? "Kurhessen" : "Nassau");
const provSachsen = (u, m) => m < mi("1944-07") ? "Provinz Sachsen" : (RB_MAGDEBURG.has(u.name) ? "Magdeburg" : "Halle-Merseburg");

// 1936–45년 독일 안쪽(현대 독일 영토): 란트와 프로이센 주
function de36(u, m){
  const n = u.name;
  switch(land(u)){
    case "Bayern": return "Bayern";
    case "Baden-Württemberg": return BADEN.has(n) ? "Baden" : HOHENZOLLERN.has(n) ? "Hohenzollern" : "Württemberg";
    case "Hessen": return VOLKSSTAAT_HESSEN.has(n) ? "Hessen" : hessenNassau(u, m);
    case "Rheinland-Pfalz":
      if(PFALZ.has(n)) return "Bayern";                          // 바이에른령 팔츠
      if(RHEINHESSEN.has(n)) return "Hessen";
      if(MONTABAUR.has(n)) return hessenNassau(u, m);
      if(n === "Birkenfeld") return m < mi("1937-04") ? "Oldenburg" : "Rheinprovinz";
      return "Rheinprovinz";
    case "Saarland": return "Saarland";
    case "Nordrhein-Westfalen": return WESTFALEN.has(n) ? "Westfalen" : LIPPE.has(n) ? "Lippe" : "Rheinprovinz";
    case "Niedersachsen":
      if(n === "Wilhelmshaven" + KS && m < mi("1937-04")) return "Hannover";
      if(OLDENBURG.has(n)) return "Oldenburg";
      if(BRAUNSCHWEIG.has(n)) return "Braunschweig";
      if(n === "Schaumburg") return "Schaumburg-Lippe";
      return "Hannover";
    case "Bremen": return "Bremen";
    case "Hamburg": return "Hamburg";
    case "Schleswig-Holstein": return (n === "Lübeck" + KS && m < mi("1937-04")) ? "Lübeck" : "Schleswig-Holstein";
    case "Mecklenburg-Vorpommern": return VORPOMMERN.has(n) ? "Pommern" : "Mecklenburg";
    case "Brandenburg": return "Brandenburg";
    case "Berlin": return "Berlin";
    case "Sachsen": return n === "Görlitz" ? silesia(m, "Niederschlesien") : "Sachsen";
    case "Sachsen-Anhalt": return ANHALT.has(n) ? "Anhalt" : provSachsen(u, m);
    case "Thüringen": return RB_ERFURT.has(n) ? (m < mi("1944-07") ? provSachsen(u, m) : "Thüringen") : "Thüringen";
  }
  return null;
}
ref("DEU2", ["Birkenfeld", "Wilhelmshaven" + KS, "Schaumburg", "Lübeck" + KS, "Görlitz"]);

// 동독 14개 베치르크(1952–90)와 동베를린
const BEZIRK = {};
for(const [b, ks] of Object.entries({
  Rostock: ["Rostock" + KS, "Landkreis Rostock", "Vorpommern-Rügen", "Nordwestmecklenburg"], Schwerin: ["Schwerin" + KS, "Ludwigslust-Parchim"],
  Neubrandenburg: ["Mecklenburgische Seenplatte", "Vorpommern-Greifswald", "Uckermark"],
  Potsdam: ["Potsdam" + KS, "Brandenburg an der Havel" + KS, "Havelland", "Potsdam-Mittelmark", "Teltow-Fläming", "Oberhavel", "Ostprignitz-Ruppin", "Prignitz"],
  "Frankfurt (Oder)": ["Frankfurt (Oder)" + KS, "Märkisch-Oderland", "Oder-Spree", "Barnim"],
  Cottbus: ["Cottbus" + KS, "Spree-Neiße", "Oberspreewald-Lausitz", "Elbe-Elster", "Dahme-Spreewald"],
  Magdeburg: ["Magdeburg" + KS, "Börde", "Altmarkkreis Salzwedel", "Stendal", "Jerichower Land", "Harz", "Salzlandkreis"],
  Halle: ["Halle (Saale)" + KS, "Saalekreis", "Burgenlandkreis", "Mansfeld-Südharz", "Anhalt-Bitterfeld", "Dessau-Roßlau" + KS, "Wittenberg"],
  Erfurt: ["Erfurt" + KS, "Weimar" + KS, "Eisenach" + KS, "Gotha", "Sömmerda", "Unstrut-Hainich-Kreis", "Kyffhäuserkreis", "Nordhausen", "Eichsfeld", "Wartburgkreis", "Weimarer Land", "Ilm-Kreis"],
  Gera: ["Gera" + KS, "Jena" + KS, "Greiz", "Saale-Holzland-Kreis", "Saale-Orla-Kreis", "Saalfeld-Rudolstadt"], Suhl: ["Suhl" + KS, "Schmalkalden-Meiningen", "Hildburghausen", "Sonneberg"],
  Leipzig: ["Leipzig" + KS, "Leipzig", "Nordsachsen", "Altenburger Land"], Dresden: ["Dresden" + KS, "Meißen", "Sächsische Schweiz-Osterzgebirge", "Bautzen", "Görlitz"],
  "Karl-Marx-Stadt": ["Chemnitz" + KS, "Erzgebirgskreis", "Mittelsachsen", "Zwickau", "Vogtlandkreis"], "Berlin (Ost)": ["Berlin"],
})) for(const k of ref("DEU2", ks)) BEZIRK[k] = b;
const EAST = new Set(["Brandenburg", "Mecklenburg-Vorpommern", "Sachsen", "Sachsen-Anhalt", "Thüringen", "Berlin"]);

R.DEU2 = (u, m) => {
  const n = u.name, L = land(u);
  if(m < mi("1945-05")) return "DE|" + de36(u, m);
  if(m >= mi("1990-10")) return "DE|" + L;                          // 통일 뒤 현대 주
  if(EAST.has(L)){                                                  // 소련 점령지구 → 동독
    if(m < mi("1945-07")) return "DO|" + de36(u, m);
    if(m < mi("1952-08")) return "DO|" + L;                          // 1945–52년 5개 주(오늘날 주와 거의 같다)
    return "DO|" + BEZIRK[n];
  }
  if(L === "Saarland") return (m < mi("1957-01") ? "SAA|" : "DW|") + "Saarland";   // 자르 보호령
  // 서방 점령지구 → 서독
  if(L === "Baden-Württemberg" && m < mi("1952-04")){
    if(WB_NORTH.has(n)) return m < mi("1945-09") ? "DW|" + de36(u, m) : "DW|Württemberg-Baden";
    return "DW|" + (BADEN.has(n) ? "Baden" : "Württemberg-Hohenzollern");
  }
  if(L === "Niedersachsen" && m < mi("1946-11")) return "DW|" + de36(u, m);
  if(L === "Nordrhein-Westfalen" && m < mi("1946-08")) return "DW|" + (WESTFALEN.has(n) ? "Westfalen" : LIPPE.has(n) ? "Lippe" : "Nordrhein");
  if(L === "Nordrhein-Westfalen" && LIPPE.has(n) && m < mi("1947-01")) return "DW|Lippe";
  if(L === "Rheinland-Pfalz" && m < mi("1946-08")) return "DW|" + (PFALZ.has(n) ? "Pfalz" : RHEINHESSEN.has(n) ? "Rheinhessen" : "Rheinland");
  if(L === "Hessen" && m < mi("1945-09")) return "DW|" + de36(u, m);
  return "DW|" + L;
};

// ======================= 폴란드 =======================
// 1936–39년 독일령이던 포비아트(현대 폴란드 서부·북부). 라벨은 1936년 프로이센 주
const P = s => "powiat " + s;
const PL_DE = {};
const deGroup = (label, names) => { for(const n of ref("POL2", names)) PL_DE[n] = label; };
deGroup("Pommern", ["powiat kamieński", "powiat drawski", "powiat koszaliński", "Koszalin", "powiat pyrzycki", "powiat świdwiński", "powiat policki", "powiat białogardzki",
  "powiat goleniowski", "powiat łobeski", "powiat sławieński", "powiat stargardzki", "powiat szczecinecki", "Świnoujście", "Szczecin", "powiat gryficki", "Colberg County",
  "powiat lęborski", "powiat bytowski", "powiat słupski", "Słupsk"]);
deGroup("Brandenburg", ["powiat myśliborski", "powiat gryfiński", "powiat gorzowski", "Gorzów Wielkopolski", "powiat słubicki", "powiat sulęciński",
  "powiat strzelecko-drezdenecki", "powiat świebodziński", "powiat żarski"]);
deGroup("Brandenburg/Pommern", ["powiat choszczeński"]);            // 아른스발데: 1938년 포메른으로
deGroup("Grenzmark/Pommern", ["powiat wałecki", "powiat człuchowski", "powiat złotowski", "powiat pilski"]);
deGroup("Grenzmark/Brandenburg", ["powiat międzyrzecki"]);
deGroup("Grenzmark/Niederschlesien", ["powiat wschowski"]);
deGroup("Niederschlesien", ["powiat zielonogórski", "Zielona Góra", "powiat nowosolski", "powiat żagański", "powiat namysłowski", "powiat brzeski"]);
deGroup("Ostpreußen", ["powiat sztumski", "powiat kwidzyński", "powiat malborski", "powiat elbląski", "Elbląg"]);
deGroup("Oberschlesien", ["Gliwice County", "Gliwice", "Zabrze", "Bytom", "Racibórz County"]);
deGroup("Danzig", ["Gdańsk", "Sopot", "powiat nowodworski", "powiat gdański"]);
// 포비아트 이름이 여러 주에 겹치는 경우(nowodworski는 포모제·마조프셰 둘 다 있다)가 있어 현대 주로 거른다
const DE_PARENT = {"Pommern": ["West Pomeranian", "Pomeranian"], "Danzig": ["Pomeranian"], "Ostpreußen": ["Pomeranian", "Warmian-Masurian"],
  "Oberschlesien": ["Silesian", "Opole"], "Niederschlesien": ["Lubusz", "Opole", "Lower Silesian"], "Brandenburg": ["West Pomeranian", "Lubusz"],
  "Brandenburg/Pommern": ["West Pomeranian"], "Grenzmark/Pommern": ["West Pomeranian", "Pomeranian", "Greater Poland"], "Grenzmark/Brandenburg": ["Lubusz"],
  "Grenzmark/Niederschlesien": ["Lubusz"]};
function plGerman(u){
  const g = PL_DE[u.name];
  if(g && DE_PARENT[g].includes(u.parent)) return g;
  if(u.parent === "Lower Silesian") return "Niederschlesien";
  if(u.parent === "Opole") return "Oberschlesien";
  if(u.parent === "Warmian-Masurian" && !["powiat działdowski", "powiat nowomiejski"].includes(u.name)) return "Ostpreußen";
  if(u.parent === "West Pomeranian") return "Pommern";
  if(u.parent === "Lubusz") return "Brandenburg";
  return null;
}
function deLabel(g, m){
  const [a, b] = g.split("/");
  if(a === "Grenzmark") return grenzmark(m, b === "Niederschlesien" ? silesia(m, "Niederschlesien") : b);
  if(a === "Brandenburg" && b) return m < mi("1938-10") ? "Brandenburg" : b;
  if(a === "Niederschlesien" || a === "Oberschlesien") return silesia(m, a);
  return a;
}

// 전간기 폴란드 주(województwo): 가까운 주도 + 이름으로 바로잡기
const woj36 = nearest({warszawskie: [21.01, 52.23], łódzkie: [19.46, 51.76], kieleckie: [20.63, 50.87], lubelskie: [22.57, 51.25], białostockie: [23.16, 53.13],
  poznańskie: [16.93, 52.41], pomorskie: [18.60, 53.01], krakowskie: [19.94, 50.06], lwowskie: [24.03, 49.84]});
const WOJ36 = {};
const wojFix = (w, names) => { for(const n of ref("POL2", names)) WOJ36[n] = w; };
wojFix("śląskie", ["Rybnik", "powiat rybnicki", "powiat cieszyński", "Jastrzębie-Zdrój", "powiat lubliniecki", "powiat bieruńsko-lędziński", "Chorzów", "Katowice",
  "Mysłowice", "powiat pszczyński", "Ruda Śląska", "Siemianowice Śląskie", "Świętochłowice", "Tarnowskie Góry County", "Wodzisław County", "Żory", "powiat mikołowski",
  "Bielsko County", "Bielsko-Biała", "Piekary Śląskie", "Tychy"]);
wojFix("kieleckie", ["powiat kłobucki", "powiat częstochowski", "Częstochowa", "Dąbrowa Górnicza", "powiat zawierciański", "powiat myszkowski", "Sosnowiec",
  "powiat będziński", "powiat olkuski", "powiat miechowski", "Radom", "powiat radomski", "powiat szydłowiecki", "powiat przysuski", "powiat zwoleński", "powiat lipski",
  "powiat opoczyński", "powiat radomszczański", "powiat włoszczowski", "powiat konecki"]);
wojFix("krakowskie", ["powiat żywiecki", "Jaworzno", "powiat chrzanowski", "powiat oświęcimski", "powiat wadowicki", "powiat suski", "powiat dębicki",
  "powiat ropczycko-sędziszowski", "powiat mielecki", "powiat dąbrowski", "Tarnów", "powiat tarnowski", "powiat gorlicki", "powiat nowosądecki", "Nowy Sącz", "powiat limanowski"]);
wojFix("lubelskie", ["Siedlce", "Siedlce County", "powiat łosicki", "powiat sokołowski", "powiat węgrowski", "powiat garwoliński", "powiat rycki", "powiat łukowski",
  "powiat bialski", "Biała Podlaska", "powiat radzyński", "powiat kraśnicki", "powiat janowski", "powiat biłgorajski"]);
wojFix("białostockie", ["powiat łomżyński", "Łomża", "powiat kolneński", "powiat grajewski", "powiat zambrowski", "powiat wysokomazowiecki", "powiat ostrołęcki",
  "Ostrołęka", "powiat augustowski", "Suwałki", "powiat suwalski", "powiat sejneński"]);
wojFix("pomorskie", ["powiat działdowski", "powiat nowomiejski", "powiat grudziądzki", "Grudziądz", "powiat chełmiński", "powiat świecki", "powiat brodnicki",
  "powiat toruński", "Toruń", "powiat golubsko-dobrzyński", "powiat wąbrzeski", "powiat tucholski", "powiat sępoleński", "Gdynia", "powiat pucki", "powiat wejherowski",
  "powiat kartuski", "powiat kościerski", "powiat chojnicki", "powiat starogardzki", "powiat tczewski"]);
wojFix("warszawskie", ["Kutno County", "powiat łowicki", "powiat skierniewicki", "Skierniewice", "Włocławek", "powiat włocławski",
  "powiat radziejowski", "powiat aleksandrowski", "Lipno County", "powiat rypiński"]);
wojFix("łódzkie", ["Kalisz", "powiat kaliski", "Konin", "powiat koniński", "powiat kolski", "powiat turecki", "powiat rawski"]);
// 1938년 4월 개편: 포모제가 비드고슈치·이노브로츠와프 쪽과 도브쥔 땅을, 포즈난이 칼리시·코닌 쪽을 넘겨받았다
const WOJ38 = {};
for(const n of ref("POL2", ["powiat bydgoski", "Bydgoszcz", "powiat inowrocławski", "powiat nakielski", "powiat żniński", "powiat mogileński", "powiat chodzieski",
  "Lipno County", "powiat rypiński"])) WOJ38[n] = "pomorskie";
for(const n of ref("POL2", ["Kalisz", "powiat kaliski", "Konin", "powiat koniński", "powiat kolski", "powiat turecki"])) WOJ38[n] = "poznańskie";
for(const n of ref("POL2", ["powiat ostrołęcki", "Ostrołęka", "powiat ostrowski"])) WOJ38[n] = "warszawskie";
function woj(u, m){
  if(u.name === "powiat ostrowski" && u.parent !== "Masovian") return woj36(u);   // 같은 이름이 비엘코폴스카에도 있다
  if(m >= mi("1938-04") && WOJ38[u.name]) return WOJ38[u.name];
  return WOJ36[u.name] || woj36(u);
}

// 1939–45년 독일 편입지·총독부 관구
const WW2 = nearest({
  "Danzig-Westpreußen": [18.65, 54.35], "Danzig-Westpreußen#2": [18.0, 53.12], "Danzig-Westpreußen#3": [18.60, 53.01],
  "Wartheland": [16.93, 52.41], "Wartheland#2": [18.26, 52.80], "Wartheland#3": [19.46, 51.76], "Wartheland#4": [18.09, 51.76],
  "Ostpreußen": [20.62, 52.88], "Ostpreußen#2": [22.93, 54.10], "Ostpreußen#3": [19.70, 52.55],
  "Oberschlesien": [19.02, 50.26], "Oberschlesien#2": [19.19, 50.28], "Oberschlesien#3": [19.04, 49.82],
  "Krakau": [19.94, 50.06], "Krakau#2": [20.99, 50.01], "Krakau#3": [22.0, 50.04], "Krakau#4": [20.69, 49.62],
  "Radom": [21.15, 51.40], "Radom#2": [20.63, 50.87], "Radom#3": [19.12, 50.81], "Radom#4": [19.70, 51.40],
  "Warschau": [21.01, 52.23], "Warschau#2": [22.27, 52.17], "Warschau#3": [20.15, 51.96],
  "Lublin": [22.57, 51.25], "Lublin#2": [23.25, 50.72], "Lublin#3": [23.13, 52.03],
  "Bialystok": [23.16, 53.13], "Bialystok#2": [22.06, 53.18], "Galizien": [24.03, 49.84],
});
const SOVIET_39 = set("POL2", ["powiat białostocki", "Białystok", "powiat bielski", "powiat hajnowski", "powiat siemiatycki", "powiat sokólski", "powiat moniecki",
  "powiat łomżyński", "Łomża", "powiat kolneński", "powiat grajewski", "powiat zambrowski", "powiat wysokomazowiecki", "powiat augustowski",
  "powiat lubaczowski", "powiat bieszczadzki", "powiat leski"]);
function ww2(u, m){
  let g = WW2(u).split("#")[0];
  if(g === "Bialystok" || g === "Galizien" || SOVIET_39.has(u.name)){
    if(m < mi("1941-07")) return SOVIET_39.has(u.name) ? null : g === "Bialystok" ? "Ostpreußen" : "Krakau";   // 1939–41년 소련 점령
    if(SOVIET_39.has(u.name) && u.parent === "Subcarpathian") g = "Galizien";
    else if(SOVIET_39.has(u.name)) g = "Bialystok";
  }
  if(g === "Oberschlesien" && m < mi("1941-01")) g = "Schlesien";
  return g;
}

const W46 = nearest({Białostockie: [23.16, 53.13], Gdańskie: [18.65, 54.35], Kieleckie: [20.63, 50.87], Krakowskie: [19.94, 50.06], Lubelskie: [22.57, 51.25],
  Łódzkie: [19.46, 51.76], Olsztyńskie: [20.48, 53.78], Pomorskie: [18.01, 53.12], Poznańskie: [16.93, 52.41], "Poznańskie#2": [15.51, 51.94], Rzeszowskie: [22.0, 50.04],
  Szczecińskie: [14.55, 53.43], "Szczecińskie#2": [16.17, 54.19], Śląskie: [19.02, 50.26], "Śląskie#2": [17.93, 50.67], Warszawskie: [21.01, 52.23], Wrocławskie: [17.04, 51.11]});
const W50 = nearest({Białostockie: [23.16, 53.13], Gdańskie: [18.65, 54.35], Kieleckie: [20.63, 50.87], Krakowskie: [19.94, 50.06], Lubelskie: [22.57, 51.25],
  Łódzkie: [19.46, 51.76], Olsztyńskie: [20.48, 53.78], Bydgoskie: [18.01, 53.12], Poznańskie: [16.93, 52.41], Rzeszowskie: [22.0, 50.04], Szczecińskie: [14.55, 53.43],
  Koszalińskie: [16.17, 54.19], Katowickie: [19.02, 50.26], Opolskie: [17.93, 50.67], Zielonogórskie: [15.51, 51.94], Warszawskie: [21.01, 52.23], Wrocławskie: [17.04, 51.11]});
const W75 = nearest({
  "Biała Podlaska": [23.13, 52.03], Białystok: [23.16, 53.13], "Bielsko-Biała": [19.04, 49.82], Bydgoszcz: [18.01, 53.12], Chełm: [23.47, 51.13], Ciechanów: [20.62, 52.88],
  Częstochowa: [19.12, 50.81], Elbląg: [19.40, 54.16], Gdańsk: [18.65, 54.35], "Gorzów": [15.23, 52.73], "Jelenia Góra": [15.73, 50.90], Kalisz: [18.09, 51.76],
  Katowice: [19.02, 50.26], Kielce: [20.63, 50.87], Konin: [18.25, 52.22], Koszalin: [16.17, 54.19], Kraków: [19.94, 50.06], Krosno: [21.77, 49.69], Legnica: [16.16, 51.21],
  Leszno: [16.57, 51.84], Lublin: [22.57, 51.25], Łomża: [22.06, 53.18], Łódź: [19.46, 51.76], "Nowy Sącz": [20.69, 49.62], Olsztyn: [20.48, 53.78], Opole: [17.93, 50.67],
  Ostrołęka: [21.57, 53.08], Piła: [16.74, 53.15], "Piotrków": [19.70, 51.40], Płock: [19.71, 52.55], Poznań: [16.93, 52.41], Przemyśl: [22.77, 49.78], Radom: [21.15, 51.40],
  Rzeszów: [22.0, 50.04], Siedlce: [22.27, 52.17], Sieradz: [18.73, 51.60], Skierniewice: [20.15, 51.96], Słupsk: [17.03, 54.46], Suwałki: [22.93, 54.10],
  Szczecin: [14.55, 53.43], Tarnobrzeg: [21.68, 50.57], Tarnów: [20.99, 50.01], Toruń: [18.60, 53.01], Wałbrzych: [16.28, 50.77], Warszawa: [21.01, 52.23],
  Włocławek: [19.07, 52.65], Wrocław: [17.04, 51.11], Zamość: [23.25, 50.72], "Zielona Góra": [15.51, 51.94]});

R.POL2 = (u, m) => {
  const g = plGerman(u);
  if(m < mi("1939-09")){
    if(g === "Danzig") return "DZG|Danzig";
    if(g) return "DE|" + deLabel(g, m);
    return "PL|" + woj(u, m);
  }
  if(m < mi("1945-05")){
    if(g && g !== "Danzig") return "DE|" + deLabel(g, m);
    const w = ww2(u, m);
    return w ? "DE|" + w : null;
  }
  if(m < mi("1950-07")) return "PL|" + W46(u).split("#")[0];
  if(m < mi("1975-06")) return "PL|" + W50(u);
  return "PL|" + W75(u);
};

// ======================= 중국 =======================
const C = (parent, names) => new Set(ref("CHN2", names).map(n => parent + ":" + n));
const uni = (...s) => new Set(s.flatMap(x => [...x]));
const IM = {
  hulunbuir: C("Inner Mongol", ["Geergunyouqi", "Geergunzuoqi", "Elunchunzizhiqi", "Yakesheishi", "Molidawadahanerzuzizhiqi", "Chenbaerhuqi", "Xinbaerhuyouqi",
    "Xinbaerhuzuoqi", "Arongqi", "Manzhoulishi", "Hailaershi", "Ewenkezuzizhiqi", "Zalantunshi"]),
  hinggan: C("Inner Mongol", ["Keerqinyouyiqianqi", "Zhafente", "Wulanhaoteshi", "Tuquanxian", "Keerqinyouyizhongqi"]),
  tongliao: C("Inner Mongol", ["Huolinguoleshi", "Zaluteqi", "Keerqinzuoyizhongqi", "Kailuxian", "Tongliaoshi", "Keerqinzuoyihouqi", "Naimanqi", "Kulunqi"]),
  chifengN: C("Inner Mongol", ["Alukeerqinqi", "Balinzuoqi", "Balinyouqi", "Linxixian", "Keshenketengqi", "Wengniuteqi"]),
  chifengS: C("Inner Mongol", ["Aohanqi", "Cifengshi", "Kelinqinqi", "Ningchengxian"]),
  xilingol: C("Inner Mongol", ["Dongwuzhumuqinqi", "Xiwuzhumuqinqi", "Abagaqi", "Shunitezuoqi", "Xilinhaoteshi", "Erlianhaoteshi", "Shuniteyouqi", "Zhenglanqi",
    "Zhengxiangbaiqi", "Xianghuangqi", "Duolunxian", "Taipusiqi"]),
  chaharLeague: C("Inner Mongol", ["Huadexian", "Shangduxian", "Chahaeryouyihouqi", "Chahaeryouyizhongqi", "Chahaeryouyiqianqi"]),
  alxa: C("Inner Mongol", ["Alashanyouqi", "Alashanzuoqi", "Ejinaqi"]),
};
const REHE_HEBEI = C("Hebei", ["Weichangxian", "Fengningmanzuzizhixian", "Longhuaxian", "Chengdexian", "Pingquanxian", "Luanpingxian", "Chengdeshi",
  "Kuanchengmanzuzizhixian", "Xinglongxian"]);
const REHE_LIAONING = C("Liaoning", ["Chaoyangxian", "Chaoyangshi", "Beipiaoshi", "Jianpingxian", "Lingyuanshi", "Kalaqinzuoqimengguzuzizhixian", "Jianchangshi"]);
const CHAHAR_HEBEI = uni(C("Hebei", ["Kangbaoxian", "Guyuanxian", "Zhangbeixian", "Shangyixian", "Chonglixian", "Cichengxian", "Wanquanxian", "Zhangjiakoushi",
  "Xuanhuaxian", "Huaianxian", "Huailaixian", "Zhuoluxian", "Yangyuanxian"]), C("Beijing", ["Yanqingxian"]));
const HEBEI_YUXIAN = "Hebei:Weixian";   // 웨이현(蔚縣, 차하르)은 같은 로마자 이름이 셋이라 좌표로 가린다
const DATONG = C("Shanxi", ["Tianzhenxian", "Yanggaoxian", "Datongshi", "Datongxian", "Zuoyunxian", "Guanglingxian", "Huairenxian", "Hunyuanxian", "Shanyinxian",
  "Yingxian", "Lingqiuxian", "Youyuxian", "Pingluqu", "Shouzhoushi"]);
const KWANTUNG = C("Liaoning", ["Dalianshi", "Xinjinxian", "Changhaixian"]);
const NINGXIA_SOUTH = C("Ningxia", ["Haiyuanxian", "Guyuanxian", "Pengyangxian", "Xijixian", "Longdexian", "Jingyuanxian"]);
const XIKANG_GARZE = C("Sichuan", ["Shiquxian", "Ganzhixian", "Shedaxian", "Degexian", "Luohuoxian", "Baiyuxian", "Xinlongxian", "Daofuxian", "Danbaxian", "Litangxian",
  "Batangxian", "Kangdingxian", "Yajiangxian", "Ludingxian", "Jiulongxian", "Xiangchengxian", "Daochengxian", "Derongxian"]);
const XIKANG_1939 = C("Sichuan", ["Baoxingxian", "Lushanxian", "Tianquanxian", "Mingshanxian", "Yaanshi", "Yongjingxian", "Hanyuanxian", "Shimianxian",
  "Mulicangzuzizhixian", "Mianningxian", "Yuexixian", "Xidexian", "Zhaojuexian", "Yanyuanxian", "Butuoxian", "Pugexian", "Dechangxian", "Yanbianxian", "Miyixian",
  "Ningnanxian", "Huilixian", "Huidongxian", "Panzhihuashi", "Xichangshi"]);
const CHAMDO = C("Xizang", ["Changduxian", "Jiangdaxian", "Gongjuexian", "Leiwuqixian", "Dingqingxian", "Chayaxian", "Bashuxian", "Zuogongxian", "Manggangxian",
  "Luolongxian", "Bianbaxian", "Tuobaxian", "Shengdaxian", "Yanjingxian", "Bituxian", "Chayuxian"]);
const QINZHOU = C("Guangxi", ["Pubeixian", "Lingshanxian", "Qinzhoushi", "Fangchenggangshi", "Hepuxian", "Beihaishi"]);
const MANCHU = new Set(["Liaoning", "Jilin", "Heilongjiang"]);

const MAN_CAPS = [
  ["1932-01", {Fengtian: [123.43, 41.80], Jilin: [126.55, 43.84], Longjiang: [123.95, 47.35], Rehe: [117.94, 40.95], Andong: [124.38, 40.13], Jinzhou: [121.12, 41.10],
    Binjiang: [126.63, 45.75], Jiandao: [129.51, 42.89], Sanjiang: [130.36, 46.80], Heihe: [127.50, 50.24], "Xing'an North": [119.74, 49.21],
    "Xing'an East": [122.74, 48.00], "Xing'an South": [122.07, 46.08], "Xing'an West": [118.9, 43.8]}],
  ["1937-07", {Mudanjiang: [129.60, 44.58], Tonghua: [125.94, 41.73]}],
  ["1939-06", {Beian: [126.50, 48.26], Dongan: [131.87, 45.55]}],
  ["1941-07", {Siping: [124.37, 43.17]}],
].map(([d], i, a) => [mi(d), nearest(Object.assign({}, ...a.slice(0, i + 1).map(x => x[1])))]);
const manProv = (u, m) => { let f; for(const [d, g] of MAN_CAPS) if(m >= d) f = g; return f(u); };
const ROC_NE = nearest({Liaoning: [123.43, 41.80], "Liaoning#2": [121.12, 41.10], Andong: [125.94, 41.73], "Andong#2": [124.38, 40.13], Liaobei: [123.5, 43.5],
  Jilin: [126.55, 43.84], Songjiang: [129.60, 44.58], Hejiang: [130.36, 46.80], Heilongjiang: [126.50, 48.26], Nenjiang: [123.95, 47.35], "Songjiang#2": [126.63, 45.75]});
const PRC_NE = nearest({Liaodong: [124.38, 40.13], "Liaodong#2": [125.94, 41.73], "Liaodong#3": [123.43, 41.80], Liaoxi: [121.12, 41.10], "Liaoxi#2": [121.67, 42.02],
  "Liaoxi#3": [123.84, 42.29], Jilin: [126.55, 43.84], "Jilin#2": [124.37, 43.17], "Jilin#3": [129.5, 42.9], Songjiang: [126.63, 45.75], "Songjiang#2": [129.6, 44.58],
  "Songjiang#3": [130.36, 46.8], Heilongjiang: [123.95, 47.35], "Heilongjiang#2": [126.5, 48.26], "Heilongjiang#3": [127.5, 50.24]});
const base = s => s.split("#")[0];
const inside = (s, u) => s.has(u.parent + ":" + u.name);
const isYuxian = u => u.parent + ":" + u.name === HEBEI_YUXIAN && u.lon < 115 && u.lat > 39.6;

R.CHN2 = (u, m) => {
  const Pn = u.parent, has = s => inside(s, u);
  if(Pn === "Paracel Islands") return null;
  const chahar = has(CHAHAR_HEBEI) || isYuxian(u);
  const reheCore = has(REHE_HEBEI) || has(REHE_LIAONING) || has(IM.chifengS);
  const imEast = has(IM.hulunbuir) || has(IM.hinggan) || has(IM.tongliao) || has(IM.chifengN);
  // 1936–45년: 만주국(+ 러허), 관동주, 티베트, 중화민국 성
  if(m < mi("1945-09")){
    if(has(KWANTUNG)) return "JP|Kwantung";
    if(MANCHU.has(Pn) || reheCore || imEast) return "MAN|" + manProv(u, m);
    if(Pn === "Xizang") return "TIB|Tibet";
    return "CN|" + roc(u, m, chahar);
  }
  // 1945–49년: 중화민국 동북 9성
  if(m < mi("1949-10")){
    if(Pn === "Xizang") return "TIB|Tibet";
    if(has(KWANTUNG)) return "CN|Lüda";
    if(reheCore) return "CN|Rehe";
    if(has(IM.hulunbuir)) return "CN|Xing'an";
    if(MANCHU.has(Pn) || imEast) return "CN|" + base(ROC_NE(u));
    return "CN|" + roc(u, m, chahar);
  }
  // 1949년~ 중화인민공화국
  const d = (a, b) => m >= mi(a) && m < mi(b);
  if(Pn === "Xizang"){
    if(m < mi("1950-10")) return "TIB|Tibet";
    return "CN|" + (has(CHAMDO) && m < mi("1965-09") ? "Chamdo" : "Tibet");
  }
  if(reheCore && m < mi("1955-07")) return "CN|Rehe";
  if(has(IM.hulunbuir)) return "CN|" + (d("1969-07", "1979-07") ? "Heilongjiang" : "Inner Mongolia");
  if(has(IM.hinggan) || has(IM.tongliao)) return "CN|" + (d("1969-07", "1979-07") ? "Jilin" : "Inner Mongolia");
  if(has(IM.chifengN) || has(IM.chifengS)) return "CN|" + (d("1969-07", "1979-07") ? "Liaoning" : "Inner Mongolia");
  if(has(IM.alxa)){
    if(m < mi("1954-09")) return "CN|Ningxia";
    if(m < mi("1956-04")) return "CN|Gansu";
    if(d("1969-07", "1979-07")) return "CN|" + (u.name === "Alashanzuoqi" ? "Ningxia" : "Gansu");
    return "CN|Inner Mongolia";
  }
  if(Pn === "Inner Mongol"){
    if(has(IM.xilingol) || has(IM.chaharLeague)) return "CN|Inner Mongolia";
    return "CN|" + (m < mi("1954-03") ? "Suiyuan" : "Inner Mongolia");
  }
  if(MANCHU.has(Pn)){
    if(has(KWANTUNG) && m < mi("1954-08")) return "CN|Lüda";
    if(m < mi("1954-08")) return "CN|" + base(PRC_NE(u));
    return "CN|" + Pn;
  }
  if((chahar || has(DATONG)) && m < mi("1952-11")) return "CN|Chahar";
  if(Pn === "Beijing") return "CN|" + (u.name === "Beijingshi" || m >= mi("1958-10") ? "Beijing" : "Hebei");
  if(Pn === "Tianjin"){
    if(u.name === "Tianjinshi") return "CN|" + (d("1958-02", "1967-01") ? "Hebei" : "Tianjin");
    return "CN|" + (m < mi("1973-07") ? "Hebei" : "Tianjin");
  }
  if(Pn === "Shanghai") return "CN|" + (u.name === "Shanghaishi" || m >= mi("1958-01") ? "Shanghai" : "Jiangsu");
  if(pingyuan(u) && m < mi("1952-11")) return "CN|Pingyuan";
  if((has(XIKANG_GARZE) || has(XIKANG_1939)) && m < mi("1955-10")) return "CN|Xikang";
  if(Pn === "Ningxia"){
    if(m >= mi("1958-10")) return "CN|Ningxia";
    return "CN|" + (m < mi("1954-09") && !has(NINGXIA_SOUTH) ? "Ningxia" : "Gansu");
  }
  if(has(QINZHOU) && (m < mi("1951-05") || d("1955-07", "1965-06"))) return "CN|Guangdong";
  if(Pn === "Hainan" && m < mi("1988-04")) return "CN|Guangdong";
  if(Pn === "Chongqing") return "CN|Sichuan";
  return "CN|" + (Pn === "Inner Mongol" ? "Inner Mongolia" : Pn);
};
ref("CHN2", ["Beijingshi", "Tianjinshi", "Shanghaishi", "Alashanzuoqi"]);

// 중화민국 시기(1936–49) 중국 본토 성
function roc(u, m, chahar){
  const Pn = u.parent, has = s => inside(s, u);
  if(chahar || has(IM.xilingol) || has(IM.chaharLeague)) return "Chahar";
  if(has(IM.alxa)) return "Ningxia";
  if(Pn === "Inner Mongol") return "Suiyuan";
  if(Pn === "Beijing" || Pn === "Tianjin") return "Hebei";
  if(Pn === "Shanghai") return u.name === "Shanghaishi" ? "Shanghai" : "Jiangsu";
  if(Pn === "Ningxia") return has(NINGXIA_SOUTH) ? "Gansu" : "Ningxia";
  if(has(XIKANG_GARZE) || (has(XIKANG_1939) && m >= mi("1939-01"))) return "Xikang";
  if(Pn === "Chongqing") return "Sichuan";
  if(has(QINZHOU) || Pn === "Hainan") return "Guangdong";
  return Pn;
}
// 핑위안성(1949–52): 황허 북쪽 허난 + 산둥 서부(랴오청·허쩌)
function pingyuan(u){
  if(u.parent === "Henan") return u.lat >= 34.95 && u.lon >= 112.6;
  if(u.parent === "Shandong") return u.lon <= 116.3 && u.lat >= 34.6 && u.lat <= 36.95;
  return false;
}
