import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Code-generated favicon: teal "R" monogram on ink, matching the site palette.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#2dd4bf",
          fontSize: 22,
          fontWeight: 800,
          fontFamily: "sans-serif",
          borderRadius: "6px",
        }}
      >
        R
      </div>
    ),
    { ...size }
  );
}
