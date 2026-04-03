export const MEDIA_LIMITS = {
  imageMaxBytes: 5 * 1024 * 1024,
  pdfMaxBytes: 20 * 1024 * 1024,
} as const;

export const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const PDF_MIME = "application/pdf";
