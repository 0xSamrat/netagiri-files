import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NetaGirifiles — Criminal records of Indian MPs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(255,45,135,0.35) 0%, rgba(255,45,135,0) 55%), radial-gradient(ellipse at 85% 30%, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0) 55%), #060814",
          color: "#f1f5f9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#ff2d87",
              boxShadow: "0 0 24px rgba(255,45,135,0.6)",
            }}
          />
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: 6,
              color: "#fff",
            }}
          >
            NETAGIRI<span style={{ color: "#ff2d87" }}>FILES</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 20,
              color: "#ff2d87",
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Civic Transparency · Lok Sabha 2024
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#fff",
              maxWidth: 960,
            }}
          >
            Know the{" "}
            <span style={{ color: "#ff2d87" }}>criminal record</span> of your
            elected MP.
          </div>
          <div style={{ fontSize: 26, color: "#cbd5e1", maxWidth: 960 }}>
            Explore cases self-declared by Indian MPs in their ECI affidavits.
          </div>
        </div>
        <div style={{ fontSize: 20, color: "#94a3b8" }}>
          Source: myneta.info · Declarations, not convictions
        </div>
      </div>
    ),
    { ...size },
  );
}
