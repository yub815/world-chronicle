// 여러 현대 나라에 걸친 옛 나라: 소련, 유고슬라비아, 체코슬로바키아, 한반도, 영국령 인도(인도·파키스탄·방글라데시).
// 라벨의 앞부분(당시 나라)이 같아야 선을 그리므로, 오늘날 국경이 당시엔 나라 안 경계였던 곳이 여기서 살아난다.
import { splits, groups, ref, mi } from "./util.mjs";

export const R = {};

// ================= 소련 =================
// 가장 작은 단위(주·자치공화국)로 묶으면 공화국 경계는 저절로 그려진다.
// 현대 주가 나중에 쪼개져 생긴 경우 그 전에는 부모 주로 합친다(1936–57년 개편 대부분이 분리였다).
const SU_END = mi("1991-12"), BALT_END = mi("1991-09");
const rus = splits("RUS", [
  ["Murmansk", "Leningrad", "1938-05"], ["Novgorod", "Leningrad", "1944-07"], ["Pskov", "Leningrad", "1944-08"],
  ["Vologda", "Arkhangel'sk", "1937-09"],                                         // 북부 지방(Northern Krai)
  ["Tula", "Moskovskaya", "1937-09"], ["Ryazan'", "Moskovskaya", "1937-09"], ["Kaluga", "Tula", "1944-07"],
  ["Yaroslavl'", "Ivanovo", "1936-03"], ["Vladimir", "Ivanovo", "1944-08"], ["Kostroma", "Yaroslavl'", "1944-08"],
  ["Bryansk", "Orel", "1944-07"], ["Orel", "Kursk", "1937-09"], ["Belgorod", "Kursk", "1954-01"],
  ["Lipetsk", "Voronezh", "1954-01"], ["Tambov", "Voronezh", "1937-09"],
  ["Ul'yanovsk", "Samara", "1943-01"], ["Penza", "Samara", "1939-02"], ["Astrakhan'", "Volgograd", "1943-12"],
  ["Perm'", "Sverdlovsk", "1938-10"], ["Kurgan", "Chelyabinsk", "1943-02"], ["Tyumen'", "Omsk", "1944-08"],
  ["Krasnodar", "Rostov", "1937-09"],                                             // 아조프-흑해 지방
  ["Tomsk", "Novosibirsk", "1944-08"], ["Kemerovo", "Novosibirsk", "1943-01"], ["Altay", "Novosibirsk", "1937-09"],   // 서시베리아 지방
  ["Chita", "Irkutsk", "1937-09"],                                                // 동시베리아 주
  ["Primor'ye", "Khabarovsk", "1938-10"], ["Amur", "Khabarovsk", "1948-08"], ["Maga Buryatdan", "Khabarovsk", "1953-12"],
  ["Kamchatka", "Khabarovsk", "1956-01"], ["Sakhalin", "Khabarovsk", "1947-01"],  // 극동 지방
]);
ref("RUS", ["Kaliningrad", "Tuva", "Crimea", "Sevastopol", "Chechnya", "Ingush", "Kalmyk"]);
R.RUS = (u, m) => {
  const n = u.name;
  if(!n) return null;
  if(n === "Kaliningrad") return m < mi("1945-04") ? "DE|Ostpreußen" : (m < SU_END ? "SU|" : "RUS|") + n;
  if(n === "Tuva" && m < mi("1944-10")) return "TUV|Tuva";                          // 투바 인민공화국
  if(n === "Crimea" || n === "Sevastopol") return (m < SU_END ? "SU" : "UKR") + "|Crimea";
  let g = (n === "Chechnya" || n === "Ingush") ? "Chechen-Ingush" : rus(n, m);
  if(n === "Kalmyk" && m >= mi("1943-12") && m < mi("1957-01")) g = "Astrakhan'";   // 칼미크 자치공화국 폐지기
  return (m < SU_END ? "SU|" : "RUS|") + g;
};

