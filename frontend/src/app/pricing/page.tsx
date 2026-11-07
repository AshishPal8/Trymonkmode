import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { formatRupees, PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing — TryMonkMode",
  description: `TryMonkMode is free to start. Monk Pro is ${formatRupees(PRO_MONTHLY_PRICE)}/month or ${formatRupees(PRO_YEARLY_PRICE)}/year.`,
  alternates: { canonical: "/pricing" },
};

const FAQ = [
  { q: "Is the Free plan really free?", a: "Yes. Tasks, goals, habits, focus timer, streaks and all community features are free, with no time limit." },
  { q: "How do I pay?", a: "UPI, cards and netbanking through Razorpay. We never see or store your card or UPI details." },
  { q: "Can I cancel anytime?", a: "Yes. Pro stays on until the end of the period you paid for, and you're never charged again." },
  { q: "Can I get a refund?", a: "Yes: a full refund if you ask within 7 days of your first payment. See the refund policy for details." },
  { q: "What happens to my data if I stop paying?", a: "Nothing is deleted. Your account moves to the Free plan and everything stays." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 flex flex-col">
      <LandingNavbar />
      <main className="flex-1 pt-20">
        <LandingPricing />
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 space-y-3">
          <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-6">Questions</h2>
          {FAQ.map((item) => (
            <details key={item.q} className="group p-5 rounded-2xl bg-white border border-slate-200/80">
              <summary className="cursor-pointer text-sm font-bold text-slate-900 list-none flex justify-between items-center">
                {item.q}
                <span className="text-slate-400 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
