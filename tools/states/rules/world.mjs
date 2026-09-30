// Natural Earth admin-1 단위 규칙 — 소련·유고·체코·한반도·인도권(realms.mjs)과 중국·독일·폴란드 세부(fine) 밖의 나라들.
// 여기 없는 나라는 선을 그리지 않는다(현대 구역이 1936–91년과 크게 달라서).
// 규칙: (u, m) => "구역"(당시 나라 = 현대 나라) | "당시나라|구역" | null
import { era, KEEP, splits, table, groups, ref, mi } from "./util.mjs";

export const R = {};
const always = f => (u, m) => f(u, m);
const bySplits = (cc, rows, extra = n => n) => { const s = splits(cc, rows); return (u, m) => s(extra(u.name), m); };

// ---------- 아메리카 ----------
R.USA = KEEP;
R.CAN = (u, m) => {
  if(u.name === "Newfoundland and Labrador" && m < mi("1949-04")) return "NFL|Newfoundland";   // 1949년 캐나다 편입 전엔 별개 자치령
  return u.name === "Nunavut" ? "Northwest Territories" : u.name;                              // 누나부트 1999년 분리
};
ref("CAN", ["Newfoundland and Labrador", "Nunavut", "Northwest Territories"]);
R.MEX = KEEP;
R.BRA = bySplits("BRA", [
  ["Tocantins", "Goiás", "1988-10"], ["Mato Grosso do Sul", "Mato Grosso", "1979-01"], ["Distrito Federal", "Goiás", "1960-04"],
  ["Amapá", "Pará", "1943-09"], ["Roraima", "Amazonas", "1943-09"], ["Rondônia", "Mato Grosso", "1943-09"],
]);
for(const cc of ["ARG", "BOL", "URY", "GTM", "HND", "SLV", "CRI", "JAM", "KNA", "ATG", "DMA", "LCA", "VCT", "GRD", "BRB"]) R[cc] = KEEP;
R.NIC = bySplits("NIC", [["Atlántico Norte", "Zelaya", "1987-09"], ["Atlántico Sur", "Zelaya", "1987-09"]]);
R.CHL = era([["1974-07", bySplits("CHL", [   // 1974년 지방(región) 체제. 그 전의 25개 주는 모양이 달라 숨긴다
  ["Arica y Parinacota", "Tarapacá", "2007-10"], ["Los Ríos", "Los Lagos", "2007-10"], ["Ñuble", "Bío-Bío", "2018-09"],
])]]);
R.PER = bySplits("PER", [
  ["Ucayali", "Loreto", "1980-06"], ["Pasco", "Junín", "1944-11"], ["Tumbes", "Piura", "1942-09"], ["Lima Province", "Lima", "2100-01"],
]);
R.COL = bySplits("COL", [
  ["Córdoba", "Bolívar", "1952-06"], ["Sucre", "Bolívar", "1966-08"], ["Cesar", "Magdalena", "1967-12"],
  ["Risaralda", "Caldas", "1967-02"], ["Quindío", "Caldas", "1966-07"], ["Casanare", "Boyacá", "1973-07"],
  ["Guaviare", "Vaupés", "1977-07"], ["Guainía", "Vaupés", "1963-07"], ["Bogota", "Cundinamarca", "1954-12"],
]);
R.VEN = bySplits("VEN", [["Vargas", "Distrito Capital", "2100-01"]]);
R.ECU = bySplits("ECU", [
  ["Santa Elena", "Guayas", "2007-11"], ["Santo Domingo de los Tsáchilas", "Pichincha", "2007-11"],
  ["Orellana", "Napo", "1998-07"], ["Sucumbios", "Napo", "1989-02"], ["Pastaza", "Napo", "1959-11"],
  ["Zamora Chinchipe", "Morona Santiago", "1953-11"],
]);
const cubOld = groups("CUB", {   // 1976년 전 6개 주
    "La Habana": ["Artemisa", "Mayabeque", "Ciudad de la Habana", "Isla de la Juventud"], "Pinar del Río": ["Pinar del Río"], "Matanzas": ["Matanzas"],
    "Las Villas": ["Villa Clara", "Cienfuegos", "Sancti Spíritus"], "Camagüey": ["Camagüey", "Ciego de Ávila"],
    "Oriente": ["Las Tunas", "Holguín", "Granma", "Santiago de Cuba", "Guantánamo"],
});
R.CUB = (u, m) => m < mi("1976-07") ? cubOld(u.name) : (["Artemisa", "Mayabeque"].includes(u.name) ? "La Habana" : u.name);

