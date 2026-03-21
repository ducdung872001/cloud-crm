/**
 * Chuyển số thành chữ tiếng Việt
 * VD: 14300000 → "Mười bốn triệu ba trăm nghìn đồng chẵn"
 */

const ONES  = ["không","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];
const TENS  = ["","mười","hai mươi","ba mươi","bốn mươi","năm mươi",
               "sáu mươi","bảy mươi","tám mươi","chín mươi"];

function readGroup(n: number, isFirst: boolean): string {
  if (n === 0) return "";
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;

  let result = "";
  if (h > 0) {
    result += ONES[h] + " trăm";
    if (t === 0 && o > 0) result += " linh";
  }
  if (t > 0) {
    if (result) result += " ";
    result += TENS[t];
    if (o > 0) {
      result += " " + (t > 1 && o === 1 ? "mốt" : o === 4 && t > 1 ? "tư" : o === 5 && t > 0 ? "lăm" : ONES[o]);
    }
  } else if (o > 0) {
    if (result) result += " ";
    result += (isFirst && h === 0 ? ONES[o] : ONES[o]);
  }
  return result.trim();
}

export function numberToWords(n: number): string {
  if (!n || n === 0) return "Không đồng";
  n = Math.round(n);

  const UNITS = ["", "nghìn", "triệu", "tỷ"];
  const groups: number[] = [];
  let tmp = n;
  while (tmp > 0) { groups.unshift(tmp % 1000); tmp = Math.floor(tmp / 1000); }

  const parts: string[] = [];
  groups.forEach((g, idx) => {
    if (g === 0) return;
    const unit = UNITS[groups.length - 1 - idx];
    const word = readGroup(g, idx === 0);
    parts.push(unit ? word + " " + unit : word);
  });

  const result = parts.join(" ").trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng chẵn";
}
