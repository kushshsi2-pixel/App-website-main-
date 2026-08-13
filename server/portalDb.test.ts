/** North Eastern Lawn visual system: Field Notes & Fine Lines. */
import { describe, expect, it } from "vitest";
import { createCustomerServiceRequest, getCustomerPortalSummary, PortalQueryable } from "./portalDb";

describe("portal database access rules", () => {
  it("scopes every customer summary query to the signed-in profile", async () => {
    const calls: Array<{ text: string; values?: unknown[] }> = [];
    const client: PortalQueryable = { query: async (text, values) => { calls.push({ text, values }); return { rows: [] }; } };
    await getCustomerPortalSummary("customer-a", client);
    expect(calls).toHaveLength(4);
    expect(calls.every(call => call.values?.[0] === "customer-a")).toBe(true);
    expect(calls[1]?.text).toContain("p.profile_id = $1");
  });

  it("creates a request only after confirming the property belongs to the signed-in customer", async () => {
    const calls: Array<{ text: string; values?: unknown[] }> = [];
    const client: PortalQueryable = { query: async (text, values) => {
      calls.push({ text, values });
      if (calls.length === 1) return { rows: [{ id: "property-a" }], rowCount: 1 };
      return { rows: [{ id: "request-a", status: "submitted" }], rowCount: 1 };
    } };
    const result = await createCustomerServiceRequest({ profileId: "customer-a", propertyId: "property-a", serviceType: "Mowing", preferredDate: "2026-08-15" }, client);
    expect(result).toMatchObject({ id: "request-a" });
    expect(calls[0]?.values).toEqual(["property-a", "customer-a"]);
    expect(calls[1]?.values?.slice(0, 2)).toEqual(["customer-a", "property-a"]);
  });

  it("rejects a request for a property outside the signed-in customer account", async () => {
    let calls = 0;
    const client: PortalQueryable = { query: async () => { calls += 1; return { rows: [], rowCount: 0 }; } };
    await expect(createCustomerServiceRequest({ profileId: "customer-a", propertyId: "property-b", serviceType: "Mowing", preferredDate: "2026-08-15" }, client)).rejects.toThrow("Property not found");
    expect(calls).toBe(1);
  });
});