const ukr = splits("UKR", [
  ["Zhytomyr", "Kiev", "1937-09"], ["Khmel'nyts'kyy", "Vinnytsya", "1937-09"], ["Mykolayiv", "Odessa", "1937-09"], ["Poltava", "Kharkiv", "1937-09"],
  ["Luhans'k", "Donets'k", "1938-06"], ["Sumy", "Kharkiv", "1939-01"], ["Zaporizhzhya", "Dnipropetrovs'k", "1939-01"],
  ["Kirovohrad", "Mykolayiv", "1939-01"], ["Kherson", "Mykolayiv", "1944-03"], ["Cherkasy", "Kiev", "1954-01"],
]);
const UKR_PL = {"L'viv": "Lwów", "Ivano-Frankivs'k": "Stanisławów", "Ternopil'": "Tarnopol", "Volyn": "Wołyń", "Rivne": "Wołyń"};
ref("UKR", Object.keys(UKR_PL).concat(["Transcarpathia", "Chernivtsi"]));
R.UKR = (u, m) => {
  const n = u.name;
  if(UKR_PL[n]){ if(m < mi("1939-09")) return "PL|" + UKR_PL[n]; if(m < mi("1939-11")) return null; }
  if(n === "Transcarpathia"){ if(m < mi("1939-03")) return "CS|Podkarpatská Rus"; if(m < mi("1945-06")) return null; }
  if(n === "Chernivtsi" && m < mi("1940-07")) return null;              // 루마니아령 북부코비나
  return (m < SU_END ? "SU|" : "UKR|") + ukr(n, m);
};

ref("BLR", ["Brest", "Grodno"]);
R.BLR = (u, m) => {
  const n = u.name;
  if(n === "Brest" || n === "Grodno"){ if(m < mi("1939-09")) return "PL|" + (n === "Brest" ? "Polesie" : "Nowogródek"); if(m < mi("1939-11")) return null; }
  if(m >= SU_END) return "BLR|" + n;
  return "SU|" + (m < mi("1938-01") ? "Byelorussian SSR" : n);        // 1938년 전엔 주가 없었다
};

const kaz = splits("KAZ", [
  ["Atyrau", "West Kazakhstan", "1938-01"], ["Mangghystau", "Atyrau", "1973-03"], ["Pavlodar", "East Kazakhstan", "1938-10"],
  ["Aqmola", "Qaraghandy", "1939-03"], ["Qyzylorda", "South Kazakhstan", "1938-01"], ["Zhambyl", "South Kazakhstan", "1939-10"],
  ["Qostanay", "Aqtöbe", "1936-07"], ["North Kazakhstan", "Qaraghandy", "1936-07"],
  ["Almaty City", "Almaty", "2100-01"], ["Astana", "Aqmola", "2100-01"],
]);
R.KAZ = (u, m) => (m < SU_END ? "SU|" : "KAZ|") + kaz(u.name, m);

