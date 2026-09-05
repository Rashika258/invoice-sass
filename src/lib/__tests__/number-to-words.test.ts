import { describe, it, expect } from "vitest";
import { numberToWordsIndian } from "../number-to-words";

describe("numberToWordsIndian", () => {
  it("converts zero correctly", () => {
    expect(numberToWordsIndian(0)).toBe("Rupees Zero Only");
  });

  it("converts single digits and teens", () => {
    expect(numberToWordsIndian(5)).toBe("Rupees Five Only");
    expect(numberToWordsIndian(14)).toBe("Rupees Fourteen Only");
  });

  it("converts tens and hundreds", () => {
    expect(numberToWordsIndian(45)).toBe("Rupees Forty Five Only");
    expect(numberToWordsIndian(350)).toBe("Rupees Three Hundred Fifty Only");
  });

  it("converts thousands, lakhs, and crores in Indian format", () => {
    expect(numberToWordsIndian(1000)).toBe("Rupees One Thousand Only");
    expect(numberToWordsIndian(125430)).toBe("Rupees One Lakh Twenty Five Thousand Four Hundred Thirty Only");
    expect(numberToWordsIndian(15000000)).toBe("Rupees One Crore Fifty Lakh Only");
  });

  it("handles paise correctly", () => {
    expect(numberToWordsIndian(100.5)).toBe("Rupees One Hundred and Fifty Paise Only");
    expect(numberToWordsIndian(0.75)).toBe("Rupees Zero and Seventy Five Paise Only");
  });

  it("handles negative amounts", () => {
    expect(numberToWordsIndian(-500)).toBe("Minus Rupees Five Hundred Only");
  });
});
