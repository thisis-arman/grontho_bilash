import { useRef, useState } from "react";
import { CheckCircle2, FileUp, Loader2, Lock, RefreshCw } from "lucide-react";
import { useGetUploadSignatureMutation } from "../../redux/features/content/contentApi";
import { bnNumber } from "../../i18n/labels";

// Upload for a digital book. The file goes straight from the browser to
// Cloudinary as a private ("authenticated") file in the seller's own folder;
// only buyers who paid can open it later, through the reader.

export interface DigitalFile {
  publicId: string;
  resourceType: "image" | "raw";
  format?: string;
  bytes?: number;
  pages?: number;
  originalName?: string;
}

// Cloudinary's per-file limit on the free plan.
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.epub,.jpg,.jpeg,.png,.webp,application/pdf,application/epub+zip,image/jpeg,image/png,image/webp";
const ALLOWED_EXT = ["pdf", "epub", "jpg", "jpeg", "png", "webp"];

const formatBytes = (bytes = 0) =>
  bytes >= 1024 * 1024 ? `${bnNumber((bytes / 1024 / 1024).toFixed(1))} এমবি` : `${bnNumber(Math.max(1, Math.round(bytes / 1024)))} কেবি`;

type Props = {
  value: DigitalFile | null;
  onChange: (file: DigitalFile | null) => void;
  error?: string;
};

const DigitalFileInput = ({ value, onChange, error }: Props) => {
  const [getSignature] = useGetUploadSignatureMutation();
  const [progress, setProgress] = useState<number | null>(null);
  const [problem, setProblem] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setProblem("");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXT.includes(ext)) return setProblem("শুধু PDF, EPUB বা ছবি (JPG/PNG) আপলোড করা যাবে।");
    if (file.size > MAX_BYTES) {
      return setProblem(`ফাইলটা ${formatBytes(file.size)}, সর্বোচ্চ ১০ এমবি দেওয়া যায়। PDF ছোট করে নাও (যেমন ilovepdf.com-এ "Compress PDF"), অথবা নিচে লিংক দাও।`);
    }

    setProgress(0);
    try {
      const { data } = await getSignature("digital").unwrap();
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", data.apiKey);
      form.append("timestamp", String(data.timestamp));
      form.append("folder", data.folder);
      form.append("allowed_formats", data.allowed_formats);
      form.append("type", data.type ?? "authenticated");
      form.append("signature", data.signature);

      // XHR rather than fetch, for upload progress.
      const result = await new Promise<{ public_id: string; resource_type: string; format?: string; bytes: number; pages?: number }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${data.cloudName}/auto/upload`);
          xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
          xhr.onload = () => {
            const body = JSON.parse(xhr.responseText || "{}");
            if (xhr.status >= 200 && xhr.status < 300) resolve(body);
            else reject(new Error(body?.error?.message || "upload failed"));
          };
          xhr.onerror = () => reject(new Error("network"));
          xhr.send(form);
        }
      );

      onChange({
        publicId: result.public_id,
        resourceType: result.resource_type === "raw" ? "raw" : "image",
        format: result.format ?? ext,
        bytes: result.bytes,
        pages: result.pages,
        originalName: file.name,
      });
    } catch (err) {
      const message = (err as Error).message ?? "";
      setProblem(
        message === "network"
          ? "ইন্টারনেট সংযোগে সমস্যা। আবার চেষ্টা করো।"
          : /too large|size/i.test(message)
            ? "ফাইলটা বেশি বড়। PDF ছোট করে আবার দাও, অথবা নিচে লিংক দাও।"
            : "আপলোড করা যায়নি। আবার চেষ্টা করো।"
      );
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  const uploading = progress !== null;

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        id="lp-digital-file"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />

      {value && !uploading ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-emerald-600" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-900">{value.originalName ?? "ফাইল আপলোড হয়েছে"}</p>
            <p className="text-xs text-stone-600">
              {(value.format ?? "").toUpperCase()}
              {value.pages ? ` · ${bnNumber(value.pages)} পৃষ্ঠা` : ""}
              {value.bytes ? ` · ${formatBytes(value.bytes)}` : ""}
            </p>
          </div>
          <label htmlFor="lp-digital-file" className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-white">
            <RefreshCw size={14} aria-hidden="true" /> বদলাও
          </label>
        </div>
      ) : (
        <label
          htmlFor="lp-digital-file"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file && !uploading) upload(file);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
            error ? "border-red-300 bg-red-50/40" : "border-stone-200 hover:border-amber-400 hover:bg-amber-50/40"
          } ${uploading ? "pointer-events-none" : ""}`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" aria-hidden="true" />
              <p className="text-sm font-semibold text-stone-800">আপলোড হচ্ছে… {bnNumber(progress ?? 0)}%</p>
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <FileUp className="h-8 w-8 text-amber-500" aria-hidden="true" />
              <p className="text-sm font-semibold text-stone-800">বইয়ের ফাইল আপলোড করো</p>
              <p className="text-xs text-stone-500">PDF, EPUB বা ছবি · সর্বোচ্চ ১০ এমবি · টেনে এনে ছেড়েও দিতে পারো</p>
            </>
          )}
        </label>
      )}

      {(problem || error) && <p className="mt-2 text-xs font-medium text-red-600">{problem || error}</p>}
      <p className="mt-2 flex items-start gap-1.5 text-xs text-stone-500">
        <Lock size={13} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
        ফাইলটি গোপন থাকে। পেমেন্ট নিশ্চিত হওয়া ক্রেতারাই শুধু গ্রন্থবিলাসে পড়তে বা ডাউনলোড করতে পারবে।
      </p>
    </div>
  );
};

export default DigitalFileInput;
