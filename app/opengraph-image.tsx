import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Urlitrim - URL Shortener";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
          position: "relative",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Logo text */}
          <div
            style={{
              fontSize: 120,
              fontWeight: 800,
              background: "linear-gradient(90deg, #3b82f6, #06b6d4, #14b8a6)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.02em",
            }}
          >
            Urlitrim
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 36,
              color: "#a1a1aa",
              marginTop: 20,
            }}
          >
            Free URL Shortener with Analytics
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 50,
              fontSize: 24,
              color: "#71717a",
            }}
          >
            <span>Click Tracking</span>
            <span style={{ color: "#3f3f46" }}>•</span>
            <span>Password Protection</span>
            <span style={{ color: "#3f3f46" }}>•</span>
            <span>Free</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
