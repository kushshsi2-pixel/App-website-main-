/**
 * North Eastern Lawn visual system: Cut & Collect.
 * Small pure helpers keep customer portal submission rules consistent and testable.
 */
export function canCreateServiceRequest(input: {
  propertyId: string;
  serviceType: string;
  preferredDate: string;
}) {
  return Boolean(input.propertyId && input.serviceType && input.preferredDate);
}

export function canCreateQuoteRequest(input: {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  serviceInterests: string[];
}) {
  return Boolean(input.address && input.city && input.state && input.postalCode && input.serviceInterests.length);
}

export function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}
