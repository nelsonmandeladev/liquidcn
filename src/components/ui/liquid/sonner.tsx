"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";
import "./liquid.css";

export { toast } from "sonner";

/** Sonner owns announcements, timers, stacking and swipe dismissal. */
export function Toaster({ className, toastOptions, ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      offset={{ top: "max(20px, env(safe-area-inset-top))" }}
      mobileOffset={{ top: "max(16px, env(safe-area-inset-top))", left: 16, right: 16 }}
      visibleToasts={3}
      closeButton
      className={cn("liquid-toaster", className)}
      {...props}
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastOptions?.classNames,
          toast: cn("liquid-surface liquid-toast", toastOptions?.classNames?.toast),
        },
      }}
    />
  );
}
