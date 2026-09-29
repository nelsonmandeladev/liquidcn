"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/liquid/button";

export default function ButtonDemo() {
  const [done, setDone] = useState(false);
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex flex-col items-center gap-6">
      <Button size="lg" onClick={() => setDone(!done)}>
        {done ? "All set" : "Continue"}
        {done ? <Check /> : <ArrowRight />}
      </Button>
      <Button
        variant={editing ? "prominent" : "default"}
        size={editing ? "icon-lg" : "lg"}
        aria-label={editing ? "Done editing" : undefined}
        onClick={() => setEditing(!editing)}
      >
        {editing ? <Check /> : "Edit"}
      </Button>
    </div>
  );
}
