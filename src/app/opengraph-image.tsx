import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "RouteyAI — Smart school bus routing and live tracking"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

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
          padding: 72,
          background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 800 }}>
          Routey<span style={{ color: "#60A5FA" }}>AI</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2 }}>Smart routing.</div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2, color: "#93C5FD" }}>
            Real-time tracking.
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2 }}>Peace of mind.</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#CBD5E1" }}>
          AI-powered school bus management for Qatar’s schools
        </div>
      </div>
    ),
    size
  )
}
