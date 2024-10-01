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
    instagram?: string; // Optional, as not all users might want to share
    facebook?: string; // Optional as well
  };
  isBan: boolean;
  isVerified: boolean;
  createdAt: Date; // Track when the user account was created
  lastLogin?: Date; // Optional: when the user last logged in
  favoriteBooks?: string[]; // Optional: IDs of favorite books
  sellerRating?: number; // Optional: rating of the user as a seller
};
