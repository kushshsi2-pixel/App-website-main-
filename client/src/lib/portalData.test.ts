/** North Eastern Lawn visual system: Field Notes & Fine Lines. */
import { describe, expect, it } from "vitest";
import { canCreateServiceRequest, formatCurrencyFromCents } from "./portalData";

describe("customer portal helpers", () => {
  it("requires a property, service, and preferred date before a customer can request work", () => {
    expect(canCreateServiceRequest({ propertyId: "property-1", serviceType: "Mowing", preferredDate: "2026-08-15" })).toBe(true);
    expect(canCreateServiceRequest({ propertyId: "", serviceType: "Mowing", preferredDate: "2026-08-15" })).toBe(false);
  });

  it("formats invoice balances as United States currency", () => {
    expect(formatCurrencyFromCents(12950)).toBe("$129.50");
  });
});
