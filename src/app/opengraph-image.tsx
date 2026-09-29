import { ImageResponse } from "next/og";
import { site } from "@/site";
import { lockup, lockupSize } from "@/www/chrome/logo";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const logoWidth = 640;

/** The card shown when a link to any page is shared: the logo and the tagline. */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 56,
        background: "#ffffff",
      }}
    >
      <svg
        width={logoWidth}
        height={(logoWidth * lockupSize.height) / lockupSize.width}
        viewBox={`0 0 ${lockupSize.width} ${lockupSize.height}`}
      >
        <path d={lockup} fill="#19191d" fillRule="evenodd" />
      </svg>
      <div style={{ fontSize: 40, color: "#5b5b66", letterSpacing: "-0.01em" }}>{site.tagline}</div>
    </div>,
    size,
  );
}
