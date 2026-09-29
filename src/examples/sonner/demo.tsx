"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/liquid/button";
import { toast } from "@/components/ui/liquid/sonner";

export default function SonnerDemo() {
  return (
    <Button
      size="lg"
      onClick={() =>
        toast.success("Saved to your collection", {
          description: "A little moment, kept forever.",
        })
      }
    >
      <Bell />
      Show notification
    </Button>
  );
}
