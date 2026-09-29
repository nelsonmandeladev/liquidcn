"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/liquid/button";
import { toast } from "@/components/ui/liquid/sonner";
import { cn } from "@/lib/utils";

/** Copies `value`; the icon morphs into a check for a moment. */
export function CopyButton({
  value,
  label = "Copy code",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      toast.error("Clipboard unavailable. Select the text and copy it.");
    }
  };
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("copy-button", className)}
      aria-label={copied ? "Copied" : label}
      onClick={copy}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  );
}
