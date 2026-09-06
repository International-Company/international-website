import type { Dict } from "@/dictionaries";
import { getPath } from "./content";
import { groupBlocks, type Field, type Group } from "./content-schema";
import type { EditorData, Row } from "@/app/admin/_components/ContentEditor";

/** Renders a dictionary value as the text the matching input should show. */
function toInput(value: unknown, field: Field): string {
  if (field.type === "lines") {
    return Array.isArray(value) ? value.join("\n") : "";
  }
  if (value == null) return "";
  return typeof value === "object" ? "" : String(value);
}

/**
 * Flattens the merged dictionary into the flat map the editor renders from.
 * Existing list rows keep their index in the key (`r0`, `r1`, …) so the save
 * action can find the original object and preserve fields the editor hides.
 */
export function buildEditorData(group: Group, dict: Dict): EditorData {
  const fields: Record<string, string> = {};
  const lists: Record<string, Row[]> = {};

  for (const block of groupBlocks(group)) {
    if (block.kind === "fields") {
      for (const field of block.fields) {
        fields[field.path] = toInput(getPath(dict, field.path), field);
      }
      continue;
    }

    const source = getPath(dict, block.path);
    const rows: Row[] = [];

    if (Array.isArray(source)) {
      source.forEach((item, index) => {
        const values: Record<string, string> = {};
        for (const field of block.fields) {
          values[field.path] = toInput(getPath(item, field.path), field);
        }
        rows.push({ key: `r${index}`, values });
      });
    }

    lists[block.path] = rows;
  }

  return { fields, lists };
}
