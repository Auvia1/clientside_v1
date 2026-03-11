import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-slate-100 text-slate-600",
        success: "bg-emerald-100 text-emerald-700",
        info: "bg-emerald-50 text-[var(--brand-primary)]",
        warning: "bg-amber-100 text-amber-700",
        muted: "bg-slate-200 text-slate-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
