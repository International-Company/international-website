import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
        paddingTop: "120px",
        textAlign: "center",
      }}
    >
      <div className="en" style={{ fontSize: "72px", fontWeight: 800, letterSpacing: ".1em" }}>
        404
      </div>
      <p style={{ color: "var(--text-2)" }}>الصفحة غير موجودة — Page not found</p>
      <Link href="/ar" className="btn btn-secondary">
        الرئيسية · Home
      </Link>
    </div>
  );
}
