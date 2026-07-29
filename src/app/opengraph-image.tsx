import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Read once per build/request rather than per render — same file every time. */
function logoDataUri() {
  const bytes = readFileSync(join(process.cwd(), "public", "logo.png"));
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(75,46,131,0.10), transparent 45%), radial-gradient(circle at 85% 85%, rgba(75,46,131,0.10), transparent 45%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- satori requires a plain img */}
        <img src={logoDataUri()} alt="" width={520} height={167} />
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#6e6e7a",
            letterSpacing: "0.02em",
          }}
        >
          {site.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
