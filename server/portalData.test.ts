/** North Eastern Lawn visual system: Field Notes & Fine Lines. */
import { describe, expect, it } from "vitest";
import { canCreateQuoteRequest, canCreateServiceRequest, formatCurrencyFromCents } from "../client/src/lib/portalData";

describe("customer portal helpers", () => {
  it("requires a property, service, and preferred date before a customer can request work", () => {
    expect(canCreateServiceRequest({ propertyId: "property-1", serviceType: "Mowing", preferredDate: "2026-08-15" })).toBe(true);
    expect(canCreateServiceRequest({ propertyId: "", serviceType: "Mowing", preferredDate: "2026-08-15" })).toBe(false);
  });

  it("formats invoice balances as United States currency", () => {
    expect(formatCurrencyFromCents(12950)).toBe("$129.50");
  });

  it("requires a complete property brief and at least one service before a quote is submitted", () => {
    expect(canCreateQuoteRequest({ address: "18 Meadow Lane", city: "Albany", state: "NY", postalCode: "12207", serviceInterests: ["Mowing & maintenance"] })).toBe(true);
    expect(canCreateQuoteRequest({ address: "18 Meadow Lane", city: "Albany", state: "NY", postalCode: "12207", serviceInterests: [] })).toBe(false);
  });
});
