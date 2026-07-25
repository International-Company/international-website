/** Floating WhatsApp button. */
export default function WhatsAppFloat({ label }: { label: string }) {
  return (
    <a
      href="https://wa.me/970594020634"
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
