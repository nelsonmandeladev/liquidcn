import { Download, Heart, Share } from "lucide-react";
import { Button } from "@/components/ui/liquid/button";

export default function ButtonIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button>
        <Download />
        Download
      </Button>
      <Button size="icon" aria-label="Share">
        <Share />
      </Button>
      <Button size="icon-lg" variant="prominent" aria-label="Favorite">
        <Heart />
      </Button>
    </div>
  );
}
