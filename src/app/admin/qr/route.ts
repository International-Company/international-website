import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { isLocale } from "@/lib/i18n";
import { cardQrPng, cardQrSvg } from "@/lib/qr";

/**
 * Downloads the contact card's QR code.
 *
 * `?format=svg` for a designer to place in artwork, PNG otherwise for a
 * sticker or a print shop. Behind the admin session, since the panel is where
 * it is offered.
 */
export async function GET(request: Request) {
  if (!(await isAuthed())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const raw = params.get("lang") ?? "ar";
  if (!isLocale(raw)) return new NextResponse("Bad locale", { status: 400 });

  const wantsSvg = params.get("format") === "svg";
  const size = Math.min(2048, Math.max(256, Number(params.get("size")) || 1024));
  const filename = `international-contact-${raw}${wantsSvg ? ".svg" : `-${size}.png`}`;

  const body: BodyInit = wantsSvg
    ? await cardQrSvg(raw)
    : new Uint8Array(await cardQrPng(raw, size));

  return new NextResponse(body, {
    headers: {
      "Content-Type": wantsSvg ? "image/svg+xml" : "image/png",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
