import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import { MEDIA_SLOTS, defaultImages, listMedia } from "@/lib/media";
import { MAX_UPLOAD_BYTES } from "@/lib/media-constants";
import Chrome from "../_components/Chrome";
import { arDateTime } from "../_components/labels";
import { deleteMediaAction, uploadMediaAction } from "../actions";
import UploadField from "../_components/UploadField";

export const dynamic = "force-dynamic";

const kb = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} م.ب`
    : `${Math.round(bytes / 1024)} ك.ب`;

export default async function AdminMediaPage() {
  if (!(await isAuthed())) redirect("/admin/login");

  const uploads = await listMedia();
  const byslot = new Map(uploads.map((u) => [u.slot, u]));
  const fallbacks = defaultImages();

  return (
    <Chrome
      active="/admin/media"
      title="صور الموقع"
      subtitle="استبدل أي صورة في الموقع برفع صورة جديدة مكانها"
    >
      <div className="a-note">
        الصيغ المقبولة: JPG · PNG · WebP · SVG — والحد الأقصى{" "}
        {Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} ميغابايت للصورة الواحدة. تُحفظ الصور في
        قاعدة البيانات فتبقى بعد كل تحديث للموقع.
      </div>

      <div className="a-media-grid">
        {MEDIA_SLOTS.map((slot) => {
          const upload = byslot.get(slot.slot);
          const src = upload
            ? `/api/media/${slot.slot}?v=${upload.version}`
            : fallbacks[slot.slot];

          return (
            <section className="a-card a-media" key={slot.slot}>
              <div className="a-card-head">
                <div>
                  <h2>{slot.label}</h2>
                  <div className="hint">{slot.hint}</div>
                </div>
                {upload && <span className="a-badge b-DONE">مُستبدلة</span>}
              </div>

              <div className="a-card-body">
                <div className={`a-media-preview shape-${slot.shape}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={slot.label} loading="lazy" />
                </div>

                <div className="a-media-meta">
                  {upload ? (
                    <>
                      <span>{kb(upload.size)}</span>
                      <span>·</span>
                      <span>{arDateTime(upload.updatedAt)}</span>
                    </>
                  ) : (
                    <span>الصورة الأصلية المرفقة مع الموقع</span>
                  )}
                </div>

                <UploadField slot={slot.slot} action={uploadMediaAction} disabled={!hasDb} />

                {upload && (
                  <form action={deleteMediaAction}>
                    <input type="hidden" name="slot" value={slot.slot} />
                    <button className="a-btn ghost sm wide" type="submit">
                      استعادة الصورة الأصلية
                    </button>
                  </form>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </Chrome>
  );
}
