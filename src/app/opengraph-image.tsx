import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Meridian — Journeys, curated. A luxury travel agency.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at build time. Assets live in the private `_og` folder (not routed).
export default async function OpengraphImage() {
  const dir = join(process.cwd(), "src/app/_og");
  const [fraunces, dmSans, bg] = await Promise.all([
    readFile(join(dir, "Fraunces-Light.woff")),
    readFile(join(dir, "DMSans-Regular.woff")),
    readFile(join(dir, "og-bg.jpg")),
  ]);
  const bgSrc = `data:image/jpeg;base64,${bg.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#071226" }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={bgSrc} width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage: "linear-gradient(90deg, rgba(5,13,26,0.94) 0%, rgba(5,13,26,0.82) 48%, rgba(5,13,26,0.15) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 30, letterSpacing: 14, color: "#f4efe6" }}>MERIDIAN</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 92, lineHeight: 0.98, color: "#f4efe6", maxWidth: 720 }}>
              The world, without the noise.
            </div>
            <div style={{ display: "flex", marginTop: 28, fontFamily: "DM Sans", fontSize: 26, color: "#e9c27c", maxWidth: 640 }}>
              Journeys, curated. Private trips, planned by people who have been.
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, style: "normal", weight: 300 },
        { name: "DM Sans", data: dmSans, style: "normal", weight: 400 },
      ],
    },
  );
}
