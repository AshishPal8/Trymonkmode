// Public business details, in one place (legal pages, contact page, footer).
// Razorpay checks these during KYC: fill the empty ones to match your KYC
// before going live. Empty values are simply not shown.

export const SITE = {
  name: "TryMonkMode",
  url: "https://trymonkmode.in",
  supportEmail: "support@trymonkmode.in",
  instagram: "https://instagram.com/trymonkmode.in",
  x: "https://x.com/trymonkmode",
  /** Your legal name as on PAN / KYC, e.g. "Ashish Pal". */
  legalName: "",
  /** Contact address for Razorpay, e.g. "City, State, India". */
  address: "",
  /** Support phone number (optional). */
  phone: "",
  /** Courts that handle disputes, e.g. "Delhi". */
  jurisdictionCity: "",
  responseTime: "within 2 business days",
  policiesUpdated: "November 2026",
} as const;
