import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Book, MapPin, GraduationCap, Image as ImageIcon,
  Settings, CheckCircle2, Zap, Package, ChevronDown,
  ChevronLeft, ChevronRight, Check, AlertCircle, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrentUser, TUser } from '../../redux/features/auth/authSlice';
import { useGetCategoriesQuery } from '../../redux/features/category/categoryApi';
import { useCreateProductMutation } from '../../redux/features/book/bookApi';
import divisionsData from '../../assets/db/bangladesh-geojson-master/bd-divisions.json';
import districtsData from '../../assets/db/bangladesh-geojson-master/bd-districts.json';
import upazilasData from '../../assets/db/bangladesh-geojson-master/bd-upazilas.json';
import postcodesData from '../../assets/db/bangladesh-geojson-master/bd-postcodes.json';

export type TEducationCategory = {
  _id: string; levelId: string; levelName: string; faculties: TFaculty[];
};
export type TFaculty = {
  _id: string; facultyId: string; faculty: string;
  facultyShorts: string; departments: TDepartment[];
};
export type TDepartment = {
  _id: string; deptId: string; department: string; deptShorts: string;
};

const CATEGORIES = ["Academic", "Fiction", "Non-Fiction", "Science", "Technology", "Religion", "Children", "Self-Help", "Business", "Other"];
const CONDITIONS_PHYSICAL = ["New", "Like New", "Used"]; // Aligns with backend schema: enum: ["New", "Used", "Like New", "Digital Content"]
const DIGITAL_FORMATS = ["PDF", "EPUB", "MOBI", "MP3", "Other"];
const LANGUAGES = ["Bangla", "English", "English & Bangla", "Arabic", "Other"];

