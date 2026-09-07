"use client";

import { useActionState, useState } from "react";
import type { Department } from "@/lib/contact-config";
import { saveDepartmentsAction } from "../actions";

/**
 * Repeatable editor for the department phone list.
 *
 * Rows carry a stable key that also names their inputs, and the visible order
 * travels in a hidden field — so the server rebuilds the list from one form
 * post without needing to know how the rows were shuffled.
 */

type Row = { key: string; value: Department };

const EMPTY: Department = {
  // Kept in the shape for stored rows, though the card no longer draws it.
  icon: "",
  nameAr: "",
  nameEn: "",
  personAr: "",
  personEn: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
};

export default function DepartmentsEditor({
  departments,
  disabled,
}: {
  departments: Department[];
  disabled?: boolean;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    departments.map((value, i) => ({ key: `r${i}`, value }))
  );
  const [dragging, setDragging] = useState<string | null>(null);
  // The server action is passed to the form directly rather than wrapped in a
  // client handler, so a click that lands before hydration still submits.
  const [state, formAction, pending] = useActionState(saveDepartmentsAction, null);

  const add = () =>
    setRows((prev) => [
      ...prev,
      { key: `n${Date.now().toString(36)}`, value: { ...EMPTY } },
    ]);

  const remove = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

  const move = (index: number, delta: number) => reorder(index, index + delta);

  /** Lifts one row out and drops it in at `to`, keeping the rest in sequence. */
  const reorder = (from: number, to: number) =>
    setRows((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

  /** Keeps the row header in sync while the name is being typed. */
  const rename = (key: string, name: string) =>
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, value: { ...r.value, nameAr: name } } : r))
    );

  return (
    <form action={formAction}>
      <input type="hidden" name="order" value={rows.map((r) => r.key).join(",")} />

      <div className="a-list-head">
        <b>أقسام الشركة</b>
        <span className="a-list-count">{rows.length}</span>
      </div>

      {rows.length === 0 && (
        <div className="a-note">لا توجد أقسام — أضف قسمًا ليظهر في صفحة «تواصل معنا».</div>
      )}

      {rows.map((row, index) => (
        <div
          className={`a-row${dragging === row.key ? " is-dragging" : ""}`}
          key={row.key}
          onDragOver={(e) => {
            e.preventDefault();
            if (dragging && dragging !== row.key) {
              reorder(rows.findIndex((r) => r.key === dragging), index);
            }
          }}
          onDrop={(e) => e.preventDefault()}
        >
          <div
            className="a-row-head"
            draggable
            onDragStart={() => setDragging(row.key)}
            onDragEnd={() => setDragging(null)}
          >
            <span className="a-row-grip" aria-hidden title="اسحب لإعادة الترتيب">
              ⠿
            </span>
            <span className="a-row-index">{index + 1}</span>
            <b className="a-row-title">{row.value.nameAr || "قسم بلا اسم"}</b>
            <div className="a-row-tools">
              <button
                type="button"
                className="a-icon-btn"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="تحريك لأعلى"
                title="تحريك لأعلى"
              >
                ↑
              </button>
              <button
                type="button"
                className="a-icon-btn"
                onClick={() => move(index, 1)}
                disabled={index === rows.length - 1}
                aria-label="تحريك لأسفل"
                title="تحريك لأسفل"
              >
                ↓
              </button>
              <button
                type="button"
                className="a-icon-btn danger"
                onClick={() => remove(row.key)}
                aria-label="حذف القسم"
                title="حذف القسم"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="a-fieldgrid">
            <label className="a-field">
              <span className="a-field-label">اسم القسم بالعربية</span>
              <input
                name={`dept_${row.key}_nameAr`}
                type="text"
                defaultValue={row.value.nameAr}
                dir="auto"
                onChange={(e) => rename(row.key, e.target.value)}
              />
            </label>

            <label className="a-field">
              <span className="a-field-label">اسم القسم بالإنجليزية</span>
              <input
                name={`dept_${row.key}_nameEn`}
                type="text"
                defaultValue={row.value.nameEn}
                dir="ltr"
              />
            </label>

            <label className="a-field">
              <span className="a-field-label">المسؤول عن القسم</span>
              <input
                name={`dept_${row.key}_personAr`}
                type="text"
                defaultValue={row.value.personAr}
                dir="auto"
                placeholder="مثال: أ. محمد العلي"
              />
              <small className="a-field-hint">اتركه فارغًا لإخفاء الاسم من البطاقة</small>
            </label>

            <label className="a-field">
              <span className="a-field-label">اسم المسؤول بالإنجليزية</span>
              <input
                name={`dept_${row.key}_personEn`}
                type="text"
                defaultValue={row.value.personEn}
                dir="ltr"
                placeholder="Mohammed Al-Ali"
              />
              <small className="a-field-hint">
                يُستخدم في النسخة الإنجليزية — إن تُرك فارغًا يظهر الاسم العربي
              </small>
            </label>

            <label className="a-field">
              <span className="a-field-label">رقم الهاتف</span>
              <input
                name={`dept_${row.key}_phone`}
                type="text"
                defaultValue={row.value.phone}
                dir="ltr"
                placeholder="+970 59 402 0634"
              />
              <small className="a-field-hint">يظهر كما تكتبه تمامًا</small>
            </label>

            <label className="a-field">
              <span className="a-field-label">رقم الواتساب</span>
              <input
                name={`dept_${row.key}_whatsapp`}
                type="text"
                defaultValue={row.value.whatsapp}
                dir="ltr"
                placeholder="972598650998"
              />
              <small className="a-field-hint">أرقام فقط — اتركه فارغًا لإخفاء الزر</small>
            </label>

            <label className="a-field">
              <span className="a-field-label">بريد القسم (اختياري)</span>
              <input
                name={`dept_${row.key}_email`}
                type="email"
                defaultValue={row.value.email}
                dir="ltr"
              />
            </label>

            <label className="a-field wide">
              <span className="a-field-label">رابط موقع خاص بالقسم (اختياري)</span>
              <input
                name={`dept_${row.key}_website`}
                type="text"
                defaultValue={row.value.website}
                dir="ltr"
                placeholder="https://gold-showroom.example.com"
              />
              <small className="a-field-hint">
                معرض أو كتالوج أو صفحة خاصة بالقسم — يظهر كزر «زيارة الموقع» على البطاقة
              </small>
            </label>
          </div>
        </div>
      ))}

      <button type="button" className="a-btn ghost sm" onClick={add}>
        ＋ إضافة قسم
      </button>

      <div className="a-savebar">
        <span className="tip">
          {state?.saved && !pending
            ? "✅ تم الحفظ — الأقسام ظاهرة في صفحة تواصل معنا"
            : "القسم الذي لا يحمل رقمًا أو واتساب لا يظهر للزوار"}
        </span>
        <button className="a-btn" type="submit" disabled={pending || disabled}>
          {pending ? "جارٍ الحفظ..." : "💾 حفظ الأقسام"}
        </button>
      </div>
    </form>
  );
}
