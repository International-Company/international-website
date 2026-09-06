import Link from "next/link";
import { getAnnouncement } from "@/lib/site-config";
import type { Locale } from "@/lib/i18n";

/**
 * Optional strip above the navbar for a notice the admin panel controls —
 * a holiday closure, a promotion, a new branch. Renders nothing until it is
 * switched on with text for the visitor's language.
 */
export default async function AnnounceBar({ locale }: { locale: Locale }) {
  const a = await getAnnouncement();
  if (!a.enabled) return null;

  const text = (locale === "ar" ? a.ar : a.en).trim() || a.ar.trim() || a.en.trim();
  if (!text) return null;

  const body = (
    <>
      <span className="ann-dot" aria-hidden />
      <span className="ann-text">{text}</span>
      {a.href && <span className="ann-go" aria-hidden>→</span>}
    </>
  );

  return (
    <div className={`announce announce-${a.tone}`} role="status">
      {a.href ? (
        <Link href={a.href} className="ann-inner">
          {body}
        </Link>
      ) : (
        <div className="ann-inner">{body}</div>
      )}
    </div>
  );
}
