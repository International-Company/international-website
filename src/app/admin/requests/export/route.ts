import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { prisma, safeDb } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";
import { SERVICE_AR, STATUS_AR } from "../../_components/labels";

/**
 * Downloads the filtered request list as a CSV that opens cleanly in Excel.
 *
 * Excel decides the encoding from a byte-order mark, so the file starts with
 * one — without it every Arabic name arrives as mojibake.
 */

const COLUMNS = [
  "التاريخ",
  "الاسم",
  "الهاتف",
  "الخدمة",
  "المبلغ",
  "العملة",
  "الوجهة",
  "المستلم",
  "الحالة",
  "ملاحظات",
];

/** Quotes a value, and blocks the leading characters Excel treats as formulas. */
function cell(value: string | null | undefined): string {
  const text = (value ?? "").replace(/\r?\n/g, " ").trim();
  const safe = /^[=+\-@\t]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  if (!(await isAuthed())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const status = params.get("status") ?? "";
  const service = params.get("service") ?? "";
  const q = (params.get("q") ?? "").trim();

  const where: Prisma.RequestWhereInput = {
    ...(STATUS_AR[status] ? { status: status as Prisma.EnumRequestStatusFilter["equals"] } : {}),
    ...(SERVICE_AR[service] ? { service } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q } },
            { recipient: { contains: q, mode: "insensitive" as const } },
            { country: { contains: q, mode: "insensitive" as const } },
            { note: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const rows = await safeDb(
    () => prisma.request.findMany({ where, orderBy: { createdAt: "desc" } }),
    [] as Awaited<ReturnType<typeof prisma.request.findMany>>
  );

  const fmt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const lines = [
    COLUMNS.map(cell).join(","),
    ...rows.map((r) =>
      [
        fmt.format(r.createdAt),
        r.name,
        r.phone,
        SERVICE_AR[r.service] ?? r.service,
        r.amount,
        r.currency,
        r.country,
        r.recipient,
        STATUS_AR[r.status] ?? r.status,
        r.note,
      ]
        .map(cell)
        .join(",")
    ),
  ];

  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="requests-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
