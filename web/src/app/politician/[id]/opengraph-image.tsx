import { ImageResponse } from "next/og";
import { getPoliticianById } from "@/lib/queries/politicians";

export const runtime = "nodejs";
export const alt = "Politician record — NetaGirifiles";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);
  const p = isNaN(id) ? null : await getPoliticianById(id);

  const name = p?.name ?? "Unknown MP";
  const party = p?.party_short_name ?? "IND";
  const place = p?.constituency ?? p?.state_name ?? "";
  const total = p?.total_cases ?? 0;
  const serious = p?.serious_cases ?? 0;
  const accent = p?.party_color ?? "#ff2d87";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          background:
            "radial-gradient(ellipse at 15% 0%, rgba(255,45,135,0.3) 0%, rgba(255,45,135,0) 55%), #060814",
          color: "#f1f5f9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "#ff2d87",
              boxShadow: "0 0 20px rgba(255,45,135,0.6)",
            }}
          />
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 5,
              color: "#fff",
            }}
          >
            NETAGIRI<span style={{ color: "#ff2d87" }}>FILES</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 64,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              color: "#94a3b8",
            }}
          >
            <span
              style={{
                padding: "4px 14px",
                borderRadius: 999,
                background: `${accent}22`,
                color: accent,
                fontWeight: 700,
              }}
            >
              {party}
            </span>
            {place && <span>· {place}</span>}
          </div>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.05,
              color: "#fff",
              maxWidth: 1000,
            }}
          >
            {name}
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: 24,
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "18px 26px",
                borderRadius: 18,
                background: "rgba(255,45,135,0.12)",
                border: "2px solid rgba(255,45,135,0.3)",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  letterSpacing: 3,
                  color: "#ff2d87",
                  fontWeight: 700,
                }}
              >
                TOTAL CASES
              </span>
              <span
                style={{ fontSize: 64, fontWeight: 800, color: "#fff" }}
              >
                {total}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "18px 26px",
                borderRadius: 18,
                background: "rgba(255,255,255,0.04)",
                border: "2px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  letterSpacing: 3,
                  color: "#94a3b8",
                  fontWeight: 700,
                }}
              >
                SERIOUS
              </span>
              <span
                style={{ fontSize: 64, fontWeight: 800, color: "#fff" }}
              >
                {serious}
              </span>
            </div>
          </div>
          <div style={{ fontSize: 18, color: "#64748b" }}>
            Self-declared in ECI affidavit
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
