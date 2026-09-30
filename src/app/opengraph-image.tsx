import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "RouteyAI: school bus route planning and live tracking"
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
          background: "#1E3A8A",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 40, fontWeight: 800 }}>
          Routey<span style={{ color: "#60A5FA" }}>AI</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5 }}>Plan your school bus routes</div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1.5, color: "#93C5FD" }}>
            and track every bus live
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#CBD5E1" }}>
          Route planning and live tracking for schools in Qatar
        </div>
      </div>
    ),
    size
  )
}
