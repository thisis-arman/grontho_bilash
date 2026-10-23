
// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

import { Types } from "mongoose";

export type ProductType = "Physical" | "Digital";
export type ProductCondition = "New" | "Used" | "Like New" | "Digital Content";
export type StockStatus = "In Stock" | "Out of Stock" | "Pre-order";

export interface IPrice {
  basePrice: number;
  discountPrice: number;
  isNegotiable: boolean;
}

export interface IInventory {
  quantity: number;
  soldCount: number;
}

export interface IFulfillmentOptions {
  allowPickup: boolean;
  allowShipping: boolean;
  isDigitalDelivery: boolean;
}

// The uploaded file, stored privately on Cloudinary ("authenticated"
// delivery). Only buyers who paid, the seller and admins can open it.
export interface IDigitalFile {
  publicId: string;
  resourceType: "image" | "raw";
  format?: string;
  bytes?: number;
  pages?: number;
  originalName?: string;
}

export interface IDigitalDetails {
  // External link (e.g. Google Drive) for listings made before uploads.
  downloadUrl?: string;
  file?: IDigitalFile;
  fileType?: string;
  fileSize?: string;
  pages?: number;
}

export interface IBookMetadata {
  author?: string;
  publisher?: string;
  publicationYear?: number;
  isbn?: string;
  edition?: string;
  language?: string[];
}

export interface IAcademicMetadata {
  // Old placeholder taxonomy (kept for existing listings).
  level?: Types.ObjectId;
  faculty?: Types.ObjectId;
  department?: Types.ObjectId;
  // Course catalogue (curriculum module): what the book is for.
  curriculum?: Types.ObjectId;
  program?: string; // "BBA"
  departmentName?: string; // "Accounting"
  year?: number; // 1-5
  courseCode?: string; // "212501"
  courseTitle?: string; // "Principles of Accounting"
}

export interface IProduct  {
  seller: Types.ObjectId;
  sku: string;
  title: string;
  slug: string;
  productType: ProductType;
  category: string;
  subcategory: string;

  academicMetadata?: IAcademicMetadata;

  price: IPrice;
  inventory: IInventory;
  condition: ProductCondition;

  description: string;
  images: string[];

  stockStatus: StockStatus;
  fulfillmentOptions: IFulfillmentOptions;
  digitalDetails?: IDigitalDetails;

  bookMetadata?: IBookMetadata;

  isPublished: boolean;
  isContactHidden: boolean;
  viewCount: number;
  location: string;

  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;

  // Virtuals
  estimatedShipping: number;
}
