import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/content";

export const alt = "Robin Singh Portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  const profile = getProfile();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0A",
          color: "#F5F5F5",
          padding: 72,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#9A9A9A",
          }}
        >
          Portfolio
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, fontWeight: 500, lineHeight: 1.05 }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 34, color: "#9A9A9A", maxWidth: 840 }}>
            {profile.headline}
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#9A9A9A" }}>{profile.title}</div>
      </div>
    ),
    { ...size },
  );
}