// ---------- 유럽 ----------
R.GBR = u => u.gu;                                                  // 잉글랜드·스코틀랜드·웨일스·북아일랜드만(현대 카운티·단일 자치체는 1970–90년대 개편)
R.IRL = always(u => ({"Dún Laoghaire–Rathdown": "Dublin", "Fingal": "Dublin", "South Dublin": "Dublin"})[u.name] || u.name);
ref("IRL", ["Dún Laoghaire–Rathdown", "Fingal", "South Dublin", "Dublin"]);
// splits()가 부모 이름도 원본에 있는지 확인하므로, 옛 이름(Seine 등)은 따로 처리한다
{
  const T = [["Paris","Hauts-de-Seine","Seine-Saint-Denis","Val-de-Marne"], ["Yvelines","Essonne","Val-d'Oise"]];
  ref("FRA", T.flat().concat(["Corse-du-Sud", "Haute-Corse"]));
  R.FRA = (u, m) => {
    if(m < mi("1968-01")){ if(T[0].includes(u.name)) return "Seine"; if(T[1].includes(u.name)) return "Seine-et-Oise"; }
    if(m < mi("1976-01") && (u.name === "Corse-du-Sud" || u.name === "Haute-Corse")) return "Corse";
    return u.name;
  };
}
for(const cc of ["ESP", "PRT", "NOR", "SWE", "LUX", "CYP"]) R[cc] = KEEP;
R.ITA = (u, m) => {                                                 // 현대 110개 현은 1936년(94개)과 달라 주(regione)로 묶는다
  const reg = u.region, n = u.name;
  if(reg === "Molise" && m < mi("1963-12")) return "Abruzzo";
  if(reg === "Valle d'Aosta" && m < mi("1945-09")) return "Piemonte";
  if(reg === "Friuli-Venezia Giulia" && m < mi("1963-01")) return (n === "Udine" || n === "Pordenone") ? "Veneto" : "Venezia Giulia";
  return reg;
};
ref("ITA", ["Udine", "Pordenone"]);
R.CHE = bySplits("CHE", [["Jura", "Bern", "1979-01"]]);
R.AUT = (u, m) => {
  if(m >= mi("1938-03") && m < mi("1945-05")) return "DE|" + ({                     // 합병 뒤 제국 대관구(Reichsgau)
    "Wien": "Wien", "Niederösterreich": "Niederdonau", "Burgenland": "Niederdonau", "Oberösterreich": "Oberdonau",
    "Salzburg": "Salzburg", "Steiermark": "Steiermark", "Kärnten": "Kärnten", "Tirol": "Tirol-Vorarlberg", "Vorarlberg": "Tirol-Vorarlberg",
  })[u.name];
  return u.name;
};
ref("AUT", ["Wien", "Niederösterreich", "Burgenland", "Oberösterreich", "Salzburg", "Steiermark", "Kärnten", "Tirol", "Vorarlberg"]);
// 독일 NE 단위: 독일 안쪽 선은 세부 원본이 맡고, 여기서는 합병기(1938–45) 오스트리아·주데텐과 맞닿는 선만
R.DEU = (u, m) => (m >= mi("1938-03") && m < mi("1945-05")) ? "DE|" + u.name : null;
R.BEL = always(u => ["Flemish Brabant", "Walloon Brabant", "Brussels"].includes(u.name) ? "Brabant" : u.name);   // 1995년 분할 전
ref("BEL", ["Flemish Brabant", "Walloon Brabant", "Brussels"]);
R.NLD = (u, m) => (["Bonaire", "St. Eustatius", "Saba"].includes(u.name) || (u.name === "Flevoland" && m < mi("1986-01"))) ? null : u.name;
ref("NLD", ["Bonaire", "St. Eustatius", "Saba", "Flevoland"]);
R.FIN = (u, m) => {                                                 // 현대 지역(maakunta)을 옛 주(lääni)로
  const g = {
    "Uusimaa": "Uusimaa", "Finland Proper": "Turku-Pori", "Satakunta": "Turku-Pori",
    "Tavastia Proper": "Häme", "Päijät-Häme": "Häme", "Pirkanmaa": "Häme",
    "Kymenlaakso": "Viipuri", "South Karelia": "Viipuri", "Southern Savonia": "Mikkeli",
    "Northern Savonia": "Kuopio", "North Karelia": m < mi("1960-01") ? "Kuopio" : "North Karelia",
    "Central Finland": m < mi("1960-01") ? "Vaasa" : "Central Finland",
    "Ostrobothnia": "Vaasa", "Southern Ostrobothnia": "Vaasa", "Central Ostrobothnia": "Vaasa",
    "Northern Ostrobothnia": "Oulu", "Kainuu": "Oulu", "Lapland": m < mi("1938-01") ? "Oulu" : "Lapland",
  };
  return g[u.name];
};
ref("FIN", ["Uusimaa","Finland Proper","Satakunta","Tavastia Proper","Päijät-Häme","Pirkanmaa","Kymenlaakso","South Karelia","Southern Savonia","Northern Savonia","North Karelia","Central Finland","Ostrobothnia","Southern Ostrobothnia","Central Ostrobothnia","Northern Ostrobothnia","Kainuu","Lapland"]);
{
  const city = {  // 시(市) 단위를 둘러싼 현으로
    "Sopron": "Gyor-Moson-Sopron", "Gyôr": "Gyor-Moson-Sopron", "Szeged": "Csongrád", "Hódmezôvásárhely": "Csongrád",
    "Salgótarján": "Nógrád", "Szolnok": "Jász-Nagykun-Szolnok", "Érd": "Pest", "Eger": "Heves", "Miskolc": "Borsod-Abaúj-Zemplén",
    "Dunaújváros": "Fejér", "Székesfehérvár": "Fejér", "Kecskemét": "Bács-Kiskun", "Tatabánya": "Komárom-Esztergom",
    "Szombathely": "Vas", "Zalaegerszeg": "Zala", "Nagykanizsa": "Zala", "Kaposvár": "Somogy", "Pécs": "Baranya",
    "Szekszárd": "Tolna", "Békéscsaba": "Békés", "Debrecen": "Hajdú-Bihar", "Nyíregyháza": "Szabolcs-Szatmár-Bereg",
  };
  const f = table("HUN", city);
  R.HUN = (u, m) => m < mi("1950-03") ? null : f(u.name);           // 1950년 주(megye) 개편 뒤
}
R.ROU = era([["1968-02", bySplits("ROU", [["Giurgiu", "Ilfov", "1981-01"], ["Calarasi", "Ialomita", "1981-01"]])]]);
R.BGR = (u, m) => (m >= mi("1959-03") && m < mi("1987-08")) ? u.name : null;   // 1959–87년 28개 주(okrug)가 지금의 28개 주와 거의 같다
R.GRC = (u, m) => m >= mi("1987-01") ? u.name : (u.name === "Ayion Oros" ? "Athos" : "Greece");   // 1987년 전엔 아토스 자치구만
ref("GRC", ["Ayion Oros"]);
R.TUR = (u, m) => {
  if(u.name === "Hatay" && m < mi("1939-07")) return null;          // 1939년까지 시리아(알렉산드레타)·하타이국
  return turSplit(u.name, m);
};
const turSplit = splits("TUR", [
  ["Adiyaman", "Malatya", "1954-06"], ["Nevsehir", "Nigde", "1954-06"], ["Sakarya", "Kocaeli", "1954-06"], ["Usak", "Kütahya", "1953-06"],
  ["Batman", "Siirt", "1990-05"], ["Sirnak", "Siirt", "1990-05"], ["Bayburt", "Gümüshane", "1989-06"], ["Karaman", "Konya", "1989-06"],
  ["Kinkkale", "Ankara", "1989-06"], ["Aksaray", "Nigde", "1989-06"], ["Ardahan", "Kars", "1992-05"], ["Iğdir", "Kars", "1992-05"],
  ["Bartın", "Zinguldak", "1991-08"], ["Karabük", "Zinguldak", "1995-06"], ["Kilis", "Gaziantep", "1995-06"], ["Osmaniye", "Adana", "1996-08"],
  ["Yalova", "Istanbul", "1995-06"], ["Düzce", "Bolu", "1999-12"],
]);
ref("TUR", ["Hatay"]);