ref("UZB", ["Karakalpakstan", "Namangan", "Ferghana"]);
const uzb = splits("UZB", [
  ["Andijon", "Ferghana", "1941-03"], ["Surkhandarya", "Bukhoro", "1941-03"], ["Kashkadarya", "Bukhoro", "1943-01"],
  ["Sirdaryo", "Tashkent", "1963-01"], ["Jizzakh", "Samarkand", "1973-12"], ["Navoi", "Bukhoro", "1982-04"],
]);
R.UZB = (u, m) => {
  const n = u.name, p = m < SU_END ? "SU|" : "UZB|";
  if(n === "Karakalpakstan") return p + "Karakalpakstan";
  if(m < mi("1938-01")) return p + "Uzbek SSR";                        // 1938년 전엔 주가 없었다
  if(n === "Namangan" && (m < mi("1941-03") || (m >= mi("1960-01") && m < mi("1967-12")))) return p + "Ferghana";
  return p + uzb(n, m);
};
R.TKM = (u, m) => m < SU_END ? "SU|Turkmen SSR" : null;
R.KGZ = (u, m) => m < SU_END ? "SU|Kirghiz SSR" : null;
ref("TJK", ["Gorno-Badakhshan", "Leninabad"]);
R.TJK = (u, m) => {
  if(m >= SU_END) return null;
  if(u.name === "Gorno-Badakhshan") return "SU|Gorno-Badakhshan";
  if(u.name === "Leninabad" && ((m >= mi("1939-10") && m < mi("1962-04")) || m >= mi("1970-01"))) return "SU|Leninabad";
  return "SU|Tajik SSR";
};
ref("GEO", ["Abkhazia", "Ajaria"]);
R.GEO = (u, m) => m < SU_END ? "SU|" + (u.name === "Abkhazia" || u.name === "Ajaria" ? u.name : "Georgian SSR") : null;
R.ARM = (u, m) => m < SU_END ? "SU|Armenian SSR" : null;
const NKAO = ref("AZE", ["Şuşa", "Xocalı", "Xocavənd", "Stepanakert"]);
R.AZE = (u, m) => {
  if(m >= SU_END) return null;
  if(u.region === "Naxçıvan Autonomous Republic") return "SU|Nakhchivan";
  if(NKAO.includes(u.name) && m < mi("1991-11")) return "SU|Nagorno-Karabakh";
  return "SU|Azerbaijan SSR";
};
// 몰도바: 드네스트르 동쪽(몰다비아 자치공화국, 우크라이나 소속)만 1940년 전에도 소련
const LEFT_BANK = ref("MDA", ["Camenca", "Stîngă Nistrului", "Grigoriopol", "Transnistria"]);
R.MDA = (u, m) => {
  if(m >= SU_END) return null;
  if(m >= mi("1940-08")) return "SU|Moldavian SSR";
  const left = LEFT_BANK.includes(u.name) || (u.name === "Rezina" && u.lon > 29);
  return left && m >= 0 ? "SU|Moldavian ASSR" : null;
};
// 발트 3국: 독립기 내부 선은 숨기되 라트비아 4개 지방과 리투아니아의 빌뉴스·클라이페다는 살린다
R.EST = (u, m) => (m >= mi("1940-08") && m < BALT_END) ? "SU|Estonian SSR" : null;
R.LVA = (u, m) => {
  if(m >= mi("1940-08")) return m < BALT_END ? "SU|Latvian SSR" : null;
  return "LAT|" + ({Riga: "Vidzeme", Vidzeme: "Vidzeme", Kurzeme: "Kurzeme", Zemgale: "Zemgale", Latgale: "Latgale"})[u.region];
};
ref("LTU", ["Vilniaus", "Klaipedos"]);
R.LTU = (u, m) => {
  const n = u.name;
  if(m >= mi("1940-08")) return m < BALT_END ? "SU|Lithuanian SSR" : null;
  if(n === "Vilniaus" && m < mi("1939-10")) return "PL|Wilno";
  if(n === "Klaipedos") return m < mi("1939-03") ? "LIT|Klaipėda" : "DE|Ostpreußen";
  return "LIT|Lithuania";
};
// 폴란드 NE 단위: 1939년 전 동쪽 국경(지금의 우크라이나·벨라루스·리투아니아 쪽)과 맞닿는 선만. 폴란드 안쪽은 세부 원본이 맡는다
ref("POL", ["Lublin", "Podlachian", "Subcarpathian", "Warmian-Masurian"]);
R.POL = (u, m) => {
  if(m >= mi("1939-09")) return null;
  return ({"Lublin": "PL|Lublin", "Podlachian": "PL|Białystok", "Subcarpathian": "PL|Lwów", "Warmian-Masurian": "DE|Ostpreußen"})[u.name] || null;
};

// ================= 유고슬라비아 =================
// 1929–41년 바노비나는 현대 단위와 맞지 않아 숨기고, 1945년 연방 공화국·자치주 경계부터 그린다
const VOJ = ref("SRB", ["Severno-Backi", "Zapadno-Backi", "Severno-Banatski", "Sremski", "Južno-Backi", "Srednje-Banatski", "Južno-Banatski"]);
const YU0 = mi("1945-05");
const yug = (g, end) => (u, m) => (m >= YU0 && m < end) ? "YU|" + (typeof g === "function" ? g(u) : g) : null;
const ITALIAN_SVN = ["Obalno-kraška", "Goriška", "Notranjsko-kraška"];      // 1943년까지 이탈리아 베네치아줄리아
R.SVN = (u, m) => (ITALIAN_SVN.includes(u.region) && m < mi("1943-09")) ? "ITA|Venezia Giulia" : yug("Slovenia", mi("1991-06"))(u, m);
ref("HRV", ["Istarska"]);
R.HRV = (u, m) => (u.name === "Istarska" && m < mi("1943-09")) ? "ITA|Venezia Giulia" : yug("Croatia", mi("1991-06"))(u, m);
R.BIH = yug("Bosnia and Herzegovina", mi("1992-03"));
R.MNE = yug("Montenegro", 1e9);
R.MKD = yug("Macedonia", mi("1991-09"));
R.KOS = yug("Kosovo", 1e9);
R.SRB = yug(u => VOJ.includes(u.name) ? "Vojvodina" : "Serbia", 1e9);

