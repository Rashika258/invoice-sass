import { describe, it, expect } from "vitest";
import {
  COUNTRIES,
  INDIAN_STATES,
  GST_STATE_CODES,
  getStatesForCountry,
  getStateFromGstin,
  getGstStateCode,
} from "@/lib/geo-data";

describe("Geo Data & Auto-population Engine", () => {
  it("should have India as the default top country in COUNTRIES list", () => {
    expect(COUNTRIES[0]).toBe("India");
    expect(COUNTRIES).toContain("United States");
    expect(COUNTRIES).toContain("United Arab Emirates");
    expect(COUNTRIES).toContain("United Kingdom");
  });

  it("should have all 36 Indian states and union territories", () => {
    expect(INDIAN_STATES.length).toBe(36);
    expect(INDIAN_STATES).toContain("Maharashtra");
    expect(INDIAN_STATES).toContain("Delhi");
    expect(INDIAN_STATES).toContain("Karnataka");
    expect(INDIAN_STATES).toContain("Ladakh");
    expect(INDIAN_STATES).toContain("Chandigarh");
  });

  it("should return Indian states for default/empty country and India", () => {
    const defaultStates = getStatesForCountry();
    expect(defaultStates).toEqual([...INDIAN_STATES]);

    const indiaStates = getStatesForCountry("India");
    expect(indiaStates).toEqual([...INDIAN_STATES]);
  });

  it("should return country-specific states for other countries", () => {
    const usStates = getStatesForCountry("United States");
    expect(usStates).toContain("California");
    expect(usStates).toContain("New York");

    const uaeStates = getStatesForCountry("United Arab Emirates");
    expect(uaeStates).toContain("Dubai");
    expect(uaeStates).toContain("Abu Dhabi");
  });

  it("should auto-detect state from GSTIN", () => {
    expect(getStateFromGstin("27AAAAA0000A1Z5")).toBe("Maharashtra");
    expect(getStateFromGstin("07AAAAA0000A1Z5")).toBe("Delhi");
    expect(getStateFromGstin("29AAAAA0000A1Z5")).toBe("Karnataka");
    expect(getStateFromGstin("33AAAAA0000A1Z5")).toBe("Tamil Nadu");
    expect(getStateFromGstin("")).toBeNull();
    expect(getStateFromGstin("9999")).toBeNull();
  });

  it("should reverse lookup GST state code from state name", () => {
    expect(getGstStateCode("Maharashtra")).toBe("27");
    expect(getGstStateCode("Delhi")).toBe("07");
    expect(getGstStateCode("Karnataka")).toBe("29");
  });
});
