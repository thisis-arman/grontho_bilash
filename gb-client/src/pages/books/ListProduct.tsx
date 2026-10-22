import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Book, MapPin, GraduationCap, Image as ImageIcon,
  Settings, CheckCircle2, Zap, Package, ChevronDown,
  ChevronLeft, ChevronRight, Check, AlertCircle, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '../../redux/hooks';
import type { RootState } from '../../redux/store';
import { API_BASE_URL } from '../../config/api';
import { compressImage } from '../../utils/compressImage';
import { selectCurrentUser, TUser } from '../../redux/features/auth/authSlice';
import CoursePicker, { type AcademicChoice } from '../../components/courses/CoursePicker';
import { useCreateProductMutation } from '../../redux/features/book/bookApi';
import divisionsData from '../../assets/db/bangladesh-geojson-master/bd-divisions.json';
import districtsData from '../../assets/db/bangladesh-geojson-master/bd-districts.json';
import upazilasData from '../../assets/db/bangladesh-geojson-master/bd-upazilas.json';
import postcodesData from '../../assets/db/bangladesh-geojson-master/bd-postcodes.json';
import { bnNumber, conditionLabel, productTypeLabel, stockLabel } from '../../i18n/labels';

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

// Bangla display labels; the English values above are what we send to the API.
const CATEGORY_LABELS: Record<string, string> = {
  Academic: "একাডেমিক", Fiction: "কল্পকাহিনী", "Non-Fiction": "নন-ফিকশন", Science: "বিজ্ঞান",
  Technology: "প্রযুক্তি", Religion: "ধর্মীয়", Children: "শিশুতোষ", "Self-Help": "সেলফ-হেল্প",
  Business: "ব্যবসা", Other: "অন্যান্য",
};
const LANGUAGE_LABELS: Record<string, string> = {
  Bangla: "বাংলা", English: "ইংরেজি", "English & Bangla": "ইংরেজি ও বাংলা", Arabic: "আরবি", Other: "অন্যান্য",
};
const FORMAT_LABELS: Record<string, string> = { Other: "অন্যান্য" };
const categoryLabel = (value?: string) => (value ? CATEGORY_LABELS[value] ?? value : "");
const languageLabel = (value?: string) => (value ? LANGUAGE_LABELS[value] ?? value : "");
const formatLabel = (value?: string) => (value ? FORMAT_LABELS[value] ?? value : "");

