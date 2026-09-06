/**
 * Upload limits shared by the browser and the server.
 *
 * Kept apart from `media.ts` so the client-side upload control can import
 * them without pulling the Prisma client into the browser bundle.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
