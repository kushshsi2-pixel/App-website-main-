/** North Eastern Lawn 2027 quote pipeline. */
export type PublicQuoteLead = {
  propertyAddress: string;
  postalCode: string;
  serviceInterest: string;
  fullName: string;
  phone: string;
  email: string;
};

export function validatePublicQuoteLead(lead: PublicQuoteLead) {
  if (!lead.propertyAddress.trim() || !lead.postalCode.trim()) return "Add the property address and ZIP code.";
  if (!lead.serviceInterest) return "Choose the service you are looking for.";
  if (!lead.fullName.trim() || !lead.phone.trim() || !lead.email.trim()) return "Add your name, phone number, and email.";
  return null;
}
