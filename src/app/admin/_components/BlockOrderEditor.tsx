"use client";

import { useActionState, useState } from "react";
import { CONTACT_BLOCKS, type BlockId } from "@/lib/contact-layout";
import { saveBlockOrderAction } from "../actions";

/**
 * Sets the order the contact page stacks its three blocks in.
 *
 * Drag to reorder on a desktop; the arrows do the same thing and are the only
 * way that works on a touch screen or a keyboard, so they are not a fallback
 * hidden away — they sit right there on every row.
 */
export default function BlockOrderEditor({
  order,
  disabled,
}: {
  order: BlockId[];
  disabled?: boolean;
}) {
  const [rows, setRows] = useState<BlockId[]>(order);
  const [dragging, setDragging] = useState<BlockId | null>(null);
  const [state, formAction, pending] = useActionState(saveBlockOrderAction, null);

  const move = (from: number, to: number) =>
    setRows((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

  const label = (id: BlockId) => CONTACT_BLOCKS.find((b) => b.id === id)!;

  return (
    <form action={formAction}>
      <input type="hidden" name="order" value={rows.join(",")} />

      <ol className="a-order">
        {rows.map((id, index) => {
          const block = label(id);
          return (
            <li
              key={id}
              className={`a-order-row${dragging === id ? " is-dragging" : ""}`}
              draggable={!disabled}
              onDragStart={() => setDragging(id)}
              onDragEnd={() => setDragging(null)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragging && dragging !== id) {
                  move(rows.indexOf(dragging), index);
                }
              }}
              onDrop={(e) => e.preventDefault()}
            >
              <span className="a-order-grip" aria-hidden title="اسحب لإعادة الترتيب">
                ⠿
              </span>
              <span className="a-order-pos">{index + 1}</span>
              <span className="a-order-name">
                <b>{block.label}</b>
                <small>{block.hint}</small>
              </span>
              <span className="a-row-tools">
                <button
                  type="button"
                  className="a-icon-btn"
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`نقل ${block.label} لأعلى`}
                  title="لأعلى"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="a-icon-btn"
                  onClick={() => move(index, index + 1)}
                  disabled={index === rows.length - 1}
                  aria-label={`نقل ${block.label} لأسفل`}
                  title="لأسفل"
                >
                  ↓
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="a-savebar">
        <span className="tip">
          {state?.saved && !pending
            ? "تم الحفظ — الترتيب مطبَّق على صفحة التواصل وبطاقة الباركود"
            : "الترتيب نفسه يُطبَّق على صفحة التواصل وعلى صفحة الباركود"}
        </span>
        <button className="a-btn" type="submit" disabled={pending || disabled}>
          {pending ? "جارٍ الحفظ..." : "حفظ الترتيب"}
        </button>
      </div>
    </form>
  );
}
