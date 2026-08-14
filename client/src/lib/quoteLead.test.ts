import { describe, expect, it } from "vitest";
import { validatePublicQuoteLead } from "./quoteLead";

describe("public quote lead validation", () => {
  const lead = { propertyAddress: "12 Main Street", postalCode: "02769", serviceInterest: "Weekly mowing", fullName: "Alex Smith", phone: "555-555-5555", email: "alex@example.com" };

  it("accepts a complete 2027 quote request", () => expect(validatePublicQuoteLead(lead)).toBeNull());
  it("requires the requested service before lead submission", () => expect(validatePublicQuoteLead({ ...lead, serviceInterest: "" })).toMatch(/service/i));
});
