import type { Metadata } from "next";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — TryMonkMode",
  description: "Billing help, refunds, bugs or ideas: how to reach the TryMonkMode team.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <LegalPageLayout
      title="Contact"
      intro={
        <p>
          Questions about billing, a refund, a bug, or an idea for the app? We read every message and usually reply{" "}
          {SITE.responseTime}.
        </p>
      }
    >
      <LegalSection title="Email">
        <p>
          <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> is the fastest way to reach us. For anything
          about a payment, please write from the email you sign in with and include the Razorpay payment ID from your
          receipt if you have it.
        </p>
      </LegalSection>

      <LegalSection title="Social">
        <p>
          You can also find us on <a href={SITE.instagram} target="_blank" rel="noreferrer">Instagram</a> and{" "}
          <a href={SITE.x} target="_blank" rel="noreferrer">X</a>.
        </p>
      </LegalSection>

      {(SITE.legalName || SITE.address || SITE.phone) && (
        <LegalSection title="Business details">
          {SITE.legalName && <p>{SITE.name} is run by {SITE.legalName}.</p>}
          {SITE.address && <p>{SITE.address}</p>}
          {SITE.phone && <p>Phone: <a href={`tel:${SITE.phone}`}>{SITE.phone}</a></p>}
        </LegalSection>
      )}
    </LegalPageLayout>
  );
}
