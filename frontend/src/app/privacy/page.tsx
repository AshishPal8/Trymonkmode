import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — TryMonkMode",
  description: "What TryMonkMode stores about you, why, who can see it, and how to get it deleted.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      intro={
        <p>
          TryMonkMode is a small, independent product. To work, it has to store things you&apos;d rather keep to
          yourself: your plans, your habits, sometimes your journal. This page explains exactly what we keep, why, and
          how to get rid of it.
        </p>
      }
    >
      <LegalSection title="What we store">
        <ul>
          <li>
            <strong>Your account:</strong> the name, email address and profile photo Google shares when you sign in.
            We never see your Google password.
          </li>
          <li>
            <strong>What you put in the app:</strong> tasks, goals, habits, focus sessions, journal entries, notes,
            finance entries and your settings.
          </li>
          <li>
            <strong>Social activity:</strong> your username, your friends, the groups and challenges you&apos;re in,
            and the badges you&apos;ve earned.
          </li>
          <li>
            <strong>Payments:</strong> if you buy Pro, the plan, amount, date and status of each payment. Your card or
            UPI details go straight to our payment partner, Razorpay, and never reach us.
          </li>
          <li>
            <strong>A little technical data:</strong> a notification token if you turn on reminders, and basic request
            logs (like IP address) that help us stop abuse and fix bugs.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Why we use it">
        <p>
          To run the app for you: keep your data in sync across devices, count your streaks and focus time, send the
          reminders you set up, show leaderboards and groups, and give you Pro when you pay for it.
        </p>
        <p>
          We don&apos;t sell your data, we don&apos;t show ads, and nobody on our side reads your journal or notes.
        </p>
      </LegalSection>

      <LegalSection title="What other people can see">
        <p>
          Your name, username and photo are visible to your friends and on leaderboards. So are your streak, level and
          weekly focus time, unless you switch your stats to private on the Leaderboard page. People in your groups and
          challenges see your activity there, like &ldquo;focused 50m&rdquo;.
        </p>
        <p>Your tasks, notes, journal and finances are never shown to anyone else.</p>
      </LegalSection>

      <LegalSection title="Who else handles it">
        <p>
          Like most apps, we rely on a few providers for hosting, Google sign-in, push notifications and payments. They
          only get what they need to do that job, and they aren&apos;t allowed to use it for anything else. We&apos;ll
          only share information beyond that if the law requires us to.
        </p>
      </LegalSection>

      <LegalSection title="AI features">
        <p>
          When AI features arrive (like turning a brain dump into a plan), they&apos;ll only process the text you send
          them, only when you use them. Your data won&apos;t be used to train public AI models.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          As long as you have an account. If you ask us to delete it, we remove your data within 30 days. We may keep
          payment records for longer where tax law requires it.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <ul>
          <li>Make your stats private, or turn off notifications, any time in the app.</li>
          <li>Ask for a copy of your data, or for anything to be corrected.</li>
          <li>
            Ask us to delete your account: email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> from
            the address you sign in with. (In-app export and deletion are on the way.)
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Children">
        <p>TryMonkMode is for people aged 13 and over. We don&apos;t knowingly collect data from younger children.</p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          If we change something important, we&apos;ll tell you in the app or by email before it applies. Security
          details are on the <Link href="/security">security page</Link>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
