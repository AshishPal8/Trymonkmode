import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security — TryMonkMode",
  description: "How TryMonkMode keeps your account and your data safe, and how to report a problem.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <LegalPageLayout
      title="Security"
      intro={
        <p>
          Your journal and plans are personal, so we treat keeping them safe as part of the product, not an
          afterthought. Here&apos;s what that means in practice.
        </p>
      }
    >
      <LegalSection title="Signing in">
        <p>
          You sign in with Google, so there&apos;s no TryMonkMode password to leak or reuse. Your session is kept in a
          secure cookie that page scripts can&apos;t read, and signing out ends it on our side too.
        </p>
      </LegalSection>

      <LegalSection title="Your data">
        <ul>
          <li>Everything between your browser and our servers travels over an encrypted connection (HTTPS).</li>
          <li>Your workspace is only ever shown to you. Friends and groups only see the stats described in the <Link href="/privacy">privacy policy</Link>.</li>
          <li>We only look at an account when you ask us to (for example to fix a problem), and admin actions are logged.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Payments">
        <p>
          Card and UPI details are entered with Razorpay and go straight to them. We never see or store them. Pro is only
          switched on after Razorpay confirms the payment to our server.
        </p>
      </LegalSection>

      <LegalSection title="Keeping the service healthy">
        <p>
          Every part of the app has limits on how often it can be called, to stop bots, spam and brute-force attempts
          from slowing things down for everyone. Leaderboards only count activity saved on our servers, with daily caps,
          so they can&apos;t easily be gamed.
        </p>
      </LegalSection>

      <LegalSection title="Found a problem?">
        <p>
          If you think you&apos;ve found a security issue, please email{" "}
          <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> with the details before sharing it publicly.
          We&apos;ll look into it quickly and tell you what we find.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
