import { v2 as cloudinary } from "cloudinary";
import httpStatus from "http-status";
import config from "../config";
import AppError from "../errors/AppError";
import { IDigitalDetails, IDigitalFile } from "../modules/book/product.interface";

// Digital books live on Cloudinary with "authenticated" delivery: the files
// have no public URL. Readers get page images through signed URLs and the
// download through a link that expires (see readerFor below).

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export const DIGITAL_FORMATS = "pdf,epub,jpg,jpeg,png,webp";

// Each seller uploads into their own folder, so a listing can only ever
// point at a file its seller uploaded.
export const digitalFolder = (sellerId: string) => `grontho-bilash/digital/${sellerId}`;

const DOWNLOAD_LINK_MINUTES = 15;
const MAX_READER_PAGES = 2000;

const FORMAT_LABELS: Record<string, string> = { pdf: "PDF", epub: "EPUB", jpg: "Image", jpeg: "Image", png: "Image", webp: "Image" };

const formatSize = (bytes?: number) => {
  if (!bytes) return undefined;
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);

// Checks the digital part of a listing and fills in type, size and page
// count from the uploaded file itself (as Cloudinary reports it), so they
// cannot be faked by the browser.
export const prepareDigitalDetails = async (
  details: Partial<IDigitalDetails> | undefined,
  sellerId: string
): Promise<IDigitalDetails> => {
  const result: IDigitalDetails = {
    fileType: details?.fileType,
    fileSize: details?.fileSize,
  };

  const link = details?.downloadUrl?.trim();
  if (link) {
    if (!isHttpUrl(link)) {
      throw new AppError(httpStatus.BAD_REQUEST, "ডাউনলোড লিংকটি সঠিক নয় (https:// দিয়ে শুরু হতে হবে)");
    }
    result.downloadUrl = link;
  }

  const file = details?.file;
  if (file?.publicId) {
    if (!String(file.publicId).startsWith(`${digitalFolder(sellerId)}/`)) {
      throw new AppError(httpStatus.FORBIDDEN, "এই ফাইলটি তোমার আপলোড করা নয়");
    }
    const resourceType = file.resourceType === "raw" ? "raw" : "image";
    let info: { format?: string; bytes?: number; pages?: number };
    try {
      info = await cloudinary.api.resource(file.publicId, {
        type: "authenticated",
        resource_type: resourceType,
        pages: true,
      });
    } catch {
      throw new AppError(httpStatus.BAD_REQUEST, "আপলোড করা ফাইলটি পাওয়া যায়নি। আবার আপলোড করো।");
    }
    const format = (info.format || file.format || String(file.publicId).split(".").pop() || "").toLowerCase();
    const stored: IDigitalFile = {
      publicId: file.publicId,
      resourceType,
      format,
      bytes: info.bytes,
      pages: info.pages,
      originalName: file.originalName?.slice(0, 200),
    };
    result.file = stored;
    result.fileType = FORMAT_LABELS[format] ?? result.fileType ?? "Other";
    result.fileSize = formatSize(info.bytes) ?? result.fileSize;
    if (info.pages) result.pages = info.pages;
  }

  if (!result.file && !result.downloadUrl) {
    throw new AppError(httpStatus.BAD_REQUEST, "ডিজিটাল বইয়ের ফাইল আপলোড করো অথবা ডাউনলোড লিংক দাও");
  }
  if (!result.fileType) result.fileType = "Other";
  return result;
};

export type ReaderData = {
  mode: "pages" | "image" | "download" | "link";
  pageUrls?: string[];
  imageUrl?: string;
  downloadUrl?: string;
  externalUrl?: string;
  fileType?: string;
  fileSize?: string;
  expiresInMinutes?: number;
};

// What the reader page needs for one digital product. Only call this after
// checking the requester may open the file.
export const readerFor = (details: IDigitalDetails | undefined): ReaderData => {
  const file = details?.file;
  const base = { fileType: details?.fileType, fileSize: details?.fileSize };

  if (file?.publicId) {
    const expiresAt = Math.floor(Date.now() / 1000) + DOWNLOAD_LINK_MINUTES * 60;
    const downloadUrl = cloudinary.utils.private_download_url(file.publicId, file.format || "", {
      resource_type: file.resourceType,
      type: "authenticated",
      expires_at: expiresAt,
      attachment: true,
    });
    const withDownload = { ...base, downloadUrl, expiresInMinutes: DOWNLOAD_LINK_MINUTES };

    // PDFs are read as page images: works on every phone, no PDF plugin.
    if (file.resourceType === "image" && file.format === "pdf" && file.pages) {
      const count = Math.min(file.pages, MAX_READER_PAGES);
      const pageUrls = Array.from({ length: count }, (_, i) =>
        cloudinary.url(file.publicId, {
          type: "authenticated",
          resource_type: "image",
          sign_url: true,
          secure: true,
          format: "jpg",
          transformation: [{ page: i + 1, width: 1200, crop: "limit", quality: "auto", flags: "progressive" }],
        })
      );
      return { mode: "pages", pageUrls, ...withDownload };
    }
    if (file.resourceType === "image" && file.format !== "pdf") {
      const imageUrl = cloudinary.url(file.publicId, {
        type: "authenticated",
        resource_type: "image",
        sign_url: true,
        secure: true,
        transformation: [{ width: 1600, crop: "limit", quality: "auto" }],
      });
      return { mode: "image", imageUrl, ...withDownload };
    }
    return { mode: "download", ...withDownload };
  }

  if (details?.downloadUrl) return { mode: "link", externalUrl: details.downloadUrl, ...base };
  throw new AppError(httpStatus.NOT_FOUND, "এই বইয়ের ফাইল এখনো যোগ করা হয়নি। বিক্রেতার সাথে যোগাযোগ করো।");
};
