"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/liquid/button";
import { setDarkTheme, useDarkTheme } from "@/www/preferences";

export function ThemeToggle() {
  const dark = useDarkTheme();
  // CSS picks the first icon, so hydration changes nothing and the button does not morph on
  // load. After a click React owns the icon, and the change morphs like any button content.
  const [touched, setTouched] = useState(false);
  const toggle = () => {
    setTouched(true);
    setDarkTheme(!dark);
  };
  const both = (
    <>
      <Moon className="theme-icon-light" />
      <Sun className="theme-icon-dark" />
    </>
  );
  return (
    <Button variant="ghost" size="icon" aria-label="Toggle dark theme" onClick={toggle}>
      {touched ? dark ? <Sun /> : <Moon /> : both}
    </Button>
  );
}
