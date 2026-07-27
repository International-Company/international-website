export {};

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      targetOrName: string | Date,
      params?: Record<string, unknown>
    ) => void;
  }
}
