"use client";

import { Button } from "@/components/ui/liquid/button";
import { toast } from "@/components/ui/liquid/sonner";

const upload = () => new Promise((resolve) => setTimeout(resolve, 1500));

export default function SonnerTypes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button onClick={() => toast("Event created", { description: "Sunday at 9:00" })}>
        Default
      </Button>
      <Button
        onClick={() =>
          toast.error("Could not upload", { description: "Check your connection and try again." })
        }
      >
        Error
      </Button>
      <Button
        onClick={() =>
          toast.promise(upload(), {
            loading: "Uploading…",
            success: "Uploaded",
            error: "Could not upload",
          })
        }
      >
        Promise
      </Button>
      <Button
        onClick={() =>
          toast("Photo deleted", {
            action: { label: "Undo", onClick: () => toast.success("Photo restored") },
          })
        }
      >
        With action
      </Button>
    </div>
  );
}
