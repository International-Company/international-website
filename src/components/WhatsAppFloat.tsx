import { WHATSAPP_NUMBER } from "@/lib/site";

/** Floating WhatsApp button — brand-green with a real WhatsApp glyph. */
export default function WhatsAppFloat({ label }: { label: string }) {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float"
      aria-label={label}
      title={label}
    >
      <svg
        className="wico"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M12 2.75a9.25 9.25 0 0 0-8.02 13.86L2.8 20.6a.6.6 0 0 0 .74.74l4.04-1.17A9.25 9.25 0 1 0 12 2.75Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9.1 7.9c.2-.45.42-.46.62-.47l.53-.01c.18 0 .43.02.62.47.2.46.66 1.6.72 1.72.06.12.1.27.02.43-.08.17-.13.27-.25.42-.12.15-.26.33-.37.44-.12.12-.25.26-.11.5.14.25.62 1.03 1.34 1.67.92.82 1.7 1.08 1.94 1.2.24.12.38.1.52-.06.14-.17.6-.7.76-.94.16-.24.32-.2.53-.12.22.08 1.38.65 1.62.77.24.12.4.18.46.28.06.1.06.6-.14 1.18-.2.58-1.17 1.14-1.62 1.18-.44.04-.85.2-2.87-.6-2.43-.96-3.96-3.44-4.08-3.6-.12-.16-.97-1.3-.97-2.47 0-1.18.62-1.76.84-2Z"
          fill="currentColor"
        />
      </svg>
      <span className="txt">{label}</span>
    </a>
  );
}
