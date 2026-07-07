import { describe, expect, it } from "vitest";
import {
  direction,
  formatChange,
  formatClock,
  formatPercent,
  formatPrice,
} from "./format";

describe("formatPrice", () => {
  it("keeps two decimals and thousands separators", () => {
    expect(formatPrice(1234.5)).toBe("1,234.50");
    expect(formatPrice(9.1)).toBe("9.10");
  });
});

describe("formatPercent", () => {
  it("prefixes a plus sign for gains", () => {
    expect(formatPercent(1.234)).toBe("+1.23%");
  });
  it("keeps the minus sign for losses", () => {
    expect(formatPercent(-0.8)).toBe("-0.80%");
  });
  it("shows zero without a sign", () => {
    expect(formatPercent(0)).toBe("0.00%");
  });
});

describe("formatChange", () => {
  it("signs positive values", () => {
    expect(formatChange(2.3)).toBe("+2.30");
    expect(formatChange(-1.15)).toBe("-1.15");
  });
});

describe("direction", () => {
  it("classifies up, down and flat", () => {
    expect(direction(1)).toBe("up");
    expect(direction(-1)).toBe("down");
    expect(direction(0)).toBe("flat");
  });
});

describe("formatClock", () => {
  it("returns an HH:MM:SS string", () => {
    expect(formatClock(0)).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});
