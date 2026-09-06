import { NextResponse } from "next/server";
import { prisma, safeDb, hasDb } from "@/lib/db";
import { isMediaSlot } from "@/lib/media";

/**
 * Serves an image uploaded from the admin panel.
 *
 * The URL always carries a `?v=` stamp that changes on every upload, so the
 * response is safe to cache immutably — a replaced image reaches visitors as
 * soon as the page referencing it re-renders.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slot: string }> }
) {
  const { slot } = await params;

  if (!isMediaSlot(slot)) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!hasDb) {
    return new NextResponse("No database", { status: 404 });
  }

  const row = await safeDb(
    () => prisma.media.findUnique({ where: { slot } }),
    null
  );
  if (!row) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(row.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
