import { NextRequest, NextResponse } from "next/server";
import { prisma, hasDb } from "@/lib/db";

const SERVICES = ["remittances", "transfers", "exchange", "gold"];

/** Accepts a structured service request from the public site. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim().slice(0, 120);
    const phone = String(body.phone ?? "").trim().slice(0, 40);
    const service = SERVICES.includes(String(body.service)) ? String(body.service) : "remittances";

    if (name.length < 2 || phone.length < 6) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }

    const data = {
      service,
      name,
      phone,
      amount: body.amount ? String(body.amount).trim().slice(0, 40) : null,
      currency: body.currency ? String(body.currency).trim().slice(0, 16) : null,
      country: body.country ? String(body.country).trim().slice(0, 80) : null,
      recipient: body.recipient ? String(body.recipient).trim().slice(0, 120) : null,
      note: body.note ? String(body.note).trim().slice(0, 800) : null,
    };

    if (!hasDb) {
      // No database configured yet — don't fail the visitor, log for follow-up.
      console.warn("[requests] DB not configured, dropping request:", data);
      return NextResponse.json({ ok: true, stored: false });
    }

    await prisma.request.create({ data });
    return NextResponse.json({ ok: true, stored: true });
  } catch (err) {
    console.error("[requests] failed:", err);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }
}
