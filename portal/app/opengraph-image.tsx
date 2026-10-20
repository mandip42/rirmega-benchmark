import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "RIR-Mega Independent Benchmark & Evaluation Portal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Code-generated Open Graph share card. Palette matches tailwind.config.ts:
// ink #0f172a, paper #f8fafc, accent (teal) #0d9488, accent2 (indigo) #6366f1.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f172a",
          color: "#f8fafc",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "#f8fafc",
            }}
          >
            RIR-Mega <span style={{ color: "#2dd4bf" }}>Benchmark</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: "980px",
            }}
          >
            Reproduce, evaluate, challenge and extend RIR-Mega
          </div>
          <div style={{ fontSize: 30, color: "#cbd5e1", maxWidth: "940px" }}>
            Independent benchmark portal — interactive explorer, 5-minute
            reproducibility quickstart, and an open PR-based submission workflow.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: 26,
            color: "#94a3b8",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "999px",
              background: "#0d9488",
            }}
          />
          <div>rirmega-benchmark.vercel.app</div>
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "999px",
              background: "#6366f1",
              marginLeft: "12px",
            }}
          />
          <div>arXiv:2510.18917</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
