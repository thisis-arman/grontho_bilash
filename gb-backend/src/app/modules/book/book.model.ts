import { Schema, model } from "mongoose";

// Define the Mongoose schema for the book
const bookSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
      
    },

    bookTitle: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      enum: ["Fresh", "Used"], // Only 'fresh' or 'used' values are allowed
      required: true,
      default:"used"
    },
    level: {
      type: Schema.Types.ObjectId,
      ref:'Level',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false, // Default to unpublished
    },
    isContactNoHidden: {
      type: Boolean,
      default: false, // Default to showing contact number
    },
    isNegotiable: {
      type: Boolean,
      default: false, // Default to price not negotiable
    },
    images: {
      type: [String], // An array of image URLs or paths
      default: [], // Default to empty array if no images are provided
    },
    publicationYear: {
      type: Number,
      required: true,
    },
    transactionDate: {
      type: Date, // Optional field for the sale date
    },
    location: {
      type: String,
      required: true, // Seller's location
    },
    deliveryOption: {
      type: String,
      enum: ["Pickup", "Shipping"], 
      required: true,
    },
    shippingCost: {
      type: Number, 
      default: 0,
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
  }
);

// Create the Mongoose model
export const BookModel = model("Book", bookSchema);