// ================= 체코슬로바키아 =================
const BOH = ref("CZE", ["Ústecký", "Liberecký", "Karlovarský", "Plzeňský", "Jihočeský", "Královéhradecký", "Pardubický", "Středočeský", "Prague"]);
const SUDETEN = ["Karlovarský", "Ústecký", "Liberecký"];
const kraj60 = groups("CZE", {"West Bohemian": ["Karlovarský", "Plzeňský"], "North Bohemian": ["Ústecký", "Liberecký"], "East Bohemian": ["Královéhradecký", "Pardubický"],
  "South Bohemian": ["Jihočeský"], "Central Bohemian": ["Středočeský"], "Prague": ["Prague"], "South Moravian": ["Jihomoravský", "Zlínský", "Vysočina"],
  "North Moravian": ["Olomoucký", "Moravskoslezský"]});
const kraj60s = groups("SVK", {"West Slovak": ["Bratislavský", "Trnavský", "Nitriansky", "Trenciansky"], "Central Slovak": ["Žilinský", "Banskobystrický"], "East Slovak": ["Košický", "Prešov"]});
R.CZE = (u, m) => {
  const n = u.name, land = BOH.includes(n) ? "Bohemia" : "Moravia-Silesia";
  if(m >= mi("1938-10") && m < mi("1945-05") && SUDETEN.includes(n)) return "DE|Sudetenland";
  if(m >= mi("1939-03") && m < mi("1945-05")) return "PRO|" + land;      // 보헤미아-모라바 보호령
  if(m < mi("1949-01")) return "CS|" + land;
  if(m < mi("1960-07")) return "CS|Czech Lands";
  return m < mi("1993-01") ? "CS|" + kraj60(n) : null;
};
R.SVK = (u, m) => {
  if(m >= mi("1939-03") && m < mi("1945-05")) return null;              // 슬로바키아국
  if(m < mi("1960-07")) return "CS|Slovakia";
  if(u.name === "Bratislavský" && m >= mi("1971-01")) return "CS|Bratislava";
  return "CS|" + kraj60s(u.name);
};

// ================= 한반도 =================
// 1936–45년 13도. 해방 뒤엔 남북 각각 도 분리·광역시 승격 전으로 되돌린다
const kr13 = groups("KOR", {
  Gyeonggi: ["Gyeonggi", "Incheon", "Seoul"], Gangwon: ["Gangwon"], Chungbuk: ["North Chungcheong"], Chungnam: ["South Chungcheong", "Daejeon", "Sejong"],
  Jeonbuk: ["North Jeolla"], Jeonnam: ["South Jeolla", "Gwangju", "Jeju"], Gyeongbuk: ["North Gyeongsang", "Daegu"], Gyeongnam: ["South Gyeongsang", "Busan", "Ulsan"],
});
const kp13 = groups("PRK", {
  Gangwon: ["Kangwŏn-do"], Hwanghae: ["Hwanghae-bukto", "Hwanghae-namdo"], Pyeongbuk: ["P'yŏngan-bukto", "Chagang-do"],
  Pyeongnam: ["P'yŏngan-namdo", "P'yŏngyang"], Hamnam: ["Hamgyŏng-namdo", "Ryanggang"], Hambuk: ["Hamgyŏng-bukto", "Rasŏn"],
});
const krS = splits("KOR", [
  ["Seoul", "Gyeonggi", "1946-08"], ["Jeju", "South Jeolla", "1946-08"], ["Busan", "South Gyeongsang", "1963-01"], ["Incheon", "Gyeonggi", "1981-07"],
  ["Daegu", "North Gyeongsang", "1981-07"], ["Gwangju", "South Jeolla", "1986-11"], ["Daejeon", "South Chungcheong", "1989-01"],
  ["Ulsan", "South Gyeongsang", "1997-07"], ["Sejong", "South Chungcheong", "2012-07"],
]);
const kpS = splits("PRK", [
  ["P'yŏngyang", "P'yŏngan-namdo", "1946-09"], ["Chagang-do", "P'yŏngan-bukto", "1949-01"], ["Ryanggang", "Hamgyŏng-namdo", "1954-10"],
  ["Hwanghae-bukto", "Hwanghae", "1954-10"], ["Hwanghae-namdo", "Hwanghae", "1954-10"], ["Rasŏn", "Hamgyŏng-bukto", "1993-09"],
]);
const LIB = mi("1945-08");
R.KOR = (u, m) => m < LIB ? "CHO|" + kr13(u.name) : "KRS|" + krS(u.name, m);
R.PRK = (u, m) => m < LIB ? "CHO|" + kp13(u.name) : "KRN|" + kpS(u.name, m);

