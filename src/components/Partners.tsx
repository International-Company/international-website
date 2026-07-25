import type { Dict } from "@/dictionaries";

/** Placeholder partner names — replace with real partner logos. */
const PARTNERS = [
  "GLOBAL BANK", "SWIFT NETWORK", "PAY LINK", "GULF EXCHANGE",
  "TRUST PAY", "GOLD SOUQ", "FIN CORP", "REMIT PRO",
];

export default function Partners({ dict }: { dict: Dict }) {
  const items = [...PARTNERS, ...PARTNERS];
  return (
    <section className="partners">
      <div className="p-label">{dict.partners.label}</div>
      <div className="partners-track-wrap">
        <div className="partners-track">
          {items.map((p, i) => (
            <div className="partner-pill" key={i}>◈ {p}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
