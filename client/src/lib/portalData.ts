/**
 * North Eastern Lawn visual system: Field Notes & Fine Lines.
 * Small pure helpers keep customer-portal states consistent and testable.
 */
export function canCreateServiceRequest(input: {
  propertyId: string;
  serviceType: string;
  preferredDate: string;
}) {
  return Boolean(input.propertyId && input.serviceType && input.preferredDate);
}

export function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountCents / 100);
}
