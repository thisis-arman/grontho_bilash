// Shrinks a photo in the browser before it is uploaded: scaled down so its
// longest side is at most `maxSide` pixels and re-encoded as WebP (JPEG where
// the browser can't encode WebP). A 4-8 MB phone photo usually ends up at
// 150-400 KB, which uploads faster on mobile data and loads faster for buyers.
//
// GIFs (may be animated) and files the browser can't decode are returned
// unchanged, as is anything that would not get smaller.

export interface CompressOptions {
  maxSide?: number;
  quality?: number;
}

const SKIP_TYPES = new Set(["image/gif", "image/svg+xml"]);

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

const loadImage = async (file: File): Promise<CanvasImageSource & { width: number; height: number }> => {
  if ("createImageBitmap" in window) {
    // Applies the photo's EXIF rotation, so phone pictures stay upright.
    return createImageBitmap(file, { imageOrientation: "from-image" });
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const compressImage = async (
  file: File,
  { maxSide = 1600, quality = 0.8 }: CompressOptions = {}
): Promise<File> => {
  if (!file.type.startsWith("image/") || SKIP_TYPES.has(file.type)) return file;

  let source: Awaited<ReturnType<typeof loadImage>>;
  try {
    source = await loadImage(file);
  } catch {
    return file; // Not decodable here (e.g. HEIC on some browsers): send as is.
  }

  const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);
  if ("close" in source && typeof source.close === "function") source.close();

  // toBlob falls back to PNG when a type isn't supported, so check what came out.
  let blob = await toBlob(canvas, "image/webp", quality);
  if (!blob || blob.type !== "image/webp") {
    // JPEG has no transparency: paint a white background first.
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    blob = await toBlob(canvas, "image/jpeg", quality);
  }
  if (!blob || blob.size >= file.size) return file;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
  return new File([blob], name, { type: blob.type, lastModified: Date.now() });
};
