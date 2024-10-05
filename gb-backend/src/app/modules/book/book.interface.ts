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
  publicationYear: number; 
  transactionDate?: Date; 
  location: string; 
  deliveryOption: "pickup"|"shipping";
  shippingCost?: number; 
};