// ── Reusable Field Wrapper with Inline Error Support ─────────────────────────
const Field = ({ label, required, children, span = false, error, htmlFor }: {
  label: string; required?: boolean; children: React.ReactNode; span?: boolean; error?: string; htmlFor?: string;
}) => (
  <div className={span ? "md:col-span-2" : ""}>
    <label htmlFor={htmlFor} className="block text-xs font-semibold tracking-wide uppercase text-stone-500 mb-1.5 flex justify-between">
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
  const token = useAppSelector((state: RootState) => state.auth.token);

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

  // ── Academic State: which course the book is for (course catalogue) ───────
  const [academic, setAcademic] = useState<AcademicChoice>(() => {
    try {
      return JSON.parse(sessionStorage.getItem("gb_selected_course") ?? "{}") as AcademicChoice;
    } catch {
      return {};
    }
  });

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
    try {
      sessionStorage.setItem("gb_selected_course", JSON.stringify(academic));
    } catch {
      // Private mode: the choice just isn't kept across reloads.
    }
  }, [academic]);

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
    setFormData((prev: typeof formData) => ({ ...prev, [key]: value }));
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
    const input = event.target as HTMLInputElement;
    const original = input.files?.[0];
    input.value = ""; // lets the same photo be picked again after an error
    if (!original) return;
    setUploadingIndex(slotIndex);
    try {
      // Resize and re-encode in the browser first: phone photos drop from
      // several MB to a few hundred KB, well under the server's 4 MB limit.
      const file = await compressImage(original);
      if (file.size > 4 * 1024 * 1024) {
        toast.error("ছবিটা অনেক বড়। একটু ছোট ছবি বেছে নাও।");
        return;
      }
      const uploadData = new FormData();
      uploadData.append("image", file);
      const response = await axios.post(`${API_BASE_URL}/books/upload`, uploadData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: token ?? "" },
      });
      const updated = [...productImages];
      updated[slotIndex] = response.data.url;
      setProductImages(updated);
      toast.success("ছবি আপলোড হয়েছে!");
    } catch (e) {
      toast.error("ছবি আপলোড করা যায়নি");
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
        newErrors.title = "বইয়ের নাম দাও";
      } else if (formData.title.trim().length < 3) {
        newErrors.title = "নাম কমপক্ষে ৩ অক্ষরের হতে হবে";
      }

      if (!formData.description.trim()) {
        newErrors.description = "বর্ণনা লেখো";
      } else if (formData.description.trim().length < 10) {
        newErrors.description = "বর্ণনা কমপক্ষে ১০ অক্ষরের হতে হবে";
      }

      if (!formData.category) {
        newErrors.category = "একটা ক্যাটাগরি বেছে নাও";
      }

      if (!formData.author.trim()) {
        newErrors.author = "লেখকের নাম দাও";
      }

    }

    if (targetStep === 2) {
      const priceNum = parseFloat(formData.price);
      if (!formData.price) {
        newErrors.price = "দাম দাও";
      } else if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = "দাম ০-এর চেয়ে বেশি হতে হবে";
      }

      if (formData.productType === "Physical") {
        if (!formData.condition) {
          newErrors.condition = "বইয়ের অবস্থা বেছে নাও";
        }

        const qtyNum = parseInt(formData.quantity, 10);
        if (formData.quantity === "" || formData.quantity === null || formData.quantity === undefined) {
          newErrors.quantity = "কয়টা কপি আছে লেখো";
        } else if (isNaN(qtyNum) || !Number.isInteger(qtyNum) || qtyNum < 1) {
          newErrors.quantity = "কপির সংখ্যা ১ বা তার বেশি পূর্ণ সংখ্যা হতে হবে";
        }

        if (!selectedDivision) {
          newErrors.division = "বিভাগ বেছে নাও";
        }
        if (!selectedDistrict) {
          newErrors.district = "জেলা বেছে নাও";
        }
        if (!selectedUpazila) {
          newErrors.upazila = "উপজেলা বেছে নাও";
        }
        if (!formData.village.trim()) {
          newErrors.village = "গ্রাম / রাস্তার ঠিকানা লেখো";
        } else if (formData.village.trim().length < 3) {
          newErrors.village = "ঠিকানা কমপক্ষে ৩ অক্ষরের হতে হবে";
        }
        if (!formData.allowPickup && !formData.allowShipping) {
          newErrors.fulfillment = "বই হাতে দেওয়ার অন্তত একটা উপায় বেছে নাও";
        }
      } else {
        // Digital
        if (!formData.fileType) {
          newErrors.fileType = "ফাইলের ধরন বেছে নাও";
        }
      }
    }

    if (targetStep === 3) {
      if (!productImages[0]) {
        newErrors.images = "কভার ছবি হিসেবে অন্তত একটা ছবি দাও";
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
    if (window.confirm("এই খসড়াটা মুছে ফেলতে চাও? সব ঘর খালি হয়ে যাবে।")) {
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
      setAcademic({});
      setStep(1);
      setErrors({});
      toast.success("খসড়া মুছে ফেলা হয়েছে!");
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
      ...(formData.category === "Academic" && (academic.program || academic.courseTitle) && {
        academicMetadata: {
          ...(academic.curriculum && { curriculum: academic.curriculum }),
          ...(academic.program && academic.program !== "OTHER" && { program: academic.program }),
          ...(academic.departmentName && { departmentName: academic.departmentName }),
          ...(academic.year && { year: academic.year }),
          ...(academic.courseCode && { courseCode: academic.courseCode }),
          ...(academic.courseTitle?.trim() && { courseTitle: academic.courseTitle.trim() }),
        },
      }),
    };

    try {
      const response = await createProduct(payload);
      if ((response as any)?.data) {
        toast.success("তোমার লিস্টিং প্রকাশ হয়েছে!");
        // Clear draft from storage on success
        sessionStorage.removeItem("gb_list_product_draft");
        sessionStorage.removeItem("gb_list_product_images");
        sessionStorage.removeItem("gb_selected_division");
        sessionStorage.removeItem("gb_selected_district");
        sessionStorage.removeItem("gb_selected_upazila");
        sessionStorage.removeItem("gb_selected_postcode");
        sessionStorage.removeItem("gb_selected_course");

        // Delay redirect slightly to show toast
        setTimeout(() => {
          window.location.href = "/user/my-Products";
        }, 1500);
      } else {
        toast.error((response as any)?.error?.data?.message || "লিস্টিং তৈরি করা যায়নি। আবার চেষ্টা করো।");
      }
    } catch (err) {
      console.error(err);
      toast.error("অপ্রত্যাশিত একটা সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-2">
      <div className="max-w-4xl mx-auto">

        {/* ── Page Header & Step Tracker ── */}
        <div className="mb-4 text-center sm:text-left ">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">লিস্টিং তৈরি করো</h1>
              <p className="mt-1 text-sm text-stone-500">
                ৩টা সহজ ধাপে ছাপা বই বা ডিজিটাল ফাইল মার্কেটপ্লেসে তুলে দাও।
              </p>
            </div>
            <button
              type="button"
              onClick={clearDraft}
              className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all self-center sm:self-auto"
            >
              খসড়া মুছে ফেলো
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
                { number: 1, title: "বইয়ের তথ্য", subtitle: "ধরন ও বিস্তারিত" },
                { number: 2, title: "দাম ও ডেলিভারি", subtitle: "দাম, ডেলিভারি ও শর্ত" },
                { number: 3, title: "ছবি ও রিভিউ", subtitle: "কভার ছবি ও প্রকাশ" }
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
                      {isCompleted ? <Check className="w-5 h-5" /> : bnNumber(s.number)}
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
                  প্রোডাক্টের ধরন
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
                      <h4 className="text-sm font-bold text-stone-800">ছাপা বই</h4>
                      <p className="text-[11px] text-stone-400 mt-1">উপন্যাস, পাঠ্যবই, রেফারেন্স বইয়ের মতো ছাপা জিনিসের জন্য। ডেলিভারি আর ঠিকানা লাগবে।</p>
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
                      <h4 className="text-sm font-bold text-stone-800">ডিজিটাল ফাইল</h4>
                      <p className="text-[11px] text-stone-400 mt-1">পিডিএফ, ইপাব, লেকচার স্লাইড, ওয়ার্কশিটের জন্য। ক্রেতা ডাউনলোড লিংকে পাবে।</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-3 flex items-center gap-2">
                  <Book className="w-4 h-4 text-amber-500" />
                  মূল তথ্য
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="বইয়ের নাম" required span error={errors.title} htmlFor="lp-title">
                    <input
                      id="lp-title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={e => updateField("title", e.target.value)}
                      placeholder="যেমন: উচ্চ মাধ্যমিক পদার্থবিজ্ঞান, ১ম পত্র"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="বর্ণনা" required span error={errors.description} htmlFor="lp-description">
                    <textarea
                      id="lp-description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={e => updateField("description", e.target.value)}
                      placeholder="বইয়ের অবস্থা, ভেতরে নোট আছে কি না, কোন কোন অধ্যায় আছে লেখো..."
                      className={inputCls}
                    />
                  </Field>

                  <Field label="ক্যাটাগরি" required error={errors.category} htmlFor="lp-category">
                    <div className="relative">
                      <select
                        id="lp-category"
                        name="category"
                        value={formData.category}
                        onChange={e => updateField("category", e.target.value)}
                        className={selectCls}
                      >
                        <option value="" disabled>ক্যাটাগরি বেছে নাও</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="লেখক" required error={errors.author} htmlFor="lp-author">
                    <input
                      id="lp-author"
                      name="author"
                      type="text"
                      value={formData.author}
                      onChange={e => updateField("author", e.target.value)}
                      placeholder="যেমন: হুমায়ূন আহমেদ"
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
                    কোন কোর্সের বই?
                  </h3>

                  <CoursePicker value={academic} onChange={setAcademic} />
                </div>
              )}

              {/* Book Metadata */}
              <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider border-b border-stone-100 pb-3 flex items-center gap-2">
                  <Book className="w-4 h-4 text-amber-500" />
                  বইয়ের আরও তথ্য
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="প্রকাশক" htmlFor="lp-publisher">
                    <input
                      id="lp-publisher"
                      name="publisher"
                      type="text"
                      value={formData.publisher}
                      onChange={e => updateField("publisher", e.target.value)}
                      placeholder="যেমন: অন্যপ্রকাশ"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="সংস্করণ" htmlFor="lp-edition">
                    <input
                      id="lp-edition"
                      name="edition"
                      type="text"
                      value={formData.edition}
                      onChange={e => updateField("edition", e.target.value)}
                      placeholder="যেমন: ৩য় সংস্করণ"
                      className={inputCls}
                    />
                  </Field>

                  <Field label="প্রকাশের সাল" htmlFor="lp-year">
                    <div className="relative">
                      <select
                        id="lp-year"
                        name="publicationYear"
                        value={formData.publicationYear}
                        onChange={e => updateField("publicationYear", e.target.value)}
                        className={selectCls}
                      >
                        {previousYears.map(y => <option key={y} value={y}>{bnNumber(y)}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="ভাষা" htmlFor="lp-language">
                    <div className="relative">
                      <select
                        id="lp-language"
                        name="language"
                        value={formData.language}
                        onChange={e => updateField("language", e.target.value)}
                        className={selectCls}
                      >
                        {LANGUAGES.map(l => <option key={l} value={l}>{languageLabel(l)}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="ISBN কোড" span htmlFor="lp-isbn">
                    <input
                      id="lp-isbn"
                      name="isbn"
                      type="text"
                      value={formData.isbn}
                      onChange={e => updateField("isbn", e.target.value)}
                      placeholder="যেমন: 978-0470595848"
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
                  দাম ও পছন্দ
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="দাম (৳)" required error={errors.price} htmlFor="lp-price">
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-semibold">৳</span>
                      <input
                        id="lp-price"
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
                        <p className="text-xs font-bold text-stone-800">দর কষাকষি চলবে</p>
                        <p className="text-[10px] text-stone-400">ক্রেতারা চ্যাটে তাদের অফার জানাতে পারবে</p>
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
                        <p className="text-xs font-bold text-stone-800">মোবাইল নম্বর লুকিয়ে রাখো</p>
                        <p className="text-[10px] text-stone-400">ফোন নম্বর গোপন থাকবে; অ্যাপের মেসেজে কথা বলো</p>
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
                      অবস্থা ও ডেলিভারি
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="বইয়ের অবস্থা" required error={errors.condition} htmlFor="lp-condition">
                        <div className="relative">
                          <select
                            id="lp-condition"
                            name="condition"
                            value={formData.condition}
                            onChange={e => updateField("condition", e.target.value)}
                            className={selectCls}
                          >
                            {CONDITIONS_PHYSICAL.map(c => <option key={c} value={c}>{conditionLabel(c)}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>
                      </Field>

                      <Field
                        label="কয়টা কপি আছে"
                        required
                        error={errors.quantity}
                        htmlFor="lp-quantity"
                      >
                        <input
                          id="lp-quantity"
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
                          সাধারণত ১। ঠিক একই বইয়ের একাধিক কপি থাকলে তবেই সংখ্যা বাড়াও।
                        </p>
                      </Field>

                      <div className="space-y-3 md:col-span-2">
                        <p className="block text-xs font-semibold tracking-wide uppercase text-stone-500">
                          বই কীভাবে দেবে <span className="text-rose-500">*</span>
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
                              <p className="text-xs font-bold text-stone-800">নিজে এসে নিতে পারবে</p>
                              <p className="text-[9px] text-stone-400">সরাসরি হাতে হাতে</p>
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
                              <p className="text-xs font-bold text-stone-800">ডেলিভারি দেওয়া যাবে</p>
                              <p className="text-[9px] text-stone-400">কুরিয়ারে পাঠানো</p>
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
                      বই কোথা থেকে পাঠাবে
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="বিভাগ" required error={errors.division} htmlFor="lp-division">
                        <div className="relative">
                          <select
                            id="lp-division"
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
                            <option value="" disabled>বিভাগ বেছে নাও</option>
                            {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>
                      </Field>

                      <Field label="জেলা" required error={errors.district} htmlFor="lp-district">
                        <div className="relative">
                          <select
                            id="lp-district"
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
                            <option value="" disabled>জেলা বেছে নাও</option>
                            {filteredDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>
                      </Field>

                      <Field label="উপজেলা" required error={errors.upazila} htmlFor="lp-upazila">
                        <div className="relative">
                          <select
                            id="lp-upazila"
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
                            <option value="" disabled>উপজেলা বেছে নাও</option>
                            {filteredUpazilas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>
                      </Field>

                      <Field label="পোস্ট কোড" htmlFor="lp-postcode">
                        <div className="relative">
                          <select
                            id="lp-postcode"
                            value={selectedPostcode}
                            onChange={e => setSelectedPostcode(e.target.value)}
                            disabled={!selectedUpazila}
                            className={selectCls}
                          >
                            <option value="">পোস্ট কোড বেছে নাও</option>
                            {filteredPostcodes.map(p => (
                              <option key={p.postCode} value={p.postCode}>
                                {p.postCode} — {p.postOffice}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                        </div>
                      </Field>

                      <Field label="গ্রাম / রাস্তার ঠিকানা" required span error={errors.village} htmlFor="lp-village">
                        <input
                          id="lp-village"
                          name="village"
                          type="text"
                          value={formData.village}
                          onChange={e => updateField("village", e.target.value)}
                          placeholder="রোড নম্বর, বাড়ির নাম, এলাকা বা গ্রামের নাম..."
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
                    ডিজিটাল ফাইলের তথ্য
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="ফাইলের ধরন" required error={errors.fileType} htmlFor="lp-filetype">
                      <div className="relative">
                        <select
                          id="lp-filetype"
                          name="fileType"
                          value={formData.fileType}
                          onChange={e => updateField("fileType", e.target.value)}
                          className={selectCls}
                        >
                          <option value="" disabled>ফাইলের ধরন বেছে নাও</option>
                          {DIGITAL_FORMATS.map(f => <option key={f} value={f}>{formatLabel(f)}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                      </div>
                    </Field>

                    <Field label="আনুমানিক ফাইল সাইজ (এমবি)" htmlFor="lp-filesize">
                      <input
                        id="lp-filesize"
                        name="fileSize"
                        type="text"
                        value={formData.fileSize}
                        onChange={e => updateField("fileSize", e.target.value)}
                        placeholder="যেমন: 12.5"
                        className={inputCls}
                      />
                    </Field>

                    <Field label="প্রিভিউ পিডিএফ / ছবির লিংক" span htmlFor="lp-preview">
                      <input
                        id="lp-preview"
                        name="previewUrl"
                        type="url"
                        value={formData.previewUrl}
                        onChange={e => updateField("previewUrl", e.target.value)}
                        placeholder="https://... (ফ্রি নমুনা বা প্রিভিউর লিংক দাও)"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                    <p className="text-xs text-amber-700 font-medium">
                      📎 নিরাপদ ডেলিভারি: কেনার পর ক্রেতার ডাউনলোড লিংক প্ল্যাটফর্ম নিজেই নিরাপদে দেয়। এখানে তুমি শুধু দেখার জন্য নমুনা বা প্রিভিউ দাও।
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
                  প্রোডাক্টের ছবি
                </h3>
                <p className="text-xs text-stone-500">
                  সর্বোচ্চ ৬টা পরিষ্কার ছবি দাও। প্রথম ছবিটা মার্কেটপ্লেসে <strong>কভার ছবি</strong> হিসেবে দেখাবে।
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
                            <span className="absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">কভার</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            aria-label="ছবি সরাও"
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
                          <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">{index === 0 ? "কভার" : `ছবি ${bnNumber(index + 1)}`}</span>
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
                <p className="text-[11px] text-stone-400 text-center">PNG, JPG বা WebP · আপলোডের আগে ছবি নিজে থেকেই ছোট করে নেওয়া হয়</p>
              </div>

              {/* ── Visual Review & Mock Card ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">

                {/* Live Card Mockup (Left/4 cols) */}
                <div className="lg:col-span-5 bg-white border border-stone-100 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-600 mb-2">
                    <Eye className="w-4 h-4" /> কার্ড দেখতে যেমন হবে
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-md group max-w-sm mx-auto">
                    <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                      {productImages[0] ? (
                        <img src={productImages[0]} alt="বইয়ের কভার" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                          <Book className="w-10 h-10 stroke-1 text-stone-300 animate-pulse" />
                          <span className="text-xs font-semibold">কভার ছবি দাও</span>
                        </div>
                      )}
                      <span className={`absolute top-3 left-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm ${formData.productType === "Digital" ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700"
                        }`}>
                        {productTypeLabel(formData.productType)}
                      </span>
                      {formData.productType === "Physical" && (
                        (() => {
                          const qty = parseInt(formData.quantity, 10) || 0;
                          const outOfStock = qty <= 0;
                          return (
                            <span className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm ${outOfStock ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                              }`}>
                              {outOfStock ? stockLabel("Out of Stock") : qty > 1 ? `${bnNumber(qty)} কপি` : stockLabel("In Stock")}
                            </span>
                          );
                        })()
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{categoryLabel(formData.category) || "সাধারণ"}</span>
                        <h4 className="text-sm font-black text-stone-800 line-clamp-1 mt-0.5">{formData.title || "নাম দেওয়া হয়নি"}</h4>
                        <p className="text-xs text-stone-500 truncate mt-0.5">{formData.author ? `লেখক: ${formData.author}` : "লেখকের নাম দেওয়া হয়নি"}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-stone-50 pt-3">
                        <div>
                          <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">দাম</p>
                          <p className="text-sm font-extrabold text-stone-900">৳{bnNumber(formData.price || "0")}</p>
                        </div>
                        {formData.productType === "Physical" ? (
                          <div className="text-right">
                            <span className="text-[9px] text-stone-400 block uppercase font-bold">অবস্থা</span>
                            <span className="text-[10px] font-black text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">{conditionLabel(formData.condition)}</span>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-[9px] text-stone-400 block uppercase font-bold">ফরম্যাট</span>
                            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">{formatLabel(formData.fileType) || productTypeLabel("Digital")}</span>
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
                    লিস্টিংয়ের তথ্য মিলিয়ে নাও
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">ধরন</p>
                      <p className="text-stone-800 mt-0.5 font-semibold">{productTypeLabel(formData.productType)} · {categoryLabel(formData.category)}</p>
                    </div>

                    <div>
                      <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">দামের শর্ত</p>
                      <p className="text-stone-800 mt-0.5 font-semibold">
                        ৳{bnNumber(formData.price)} {formData.isNegotiable ? "(দর কষাকষি চলবে)" : "(দাম ফিক্সড)"}
                      </p>
                    </div>

                    <div>
                      <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">লেখক ও প্রকাশক</p>
                      <p className="text-stone-800 mt-0.5 font-semibold">
                        {formData.author} {formData.publisher && `(প্রকাশক: ${formData.publisher})`}
                      </p>
                    </div>

                    <div>
                      <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">সাল ও সংস্করণ</p>
                      <p className="text-stone-800 mt-0.5 font-semibold">
                        {formData.edition || "দেওয়া হয়নি"} · {bnNumber(formData.publicationYear)}
                      </p>
                    </div>

                    {formData.productType === "Physical" ? (
                      <>
                        <div>
                          <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">কপির সংখ্যা</p>
                          <p className="text-stone-800 mt-0.5 font-semibold">
                            {bnNumber(formData.quantity || "1")} কপি
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">বই দেওয়ার উপায়</p>
                          <p className="text-stone-800 mt-0.5 font-semibold">
                            {[
                              formData.allowPickup && "নিজে এসে নেওয়া",
                              formData.allowShipping && "ডেলিভারি"
                            ].filter(Boolean).join(" ও ") || "কোনোটাই না"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">যেখান থেকে পাঠাবে</p>
                          <p className="text-stone-800 mt-0.5 font-semibold truncate">
                            {formData.village}, {selectedUpazila?.name}, {selectedDistrict?.name}, {selectedDivision?.name}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">ফাইলের ধরন ও সাইজ</p>
                          <p className="text-stone-800 mt-0.5 font-semibold">
                            {formatLabel(formData.fileType)} {formData.fileSize && `(${bnNumber(formData.fileSize)} এমবি)`}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">প্রিভিউ নমুনার লিংক</p>
                          <p className="text-stone-800 mt-0.5 font-semibold truncate hover:underline text-amber-600">
                            {formData.previewUrl || "কোনো প্রিভিউ দেওয়া হয়নি"}
                          </p>
                        </div>
                      </>
                    )}

                    <div>
                      <p className="text-stone-400 font-bold uppercase tracking-wider text-[9px]">ভাষা ও ISBN</p>
                      <p className="text-stone-800 mt-0.5 font-semibold">
                        {languageLabel(formData.language)} {formData.isbn ? `· ISBN: ${formData.isbn}` : ""}
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
                  <ChevronLeft className="w-4 h-4" /> আগের ধাপ
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
                  পরের ধাপ <ChevronRight className="w-4 h-4" />
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
                      প্রকাশ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      লিস্টিং প্রকাশ করো
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