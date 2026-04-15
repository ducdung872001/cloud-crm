// Smoke test cho utility numberToWords + bootstrap vitest infrastructure.
// Chạy: npm test

import { describe, it, expect } from "vitest";
import { numberToWords } from "./numberToWords";

describe("numberToWords — chuyển số thành chữ tiếng Việt", () => {
  it("trả 'Không đồng' cho 0", () => {
    expect(numberToWords(0)).toBe("Không đồng");
  });

  it("trả 'Không đồng' cho null/undefined/NaN", () => {
    // @ts-expect-error — test runtime behavior
    expect(numberToWords(null)).toBe("Không đồng");
    // @ts-expect-error
    expect(numberToWords(undefined)).toBe("Không đồng");
  });

  it("số 1 chữ số", () => {
    expect(numberToWords(1)).toBe("Một đồng chẵn");
    expect(numberToWords(9)).toBe("Chín đồng chẵn");
  });

  it("số hai chữ số — quy tắc 'linh', 'mốt', 'lăm', 'tư'", () => {
    expect(numberToWords(10)).toBe("Mười đồng chẵn");
    expect(numberToWords(15)).toBe("Mười lăm đồng chẵn");
    expect(numberToWords(21)).toBe("Hai mươi mốt đồng chẵn");
    expect(numberToWords(24)).toBe("Hai mươi tư đồng chẵn");
    expect(numberToWords(25)).toBe("Hai mươi lăm đồng chẵn");
  });

  it("số ba chữ số có 'linh'", () => {
    expect(numberToWords(101)).toBe("Một trăm linh một đồng chẵn");
    expect(numberToWords(105)).toBe("Một trăm linh năm đồng chẵn");
    expect(numberToWords(150)).toBe("Một trăm năm mươi đồng chẵn");
  });

  it("số hàng nghìn", () => {
    expect(numberToWords(1000)).toBe("Một nghìn đồng chẵn");
    expect(numberToWords(15_000)).toBe("Mười lăm nghìn đồng chẵn");
  });

  it("số hàng triệu", () => {
    expect(numberToWords(1_000_000)).toBe("Một triệu đồng chẵn");
    expect(numberToWords(14_300_000)).toMatch(/Mười bốn triệu/);
  });

  it("số hàng tỷ", () => {
    expect(numberToWords(1_000_000_000)).toMatch(/Một tỷ/);
  });

  it("round giá trị thập phân", () => {
    expect(numberToWords(1000.4)).toBe("Một nghìn đồng chẵn");
    expect(numberToWords(1000.6)).toMatch(/Một nghìn/);
  });
});
