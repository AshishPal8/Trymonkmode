import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service — TryMonkMode",
  description: "The rules for using TryMonkMode: your content, fair use, paid plans, cancelling and refunds.",
  alternates: { canonical: "/terms" },
};

const operator = SITE.legalName ? `${SITE.name}, run by ${SITE.legalName}` : SITE.name;

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      intro={
        <p>
          These are the rules for using TryMonkMode. We&apos;ve kept them short. By creating an account you agree to
          them, and if you don&apos;t, please don&apos;t use the app.
        </p>
      }
    >
      <LegalSection title="Who you're dealing with">
        <p>
          These terms are between you and {operator} (&ldquo;we&rdquo;, &ldquo;us&rdquo;).
        </p>
      </LegalSection>

      <LegalSection title="Your account">
        <ul>
          <li>You sign in with Google. Anyone with access to your Google account can open your workspace, so keep it secure.</li>
          <li>You need to be at least 13. To buy Pro you need to be 18, or have a parent or guardian&apos;s permission.</li>
          <li>We create a username for you when you sign up. It&apos;s how friends find you.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Your content is yours">
        <p>
          Everything you write or add stays yours. We only use it to run the app for you, as described in the{" "}
          <Link href="/privacy">privacy policy</Link>.
        </p>
      </LegalSection>

      <LegalSection title="Play fair">
        <p>Please don&apos;t:</p>
        <ul>
          <li>try to break, overload or get around the security of the service;</li>
          <li>use bots or scripts to farm XP, streaks or leaderboard places;</li>
          <li>harass people through friends, groups or challenges;</li>
          <li>get into other people&apos;s accounts, or upload anything illegal or harmful.</li>
        </ul>
        <p>If you do, we may remove content, reset your stats or close your account.</p>
      </LegalSection>

      <LegalSection title="Paid plans">
        <ul>
          <li>
            The Free plan stays free. Paid plans and prices are on the <Link href="/pricing">pricing page</Link> and
            shown again before you pay, in Indian Rupees.
          </li>
          <li>Payments are handled by Razorpay. Pro renews automatically each month or year until you cancel.</li>
          <li>Features marked &ldquo;Soon&rdquo; aren&apos;t available yet, and we can&apos;t promise a date.</li>
          <li>
            You can cancel any time. Refunds follow the <Link href="/refund">refund &amp; cancellation policy</Link>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="When things go wrong">
        <p>
          We work hard to keep TryMonkMode running, but there will be the occasional outage or bug, and features will
          change as the app grows. If we ever remove something you paid for, we&apos;ll refund the unused time.
        </p>
        <p>
          The app is provided as it is. As far as the law allows, we aren&apos;t liable for indirect losses, and our
          total liability is limited to what you paid us in the 12 months before the problem. Keep your own copy of
          anything critical.
        </p>
      </LegalSection>

      <LegalSection title="Closing your account">
        <p>
          You can stop using TryMonkMode whenever you like, and ask us to delete your account by emailing{" "}
          <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
        </p>
      </LegalSection>

      <LegalSection title="Law and disputes">
        <p>
          These terms are governed by the laws of India
          {SITE.jurisdictionCity ? `, and the courts of ${SITE.jurisdictionCity} handle any dispute` : ""}. If
          something goes wrong, please email us first. Most problems are sorted out quickly.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          If we change these terms in an important way, we&apos;ll let you know before the change applies. Using the app
          after that means you accept them.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
