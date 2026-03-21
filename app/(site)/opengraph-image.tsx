import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "NECVA 線上實戰學習平台";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  let fontData: ArrayBuffer | undefined;
  try {
    const res = await fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-tc@5.2.5/files/noto-sans-tc-chinese-traditional-700-normal.woff",
    );
    if (res.ok) fontData = await res.arrayBuffer();
  } catch {
    /* 無網路時改以英文文案渲染 */
  }

  const fontFamily = fontData ? "NecvaOg" : "system-ui";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background:
            "linear-gradient(135deg, #0056b3 0%, #004494 55%, #003d7a 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            bottom: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(255, 138, 0, 0.22)",
          }}
        />
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            fontFamily,
          }}
        >
          NECVA
        </div>
        {fontData ? (
          <>
            <div
              style={{
                marginTop: 20,
                fontSize: 34,
                fontWeight: 700,
                color: "#ffcc99",
                maxWidth: 900,
                lineHeight: 1.35,
                fontFamily,
              }}
            >
              線上實戰學習平台
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 22,
                color: "rgba(255,255,255,0.88)",
                maxWidth: 820,
                lineHeight: 1.45,
                fontFamily,
              }}
            >
              與產業接軌的實戰課程 · 隨時隨地精進技能
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                marginTop: 20,
                fontSize: 32,
                fontWeight: 700,
                color: "#ffcc99",
                maxWidth: 900,
                lineHeight: 1.35,
                fontFamily,
              }}
            >
              Hands-on online learning
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 22,
                color: "rgba(255,255,255,0.88)",
                maxWidth: 820,
                lineHeight: 1.45,
                fontFamily,
              }}
            >
              Practical courses aligned with industry — learn anywhere
            </div>
          </>
        )}
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "NecvaOg",
              data: fontData,
              style: "normal",
              weight: 700,
            },
          ]
        : [],
    },
  );
}