// ================= 영국령 인도 → 인도·파키스탄·방글라데시 =================
// 1956년 주 재편 전은 번왕국이 많아 현대 주로 나타낼 수 없는 곳(남부·중부·서부)은 숨기고, 북부·동부의 주 경계만 살린다
const BI_END = mi("1947-08"), IN56 = mi("1956-11");
const biInd = groups("IND", {
  Punjab: ["Punjab", "Haryana", "Chandigarh", "Himachal Pradesh"], Delhi: ["Delhi"], Kashmir: ["Jammu and Kashmir", "Ladakh"],
  Bengal: ["West Bengal"], Assam: ["Assam", "Meghalaya", "Nagaland", "Mizoram", "Arunachal Pradesh"], Manipur: ["Manipur"], Tripura: ["Tripura"],
  Bihar: ["Bihar", "Jharkhand"], Orissa: ["Odisha"], "United Provinces": ["Uttar Pradesh", "Uttarakhand"], Rajputana: ["Rajasthan"],
}, () => null);
const in47 = groups("IND", {
  Punjab: ["Punjab", "Haryana", "Chandigarh"], "Himachal Pradesh": ["Himachal Pradesh"], Delhi: ["Delhi"], "Jammu and Kashmir": ["Jammu and Kashmir", "Ladakh"],
  "West Bengal": ["West Bengal"], Assam: ["Assam", "Meghalaya", "Nagaland", "Mizoram", "Arunachal Pradesh"], Manipur: ["Manipur"], Tripura: ["Tripura"],
  Bihar: ["Bihar", "Jharkhand"], Orissa: ["Odisha"], "Uttar Pradesh": ["Uttar Pradesh", "Uttarakhand"], Rajasthan: ["Rajasthan"],
}, () => null);
const inS = splits("IND", [
  ["Gujarat", "Bombay", "1960-05"], ["Maharashtra", "Bombay", "1960-05"], ["Haryana", "Punjab", "1966-11"], ["Chandigarh", "Punjab", "1966-11"],
  ["Nagaland", "Assam", "1963-12"], ["Meghalaya", "Assam", "1972-01"], ["Mizoram", "Assam", "1972-01"], ["Arunachal Pradesh", "Assam", "1972-01"],
  ["Chhattisgarh", "Madhya Pradesh", "2000-11"], ["Jharkhand", "Bihar", "2000-11"], ["Uttarakhand", "Uttar Pradesh", "2000-11"],
  ["Telangana", "Andhra Pradesh", "2014-06"], ["Ladakh", "Jammu and Kashmir", "2019-10"],
]);
ref("IND", ["Odisha", "Goa", "Dadra and Nagar Haveli and Daman and Diu", "Puducherry", "Sikkim"]);
R.IND = (u, m) => {
  const n = u.name;
  if(m < BI_END){
    if(n === "Odisha" && m < mi("1936-04")) return "BI|Bihar";          // 비하르-오리사 주 분리 전
    if(n === "Sikkim") return null;
    const g = biInd(n); return g ? "BI|" + g : null;
  }
  if(["Goa", "Dadra and Nagar Haveli and Daman and Diu"].includes(n) && m < mi("1961-12")) return null;   // 포르투갈령
  if(n === "Puducherry" && m < mi("1954-11")) return null;              // 프랑스령
  if(n === "Sikkim" && m < mi("1975-05")) return null;                  // 보호국
  if(m < IN56){ const g = in47(n); return g ? "IND|" + g : null; }
  return "IND|" + inS(n, m);
};
const pk = groups("PAK", {Punjab: ["Punjab", "F.C.T."], Sind: ["Sind"], NWFP: ["K.P."], "Tribal Areas": ["F.A.T.A."], Baluchistan: ["Baluchistan"],
  Kashmir: ["Azad Kashmir", "Northern Areas"]});
R.PAK = (u, m) => {
  const n = u.name;
  if(m < BI_END){
    if(n === "Sind" && m < mi("1936-04")) return null;                  // 봄베이 관구 소속(봄베이 쪽은 숨김)
    return "BI|" + pk(n);
  }
  if(n === "Azad Kashmir" || n === "Northern Areas") return "PAK|" + n;
  if(m >= mi("1955-10") && m < mi("1970-07")) return "PAK|West Pakistan";   // 서파키스탄 단일 주
  if(n === "F.C.T." && m < mi("1967-01")) return "PAK|Punjab";
  return "PAK|" + (n === "F.A.T.A." ? "Tribal Areas" : n);
};
ref("BGD", ["Sylhet"]);
R.BGD = (u, m) => {
  if(m < BI_END) return "BI|" + (u.name === "Sylhet" ? "Assam" : "Bengal");
  return m < mi("1971-12") ? "PAK|East Pakistan" : null;
};
