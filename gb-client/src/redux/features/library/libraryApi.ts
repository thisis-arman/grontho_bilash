import { baseApi } from "../../api/baseApi";

type Envelope<T> = { success: boolean; message: string; data: T };

export type LibraryStatus = "ready" | "awaiting" | "failed";

export interface LibraryItem {
  product: string;
  title: string;
  slug: string;
  image?: string;
  author?: string;
  fileType?: string;
  fileSize?: string;
  pages?: number;
  orderId: string;
  order: string;
  orderedAt: string;
  status: LibraryStatus;
}

export interface ReaderData {
  product: string;
  title: string;
  slug: string;
  image?: string;
  author?: string;
  pages?: number;
  mode: "pages" | "image" | "download" | "link";
  pageUrls?: string[];
  imageUrl?: string;
  downloadUrl?: string;
  externalUrl?: string;
  fileType?: string;
  fileSize?: string;
  expiresInMinutes?: number;
}

// The buyer's digital books (after an admin confirms the bKash payment).
export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibrary: builder.query<Envelope<LibraryItem[]>, void>({
      query: () => ({ url: "/library", method: "GET" }),
      providesTags: ["Library"],
    }),
    // { [productId]: status } for the product page's buy / read button.
    getOwnedBooks: builder.query<Envelope<Record<string, LibraryStatus>>, void>({
      query: () => ({ url: "/library/owned", method: "GET" }),
      providesTags: ["Library"],
    }),
    // Signed links expire, so never reuse an old answer.
    openBook: builder.query<Envelope<ReaderData>, string>({
      query: (productId) => ({ url: `/library/${productId}`, method: "GET" }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetLibraryQuery, useGetOwnedBooksQuery, useOpenBookQuery } = libraryApi;