// ---------- 아시아 ----------
R.JPN = KEEP;
R.TWN = (u, m) => m < mi("1950-10") ? null : ({"Hsinchu City": m < mi("1982-07") ? "Hsinchu" : "Hsinchu City", "Chiayi City": m < mi("1982-07") ? "Chiayi" : "Chiayi City"})[u.name] || u.name;
ref("TWN", ["Hsinchu City", "Hsinchu", "Chiayi City", "Chiayi"]);
R.MNG = (u, m) => m < mi("1942-01") ? null : ({"Darhan-Uul": "Selenge", "Orhon": "Bulgan", "Govĭ-Sümber": "Töv"})[u.name] || u.name;   // 1994년 새 아이막은 합친다
ref("MNG", ["Darhan-Uul", "Selenge", "Orhon", "Bulgan", "Govĭ-Sümber", "Töv"]);
R.LKA = u => u.region;                                              // 9개 주(province)는 19세기부터 그대로
R.NPL = (u, m) => m >= mi("1962-04") ? u.name : null;               // 14개 구역(zone) 1962년
R.MMR = (u, m) => m < mi("1948-01") ? null : (m < mi("1974-03") && u.name === "Mon") ? "Tanintharyi" : u.name;
ref("MMR", ["Mon", "Tanintharyi"]);
R.THA = bySplits("THA", [
  ["Yasothon", "Ubon Ratchathani", "1972-03"], ["Phayao", "Chiang Rai", "1977-08"], ["Mukdahan", "Nakhon Phanom", "1982-09"],
  ["Nong Bua Lam Phu", "Udon Thani", "1993-12"], ["Amnat Charoen", "Ubon Ratchathani", "1993-01"], ["Sa Kaeo", "Prachin Buri", "1993-12"],
  ["Bueng Kan", "Nong Khai", "2011-03"],
]);
R.MYS = bySplits("MYS", [["Kuala Lumpur", "Selangor", "1974-02"], ["Putrajaya", "Selangor", "2001-02"], ["Labuan", "Sabah", "1984-04"]]);
R.BRN = KEEP;
R.IDN = era([["1968-01", bySplits("IDN", [   // 1950–67년엔 주 분리가 잦아 숨기고, 1968년부터 1999년 뒤 분리만 되돌린다
  ["Banten", "Jawa Barat", "2100-01"], ["Bangka-Belitung", "Sumatera Selatan", "2100-01"], ["Gorontalo", "Sulawesi Utara", "2100-01"],
  ["Maluku Utara", "Maluku", "2100-01"], ["Papua Barat", "Papua", "2100-01"], ["Kepulauan Riau", "Riau", "2100-01"], ["Sulawesi Barat", "Sulawesi Selatan", "2100-01"],
])]]);
{ // 프랑스령 인도차이나: 통킹·안남·코친차이나·라오스·캄보디아
  const vn = {"Tây Bắc": "Tonkin", "Đông Bắc": "Tonkin", "Ðông B?c": "Tonkin", "Đồng Bằng Sông Hồng": "Tonkin",
              "Bắc Trung Bộ": "Annam", "Nam Trung Bộ": "Annam", "Tây Nguyên": "Annam", "Đông Nam Bộ": "Cochinchina", "đồng bằng sông Cửu Long": "Cochinchina"};
  const vnName = {"Quàng Nam": "Annam", "Hau Giang": "Cochinchina", "Can Tho": "Cochinchina", "Bình Thuận": "Annam", "Ninh Thuận": "Annam", "Ha Noi": "Tonkin"};
  ref("VNM", Object.keys(vnName));
  R.VNM = (u, m) => {
    if(m >= mi("1949-06")) return null;                             // 1949년 베트남국 성립(코친차이나 편입) 뒤엔 숨긴다
    const g = vnName[u.name] || vn[u.region];
    return g ? "FIC|" + g : null;
  };
  R.LAO = (u, m) => m < mi("1953-10") ? "FIC|Laos" : null;
  R.KHM = (u, m) => m < mi("1953-11") ? "FIC|Cambodia" : null;
}
R.IRQ = (u, m) => m >= mi("1976-01") ? u.name : null;              // 1976년 18개 주 체제
R.SYR = (u, m) => {                                                 // 1936년 말 알라위·드루즈국이 시리아에 합쳐지기 전
  if(m >= mi("1937-01") || u.name === "UNDOF") return null;
  return ({"Lattakia": "Alawite State", "Tartus": "Alawite State", "As Suwayda'": "Jabal Druze"})[u.name] || "State of Syria";
};
ref("SYR", ["UNDOF", "Lattakia", "Tartus", "As Suwayda'"]);
R.LBN = bySplits("LBN", [["An Nabatiyah", "South Lebanon", "1975-01"]]);
R.ISR = (u, m) => m >= mi("1953-01") ? u.name : null;
R.ARE = KEEP;

