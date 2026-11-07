import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LegalNavTabs } from "./LegalNavTabs";
import { SITE } from "@/lib/site";

interface LegalPageLayoutProps {
  title: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}

/** A plain, readable document page: Privacy, Terms, Refunds, Security, Contact. */
export function LegalPageLayout({ title, intro, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col">
      <LandingNavbar />

      <main className="max-w-3xl mx-auto px-5 sm:px-6 pt-32 sm:pt-36 pb-24 flex-1 w-full">
        <LegalNavTabs />

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          <p className="text-sm text-slate-400 mt-2">Last updated {SITE.policiesUpdated}</p>
          <div className="text-[17px] text-slate-600 leading-8 mt-6">{intro}</div>
        </header>

        <div className="space-y-10">{children}</div>

        <p className="mt-14 pt-8 border-t border-slate-200 text-[15px] text-slate-600 leading-7">
          Questions about anything on this page? Email{" "}
          <a href={`mailto:${SITE.supportEmail}`} className="font-semibold text-[#0052FF]">
            {SITE.supportEmail}
          </a>{" "}
          and you&apos;ll hear back from a person, usually {SITE.responseTime}.
        </p>
      </main>

      <LandingFooter />
    </div>
  );
}

/** One section of a policy: a heading and its text. */
export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="text-[15px] text-slate-700 leading-7 space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-[#0052FF] [&_a]:font-semibold [&_strong]:text-slate-900">
        {children}
      </div>
    </section>
  );
}
