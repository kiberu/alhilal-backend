import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "radial-gradient(circle at 18% 24%, rgba(249,160,40,0.28), transparent 26%), linear-gradient(135deg, #3d091e 0%, #6f0032 42%, #970246 100%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: "56px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "32px",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "28px",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div
              style={{
                borderRadius: "22px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "18px 24px",
              }}
            >
              <div style={{ fontSize: "30px", fontWeight: 700, letterSpacing: "-0.04em" }}>Al Hilal</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "22px", letterSpacing: "0.28em", textTransform: "uppercase", opacity: 0.76 }}>
                Al Hilal Travels Uganda
              </div>
              <div style={{ fontSize: "28px", fontWeight: 700 }}>Guided Umrah and Hajj from Kampala</div>
            </div>
          </div>

          <div style={{ maxWidth: "860px", display: "flex", flexDirection: "column", gap: "22px" }}>
            <div style={{ fontSize: "76px", lineHeight: 1, fontWeight: 700 }}>Plan your journey with a team that keeps worship first.</div>
            <div style={{ fontSize: "28px", lineHeight: 1.35, opacity: 0.86 }}>
              See journeys, check dates and pricing, and speak to Al Hilal on WhatsApp with clear planning and family-aware care.
            </div>
          </div>

          <div style={{ display: "flex", gap: "18px", fontSize: "22px", opacity: 0.9 }}>
            <span>Journeys</span>
            <span>•</span>
            <span>Guidance</span>
            <span>•</span>
            <span>WhatsApp</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
