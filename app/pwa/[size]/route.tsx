import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const px = size === "512" ? 512 : 192;
  const u = px / 32;
  return new ImageResponse(
    (
      <div style={{ width: px, height: px, background: "#fbfafd", display: "flex" }}>
        <svg width={px} height={px} viewBox="0 0 32 32">
          <rect x="2" y="6" width="19" height="19" rx="6" fill="#2d1b5e" />
          <rect x="11" y="2" width="19" height="19" rx="6" fill="#c1294a" />
          <path d="M17 11.5l3.2 3.2 5.3-6" stroke="#fff" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { width: px, height: px },
  );
}
