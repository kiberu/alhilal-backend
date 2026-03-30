import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

async function getLogoDataUri() {
  const logoPath = path.join(process.cwd(), "public", "alhilal-assets", "LOGO-POTRAIT.svg");
  const logo = await readFile(logoPath, "utf8");

  return `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;
}

export default async function AppleIcon() {
  const logoSrc = await getLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#970246",
          borderRadius: 40,
          padding: "28px",
          boxSizing: "border-box",
        }}
      >
        <img
          src={logoSrc}
          alt="Al Hilal logo"
          width="124"
          height="124"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size
  );
}
