type TAddress = {
  division: string; // Changed to lowercase for consistency
  city: string;
  thana: string;
  village?: string; // Optional, as not everyone may have this
  street?: string; // Optional for flexibility
  postalCode?: string; // Added postal code if applicable
};

export type TUser = {
  userId: number;
  email: string;
  contactNo: string;
  name: string;
  address: TAddress;
  nid: number;
  profileImage: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
  };
  isBan: boolean;
  isVerified: boolean;
  createdAt: Date;
  lastLogin?: Date;
  favoriteBooks?: string[];
  sellerRating?: number;
};
