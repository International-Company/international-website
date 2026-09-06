"use client";

import { useState, useTransition } from "react";
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
  icon: "",
  nameAr: "",
  nameEn: "",
  phone: "",
  whatsapp: "",
  email: "",
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
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const add = () =>
    setRows((prev) => [
      ...prev,
      { key: `n${Date.now().toString(36)}`, value: { ...EMPTY } },
    ]);

  const remove = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

  const move = (index: number, delta: number) =>
    setRows((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  /** Keeps the row header in sync while the name is being typed. */
  const rename = (key: string, name: string) =>
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, value: { ...r.value, nameAr: name } } : r))
    );

  function onSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await saveDepartmentsAction(formData);
      setSaved(true);
    });
  }

  return (
    <form action={onSubmit}>
      <input type="hidden" name="order" value={rows.map((r) => r.key).join(",")} />

      <div className="a-list-head">
        <b>أقسام الشركة</b>
        <span className="a-list-count">{rows.length}</span>
      </div>

      {rows.length === 0 && (
        <div className="a-note">لا توجد أقسام — أضف قسمًا ليظهر في صفحة «تواصل معنا».</div>
      )}

      {rows.map((row, index) => (
        <div className="a-row" key={row.key}>
          <div className="a-row-head">
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
            <label className="a-field compact">
              <span className="a-field-label">الأيقونة</span>
              <input
                name={`dept_${row.key}_icon`}
                type="text"
                defaultValue={row.value.icon}
                dir="auto"
              />
              <small className="a-field-hint">إيموجي واحد</small>
            </label>

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
          </div>
        </div>
      ))}

      <button type="button" className="a-btn ghost sm" onClick={add}>
        ＋ إضافة قسم
      </button>

      <div className="a-savebar">
        <span className="tip">
          {saved && !pending
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
