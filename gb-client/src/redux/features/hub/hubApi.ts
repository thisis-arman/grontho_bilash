import { baseApi } from "../../api/baseApi";
import type { FacetValue, PageMeta } from "../content/contentApi";

// Search suggestions, "notify me" alerts and book lists.

type Envelope<T> = { success: boolean; message: string; data: T };
type Params = Record<string, string | number | undefined>;
const clean = (params: Params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));

export interface SuggestProduct {
  title: string;
  slug: string;
  image: string;
  price: number;
  author: string;
  condition: string;
}

export interface SuggestContent {
  kind: "booklist" | "suggestion" | "question" | "blog" | "course";
  title: string;
  url: string;
}

export interface SuggestResult {
  query: string;
  total?: number;
  products: SuggestProduct[];
  terms: string[];
  content: SuggestContent[];
}

export interface BookAlert {
  _id: string;
  query: string;
  status: "open" | "notified";
  matchedProduct?: { title: string; slug: string };
  notifiedAt?: string;
  createdAt: string;
}

export interface BookListBook {
  title: string;
  author?: string;
  note?: string;
  optional?: boolean;
  searchTerm?: string;
  count?: number;
  fromPrice?: number | null;
}

export interface BookList {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  level: string;
  institution?: string;
  program?: string;
  department?: string;
  academicYear?: string;
  session?: string;
  books: BookListBook[];
  bookCount?: number;
  status: "draft" | "published";
  updatedAt?: string;
  views: number;
}

export interface BookListFilters {
  levels: FacetValue[];
  institutions: FacetValue[];
  programs: FacetValue[];
  departments: FacetValue[];
  academicYears: FacetValue[];
  allLevels: string[];
}

export interface SearchInsights {
  notFound: { _id: string; display: string; count: number; zeroCount: number; lastSearchedAt: string }[];
  top: { _id: string; display: string; count: number; lastResults: number; lastSearchedAt: string }[];
  openAlerts: { query: string; people: number; since: string }[];
  totals: { distinctSearches: number; openAlerts: number; notifiedAlerts: number };
}

export interface Course {
  code?: string;
  title: string;
  marks?: number | null;
  credits?: number | null;
  group?: string;
}

export interface CurriculumYear {
  year: number;
  session?: string;
  syllabusUrl?: string;
  publishedAt?: string;
  courses: Course[];
  courseCount?: number;
}

export interface Curriculum {
  _id: string;
  slug: string;
  institution: string;
  institutionBn?: string;
  level: string;
  program: string;
  programName?: string;
  programNameBn?: string;
  department: string;
  departmentBn?: string;
  years: CurriculumYear[];
  status?: "draft" | "published";
  updatedAt?: string;
}

export interface CourseHit {
  code?: string;
  title: string;
  year: number;
  program: string;
  department: string;
  departmentBn: string;
  slug: string;
}

export interface OfficialLinks {
  source: string;
  note: string;
  extras: { kind: string; title: string; url: string; publishedAt?: string; program?: string | null; year?: number | null }[];
}

