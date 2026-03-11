import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400",
        className
      )}
      {...props}
    />
  );
}
