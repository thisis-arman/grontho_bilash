export type TBook = {
  bookId: string;
  bookTitle: string;
  price: number;
  description: string;
  condition: "fresh" | "used";
  level: "ssc" | "hsc" | "bachelor" | "master";
  isPublished: boolean;
  isContactNoHidden: boolean;
  isNegotiable: boolean;
  images: string[]; 
  publicationYear: number; // Year the book was published
  transactionDate?: Date; // Date of the sale (optional)
  location: string; // Seller's location for easier exchange
  deliveryOption: "pickup" | "shipping"; // Whether the book is for pickup or delivery
  shippingCost?: number; // Optional cost of shipping if deliveryOption is 'shipping'
};
