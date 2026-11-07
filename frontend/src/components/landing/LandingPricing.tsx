"use client";

import React, { useState } from "react";
import { Award, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { formatRupees, PAYMENTS_LIVE, PLANS, YEARLY_SAVING_PCT, type Plan } from "@/lib/plans";

type Billing = "monthly" | "yearly";

const FREE = PLANS.find((p) => p.id === "free")!;
const PRO_MONTHLY = PLANS.find((p) => p.id === "pro_monthly")!;
const PRO_YEARLY = PLANS.find((p) => p.id === "pro_yearly")!;

/** Pro on the yearly toggle: monthly's features plus the yearly extras. */
const proFor = (billing: Billing): Plan =>
  billing === "monthly"
    ? PRO_MONTHLY
    : { ...PRO_YEARLY, features: [...PRO_MONTHLY.features, ...PRO_YEARLY.features.slice(1)] };

function PlanCard({ plan, cta, onCta }: { plan: Plan; cta: string; onCta: () => void }) {
  const isPro = plan.id !== "free";
  return (
    <div
      className={`p-7 rounded-3xl bg-white flex flex-col justify-between gap-6 relative ${
        plan.highlight || isPro ? "border-2 border-[#0052FF] shadow-[0_20px_50px_rgba(0,82,255,0.12)]" : "border border-slate-200"
      }`}
    >
      {isPro && (
        <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-[#0052FF] text-white text-[10px] font-extrabold">
          MOST POPULAR
        </span>
      )}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">{plan.name}</h3>
          <p className="text-xs text-slate-500 mt-1">{plan.tagline}</p>
        </div>
        <div>
          <span className={`text-4xl font-extrabold ${isPro ? "text-[#0052FF]" : "text-slate-900"}`}>{formatRupees(plan.price)}</span>
          <span className="text-xs text-slate-500 font-semibold"> / {plan.period}</span>
          {plan.note && <p className="text-xs font-semibold text-emerald-600 mt-1">{plan.note}</p>}
        </div>
        <ul className="space-y-2.5 pt-2 text-sm text-slate-700">
          {plan.features.map((f) => (
            <li key={f.text} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>
                {f.text}
                {f.soon && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold align-middle">
                    SOON
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Button
        variant={isPro ? "default" : "outline"}
        size="lg"
        onClick={onCta}
        className="w-full rounded-xl font-bold"
      >
        {cta}
      </Button>
    </div>
  );
}

interface LandingPricingProps {
  /** Opens the page's sign-up form. Without it the section uses its own. */
  onOpenAuth?: (mode: "login" | "signup") => void;
}

/** Free vs Pro, with a monthly / yearly switch. Used on the home page and /pricing. */
export function LandingPricing({ onOpenAuth }: LandingPricingProps) {
  const [billing, setBilling] = useState<Billing>("yearly");
  const [ownAuthOpen, setOwnAuthOpen] = useState(false);
  const openSignup = () => (onOpenAuth ? onOpenAuth("signup") : setOwnAuthOpen(true));

  return (
    <section id="pricing" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 border-t border-slate-200/60">
      <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-[#0052FF]">
          <Award className="w-3.5 h-3.5" />
          <span>Simple pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Free to start. Pro when you&apos;re ready.</h2>
        <p className="text-sm text-slate-600">
          The whole productivity system is free. Pro adds AI planning and deeper insights.
        </p>

        <div className="pt-3 inline-flex p-1 rounded-full bg-white border border-slate-200">
          {(["monthly", "yearly"] as Billing[]).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBilling(b)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                billing === b ? "bg-[#0052FF] text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {b === "monthly" ? "Monthly" : `Yearly · save ${YEARLY_SAVING_PCT}%`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PlanCard plan={FREE} cta="Start free" onCta={openSignup} />
        <PlanCard
          plan={proFor(billing)}
          cta={PAYMENTS_LIVE ? "Get Pro" : "Start free · Pro launching soon"}
          onCta={openSignup}
        />
      </div>

      <p className="text-center text-xs text-slate-500 mt-6">
        Prices in Indian Rupees. Cancel anytime. 7-day refund on your first payment.{" "}
        <a href="/refund" className="font-semibold text-[#0052FF]">
          Refund policy
        </a>
      </p>

      {!onOpenAuth && <AuthModal isOpen={ownAuthOpen} onClose={() => setOwnAuthOpen(false)} initialMode="signup" />}
    </section>
  );
}
