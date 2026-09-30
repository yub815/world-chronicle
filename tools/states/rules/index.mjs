// 나라별 규칙 모음. labelFor(u, m) → "당시 나라|구역" | "구역"(당시 나라 = 현대 나라) | null(선 안 그림)
import { R as world } from "./world.mjs";
import { R as realms } from "./realms.mjs";
import { R as fine } from "./fine.mjs";
export const FINE = (process.env.FINE ?? "CHN,DEU,POL").split(",").filter(Boolean);
const R = {...world, ...realms, ...fine};
export function labelFor(u, m){
  const f = R[u.src === "ne" ? u.cc : u.src + "2"];
  return f ? f(u, m) : null;          // 규칙이 없는 나라는 그리지 않는다
}
