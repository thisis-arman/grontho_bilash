import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    // 1. Core Identification
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
    slug: { // URL friendly name (e.g., "intro-to-algorithms-3rd-edition")
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
    
    academicMetadata: {
      level: { type: Schema.Types.ObjectId, ref: "EducationCategory" },
      faculty: { type: Schema.Types.ObjectId, ref: "Faculty" },
      department: { type: Schema.Types.ObjectId, ref: "Department" },
    },

    price: {
      basePrice: { type: Number, required: true }, // The seller's price
      discountPrice: { type: Number, default: 0 },
      isNegotiable: { type: Boolean, default: false },
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
      validate: [
        (val: string[]) => val.length > 0, 
        "At least one product image is required"
      ],
    },

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
      downloadUrl: { type: String }, 
      fileType: { type: String },   
      fileSize: { type: String },
    },

    // 7. General Book Attributes
    bookMetadata: {
      author: { type: String },
      publisher: { type: String },
      publicationYear: { type: Number },
      isbn: { type: String },
      edition: { type: String },
      language: { type: String, default: "English/Bangla" },
    },

    // 8. Visibility & Analytics
    isPublished: { type: Boolean, default: false, index: true },
    isContactNoHidden: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    location: { type: String, required: true }, 

    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for dynamic shipping cost (Platform logic)
productSchema.virtual('estimatedShipping').get(function() {
    if (this.productType === 'Digital') return 0;
    // Logic here can refer to a global config
    return 70; 
});

productSchema.index({ category: 1, productType: 1, isPublished: 1 });

export const ProductModel = model("Product", productSchema);