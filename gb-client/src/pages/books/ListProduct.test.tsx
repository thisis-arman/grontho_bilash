import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddProduct from "./ListProduct";

// Mock the Redux and API Hooks
vi.mock("../../redux/hooks", () => ({
  useAppSelector: vi.fn(() => ({ id: "123", email: "user@example.com", name: "John Doe" })),
}));

vi.mock("../../redux/features/auth/authSlice", () => ({
  selectCurrentUser: vi.fn(() => ({ id: "123", email: "user@example.com", name: "John Doe" })),
}));

// Course catalogue used by the course picker (program → department → year → course).
vi.mock("../../redux/features/hub/hubApi", () => ({
  useGetCurriculaQuery: vi.fn(() => ({
    data: {
      data: [
        { _id: "c1", slug: "nu-honours-bba-accounting", program: "BBA", department: "Accounting", departmentBn: "হিসাববিজ্ঞান", years: [{ year: 1 }] }
      ]
    },
    isLoading: false
  })),
  useGetCurriculumQuery: vi.fn(() => ({ data: undefined, isFetching: false })),
}));

// Signed upload for the digital book file.
vi.mock("../../redux/features/content/contentApi", () => ({
  useGetUploadSignatureMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

vi.mock("../../redux/features/book/bookApi", () => ({
  useCreateProductMutation: vi.fn(() => [
    vi.fn().mockResolvedValue({ data: { _id: "prod_abc" } }),
    { isLoading: false }
  ]),
}));

// Mock window.scrollTo and element.scrollIntoView (jsdom has neither)
window.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();
Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

describe("AddProduct Multi-step Wizard Component", () => {
  beforeEach(() => {
    sessionStorageMock.clear();
    vi.clearAllMocks();
  });

  it("renders Step 1 (Book Details) by default", () => {
    render(<AddProduct />);
    
    // Page header title check
    expect(screen.getByText("লিস্টিং তৈরি করো")).toBeInTheDocument();
    
    // Check Step 1 indicator is active
    const step1Btn = screen.getByRole("button", { name: /১/ });
    expect(step1Btn).toBeInTheDocument();
    
    // Check form inputs for Step 1 are visible
    expect(screen.getByLabelText(/বইয়ের নাম/)).toBeInTheDocument();
    expect(screen.getByLabelText(/বর্ণনা/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ক্যাটাগরি/)).toBeInTheDocument();
    expect(screen.getByLabelText(/লেখক/)).toBeInTheDocument();
    
    // Check that Step 2 inputs are NOT visible
    expect(screen.queryByLabelText(/দাম \(৳\)/)).not.toBeInTheDocument();
  });

  it("blocks navigation to Step 2 if required fields in Step 1 are empty", () => {
    render(<AddProduct />);
    
    // Click Next button
    const nextBtn = screen.getByRole("button", { name: /পরের ধাপ/ });
    fireEvent.click(nextBtn);
    
    // Check we are still on Step 1 (the title field should still be here)
    expect(screen.getByLabelText(/বইয়ের নাম/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/দাম \(৳\)/)).not.toBeInTheDocument();
  });

  it("advances to Step 2 (Price & Logistics) when Step 1 fields are valid", async () => {
    render(<AddProduct />);
    
    // Fill required Step 1 fields
    fireEvent.change(screen.getByLabelText(/বইয়ের নাম/), { target: { value: "Test Book Title" } });
    fireEvent.change(screen.getByLabelText(/বর্ণনা/), { target: { value: "This is a detailed 10+ character description of the test book." } });
    fireEvent.change(screen.getByLabelText(/ক্যাটাগরি/), { target: { value: "Fiction" } });
    fireEvent.change(screen.getByLabelText(/লেখক/), { target: { value: "Author Name" } });
    
    // Click Next
    const nextBtn = screen.getByRole("button", { name: /পরের ধাপ/ });
    fireEvent.click(nextBtn);
    
    // Assert we moved to Step 2
    await waitFor(() => {
      expect(screen.getByLabelText(/দাম \(৳\)/)).toBeInTheDocument();
      expect(screen.getByLabelText(/বইয়ের অবস্থা/)).toBeInTheDocument();
      expect(screen.queryByLabelText(/বইয়ের নাম/)).not.toBeInTheDocument();
    });
  });

  it("toggles fields correctly between Physical and Digital product types", async () => {
    render(<AddProduct />);
    
    // Click Digital Document card option
    const digitalCard = screen.getByRole("button", { name: /ডিজিটাল ফাইল/ });
    fireEvent.click(digitalCard);
    
    // Fill step 1 required fields
    fireEvent.change(screen.getByLabelText(/বইয়ের নাম/), { target: { value: "Digital Guide" } });
    fireEvent.change(screen.getByLabelText(/বর্ণনা/), { target: { value: "This is a detailed description of the digital book product." } });
    fireEvent.change(screen.getByLabelText(/ক্যাটাগরি/), { target: { value: "Technology" } });
    fireEvent.change(screen.getByLabelText(/লেখক/), { target: { value: "Tech Writer" } });
    
    // Click Next
    const nextBtn = screen.getByRole("button", { name: /পরের ধাপ/ });
    fireEvent.click(nextBtn);
    
    // Assert Step 2 shows digital fields and not physical fields
    await waitFor(() => {
      expect(screen.getByLabelText(/দাম \(৳\)/)).toBeInTheDocument();
      expect(screen.getByLabelText(/ফাইলের ধরন/)).toBeInTheDocument();
      // The book file is uploaded (or linked) on this step.
      expect(screen.getByText(/বইয়ের ফাইল আপলোড করো/)).toBeInTheDocument();
      
      // Should not show physical fields
      expect(screen.queryByLabelText(/বইয়ের অবস্থা/)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/বিভাগ/)).not.toBeInTheDocument();
    });
  });

  it("shows the course picker only when the category is Academic", () => {
    render(<AddProduct />);

    // Course picker should not render initially
    expect(screen.queryByLabelText(/প্রোগ্রাম/)).not.toBeInTheDocument();

    // Change Category to Academic
    fireEvent.change(screen.getByLabelText(/ক্যাটাগরি/), { target: { value: "Academic" } });

    // Now program → department → year → course selects are visible
    expect(screen.getByLabelText(/প্রোগ্রাম/)).toBeInTheDocument();
    expect(screen.getByLabelText(/কোর্স \/ বিষয়/)).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /বিবিএ/ })).toBeInTheDocument();
  });
});
