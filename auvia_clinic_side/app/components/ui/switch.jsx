"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";

export function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-slate-200 transition-colors data-[state=checked]:bg-(--brand-primary)",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 translate-x-0 rounded-full bg-white shadow ring-0 transition-transform data-[state=checked]:translate-x-4"
        )}
      />
    </SwitchPrimitive.Root>
  );
}
