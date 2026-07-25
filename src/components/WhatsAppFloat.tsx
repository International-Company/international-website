/** Floating WhatsApp button — set the real number in the href (wa.me/NUMBER). */
export default function WhatsAppFloat({ label }: { label: string }) {
  return (
    <a
      href="https://wa.me/0000000000"
      target="_blank"
      rel="noopener noreferrer"
      className="wa-float"
      title={label}
    >
      <span className="wico">✆</span>
      <span className="txt">{label}</span>
    </a>
  );
}
