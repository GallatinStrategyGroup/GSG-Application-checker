import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Gallatin Strategy Group — College application review by real counselors";

// Social-share (OpenGraph) image, generated at request/build time.
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
          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 55%)",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "#1d4ed8",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              fontWeight: 700,
              fontFamily: "Georgia, serif",
            }}
          >
            G
          </div>
          <div style={{ fontSize: "30px", fontWeight: 600, color: "#0f172a" }}>
            Gallatin Strategy Group
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "68px",
            fontWeight: 600,
            lineHeight: 1.1,
            color: "#0f172a",
            fontFamily: "Georgia, serif",
            maxWidth: "900px",
          }}
        >
          College applications, reviewed by the best counselors in the country.
        </div>

        <div style={{ display: "flex", fontSize: "28px", color: "#475569" }}>
          Real counselors · Feedback in ~2 days · Private &amp; secure
        </div>
      </div>
    ),
    { ...size },
  );
}
