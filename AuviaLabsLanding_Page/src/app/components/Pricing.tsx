import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Check, Star } from "lucide-react";
import { cn } from "./ui/utils";
import { buttonVariants } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

const MONTHLY_PLANS = [
  {
    name: "STARTER",
    description: "Perfect for small clinics",
    price: 25000,
    yearlyPrice: 22500,
    period: "month",
    features: [
      "AI call handling (3,000 calls/month)",
      "₹6 per additional call after limit",
      "Appointment automation",
      "WhatsApp payment link for patients",
      "24/7 AI receptionist availability",
      "Basic analytics dashboard",
      "Email support",
    ],
    buttonText: "Book a Demo",
    href: "#",
    isPopular: false,
    currency: "₹",
  },
  {
    name: "PRO",
    description: "For growing clinics",
    price: 45000,
    yearlyPrice: 40500,
    period: "month",
    features: [
      "AI call handling (7,000 calls/month)",
      "₹6 per additional call after limit",
      "Appointment automation",
      "WhatsApp payment link for patients",
      "24/7 AI receptionist availability",
      "Advanced analytics dashboard",
      "Priority support",
    ],
    buttonText: "Book a Demo",
    href: "#",
    isPopular: true,
    currency: "₹",
  },
  {
    name: "ENTERPRISE",
    description: "For hospitals & large clinics",
    price: 0,
    yearlyPrice: 0,
    period: "custom",
    features: [
      "Custom AI call volume",
      "Negotiated per-call pricing",
      "Appointment automation",
      "WhatsApp payment link for patients",
      "24/7 AI receptionist availability",
      "Multi-location management",
      "Advanced analytics & reporting",
      "Custom integrations (EMR, CRM)",
      "Dedicated support",
      "SLA guarantees",
    ],
    buttonText: "Contact Sales",
    href: "#",
    isPopular: false,
    currency: "",
  },
];

export function Pricing({ onOpenForm }: { onOpenForm: () => void }) {
  const [isMonthly, setIsMonthly] = useState(true);
  const switchRef = useRef<HTMLButtonElement>(null);

  function handleToggle(checked: boolean) {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ["#059669", "#10b981", "#6ee7b7", "#d1fae5"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  }

  const plans = MONTHLY_PLANS;

  return (
    <section id="pricing" className="bg-gradient-to-b from-white to-slate-50 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center space-y-4"
        >
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Choose the plan that fits your clinic's needs. All plans include core AI features.
          </p>
        </motion.div>

        {/* Monthly / Annual toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <Label htmlFor="billing-toggle" className="text-sm font-medium text-slate-600">Monthly</Label>
          <Switch
            id="billing-toggle"
            ref={switchRef}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-emerald-600"
          />
          <span className="text-sm font-semibold text-slate-700">
            Annual <span className="text-emerald-600">(Save 10%)</span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-end">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{
                y: plan.isPopular ? -16 : 0,
                opacity: 1,
                scale: plan.isPopular ? 1.03 : 0.97,
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, type: "spring", stiffness: 90, damping: 22, delay: index * 0.1 }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-7 shadow-lg",
                plan.isPopular
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 z-10"
                  : "border-slate-200 z-0",
              )}
            >
              {plan.isPopular && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5">
                  <Star className="h-3.5 w-3.5 fill-white text-white" />
                  <span className="text-xs font-bold text-white">Popular</span>
                </div>
              )}

              <p className="text-sm font-semibold tracking-widest text-slate-500">{plan.name}</p>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>

              {/* Price */}
              <div className="mt-6 flex items-baseline gap-1">
                {plan.period === "custom" ? (
                  <span className="text-4xl font-bold text-slate-900">Custom Pricing</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-slate-900">{plan.currency}</span>
                    <NumberFlow
                      value={isMonthly ? plan.price : plan.yearlyPrice}
                      format={{ useGrouping: true }}
                      transformTiming={{ duration: 500, easing: "ease-out" }}
                      willChange
                      className="text-4xl font-bold text-slate-900 tabular-nums"
                    />
                    <span className="text-sm font-medium text-slate-500">/ month</span>
                  </>
                )}
              </div>
              {plan.period !== "custom" && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {isMonthly ? "billed monthly" : "billed annually"}
                </p>
              )}

              {/* Features */}
              <ul className="mt-6 flex flex-col gap-2.5 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="my-5 border-slate-100" />

              <button
                onClick={onOpenForm}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-center text-sm font-semibold transition-all duration-300",
                  "hover:ring-2 hover:ring-emerald-500 hover:ring-offset-1",
                  plan.isPopular
                    ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700"
                    : "bg-white text-slate-800 hover:bg-emerald-50",
                )}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
