import Link from "next/link";
import type { Dict } from "@/dictionaries";
import type { Locale } from "@/lib/i18n";

export default function Footer({ dict, locale }: { dict: Dict; locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href={`/${locale}`} className="logo">
              <span className="en-name">{dict.brand.en}</span>
              <span className="ar-name">{dict.brand.ar}</span>
            </Link>
            <p>{dict.footer.blurb}</p>
          </div>
          <div>
            <h5>{dict.footer.company}</h5>
            <ul>
              <li><Link href={`/${locale}/about`}>{dict.nav.about}</Link></li>
              <li><Link href={`/${locale}#network`}>{dict.nav.network}</Link></li>
              <li><Link href={`/${locale}/about`}>{dict.footer.licenses}</Link></li>
              <li><Link href={`/${locale}/legal`}>{dict.footer.legal}</Link></li>
            </ul>
          </div>
          <div>
            <h5>{dict.footer.servicesCol}</h5>
            <ul>
              {dict.services.items.map((s) => (
                <li key={s.en}>
                  <Link href={`/${locale}/services`}>{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>{dict.footer.contactCol}</h5>
            <ul>
              <li><Link href={`/${locale}/contact`}>{dict.footer.callUs}</Link></li>
              <li><Link href={`/${locale}/contact#branches`}>{dict.footer.branches}</Link></li>
              <li><Link href={`/${locale}/contact`}>{dict.footer.careers}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{dict.footer.rights}</span>
          <span className="en" style={{ letterSpacing: ".14em", fontSize: "11px" }}>
            {dict.footer.holding}
          </span>
        </div>
      </div>
    </footer>
  );
}
