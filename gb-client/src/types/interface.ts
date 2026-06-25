
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

export interface IDigitalDetails {
    downloadUrl?: string;
    fileType?: string;
    fileSize?: string;
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
    level?: string;
    faculty?: string;
    department?: string;
}

export interface IProduct {
    _id: string;
    seller: string;
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
