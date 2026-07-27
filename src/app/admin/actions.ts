"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { checkPassword, createSession, destroySession, isAuthed } from "@/lib/auth";
import { DEFAULT_RATES } from "@/lib/rates-data";

async function requireAuth() {
  if (!(await isAuthed())) throw new Error("unauthorized");
}

function refreshPublic() {
  revalidatePath("/admin");
  revalidatePath("/ar/rates");
  revalidatePath("/en/rates");
  revalidatePath("/ar");
  revalidatePath("/en");
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "كلمة المرور غير صحيحة" };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/** Saves every rate row submitted from the admin table. */
export async function saveRatesAction(formData: FormData) {
  await requireAuth();

  const codes = formData.getAll("code").map(String);
  for (const code of codes) {
    const buy = parseFloat(String(formData.get(`buy_${code}`) ?? ""));
    const sell = parseFloat(String(formData.get(`sell_${code}`) ?? ""));
    const active = formData.get(`active_${code}`) === "on";
    if (!Number.isFinite(buy) || !Number.isFinite(sell)) continue;

    await prisma.rate.update({
      where: { code },
      data: { buy, sell, active },
    });
  }

  refreshPublic();
}

/** Creates the default rate rows the first time the panel is used. */
export async function seedRatesAction() {
  await requireAuth();
  for (const r of DEFAULT_RATES) {
    await prisma.rate.upsert({
      where: { code: r.code },
      update: {},
      create: {
        code: r.code,
        nameAr: r.nameAr,
        nameEn: r.nameEn,
        buy: r.buy,
        sell: r.sell,
        unit: r.unit,
        sort: r.sort,
        active: r.active,
      },
    });
  }
  refreshPublic();
}

export async function setRequestStatusAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = ["NEW", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
  if (!id || !allowed.includes(status as (typeof allowed)[number])) return;

  await prisma.request.update({
    where: { id },
    data: { status: status as (typeof allowed)[number] },
  });
  revalidatePath("/admin");
}

export async function deleteRequestAction(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.request.delete({ where: { id } });
  revalidatePath("/admin");
}
