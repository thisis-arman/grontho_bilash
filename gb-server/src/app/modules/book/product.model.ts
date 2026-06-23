import { Schema, model, Document, Model, Types } from "mongoose";
import { IProduct } from "./product.interface";

// ─────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────

 const productSchema = new Schema<IProduct>(
  {
    // Core Identification
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: "text", // Enables search by title
    },
    slug: {
      // URL friendly name (e.g., "intro-to-algorithms-3rd-edition")
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    productType: {
      type: String,
      enum: ["Physical", "Digital"],
      required: true,
      default: "Physical",
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      required: true,
    },

    // Academic taxonomy (refs — kept consistent with category/subcategory
    // being plain strings only for now; see review note on this tradeoff)
    academicMetadata: {
      level: { type: Schema.Types.ObjectId, ref: "EducationCategory" },
      faculty: { type: Schema.Types.ObjectId, ref: "Faculty" },
      department: { type: Schema.Types.ObjectId, ref: "Department" },
    },

    // Pricing
    price: {
      basePrice: { type: Number, required: true, min: 0 },
      discountPrice: { type: Number, default: 0, min: 0 },
      isNegotiable: { type: Boolean, default: false },
    },

    // Inventory — quantity only meaningfully required/tracked for Physical
    inventory: {
      quantity: {
        type: Number,
        min: 0,
        required: function (this: IProduct) {
          return this.productType === "Physical";
        },
        default: 1,
      },
      soldCount: { type: Number, default: 0, min: 0 },
    },

    condition: {
      type: String,
      enum: ["New", "Used", "Like New", "Digital Content"],
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      validate: {
        validator: (val: string[]) => Array.isArray(val) && val.length > 0,
        message: "At least one product image is required",
      },
    },

    // stockStatus is a REAL, settable field (not derived), because the
    // enum includes "Pre-order" which cannot be inferred from quantity
    // alone — a seller must be able to set this explicitly. It is kept
    // roughly in sync with inventory via the pre("save") hook below for
    // the Out of Stock <-> In Stock transitions only; "Pre-order" is left
    // untouched by the hook so seller intent isn't silently overwritten.
    stockStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Pre-order"],
      default: "In Stock",
    },

    fulfillmentOptions: {
      allowPickup: { type: Boolean, default: true },
      allowShipping: { type: Boolean, default: true },
      isDigitalDelivery: { type: Boolean, default: false },
    },

    digitalDetails: {
      downloadUrl: {
        type: String,
        required: function (this: IProduct) {
          return this.productType === "Digital";
        },
      },
      fileType: {
        type: String,
        required: function (this: IProduct) {
          return this.productType === "Digital";
        },
      },
      fileSize: { type: String },
    },

    // General book attributes
    bookMetadata: {
      author: { type: String },
      publisher: { type: String },
      publicationYear: { type: Number },
      isbn: { type: String },
      edition: { type: String },
      // Array, not a hardcoded "English/Bangla" string — that default
      // claimed a fact about every book that isn't true for most of them.
      language: { type: [String], default: [] },
    },

    // Visibility & analytics
    isPublished: { type: Boolean, default: false, index: true },
    isContactHidden: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0, min: 0 },
    location: { type: String, required: true },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────
// Virtuals (computed, read-only — no overlap with real schema fields)
// ─────────────────────────────────────────────────────────────

productSchema.virtual("estimatedShipping").get(function (this: IProduct) {
  return this.productType === "Digital" ? 0 : 70;
});

// ─────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────

// Keeps stockStatus consistent with productType/inventory on save,
// without clobbering a seller-set "Pre-order" status.
// (Async-style middleware — no `next` callback — avoids ambiguous
// overload resolution between mongoose's callback- and promise-based
// pre-hook signatures under strict TS.)
productSchema.pre("save", async function () {
  if (this.productType === "Digital") {
    this.stockStatus = "In Stock";
  } else if (this.stockStatus !== "Pre-order") {
    this.stockStatus =
      this.inventory.quantity > 0 ? "In Stock" : "Out of Stock";
  }
});

// Cross-field validation that doesn't fit cleanly into single-path
// `required` functions (e.g. Digital products shouldn't carry physical-only
// fulfillment options).
productSchema.pre("validate", async function () {
  if (this.productType === "Digital") {
    this.fulfillmentOptions.allowPickup = false;
    this.fulfillmentOptions.allowShipping = false;
    this.fulfillmentOptions.isDigitalDelivery = true;
  }
});

// ─────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────

productSchema.index({ category: 1, productType: 1, isPublished: 1 });
productSchema.index({ seller: 1, isDeleted: 1 });

// ─────────────────────────────────────────────────────────────
// Model
// ─────────────────────────────────────────────────────────────

export const ProductModel: Model<IProduct> = model<IProduct>(
  "Product",
  productSchema
);