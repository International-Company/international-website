"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { Dict } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ dict, locale }: { dict: Dict; locale: Locale }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const otherLocale: Locale = locale === "ar" ? "en" : "ar";
  const rest = pathname.replace(new RegExp(`^/${locale}`), "") || "";
  const switchHref = `/${otherLocale}${rest}`;

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/about`, label: dict.nav.about },
    { href: `/${locale}/services`, label: dict.nav.services },
    { href: `/${locale}#network`, label: dict.nav.network },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  const isActive = (href: string) =>
    !href.includes("#") && (href === `/${locale}` ? pathname === href : pathname.startsWith(href));

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <Link href={`/${locale}`} className="logo">
            <Image
              src="/images/logo.png"
              alt={dict.brand.ar}
              width={44}
              height={44}
              className="logo-img"
              priority
            />
            <span className="logo-text">
              <span className="en-name">{dict.brand.en}</span>
              <span className="ar-name">{dict.brand.ar}</span>
            </span>
          </Link>

          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={isActive(l.href) ? "active" : ""}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <div className="lang-pill">
              <Link href={`/ar${rest}`} className={locale === "ar" ? "active" : ""}>
                عربي
              </Link>
              <Link href={`/en${rest}`} className={locale === "en" ? "active" : ""}>
                EN
              </Link>
            </div>
            <ThemeToggle />
            <button
              className={`menu-btn${open ? " open" : ""}`}
              onClick={() => setOpen(!open)}
              aria-label={dict.nav.menu}
              aria-expanded={open}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu${open ? " open" : ""}`}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        <Link href={switchHref} className="en" onClick={() => setOpen(false)}>
          {otherLocale === "ar" ? "العربية" : "English"}
        </Link>
      </div>
    </>
  );
}
