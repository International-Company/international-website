"use client";

import { useRef, useState, useTransition } from "react";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from "@/lib/media-constants";

/**
 * Picks an image and submits it straight away — one interaction instead of
 * "choose file" then "upload". Oversized or wrong-typed files are rejected in
 * the browser so the admin gets a reason instead of a silent no-op.
 */
export default function UploadField({
  slot,
  action,
  disabled,
}: {
  slot: string;
  action: (formData: FormData) => Promise<void>;
  disabled?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    if (!file) return;

    if (!ALLOWED_MIME.includes(file.type)) {
      setError("صيغة غير مدعومة — استخدم JPG أو PNG أو WebP أو SVG.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(
        `حجم الصورة ${(file.size / 1024 / 1024).toFixed(1)} م.ب — الحد الأقصى ${Math.round(
          MAX_UPLOAD_BYTES / 1024 / 1024
        )} م.ب.`
      );
      event.target.value = "";
      return;
    }

    const form = formRef.current;
    if (!form) return;
    startTransition(async () => {
      await action(new FormData(form));
      event.target.value = "";
    });
  }

  return (
    <form ref={formRef} action={action} className="a-upload">
      <input type="hidden" name="slot" value={slot} />
      <label className={`a-btn sm wide${pending ? " is-busy" : ""}`}>
        {pending ? "جارٍ الرفع..." : "رفع صورة جديدة"}
        <input
          type="file"
          name="file"
          accept={ALLOWED_MIME.join(",")}
          onChange={onPick}
          disabled={disabled || pending}
          hidden
        />
      </label>
      {error && <p className="a-upload-error">{error}</p>}
    </form>
  );
}
