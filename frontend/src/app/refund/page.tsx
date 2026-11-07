import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { formatRupees, PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE } from "@/lib/plans";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — TryMonkMode",
  description: "How cancelling, renewals and refunds work for TryMonkMode Pro.",
  alternates: { canonical: "/refund" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund & Cancellation"
      intro={
        <p>
          The short version: you can cancel whenever you want, and if Pro isn&apos;t for you, ask within 7 days of your
          first payment and we&apos;ll refund it.
        </p>
      }
    >
      <LegalSection title="Plans and renewals">
        <p>
          The Free plan never charges you. Monk Pro is {formatRupees(PRO_MONTHLY_PRICE)} a month, or{" "}
          {formatRupees(PRO_YEARLY_PRICE)} a year (see <Link href="/pricing">pricing</Link>). Pro renews automatically at
          the end of each month or year until you cancel. Payments are processed by Razorpay.
        </p>
      </LegalSection>

      <LegalSection title="Cancelling">
        <p>
          Cancel from the billing section in the app, or just email us. You won&apos;t be charged again, and Pro stays on
          until the end of the period you already paid for. After that your account moves to the Free plan. Nothing you
          created is deleted.
        </p>
      </LegalSection>

      <LegalSection title="Refunds">
        <ul>
          <li>
            <strong>Your first payment</strong> (monthly or yearly): full refund if you ask within 7 days. Once per
            account.
          </li>
          <li>
            <strong>A yearly renewal you didn&apos;t want:</strong> full refund if you ask within 7 days of the renewal
            date.
          </li>
          <li>
            <strong>Charged twice, or charged when the payment failed:</strong> always refunded in full.
          </li>
        </ul>
        <p>Outside these cases we don&apos;t refund part of a month or year that has already started.</p>
      </LegalSection>

      <LegalSection title="How to ask">
        <p>
          Email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> from the address you sign in with. If you
          have the Razorpay payment ID from your receipt, include it. Approved refunds go back to the way you paid
          within 5–7 business days; your bank may take a few more days to show it.
        </p>
      </LegalSection>

      <LegalSection title="Delivery">
        <p>TryMonkMode is an online service. Pro is switched on in your account as soon as the payment goes through.</p>
      </LegalSection>

      <LegalSection title="Price changes">
        <p>
          If prices change, we&apos;ll tell you at least 7 days before it affects you. The new price only applies from
          your next renewal, so you can cancel before then.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
