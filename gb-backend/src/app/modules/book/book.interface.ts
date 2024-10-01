export type TBook = {
  bookId: string;
  bookTitle: string;
  price: number;
  description: string;
  condition: "fresh" | "used";
  level: "ssc" | "hsc" | "bachelor" | "master";
  isPublished: boolean;
  images: string[]; // URLs to the book images
  author: string; // Book's author
  publicationYear: number; // Year the book was published
  genre: string; // Genre or subject of the book (e.g., Science, Literature, etc.)
  sellerId: string; // ID of the user selling the book
  buyerId?: string; // ID of the user buying the book (optional until sold)
  transactionDate?: Date; // Date of the sale (optional)
  location: string; // Seller's location for easier exchange
  stockCount: number; // How many copies are available
  ratings?: number; // Optional rating system for sellers/books
  reviews?: string[]; // User reviews about the book or seller
  deliveryOption: "pickup" | "shipping"; // Whether the book is for pickup or delivery
  shippingCost?: number; // Optional cost of shipping if deliveryOption is 'shipping'
};
