"use client";

import { useActionState, useState } from "react";
import type { Block, Field, Group, ListBlock } from "@/lib/content-schema";
import { saveContentAction } from "../actions";

/**
 * Generated editor for one content group.
 *
 * Every input is named `f:<dot path>` so the server action can rebuild the
 * patch without knowing anything about this markup. List rows carry a key —
 * `r<index>` for a row that already exists, `n<counter>` for a new one — and
 * the row order travels in a hidden `order:<path>` field, which is what makes
 * adding, deleting and reordering work with a plain form post.
 */

export type Row = { key: string; values: Record<string, string> };

/** Prepared values for one group: scalars by path, plus rows for each list. */
export type EditorData = {
  fields: Record<string, string>;
  lists: Record<string, Row[]>;
};

export default function ContentEditor({
  group,
  locale,
  data,
  disabled,
}: {
  group: Group;
  locale: string;
  data: EditorData;
  disabled?: boolean;
}) {
  const [lists, setLists] = useState(data.lists);
  // Passed straight to the form so a pre-hydration click still saves.
  const [state, formAction, pending] = useActionState(saveContentAction, null);

  const mutate = (path: string, next: Row[]) =>
    setLists((prev) => ({ ...prev, [path]: next }));

  function addRow(block: ListBlock) {
    const rows = lists[block.path] ?? [];
    if (block.max && rows.length >= block.max) return;
    const values: Record<string, string> = {};
    for (const f of block.fields) values[f.path] = "";
    mutate(block.path, [...rows, { key: `n${Date.now().toString(36)}`, values }]);
  }

  function removeRow(block: ListBlock, key: string) {
    mutate(
      block.path,
      (lists[block.path] ?? []).filter((r) => r.key !== key)
    );
  }

  function moveRow(block: ListBlock, index: number, delta: number) {
    const rows = [...(lists[block.path] ?? [])];
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    [rows[index], rows[target]] = [rows[target], rows[index]];
    mutate(block.path, rows);
  }

  return (
    <form action={formAction} className="a-editor">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="group" value={group.id} />

      {group.sections.map((section) => (
        <section className="a-card" key={section.title}>
          <div className="a-card-head">
            <div>
              <h2>{section.title}</h2>
            </div>
          </div>
          <div className="a-card-body">
            {section.blocks.map((block, i) =>
              block.kind === "fields" ? (
                <div className="a-fieldgrid" key={i}>
                  {block.fields.map((field) => (
                    <FieldInput
                      key={field.path}
                      name={`f:${field.path}`}
                      field={field}
                      value={data.fields[field.path] ?? ""}
                    />
                  ))}
                </div>
              ) : (
                <ListEditor
                  key={block.path}
                  block={block}
                  rows={lists[block.path] ?? []}
                  onAdd={() => addRow(block)}
                  onRemove={(key) => removeRow(block, key)}
                  onMove={(index, delta) => moveRow(block, index, delta)}
                />
              )
            )}
          </div>
        </section>
      ))}

      <div className="a-savebar sticky">
        <span className="tip">
          {state?.saved && !pending
            ? "✅ تم الحفظ — التغييرات ظاهرة في الموقع الآن"
            : "التغييرات تظهر في الموقع فور الحفظ"}
        </span>
        <button className="a-btn" type="submit" disabled={pending || disabled}>
          {pending ? "جارٍ الحفظ..." : "💾 حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}

/* ── one input ─────────────────────────────────────────────────────────── */

function FieldInput({
  name,
  field,
  value,
}: {
  name: string;
  field: Field;
  value: string;
}) {
  const isArea = field.type === "area" || field.type === "lines";
  const width = isArea ? " wide" : field.compact ? " compact" : "";

  return (
    <label className={`a-field${width}`}>
      <span className="a-field-label">{field.label}</span>
      {isArea ? (
        <textarea
          name={name}
          defaultValue={value}
          rows={field.type === "lines" ? 4 : 3}
          dir="auto"
        />
      ) : (
        <input
          name={name}
          type="text"
          defaultValue={value}
          dir="auto"
          inputMode={field.type === "num" ? "decimal" : undefined}
        />
      )}
      {field.hint && <small className="a-field-hint">{field.hint}</small>}
    </label>
  );
}

/* ── repeatable rows ───────────────────────────────────────────────────── */

function ListEditor({
  block,
  rows,
  onAdd,
  onRemove,
  onMove,
}: {
  block: ListBlock;
  rows: Row[];
  onAdd: () => void;
  onRemove: (key: string) => void;
  onMove: (index: number, delta: number) => void;
}) {
  const full = Boolean(block.max && rows.length >= block.max);

  return (
    <div className="a-list">
      <input
        type="hidden"
        name={`order:${block.path}`}
        value={rows.map((r) => r.key).join(",")}
      />

      <div className="a-list-head">
        <b>{block.label}</b>
        <span className="a-list-count">{rows.length}</span>
      </div>

      {rows.length === 0 && (
        <div className="a-note">لا توجد عناصر — أضف {block.itemLabel} للبدء.</div>
      )}

      {rows.map((row, index) => (
        <div className="a-row" key={row.key}>
          <div className="a-row-head">
            <span className="a-row-index">{index + 1}</span>
            <b className="a-row-title">
              {row.values[block.titleField] || `${block.itemLabel} بلا عنوان`}
            </b>
            <div className="a-row-tools">
              <button
                type="button"
                className="a-icon-btn"
                onClick={() => onMove(index, -1)}
                disabled={index === 0}
                aria-label="تحريك لأعلى"
                title="تحريك لأعلى"
              >
                ↑
              </button>
              <button
                type="button"
                className="a-icon-btn"
                onClick={() => onMove(index, 1)}
                disabled={index === rows.length - 1}
                aria-label="تحريك لأسفل"
                title="تحريك لأسفل"
              >
                ↓
              </button>
              {block.addable && (
                <button
                  type="button"
                  className="a-icon-btn danger"
                  onClick={() => onRemove(row.key)}
                  aria-label={`حذف ${block.itemLabel}`}
                  title={`حذف ${block.itemLabel}`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="a-fieldgrid">
            {block.fields.map((field) => (
              <FieldInput
                key={field.path}
                name={`f:${block.path}[${row.key}].${field.path}`}
                field={field}
                value={row.values[field.path] ?? ""}
              />
            ))}
          </div>
        </div>
      ))}

      {block.addable && (
        <button type="button" className="a-btn ghost sm" onClick={onAdd} disabled={full}>
          ＋ إضافة {block.itemLabel}
          {full && ` (الحد الأقصى ${block.max})`}
        </button>
      )}
    </div>
  );
}
