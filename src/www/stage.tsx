import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { scenes, type SceneName } from "@/www/stage-scenes";
import lake from "../../public/assets/alpine-lake.png";

type StageProps = {
  scene?: SceneName;
  className?: string;
  /** Load the photo eagerly, for stages visible on first paint. */
  eager?: boolean;
  children?: ReactNode;
};

/**
 * A photo for glass to sit on. Every stage uses the same image and `sizes`, so the browser
 * downloads it once; scenes differ only in crop and zoom.
 */
export function Stage({ scene = "full", className, eager, children }: StageProps) {
  const { x, y, zoom, ink } = scenes[scene];
  const crop = {
    objectPosition: `${x}% ${y}%`,
    transformOrigin: `${x}% ${y}%`,
    scale: zoom,
  } as CSSProperties;
  return (
    <div className={cn("stage", className)} data-scene={scene} data-ink={ink}>
      <Image
        src={lake}
        alt=""
        fill
        sizes="100vw"
        placeholder="blur"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="stage-photo"
        style={crop}
      />
      <div className="stage-content">{children}</div>
    </div>
  );
}