// ── Reusable Field Wrapper with Inline Error Support ─────────────────────────
const Field = ({ label, required, children, span = false, error }: {
  label: string; required?: boolean; children: React.ReactNode; span?: boolean; error?: string;
}) => (
  <div className={span ? "md:col-span-2" : ""}>
    <label className="block text-xs font-semibold tracking-wide uppercase text-stone-500 mb-1.5 flex justify-between">
      <span>{label} {required && <span className="text-rose-500 normal-case tracking-normal">*</span>}</span>
    </label>
    {children}
    {error && (
      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1 font-medium">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

const AddProduct = () => {
  const { id } = useAppSelector(selectCurrentUser) as TUser;

  // ── Step Navigation State ──────────────────────────────────────────────────
  const [step, setStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Form State (Centralized for persistence) ──────────────────────────────
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem("gb_list_product_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Backfill quantity for drafts saved before this field existed
        if (parsed.quantity === undefined) parsed.quantity = "1";
        return parsed;
      } catch (e) {
        console.error("Failed to parse draft from sessionStorage", e);
      }
    }
    return {
      productType: "Physical" as "Physical" | "Digital",
      title: "",
      description: "",
      category: "",
      author: "",
      publisher: "",
      isbn: "",
      edition: "",
      publicationYear: new Date().getFullYear().toString(),
      language: "English",
      price: "",
      isNegotiable: false,
      isContactHidden: false,
      condition: "New", // Default to "New" which is valid for physical
      quantity: "1", // How many identical copies the seller has (Physical only)
      village: "",
      allowPickup: true,
      allowShipping: true,
      fileType: "",
      fileSize: "",
      previewUrl: "",
    };
  });

  // ── Academic State ─────────────────────────────────────────────────────────
  const [selectedLevel, setSelectedLevel] = useState<string | null>(() => sessionStorage.getItem("gb_selected_level"));
  const [faculties, setFaculties] = useState<TFaculty[]>([]);
  const [departments, setDepartments] = useState<TDepartment[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(() => sessionStorage.getItem("gb_selected_faculty"));
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(() => sessionStorage.getItem("gb_selected_department"));

  // ── Location State ─────────────────────────────────────────────────────────
  const divisions = divisionsData.divisions;
  const districts = districtsData.districts;
  const upazilas = upazilasData.upazilas;
  const postcodes = postcodesData.postcodes;

  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
  const [filteredUpazilas, setFilteredUpazilas] = useState<any[]>([]);
  const [filteredPostcodes, setFilteredPostcodes] = useState<any[]>([]);

  const [selectedDivision, setSelectedDivision] = useState<any>(() => {
    const saved = sessionStorage.getItem("gb_selected_division");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedDistrict, setSelectedDistrict] = useState<any>(() => {
    const saved = sessionStorage.getItem("gb_selected_district");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedUpazila, setSelectedUpazila] = useState<any>(() => {
    const saved = sessionStorage.getItem("gb_selected_upazila");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedPostcode, setSelectedPostcode] = useState<string>(() => {
    return sessionStorage.getItem("gb_selected_postcode") || "";
  });

  // ── Image State ────────────────────────────────────────────────────────────
  const [productImages, setProductImages] = useState<string[]>(() => {
    const saved = sessionStorage.getItem("gb_list_product_images");
    return saved ? JSON.parse(saved) : [];
  });
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading: categoriesLoading } = useGetCategoriesQuery(undefined);
  const [createProduct] = useCreateProductMutation();

  const CurrentYear = new Date().getFullYear();
  const previousYears = Array.from({ length: 50 }, (_, i) => CurrentYear - i);

  // ── Save State to SessionStorage on changes ────────────────────────────────
  useEffect(() => {
    sessionStorage.setItem("gb_list_product_draft", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    sessionStorage.setItem("gb_list_product_images", JSON.stringify(productImages));
  }, [productImages]);

  useEffect(() => {
    if (selectedDivision) sessionStorage.setItem("gb_selected_division", JSON.stringify(selectedDivision));
    else sessionStorage.removeItem("gb_selected_division");
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDistrict) sessionStorage.setItem("gb_selected_district", JSON.stringify(selectedDistrict));
    else sessionStorage.removeItem("gb_selected_district");
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedUpazila) sessionStorage.setItem("gb_selected_upazila", JSON.stringify(selectedUpazila));
    else sessionStorage.removeItem("gb_selected_upazila");
  }, [selectedUpazila]);

  useEffect(() => {
    if (selectedPostcode) sessionStorage.setItem("gb_selected_postcode", selectedPostcode);
    else sessionStorage.removeItem("gb_selected_postcode");
  }, [selectedPostcode]);

  useEffect(() => {
    if (selectedLevel) sessionStorage.setItem("gb_selected_level", selectedLevel);
    else sessionStorage.removeItem("gb_selected_level");
  }, [selectedLevel]);

  useEffect(() => {
    if (selectedFaculty) sessionStorage.setItem("gb_selected_faculty", selectedFaculty);
    else sessionStorage.removeItem("gb_selected_faculty");
  }, [selectedFaculty]);

  useEffect(() => {
    if (selectedDepartment) sessionStorage.setItem("gb_selected_department", selectedDepartment);
    else sessionStorage.removeItem("gb_selected_department");
  }, [selectedDepartment]);

  // ── Fetch Academic Levels ─────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedLevel) {
      setFaculties([]);
      return;
    }
    fetch(`https://grontho-bilash-server.vercel.app/api/v1/level?level=${selectedLevel}`)
      .then(r => r.json())
      .then(d => setFaculties(d?.data?.faculties || []))
      .catch(console.error);
  }, [selectedLevel]);

  useEffect(() => {
    if (!selectedFaculty) {
      setDepartments([]);
      return;
    }
    fetch(`https://grontho-bilash-server.vercel.app/api/v1/faculty?facultyId=${selectedFaculty}`)
      .then(r => r.json())
      .then(d => setDepartments(d?.data?.departments || []))
      .catch(console.error);
  }, [selectedFaculty]);

  // ── Handle Location Filtering ──────────────────────────────────────────────
  useEffect(() => {
    if (selectedDivision) {
      setFilteredDistricts(districts.filter(d => d.division_id === selectedDivision.id));
    } else {
      setFilteredDistricts([]);
    }
  }, [selectedDivision, districts]);

  useEffect(() => {
    if (selectedDistrict) {
      setFilteredUpazilas(upazilas.filter(u => u.district_id === selectedDistrict.id));
    } else {
      setFilteredUpazilas([]);
    }
  }, [selectedDistrict, upazilas]);

  useEffect(() => {
    if (selectedUpazila) {
      setFilteredPostcodes(postcodes.filter(p => p.upazila === selectedUpazila.name));
    } else {
      setFilteredPostcodes([]);
    }
  }, [selectedUpazila, postcodes]);

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  // ── Image Upload ───────────────────────────────────────────────────────────
  const handleFileUpload = async (event: FormEvent<HTMLInputElement>, slotIndex: number) => {
    event.preventDefault();
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setUploadingIndex(slotIndex);
    const uploadData = new FormData();
    uploadData.append("image", file);
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || /^(192\.168\.|10\.|172\.)/.test(window.location.hostname);
      const uploadUrl = isLocal ? `http://${window.location.hostname}:5000/api/v1/books/upload` : 'https://grontho-bilash-server.vercel.app/api/v1/books/upload';
      const response = await axios.post(uploadUrl, uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = [...productImages];
      updated[slotIndex] = response.data.url;
      setProductImages(updated);
      toast.success("Image uploaded successfully!");
    } catch (e) {
      toast.error("Image upload failed");
      console.error(e);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...productImages];
    updated.splice(index, 1);
    setProductImages(updated);
  };

  // ── Validation Logic ───────────────────────────────────────────────────────
  const validateStep = (targetStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (targetStep === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "Title is required";
      } else if (formData.title.trim().length < 3) {
        newErrors.title = "Title must be at least 3 characters long";
      }

      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      } else if (formData.description.trim().length < 10) {
        newErrors.description = "Description must be at least 10 characters long";
      }

      if (!formData.category) {
        newErrors.category = "Category is required";
      }

      if (!formData.author.trim()) {
        newErrors.author = "Author name is required";
      }

      if (formData.category === "Academic") {
        if (!selectedLevel) {
          newErrors.level = "Academic Level is required";
        }
      }
    }

    if (targetStep === 2) {
      const priceNum = parseFloat(formData.price);
      if (!formData.price) {
        newErrors.price = "Base price is required";
      } else if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = "Price must be a positive number";
      }

      if (formData.productType === "Physical") {
        if (!formData.condition) {
          newErrors.condition = "Condition is required";
        }

        const qtyNum = parseInt(formData.quantity, 10);
        if (formData.quantity === "" || formData.quantity === null || formData.quantity === undefined) {
          newErrors.quantity = "Quantity is required";
        } else if (isNaN(qtyNum) || !Number.isInteger(qtyNum) || qtyNum < 1) {
          newErrors.quantity = "Quantity must be a whole number of 1 or more";
        }

        if (!selectedDivision) {
          newErrors.division = "Division is required";
        }
        if (!selectedDistrict) {
          newErrors.district = "District is required";
        }
        if (!selectedUpazila) {
          newErrors.upazila = "Upazila is required";
        }
        if (!formData.village.trim()) {
          newErrors.village = "Village / Street Address is required";
        } else if (formData.village.trim().length < 3) {
          newErrors.village = "Address must be at least 3 characters long";
        }
        if (!formData.allowPickup && !formData.allowShipping) {
          newErrors.fulfillment = "Please allow at least one fulfillment option";
        }
      } else {
        // Digital
        if (!formData.fileType) {
          newErrors.fileType = "File type format is required";
        }
      }
    }

    if (targetStep === 3) {
      if (!productImages[0]) {
        newErrors.images = "At least one product image is required as the Cover Photo";
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (!isValid) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      // Smooth scroll to the first error element
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearDraft = () => {
    if (window.confirm("Are you sure you want to clear the current draft? All fields will be reset.")) {
      sessionStorage.clear();
      setFormData({
        productType: "Physical",
        title: "",
        description: "",
        category: "",
        author: "",
        publisher: "",
        isbn: "",
        edition: "",
        publicationYear: new Date().getFullYear().toString(),
        language: "English",
        price: "",
        isNegotiable: false,
        isContactHidden: false,
        condition: "New",
        quantity: "1",
        village: "",
        allowPickup: true,
        allowShipping: true,
        fileType: "",
        fileSize: "",
        previewUrl: "",
      });
      setProductImages([]);
      setSelectedDivision(null);
      setSelectedDistrict(null);
      setSelectedUpazila(null);
      setSelectedPostcode("");
      setSelectedLevel(null);
      setSelectedFaculty(null);
      setSelectedDepartment(null);
      setStep(1);
      setErrors({});
      toast.success("Draft cleared successfully!");
    }
  };

  // ── Submit Listing ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    const locationStr = formData.productType === "Physical"
      ? `${formData.village}, ${selectedUpazila?.name}, ${selectedDistrict?.name}, ${selectedDivision?.name}`
      : "Digital";

    const payload = {
      seller: id,
      title: formData.title,
      slug: formData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: formData.description,
      productType: formData.productType,
      category: formData.category,
      subcategory: formData.category === "Academic" ? "Academic" : formData.category,
      price: {
        basePrice: parseFloat(formData.price),
        isNegotiable: formData.isNegotiable,
      },
      condition: formData.productType === "Digital" ? "Digital Content" : formData.condition,
      images: productImages.filter(Boolean),
      location: locationStr,
      isPublished: true, // Explicitly published immediately upon creation
      isContactHidden: formData.isContactHidden,
      fulfillmentOptions: {
        allowPickup: formData.productType === "Physical" ? formData.allowPickup : false,
        allowShipping: formData.productType === "Physical" ? formData.allowShipping : false,
        isDigitalDelivery: formData.productType === "Digital",
      },
      bookMetadata: {
        author: formData.author,
        publisher: formData.publisher,
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear) : undefined,
        isbn: formData.isbn,
        edition: formData.edition,
        language: formData.language,
      },
      // Inventory is only meaningful for Physical stock; Digital products
      // rely on the backend's default (unlimited / always-1) quantity.
      ...(formData.productType === "Physical" && {
        inventory: {
          quantity: parseInt(formData.quantity, 10) || 1,
        },
      }),
      ...(formData.productType === "Digital" && {
        digitalDetails: {
          fileType: formData.fileType,
          fileSize: formData.fileSize,
        },
      }),
      ...(formData.category === "Academic" && {
        academicMetadata: {
          level: selectedLevel,
          faculty: selectedFaculty,
          department: selectedDepartment,
        },
      }),
    };

    try {
      const response = await createProduct(payload);
      if ((response as any)?.data) {
        toast.success("Product listed and published successfully!");
        // Clear draft from storage on success
        sessionStorage.removeItem("gb_list_product_draft");
        sessionStorage.removeItem("gb_list_product_images");
        sessionStorage.removeItem("gb_selected_division");
        sessionStorage.removeItem("gb_selected_district");
        sessionStorage.removeItem("gb_selected_upazila");
        sessionStorage.removeItem("gb_selected_postcode");
        sessionStorage.removeItem("gb_selected_level");
        sessionStorage.removeItem("gb_selected_faculty");
        sessionStorage.removeItem("gb_selected_department");

        // Delay redirect slightly to show toast
        setTimeout(() => {
          window.location.href = "/user/my-Products";
        }, 1500);
      } else {
        toast.error((response as any)?.error?.data?.message || "Failed to create listing. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-500">Loading Categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* ── Page Header & Step Tracker ── */}
        <div className="mb-4 text-center sm:text-left ">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">Create Listing</h1>
              <p className="mt-1 text-sm text-stone-500">
                Publish a physical book or a digital file to the marketplace in 3 simple steps.
              </p>
            </div>
            <button
              type="button"
              onClick={clearDraft}
              className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all self-center sm:self-auto"
            >
              Clear Draft
            </button>
          </div>

          {/* Step Progress Tracker */}
          <div className="mt-8 relative">
            {/* Background progress bar */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-stone-200 -z-10" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-amber-500 -z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            <div className="flex justify-between items-center">
              {[
                { number: 1, title: "Book Details", subtitle: "Classification & Info" },
                { number: 2, title: "Price & Logistics", subtitle: "Pricing, Shipping & Terms" },
                { number: 3, title: "Upload & Review", subtitle: "Cover Images & Publish" }
              ].map(s => {
                const isActive = step === s.number;
                const isCompleted = step > s.number;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => {
                      // Allow backing up anytime, or going forward if validated
                      if (s.number < step) setStep(s.number);
                      else if (s.number === step + 1 && validateStep(step)) setStep(s.number);
                      else if (s.number === step + 2 && validateStep(step) && validateStep(step + 1)) setStep(s.number);
                    }}
                    className="flex flex-col items-center group cursor-pointer focus:outline-none"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${isCompleted
                        ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/10"
                        : isActive
                          ? "bg-white text-amber-600 border-amber-500 shadow-lg shadow-amber-500/20 scale-110"
                          : "bg-white text-stone-400 border-stone-200 hover:border-stone-400"
                      }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : s.number}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-xs font-bold ${isActive ? "text-amber-600" : "text-stone-800"}`}>
                        {s.title}
                      </p>
                      <p className="text-[10px] text-stone-400 hidden sm:block mt-0.5">
                        {s.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ────────────────── STEP 1: Details ────────────────── */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">

              {/* Product Type (Physical vs Digital) */}
              <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Book className="w-4 h-4 text-amber-500" />
                  Product Type
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => updateField("productType", "Physical")}
                    className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${formData.productType === "Physical"
                        ? "border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/15 shadow-sm"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/20"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${formData.productType === "Physical" ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-500"
                      }`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-800">Physical Book</h4>
                      <p className="text-[11px] text-stone-400 mt-1">For print novels, text-books, reference sheets. Includes delivery & location.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField("productType", "Digital")}
                    className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all ${formData.productType === "Digital"
                        ? "border-violet-500 bg-violet-50/20 ring-2 ring-violet-500/15 shadow-sm"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/20"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${formData.productType === "Digital" ? "bg-violet-100 text-violet-600" : "bg-stone-100 text-stone-500"
                      }`}>
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-800">Digital Document</h4>
                      <p className="text-[11px] text-stone-400 mt-1">For PDFs, EPUB formats, lecture slides, worksheets. Handled via download link.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-3 flex items-center gap-2">
                  <Book className="w-4 h-4 text-amber-500" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Book Title" required span error={errors.title}>
                    <input
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={e => updateField("title", e.target.value)}
                      placeholder="e.g. Fundamentals of Physics, 11th Edition"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Description" required span error={errors.description}>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={e => updateField("description", e.target.value)}
                      placeholder="Describe the listing condition, notes, or specific chapters included..."
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Category" required error={errors.category}>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={e => updateField("category", e.target.value)}
                        className={selectCls}
                      >
                        <option value="" disabled>Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="Author / Writer" required error={errors.author}>
                    <input
                      name="author"
                      type="text"
                      value={formData.author}
                      onChange={e => updateField("author", e.target.value)}
                      placeholder="e.g. Halliday & Resnick"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              {/* Academic Metadata (Conditional) */}
              {formData.category === "Academic" && (
                <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5 animate-slideDown">
                  <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-500" />
                    Academic Metadata
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Field label="Education Level" required error={errors.level}>
                      <div className="relative">
                        <select
                          name="level"
                          value={selectedLevel || ""}
                          onChange={e => {
                            setSelectedLevel(e.target.value);
                            setSelectedFaculty(null);
                            setSelectedDepartment(null);
                          }}
                          className={selectCls}
                        >
                          <option value="" disabled>Select Level</option>
                          {data?.data?.map((item: TEducationCategory) => (
                            <option key={item._id} value={item._id}>{item.levelName}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                      </div>
                    </Field>

                    <Field label="Faculty / Group">
                      <div className="relative">
                        <select
                          value={selectedFaculty || ""}
                          onChange={e => {
                            setSelectedFaculty(e.target.value);
                            setSelectedDepartment(null);
                          }}
                          disabled={!faculties.length}
                          className={selectCls}
                        >
                          <option value="">Select Faculty</option>
                          {faculties.map((f: TFaculty) => (
                            <option key={f._id} value={f._id}>{f.faculty} ({f.facultyShorts})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                      </div>
                    </Field>

                    <Field label="Department">
                      <div className="relative">
                        <select
                          value={selectedDepartment || ""}
                          onChange={e => setSelectedDepartment(e.target.value)}
                          disabled={!departments.length}
                          className={selectCls}
                        >
                          <option value="">Select Department</option>
                          {departments.map((d: TDepartment) => (
                            <option key={d._id} value={d._id}>{d.department} ({d.deptShorts})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {/* Book Metadata */}
              <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-3 flex items-center gap-2">
                  <Book className="w-4 h-4 text-amber-500" />
                  Additional Book Info
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Publisher">
                    <input
                      name="publisher"
                      type="text"
                      value={formData.publisher}
                      onChange={e => updateField("publisher", e.target.value)}
                      placeholder="e.g. Wiley"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Edition">
                    <input
                      name="edition"
                      type="text"
                      value={formData.edition}
                      onChange={e => updateField("edition", e.target.value)}
                      placeholder="e.g. 11th Edition"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="Publication Year">
                    <div className="relative">
                      <select
                        name="publicationYear"
                        value={formData.publicationYear}
                        onChange={e => updateField("publicationYear", e.target.value)}
                        className={selectCls}
                      >
                        {previousYears.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="Language">
                    <div className="relative">
                      <select
                        name="language"
                        value={formData.language}
                        onChange={e => updateField("language", e.target.value)}
                        className={selectCls}
                      >
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="ISBN Code" span>
                    <input
                      name="isbn"
                      type="text"
                      value={formData.isbn}
                      onChange={e => updateField("isbn", e.target.value)}
                      placeholder="e.g. 978-0470595848"
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── STEP 2: Pricing & Logistics ────────────────── */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">

              {/* General Pricing & Preferences */}
              <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-500" />
                  Pricing & Preferences
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Base Price (৳)" required error={errors.price}>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-semibold">৳</span>
                      <input
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={e => updateField("price", e.target.value)}
                        placeholder="0.00"
                        className={`${inputCls} pl-8`}
                      />
                    </div>
                  </Field>

                  {/* Negotiable & Hide Number Checklist */}
                  <div className="flex flex-col gap-3 pt-6">
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                      <input
                        name="isNegotiable"
                        type="checkbox"
                        checked={formData.isNegotiable}
                        onChange={e => updateField("isNegotiable", e.target.checked)}
                        className="mt-1 w-4 h-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-800">Price is Negotiable</p>
                        <p className="text-[10px] text-stone-400">Allow buyers to chat and propose pricing offers</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                      <input
                        name="isContactHidden"
                        type="checkbox"
                        checked={formData.isContactHidden}
                        onChange={e => updateField("isContactHidden", e.target.checked)}
                        className="mt-1 w-4 h-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500"
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-800">Hide Mobile Contact Number</p>
                        <p className="text-[10px] text-stone-400">Keep your phone private; coordinate via app messaging</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Physical Logistics Details */}
              {formData.productType === "Physical" && (
                <div className="space-y-6">
                  {/* Condition, Quantity & Fulfillment */}
                  <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-500" />
                      Condition & Logistics
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Physical Condition" required error={errors.condition}>
                        <div className="relative">
                          <select
                            name="condition"
                            value={formData.condition}
                            onChange={e => updateField("condition", e.target.value)}
                            className={selectCls}
                          >
                            {CONDITIONS_PHYSICAL.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>
                      </Field>

                      <Field
                        label="Quantity Available"
                        required
                        error={errors.quantity}
                      >
                        <input
                          name="quantity"
                          type="number"
                          step="1"
                          min="1"
                          value={formData.quantity}
                          onChange={e => updateField("quantity", e.target.value)}
                          placeholder="1"
                          className={inputCls}
                        />
                        <p className="text-[10px] text-stone-400 mt-1">
                          Defaults to 1. Increase only if you have multiple identical copies of this exact book.
                        </p>
                      </Field>

                      <div className="space-y-3 md:col-span-2">
                        <p className="block text-xs font-semibold tracking-wide uppercase text-stone-500">
                          Fulfillment Options <span className="text-rose-500">*</span>
                        </p>
                        {errors.fulfillment && <p className="text-xs text-rose-500 font-medium">{errors.fulfillment}</p>}

                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-50 transition-all">
                            <input
                              type="checkbox"
                              checked={formData.allowPickup}
                              onChange={e => updateField("allowPickup", e.target.checked)}
                              className="w-4 h-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500"
                            />
                            <div>
                              <p className="text-xs font-bold text-stone-800">Allow Pickup</p>
                              <p className="text-[9px] text-stone-400">In-person collection</p>
                            </div>
                          </label>

                          <label className="flex items-center gap-2.5 p-3.5 rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-50 transition-all">
                            <input
                              type="checkbox"
                              checked={formData.allowShipping}
                              onChange={e => updateField("allowShipping", e.target.checked)}
                              className="w-4 h-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500"
                            />
                            <div>
                              <p className="text-xs font-bold text-stone-800">Allow Shipping</p>
                              <p className="text-[9px] text-stone-400">Courier delivery</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5">
                    <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      Dispatch Location
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Division" required error={errors.division}>
                        <div className="relative">
                          <select
                            name="division"
                            value={selectedDivision?.id || ""}
                            onChange={e => {
                              const found = divisions.find(d => d.id === e.target.value);
                              setSelectedDivision(found || null);
                              setSelectedDistrict(null);
                              setSelectedUpazila(null);
                              setSelectedPostcode("");
                            }}
                            className={selectCls}
                          >
                            <option value="" disabled>Select Division</option>
                            {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>
                      </Field>

                      <Field label="District" required error={errors.district}>
                        <div className="relative">
                          <select
                            name="district"
                            value={selectedDistrict?.id || ""}
                            onChange={e => {
                              const found = filteredDistricts.find(d => d.id === e.target.value);
                              setSelectedDistrict(found || null);
                              setSelectedUpazila(null);
                              setSelectedPostcode("");
                            }}
                            disabled={!selectedDivision}
                            className={selectCls}
                          >
                            <option value="" disabled>Select District</option>
                            {filteredDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>
                      </Field>

                      <Field label="Upazila" required error={errors.upazila}>
                        <div className="relative">
                          <select
                            name="upazila"
                            value={selectedUpazila?.id || ""}
                            onChange={e => {
                              const found = filteredUpazilas.find(u => u.id === e.target.value);
                              setSelectedUpazila(found || null);
                              setSelectedPostcode("");
                            }}
                            disabled={!selectedDistrict}
                            className={selectCls}
                          >
                            <option value="" disabled>Select Upazila</option>
                            {filteredUpazilas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>
                      </Field>

                      <Field label="Postal Code">
                        <div className="relative">
                          <select
                            value={selectedPostcode}
                            onChange={e => setSelectedPostcode(e.target.value)}
                            disabled={!selectedUpazila}
                            className={selectCls}
                          >
                            <option value="">Select Postal Code</option>
                            {filteredPostcodes.map(p => (
                              <option key={p.postCode} value={p.postCode}>
                                {p.postCode} — {p.postOffice}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>
                      </Field>

                      <Field label="Village / Street Address" required span error={errors.village}>
                        <input
                          name="village"
                          type="text"
                          value={formData.village}
                          onChange={e => updateField("village", e.target.value)}
                          placeholder="Road No, House name, Area/Village details..."
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Metadata Details */}
              {formData.productType === "Digital" && (
                <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5">
                  <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Digital Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="File Format" required error={errors.fileType}>
                      <div className="relative">
                        <select
                          name="fileType"
                          value={formData.fileType}
                          onChange={e => updateField("fileType", e.target.value)}
                          className={selectCls}
                        >
                          <option value="" disabled>Select file type</option>
                          {DIGITAL_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                      </div>
                    </Field>

                    <Field label="Estimated File Size (MB)">
                      <input
                        name="fileSize"
                        type="text"
                        value={formData.fileSize}
                        onChange={e => updateField("fileSize", e.target.value)}
                        placeholder="e.g. 12.5"
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Preview PDF / Image URL" span>
                      <input
                        name="previewUrl"
                        type="url"
                        value={formData.previewUrl}
                        onChange={e => updateField("previewUrl", e.target.value)}
                        placeholder="https://... (Share a free sample or preview link)"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                    <p className="text-xs text-amber-700 font-medium">
                      📎 Safe delivery link: The file download URL for paid customers is handled secure-end by the platform post purchase. Sellers only list static review materials/samples here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ────────────────── STEP 3: Upload & Review ────────────────── */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">

              {/* Upload Images Grid */}
              <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  Product Images
                </h3>
                <p className="text-xs text-stone-500">
                  Upload up to 6 high-quality photos. The first image listed acts as the marketplace **Cover Photo**.
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square relative rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 overflow-hidden group transition-all hover:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20"
                    >
                      {uploadingIndex === index ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : productImages[index] ? (
                        <>
                          <img src={productImages[index]} alt="" className="w-full h-full object-cover" />
                          {index === 0 && (
                            <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">Cover</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-rose-600 focus:opacity-100"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-1 p-2">
                          <ImageIcon className="w-5 h-5 text-stone-300" />
                          <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">{index === 0 ? "Cover" : `Photo ${index + 1}`}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleFileUpload(e, index)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                {errors.images && <p className="text-xs text-rose-500 font-bold mt-2">{errors.images}</p>}
                <p className="text-[11px] text-stone-400 text-center">Supported: PNG, JPG, JPEG · Max 5MB per upload slot</p>
              </div>

              {/* ── Visual Review & Mock Card ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">

                {/* Live Card Mockup (Left/4 cols) */}
                <div className="lg:col-span-5 bg-white border border-stone-100 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 mb-2">
                    <Eye className="w-4 h-4" /> Live Card Preview
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-md group max-w-sm mx-auto">
                    <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                      {productImages[0] ? (
                        <img src={productImages[0]} alt="Book Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                          <Book className="w-10 h-10 stroke-1 text-stone-300 animate-pulse" />
                          <span className="text-xs font-semibold">Upload cover photo</span>
                        </div>
                      )}
                      <span className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm ${formData.productType === "Digital" ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700"
                        }`}>
                        {formData.productType}
                      </span>
                      {formData.productType === "Physical" && (
                        (() => {
                          const qty = parseInt(formData.quantity, 10) || 0;
                          const outOfStock = qty <= 0;
                          return (
                            <span className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm ${outOfStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                              }`}>
                              {outOfStock ? "Out of Stock" : qty > 1 ? `${qty} Copies` : "In Stock"}
                            </span>
                          );
                        })()
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{formData.category || "General"}</span>
                        <h4 className="text-sm font-black text-stone-800 line-clamp-1 mt-0.5">{formData.title || "Untiled Listing"}</h4>
                        <p className="text-xs text-stone-500 truncate mt-0.5">{formData.author ? `by ${formData.author}` : "Author details unknown"}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-stone-50 pt-3">
                        <div>
                          <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Price</p>
                          <p className="text-sm font-extrabold text-stone-900">৳{formData.price || "0.00"}</p>
                        </div>
                        {formData.productType === "Physical" ? (
                          <div className="text-right">
                            <span className="text-[9px] text-stone-400 block uppercase font-bold">Condition</span>
                            <span className="text-[10px] font-black text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">{formData.condition}</span>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-[9px] text-stone-400 block uppercase font-bold">Format</span>
                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">{formData.fileType || "Digital"}</span>
                          </div>
                        )}
                      </div>

                      {formData.productType === "Physical" && (selectedDivision || selectedDistrict) && (
                        <div className="flex items-center gap-1 text-[10px] text-stone-400 pt-1">
                          <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                          <span className="truncate">{selectedUpazila?.name || selectedDistrict?.name || selectedDivision?.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Table Summary (Right/7 cols) */}
                <div className="lg:col-span-7 bg-white border border-stone-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-2">
                    Review Listing Metadata
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">Classification</p>
                      <p className="text-stone-800 mt-0.5 font-semibold">{formData.productType} Product · {formData.category}</p>
                    </div>

                    <div>
                      <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">Pricing terms</p>
                      <p className="text-stone-800 mt-0.5 font-semibold">
                        ৳{formData.price} {formData.isNegotiable ? "(Negotiable)" : "(Fixed)"}
                      </p>
                    </div>

                    <div>
                      <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">Author & Publisher</p>
                      <p className="text-stone-800 mt-0.5 font-semibold">
                        {formData.author} {formData.publisher && `(Pub: ${formData.publisher})`}
                      </p>
                    </div>

                    <div>
                      <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">Year & Edition</p>
                      <p className="text-stone-800 mt-0.5 font-semibold">
                        {formData.edition || "N/A"} · {formData.publicationYear}
                      </p>
                    </div>

                    {formData.productType === "Physical" ? (
                      <>
                        <div>
                          <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">Quantity Available</p>
                          <p className="text-stone-800 mt-0.5 font-semibold">
                            {formData.quantity || "1"} {parseInt(formData.quantity, 10) === 1 ? "copy" : "copies"}
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">Fulfillment</p>
                          <p className="text-stone-800 mt-0.5 font-semibold">
                            {[
                              formData.allowPickup && "Pickup",
                              formData.allowShipping && "Shipping"
                            ].filter(Boolean).join(" & ") || "None"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">Dispatch Location</p>
                          <p className="text-stone-800 mt-0.5 font-semibold truncate">
                            {formData.village}, {selectedUpazila?.name}, {selectedDistrict?.name}, {selectedDivision?.name}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">File Format & Size</p>
                          <p className="text-stone-800 mt-0.5 font-semibold">
                            {formData.fileType} {formData.fileSize && `(${formData.fileSize} MB)`}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">Preview Sample URL</p>
                          <p className="text-stone-800 mt-0.5 font-semibold truncate hover:underline text-amber-600">
                            {formData.previewUrl || "No preview uploaded"}
                          </p>
                        </div>
                      </>
                    )}

                    <div>
                      <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">Language & ISBN</p>
                      <p className="text-stone-800 mt-0.5 font-semibold">
                        {formData.language} {formData.isbn ? `· ISBN: ${formData.isbn}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ── Action Buttons Footer ── */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200/60 pb-8">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 text-sm font-bold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-stone-900 rounded-xl hover:bg-amber-600 hover:shadow-md transition-all flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-stone-900 rounded-xl hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Publish Listing
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;