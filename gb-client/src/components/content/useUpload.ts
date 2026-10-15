import { useState } from "react";
import { useGetUploadSignatureMutation } from "../../redux/features/content/contentApi";

export interface UploadedFile {
  url: string;
  name: string;
  kind: "pdf" | "image";
  size: number;
}

// Cloudinary's per-file limit on the free plan.
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ACCEPTED: Record<string, "pdf" | "image"> = {
  "application/pdf": "pdf",
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
};

export const ACCEPT_ATTR = Object.keys(ACCEPTED).join(",");
export const ACCEPT_IMAGES_ATTR = Object.keys(ACCEPTED).filter((t) => t.startsWith("image/")).join(",");

export const formatBytes = (bytes = 0) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Uploads go straight from the browser to Cloudinary using a signature from
// our API, so large PDFs don't hit the server's request-size limit.
export const useUpload = (purpose: "blog" | "suggestion") => {
  const [getSignature] = useGetUploadSignatureMutation();
  const [progress, setProgress] = useState<number | null>(null);

  const upload = async (file: File): Promise<UploadedFile> => {
    const kind = ACCEPTED[file.type];
    if (!kind) throw new Error(`"${file.name}" is not a PDF or image.`);
    if (file.size > MAX_UPLOAD_BYTES) throw new Error(`"${file.name}" is larger than ${formatBytes(MAX_UPLOAD_BYTES)}.`);

    const { data } = await getSignature(purpose).unwrap();

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", data.apiKey);
    form.append("timestamp", String(data.timestamp));
    form.append("folder", data.folder);
    form.append("allowed_formats", data.allowed_formats);
    form.append("signature", data.signature);

    setProgress(0);
    try {
      // XHR rather than fetch, for upload progress.
      const result = await new Promise<{ secure_url: string; bytes: number }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${data.cloudName}/auto/upload`);
        xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
        xhr.onload = () => {
          const body = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300) resolve(body);
          else reject(new Error(body?.error?.message || "Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
        xhr.send(form);
      });
      return { url: result.secure_url, name: file.name.replace(/\.[^.]+$/, ""), kind, size: result.bytes };
    } finally {
      setProgress(null);
    }
  };

  return { upload, progress, isUploading: progress !== null };
};
