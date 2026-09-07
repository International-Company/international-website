import Link from "next/link";
import { prisma, safeDb, hasDb } from "@/lib/db";
import { logoutAction } from "../actions";

/**
 * Shared frame for every admin screen: sidebar on desktop, a scrolling pill
 * bar on phones, plus the page title and actions. Pages render only their own
 * content and let this handle navigation.
 *
 * Navigation is words, not pictures: seven labelled destinations read faster
 * than seven glyphs a reader has to learn.
 */

type NavItem = { href: string; label: string; exact?: boolean };

const NAV: NavItem[] = [
  { href: "/admin", label: "نظرة عامة", exact: true },
  { href: "/admin/rates", label: "أسعار الشركة" },
  { href: "/admin/requests", label: "الطلبات" },
  { href: "/admin/content", label: "محتوى الموقع" },
  { href: "/admin/contact", label: "تواصل معنا" },
  { href: "/admin/media", label: "الصور" },
  { href: "/admin/settings", label: "الإعدادات" },
];

export default async function Chrome({
  active,
  title,
  subtitle,
  actions,
  children,
}: {
  /** Href of the current screen, matched against the nav. */
  active: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const newCount = await safeDb(
    () => prisma.request.count({ where: { status: "NEW" } }),
    0
  );

  const links = NAV.map((item) => {
    const on = item.exact ? active === item.href : active.startsWith(item.href);
    return (
      <Link key={item.href} href={item.href} className={on ? "on" : ""}>
        {item.label}
        {item.href === "/admin/requests" && newCount > 0 && (
          <span className="pill">{newCount}</span>
        )}
      </Link>
    );
  });

  const brand = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.png" alt="" />
      <div>
        <b>لوحة التحكم</b>
        <span>إنترنشونال</span>
      </div>
    </>
  );

  return (
    <div className="a-shell">
      <aside className="a-side">
        <div className="a-side-brand">{brand}</div>

        <nav className="a-nav">
          <div className="a-nav-label">الإدارة</div>
          {links}
        </nav>

        <div className="a-side-foot">
          <Link href="/ar" className="a-btn ghost sm" target="_blank">
            عرض الموقع
          </Link>
          <form action={logoutAction}>
            <button className="a-btn ghost sm wide" type="submit">
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      <main className="a-main">
        <div className="a-mobile-head">
          <div className="brand">{brand}</div>
          <form action={logoutAction}>
            <button className="a-btn ghost sm" type="submit">
              خروج
            </button>
          </form>
        </div>
        <nav className="a-mobile-nav">{links}</nav>

        <div className="a-topbar">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="a-topbar-actions">{actions}</div>}
        </div>

        {!hasDb && (
          <div className="a-error">
            قاعدة البيانات غير متصلة — لن يُحفظ أي تعديل. أضف متغير{" "}
            <code>DATABASE_URL</code> في إعدادات الاستضافة لتفعيل الحفظ.
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