// ---------- 아프리카 ----------
{ // 나이지리아: 북·남부(–1939) → 3개(4개) 지방(–1967) → 12주 → 19주(1976) → 21주(1987) → 30주(1991)
  const reg = {
    North: ["Sokoto","Zamfara","Kebbi","Katsina","Kano","Jigawa","Kaduna","Bauchi","Gombe","Borno","Yobe","Adamawa","Taraba","Plateau","Nassarawa","Niger","Kwara","Kogi","Benue","Federal Capital Territory"],
    West: ["Oyo","Osun","Ogun","Ondo","Ekiti"], Lagos: ["Lagos"], MidWest: ["Edo","Delta"],
    East: ["Anambra","Enugu","Ebonyi","Imo","Abia","Rivers","Bayelsa","Cross River","Akwa Ibom"],
  };
  const s12 = {
    "North-Western": ["Sokoto","Zamfara","Kebbi","Niger"], "North-Central": ["Kaduna","Katsina"], "Kano": ["Kano","Jigawa"],
    "North-Eastern": ["Bauchi","Gombe","Borno","Yobe","Adamawa","Taraba"], "Benue-Plateau": ["Benue","Plateau","Nassarawa"],
    "Kwara": ["Kwara","Kogi"], "Western": ["Oyo","Osun","Ogun","Ondo","Ekiti"], "Lagos": ["Lagos"], "Mid-Western": ["Edo","Delta"],
    "East-Central": ["Anambra","Enugu","Ebonyi","Imo","Abia"], "Rivers": ["Rivers","Bayelsa"], "South-Eastern": ["Cross River","Akwa Ibom"],
    "Federal Capital Territory": ["Federal Capital Territory"],
  };
  const s19 = {
    "Sokoto": ["Sokoto","Zamfara","Kebbi"], "Niger": ["Niger"], "Kaduna": ["Kaduna","Katsina"], "Kano": ["Kano","Jigawa"],
    "Bauchi": ["Bauchi","Gombe"], "Borno": ["Borno","Yobe"], "Gongola": ["Adamawa","Taraba"], "Plateau": ["Plateau","Nassarawa"],
    "Benue": ["Benue"], "Kwara": ["Kwara","Kogi"], "Oyo": ["Oyo","Osun"], "Ogun": ["Ogun"], "Ondo": ["Ondo","Ekiti"], "Lagos": ["Lagos"],
    "Bendel": ["Edo","Delta"], "Anambra": ["Anambra","Enugu","Ebonyi"], "Imo": ["Imo","Abia"], "Rivers": ["Rivers","Bayelsa"],
    "Cross River": ["Cross River","Akwa Ibom"], "Federal Capital Territory": ["Federal Capital Territory"],
  };
  const gR = groups("NGA", reg), g12 = groups("NGA", s12), g19 = groups("NGA", s19);
  R.NGA = (u, m) => {
    const n = u.name;
    if(m < mi("1939-04")) return gR(n) === "North" ? "Northern Provinces" : "Southern Provinces";
    if(m < mi("1967-05")){ const r = gR(n); return r === "MidWest" && m < mi("1963-08") ? "West" : r; }
    if(n === "Federal Capital Territory" && m < mi("1976-02")) return m < mi("1967-05") ? "North" : "North-Western";
    if(m < mi("1976-02")) return g12(n);
    const r = g19(n);
    if(m < mi("1987-09")) return r;
    if(n === "Katsina" || n === "Akwa Ibom") return n;              // 1987년 21주
    if(m < mi("1991-08")) return r;
    // 1991년 30주: 1996년에 생긴 주(Bayelsa, Ebonyi, Ekiti, Gombe, Nassarawa, Zamfara)만 부모로
    return ({"Bayelsa": "Rivers", "Ebonyi": "Enugu", "Ekiti": "Ondo", "Gombe": "Bauchi", "Nassarawa": "Plateau", "Zamfara": "Sokoto"})[n] || n;
  };
}
{
  const g = groups("ZAF", {Cape: ["Western Cape","Northern Cape","Eastern Cape"], Natal: ["KwaZulu-Natal"], "Orange Free State": ["Free State"],
                           Transvaal: ["Gauteng","Mpumalanga","Limpopo","North West"]});
  R.ZAF = u => g(u.name);                                           // 1994년 전 4개 주
}
{
  const g6 = groups("COD", {Léopoldville: ["Kinshasa City","Bas-Congo","Bandundu"], Équateur: ["Équateur"], Orientale: ["Orientale"],
                            Kivu: ["Nord-Kivu","Sud-Kivu","Maniema"], Katanga: ["Katanga"], Kasai: ["Kasaï-Occidental","Kasaï-Oriental"]});
  R.COD = (u, m) => {
    if(m < mi("1966-04")) return g6(u.name);                        // 벨기에령 콩고 6개 주(1933–)
    if(m < mi("1988-10") && ["Nord-Kivu","Sud-Kivu","Maniema"].includes(u.name)) return "Kivu";
    return u.name;
  };
}
{
  const g = groups("MDG", {
    Antananarivo: ["Analamanga","Vakinankaratra","Itasy","Bongolava"], Fianarantsoa: ["Haute Matsiatra","Amoron'i Mania","Vatovavy-Fitovinany","Ihorombe","Atsimo-Atsinanana"],
    Toamasina: ["Atsinanana","Analanjirofo","Alaotra-Mangoro"], Mahajanga: ["Boeny","Sofia","Betsiboka","Melaky"],
    Toliara: ["Atsimo-Andrefana","Androy","Anosy","Menabe"], Antsiranana: ["Diana","Sava"],
  });
  R.MDG = (u, m) => m >= mi("1946-10") ? g(u.name) : null;          // 6개 주(faritany)
}
R.GHA = (u, m) => {
  const n = u.name;
  if(m < mi("1957-03")){
    if(n === "Volta") return m < mi("1956-12") ? null : "Togoland";   // 영국령 토고랜드는 1956년 합병
    return ({"Western": "Gold Coast Colony", "Central": "Gold Coast Colony", "Greater Accra": "Gold Coast Colony", "Eastern": "Gold Coast Colony",
             "Ashanti": "Ashanti", "Brong Ahafo": "Ashanti", "Northern": "Northern Territories", "Upper East": "Northern Territories", "Upper West": "Northern Territories"})[n];
  }
  if(n === "Brong Ahafo" && m < mi("1959-04")) return "Ashanti";
  if((n === "Upper East" || n === "Upper West") && m < mi("1983-07")) return m < mi("1960-07") ? "Northern" : "Upper";
  if(n === "Central" && m < mi("1970-07")) return "Western";
  if(n === "Greater Accra" && m < mi("1982-01")) return "Eastern";
  return n;
};
ref("GHA", ["Western","Central","Greater Accra","Eastern","Ashanti","Brong Ahafo","Northern","Upper East","Upper West","Volta"]);
R.CMR = (u, m) => (m >= mi("1961-10") && m < mi("1972-06")) ? (["Nord-Ouest", "Sud-Ouest"].includes(u.name) ? "West Cameroon" : "East Cameroon") : null;
ref("CMR", ["Nord-Ouest", "Sud-Ouest"]);
R.UGA = u => u.region;                                              // 부간다·동부·북부·서부 4개 주(식민지 시기부터)
R.SDN = (u, m) => m < mi("1974-01") ? "SD|" + u.region : null;       // 앵글로-이집트 수단 9개 주
R.SDS = R.SDN;
R.KEN = (u, m) => m >= mi("1963-06") ? u.name : null;
{ // 에티오피아·에리트레아·소말리아
  R.ERI = (u, m) => {
    if(m >= mi("1936-06") && m < mi("1941-11")) return "IEA|Eritrea";
    if(m >= mi("1952-09") && m < mi("1991-05")) return "ETH|Eritrea";
    return null;
  };
  R.ETH = (u, m) => {
    if(m >= mi("1936-06") && m < mi("1941-11")) return "IEA|" + (u.name === "Tigray" ? "Eritrea" : u.name === "Somali" ? "Somalia" : "Ethiopia");
    if(m >= mi("1952-09") && m < mi("1991-05")) return "ETH|Ethiopia";
    return null;
  };
  R.SOM = (u, m) => (m >= mi("1936-06") && m < mi("1941-03")) ? "IEA|Somalia" : null;
  ref("ETH", ["Tigray", "Somali"]);
}

// ---------- 오세아니아 ----------
R.AUS = KEEP;
