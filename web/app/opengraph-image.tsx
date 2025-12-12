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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #970246 0%, #7b013a 60%, #4a001f 100%)",
          position: "relative",
          color: "#ffffff",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
        }}
      >
        {/* subtle pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 55%), radial-gradient(circle at 80% 70%, rgba(255,215,0,0.10) 0%, rgba(255,215,0,0) 60%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 48,
            padding: 80,
          }}
        >
          {/* logo mark */}
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 999,
              backgroundColor: "#970246",
              border: "10px solid rgba(255,255,255,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            }}
          >
            <div
              style={{
                width: 170,
                height: 170,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 84,
                letterSpacing: -2,
              }}
            >
              AH
            </div>
          </div>

          {/* text */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760 }}>
            <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.05 }}>
              Al‑Hilal Travels Uganda
            </div>
            <div style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.25, opacity: 0.95 }}>
              Affordable Umrah & Hajj Packages from Kampala
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 22,
                opacity: 0.9,
                display: "flex",
                gap: 18,
              }}
            >
              <span>Visa Processing</span>
              <span style={{ opacity: 0.6 }}>•</span>
              <span>Accommodation</span>
              <span style={{ opacity: 0.6 }}>•</span>
              <span>Expert Guides</span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 60,
            bottom: 50,
            fontSize: 20,
            opacity: 0.85,
          }}
        >
          alhilaltravels.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