export const hubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Search ────────────────────────────────────────────────────────────
    getSearchSuggestions: builder.query<Envelope<SuggestResult>, string>({
      query: (q) => ({ url: "/search/suggest", params: { q } }),
      keepUnusedDataFor: 300,
    }),
    getPopularSearches: builder.query<Envelope<string[]>, void>({
      query: () => "/search/popular",
      keepUnusedDataFor: 900,
    }),
    logSearch: builder.mutation<Envelope<{ results: number }>, string>({
      query: (q) => ({ url: "/search/log", method: "POST", body: { q } }),
    }),
    getSearchInsights: builder.query<Envelope<SearchInsights>, void>({
      query: () => "/search/insights",
      providesTags: ["SearchInsights"],
    }),

    // ── Notify me ─────────────────────────────────────────────────────────
    createBookAlert: builder.mutation<
      Envelope<{ alreadyAvailable: boolean; available: number; alert: BookAlert | null }>,
      string
    >({
      query: (query) => ({ url: "/alerts", method: "POST", body: { query } }),
      invalidatesTags: ["Alerts"],
    }),
    getMyAlerts: builder.query<Envelope<BookAlert[]>, void>({
      query: () => "/alerts/mine",
      providesTags: ["Alerts"],
    }),
    deleteBookAlert: builder.mutation<Envelope<null>, string>({
      query: (id) => ({ url: `/alerts/${id}`, method: "DELETE" }),
      invalidatesTags: ["Alerts"],
    }),

    // ── Course catalogue (syllabus) ─────────────────────────────────────────
    getCurricula: builder.query<Envelope<Curriculum[]>, void>({
      query: () => "/curriculum",
      providesTags: ["Curriculum"],
      keepUnusedDataFor: 600,
    }),
    getCurriculum: builder.query<Envelope<Curriculum>, string>({
      query: (slug) => `/curriculum/slug/${encodeURIComponent(slug)}`,
      providesTags: ["Curriculum"],
    }),
    getOfficialLinks: builder.query<Envelope<OfficialLinks>, void>({
      query: () => "/curriculum/official-links",
      keepUnusedDataFor: 3600,
    }),
    searchCourses: builder.query<Envelope<CourseHit[]>, string>({
      query: (q) => ({ url: "/curriculum/courses", params: { q } }),
      keepUnusedDataFor: 300,
    }),
    getAdminCurricula: builder.query<Envelope<Curriculum[]>, void>({
      query: () => "/curriculum/admin/all",
      providesTags: ["Curriculum"],
    }),
    getAdminCurriculum: builder.query<Envelope<Curriculum>, string>({
      query: (id) => `/curriculum/admin/${id}`,
      providesTags: ["Curriculum"],
    }),
    saveCurriculum: builder.mutation<Envelope<Curriculum>, { id?: string; data: Partial<Curriculum> }>({
      query: ({ id, data }) => ({ url: id ? `/curriculum/${id}` : "/curriculum", method: id ? "PATCH" : "POST", body: data }),
      invalidatesTags: ["Curriculum"],
    }),
    deleteCurriculum: builder.mutation<Envelope<null>, string>({
      query: (id) => ({ url: `/curriculum/${id}`, method: "DELETE" }),
      invalidatesTags: ["Curriculum"],
    }),
    importNuHonours: builder.mutation<Envelope<{ departmentsAdded: number; yearsAdded: number; departmentsInDataset: number; source: string }>, void>({
      query: () => ({ url: "/curriculum/admin/import-nu-honours", method: "POST" }),
      invalidatesTags: ["Curriculum"],
    }),

    // ── Book lists ────────────────────────────────────────────────────────
    getBookLists: builder.query<Envelope<{ data: BookList[]; meta: PageMeta }>, Params | void>({
      query: (params) => ({ url: "/booklists", params: clean(params ?? {}) }),
      providesTags: ["BookLists"],
    }),
    getBookListFilters: builder.query<Envelope<BookListFilters>, Params | void>({
      query: (params) => ({ url: "/booklists/filters", params: clean(params ?? {}) }),
      providesTags: ["BookLists"],
    }),
    getBookList: builder.query<Envelope<{ list: BookList; related: BookList[] }>, string>({
      query: (slug) => `/booklists/slug/${encodeURIComponent(slug)}`,
      providesTags: ["BookLists"],
    }),
    getAdminBookLists: builder.query<Envelope<{ data: BookList[]; meta: PageMeta }>, Params | void>({
      query: (params) => ({ url: "/booklists/admin/all", params: clean(params ?? {}) }),
      providesTags: ["BookLists"],
    }),
    getAdminBookList: builder.query<Envelope<BookList>, string>({
      query: (id) => `/booklists/admin/${id}`,
      providesTags: ["BookLists"],
    }),
    saveBookList: builder.mutation<Envelope<BookList>, { id?: string; data: Partial<BookList> }>({
      query: ({ id, data }) => ({ url: id ? `/booklists/${id}` : "/booklists", method: id ? "PATCH" : "POST", body: data }),
      invalidatesTags: ["BookLists"],
    }),
    deleteBookList: builder.mutation<Envelope<null>, string>({
      query: (id) => ({ url: `/booklists/${id}`, method: "DELETE" }),
      invalidatesTags: ["BookLists"],
    }),
  }),
});

export const {
  useGetSearchSuggestionsQuery,
  useGetPopularSearchesQuery,
  useLogSearchMutation,
  useGetSearchInsightsQuery,
  useCreateBookAlertMutation,
  useGetMyAlertsQuery,
  useDeleteBookAlertMutation,
  useGetBookListsQuery,
  useGetBookListFiltersQuery,
  useGetBookListQuery,
  useGetAdminBookListsQuery,
  useGetAdminBookListQuery,
  useSaveBookListMutation,
  useDeleteBookListMutation,
  useGetCurriculaQuery,
  useGetCurriculumQuery,
  useGetOfficialLinksQuery,
  useSearchCoursesQuery,
  useGetAdminCurriculaQuery,
  useGetAdminCurriculumQuery,
  useSaveCurriculumMutation,
  useDeleteCurriculumMutation,
  useImportNuHonoursMutation,
} = hubApi;
