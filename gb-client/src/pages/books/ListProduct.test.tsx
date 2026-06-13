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

vi.mock("../../redux/features/category/categoryApi", () => ({
  useGetCategoriesQuery: vi.fn(() => ({
    data: {
      data: [
        { _id: "lvl1", levelId: "lvl1", levelName: "Undergraduate", faculties: [] }
      ]
    },
    isLoading: false
  })),
}));

vi.mock("../../redux/features/book/bookApi", () => ({
  useCreateProductMutation: vi.fn(() => [
    vi.fn().mockResolvedValue({ data: { _id: "prod_abc" } }),
    { isLoading: false }
  ]),
}));

// Mock window.scrollTo
window.scrollTo = vi.fn();

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
    expect(screen.getByText("Create Listing")).toBeInTheDocument();
    
    // Check Step 1 indicator is active
    const step1Btn = screen.getByRole("button", { name: /1/i });
    expect(step1Btn).toBeInTheDocument();
    
    // Check form inputs for Step 1 are visible
    expect(screen.getByLabelText(/Book Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Author \/ Writer/i)).toBeInTheDocument();
    
    // Check that Step 2 inputs are NOT visible
    expect(screen.queryByLabelText(/Base Price/i)).not.toBeInTheDocument();
  });

  it("blocks navigation to Step 2 if required fields in Step 1 are empty", () => {
    render(<AddProduct />);
    
    // Click Next button
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn);
    
    // Check we are still on Step 1 (the title field should still be here)
    expect(screen.getByLabelText(/Book Title/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Base Price/i)).not.toBeInTheDocument();
  });

  it("advances to Step 2 (Price & Logistics) when Step 1 fields are valid", async () => {
    render(<AddProduct />);
    
    // Fill required Step 1 fields
    fireEvent.change(screen.getByLabelText(/Book Title/i), { target: { value: "Test Book Title" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "This is a detailed 10+ character description of the test book." } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: "Fiction" } });
    fireEvent.change(screen.getByLabelText(/Author \/ Writer/i), { target: { value: "Author Name" } });
    
    // Click Next
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn);
    
    // Assert we moved to Step 2
    await waitFor(() => {
      expect(screen.getByLabelText(/Base Price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Physical Condition/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Book Title/i)).not.toBeInTheDocument();
    });
  });

  it("toggles fields correctly between Physical and Digital product types", async () => {
    render(<AddProduct />);
    
    // Click Digital Document card option
    const digitalCard = screen.getByRole("button", { name: /Digital Document/i });
    fireEvent.click(digitalCard);
    
    // Fill step 1 required fields
    fireEvent.change(screen.getByLabelText(/Book Title/i), { target: { value: "Digital Guide" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "This is a detailed description of the digital book product." } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: "Technology" } });
    fireEvent.change(screen.getByLabelText(/Author \/ Writer/i), { target: { value: "Tech Writer" } });
    
    // Click Next
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn);
    
    // Assert Step 2 shows digital fields and not physical fields
    await waitFor(() => {
      expect(screen.getByLabelText(/Base Price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/File Format/i)).toBeInTheDocument();
      
      // Should not show physical fields
      expect(screen.queryByLabelText(/Physical Condition/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Division/i)).not.toBeInTheDocument();
    });
  });

  it("renders Academic Level dropdown conditionally when Category is Academic", () => {
    render(<AddProduct />);
    
    // Academic Level selector should not render initially
    expect(screen.queryByLabelText(/Education Level/i)).not.toBeInTheDocument();
    
    // Change Category to Academic
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: "Academic" } });
    
    // Now it should be visible
    expect(screen.getByLabelText(/Education Level/i)).toBeInTheDocument();
  });
});
