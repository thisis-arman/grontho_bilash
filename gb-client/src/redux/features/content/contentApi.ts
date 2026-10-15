import { baseApi } from "../../api/baseApi";

export type ContentStatus = "draft" | "published";

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  coverImage?: string;
  category: string;
  tags: string[];
  bookReview?: { bookTitle?: string; bookAuthor?: string; rating?: number };
  author?: { _id: string; name: string } | string;
  status: ContentStatus;
  publishedAt?: string;
  updatedAt?: string;
  readingTime: number;
  views: number;
}

export interface Attachment {
  url: string;
  name: string;
  kind: "pdf" | "image";
  size?: number;
}

export interface Suggestion {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  body?: string;
  attachments: Attachment[];
  level: string;
  subject: string;
  subjectCode?: string;
  program?: string;
  department?: string;
  academicYear?: string;
  examYear?: string;
  institution?: string;
  preparedBy?: string;
  tags: string[];
  status: ContentStatus;
  publishedAt?: string;
  updatedAt?: string;
  views: number;
  downloads: number;
}

export interface FacetValue {
  name: string;
  count: number;
}

type Envelope<T> = { success: boolean; message: string; data: T };
type Paged<T> = Envelope<{ data: T[]; meta: PageMeta }>;
type Params = Record<string, string | number | undefined>;

// Drops empty values so they don't end up as "?search=" in the URL.
const clean = (params: Params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Blog ──────────────────────────────────────────────────────────────
    getBlogPosts: builder.query<Paged<BlogPost>, Params | void>({
      query: (params) => ({ url: "/blogs", params: clean(params ?? {}) }),
      providesTags: ["Blogs"],
    }),
    getBlogCategories: builder.query<Envelope<string[]>, void>({
      query: () => "/blogs/categories",
    }),
    getBlogPost: builder.query<Envelope<{ post: BlogPost; related: BlogPost[] }>, string>({
      query: (slug) => `/blogs/slug/${encodeURIComponent(slug)}`,
      providesTags: ["Blogs"],
    }),
    getAdminBlogPosts: builder.query<Paged<BlogPost>, Params | void>({
      query: (params) => ({ url: "/blogs/admin/all", params: clean(params ?? {}) }),
      providesTags: ["Blogs"],
    }),
    getAdminBlogPost: builder.query<Envelope<BlogPost>, string>({
      query: (id) => `/blogs/admin/${id}`,
      providesTags: ["Blogs"],
    }),
    saveBlogPost: builder.mutation<Envelope<BlogPost>, { id?: string; data: Partial<BlogPost> }>({
      query: ({ id, data }) => ({ url: id ? `/blogs/${id}` : "/blogs", method: id ? "PATCH" : "POST", body: data }),
      invalidatesTags: ["Blogs"],
    }),
    deleteBlogPost: builder.mutation<Envelope<null>, string>({
      query: (id) => ({ url: `/blogs/${id}`, method: "DELETE" }),
      invalidatesTags: ["Blogs"],
    }),

    // ── Suggestions ───────────────────────────────────────────────────────
    getSuggestions: builder.query<Paged<Suggestion>, Params | void>({
      query: (params) => ({ url: "/suggestions", params: clean(params ?? {}) }),
      providesTags: ["Suggestions"],
    }),
    getSuggestionFilters: builder.query<
      Envelope<{ levels: FacetValue[]; subjects: FacetValue[]; departments: FacetValue[]; academicYears: FacetValue[]; allLevels: string[] }>,
      void
    >({
      query: () => "/suggestions/filters",
      providesTags: ["Suggestions"],
    }),
    getSuggestion: builder.query<Envelope<{ suggestion: Suggestion; related: Suggestion[] }>, string>({
      query: (slug) => `/suggestions/slug/${encodeURIComponent(slug)}`,
      providesTags: ["Suggestions"],
    }),
    recordSuggestionDownload: builder.mutation<Envelope<null>, string>({
      query: (slug) => ({ url: `/suggestions/slug/${encodeURIComponent(slug)}/download`, method: "POST" }),
    }),
    getAdminSuggestions: builder.query<Paged<Suggestion>, Params | void>({
      query: (params) => ({ url: "/suggestions/admin/all", params: clean(params ?? {}) }),
      providesTags: ["Suggestions"],
    }),
    getAdminSuggestion: builder.query<Envelope<Suggestion>, string>({
      query: (id) => `/suggestions/admin/${id}`,
      providesTags: ["Suggestions"],
    }),
    saveSuggestion: builder.mutation<Envelope<Suggestion>, { id?: string; data: Partial<Suggestion> }>({
      query: ({ id, data }) => ({
        url: id ? `/suggestions/${id}` : "/suggestions",
        method: id ? "PATCH" : "POST",
        body: data,
      }),
      invalidatesTags: ["Suggestions"],
    }),
    deleteSuggestion: builder.mutation<Envelope<null>, string>({
      query: (id) => ({ url: `/suggestions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Suggestions"],
    }),

    // ── Uploads ───────────────────────────────────────────────────────────
    getUploadSignature: builder.mutation<
      Envelope<{ timestamp: number; folder: string; allowed_formats: string; signature: string; apiKey: string; cloudName: string }>,
      "blog" | "suggestion"
    >({
      query: (purpose) => ({ url: "/uploads/signature", method: "POST", body: { purpose } }),
    }),
  }),
});

export const {
  useGetBlogPostsQuery,
  useGetBlogCategoriesQuery,
  useGetBlogPostQuery,
  useGetAdminBlogPostsQuery,
  useGetAdminBlogPostQuery,
  useSaveBlogPostMutation,
  useDeleteBlogPostMutation,
  useGetSuggestionsQuery,
  useGetSuggestionFiltersQuery,
  useGetSuggestionQuery,
  useRecordSuggestionDownloadMutation,
  useGetAdminSuggestionsQuery,
  useGetAdminSuggestionQuery,
  useSaveSuggestionMutation,
  useDeleteSuggestionMutation,
  useGetUploadSignatureMutation,
} = contentApi;
