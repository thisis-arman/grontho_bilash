import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import {
  Book, MapPin, GraduationCap, Image as ImageIcon,
  Settings, CheckCircle2, Zap, Package, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrentUser, TUser } from '../../redux/features/auth/authSlice';
import { useGetCategoriesQuery } from '../../redux/features/category/categoryApi';
import { useCreateProductMutation } from '../../redux/features/book/bookApi';

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
const CONDITIONS_PHYSICAL = ["New", "Like New", "Good", "Acceptable"];
const DIGITAL_FORMATS = ["PDF", "EPUB", "MOBI", "MP3", "Other"];
const LANGUAGES = ["Bangla", "English", "English & Bangla", "Arabic", "Other"];

// ── Reusable field wrapper ────────────────────────────────────────────────────
const Field = ({ label, required, children, span = false }: {
  label: string; required?: boolean; children: React.ReactNode; span?: boolean;
}) => (
  <div className={span ? "md:col-span-2" : ""}>
    <label className="block text-xs font-semibold tracking-wide uppercase text-stone-500 mb-1.5">
      {label} {required && <span className="text-rose-500 normal-case tracking-normal">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle }: {
  icon: React.ElementType; title: string; subtitle?: string;
}) => (
  <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-amber-600" />
    </div>
    <div>
      <h2 className="text-sm font-semibold text-stone-800">{title}</h2>
      {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const AddProduct = () => {
  const { id } = useAppSelector(selectCurrentUser) as TUser;

  // Product type toggle
  const [productType, setProductType] = useState<"Physical" | "Digital">("Physical");

  // Academic state
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [faculties, setFaculties] = useState<TFaculty[]>([]);
  const [departments, setDepartments] = useState<TDepartment[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [divisions, setDivisions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<any[]>([]);
  const [upazilas, setUpazilas] = useState<any[]>([]);
  const [filteredUpazilas, setFilteredUpazilas] = useState<any[]>([]);
  const [postcodes, setPostcodes] = useState<any[]>([]);
  const [filteredPostcodes, setFilteredPostcodes] = useState<any[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedUpazila, setSelectedUpazila] = useState<any>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  // Image state
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Fulfillment
  const [allowPickup, setAllowPickup] = useState(true);
  const [allowShipping, setAllowShipping] = useState(true);

  const { data, isLoading } = useGetCategoriesQuery(undefined);
  const [createProduct] = useCreateProductMutation();

  const CurrentYear = new Date().getFullYear();
  const previousYears = Array.from({ length: 50 }, (_, i) => CurrentYear - i);

  // ── Fetch academic data ──────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedLevel) return;
    fetch(`https://grontho-bilash-server.vercel.app/api/v1/level?level=${selectedLevel}`)
      .then(r => r.json())
      .then(d => setFaculties(d?.data?.faculties || []))
      .catch(console.error);
  }, [selectedLevel]);

  useEffect(() => {
    if (!selectedFaculty) return;
    fetch(`https://grontho-bilash-server.vercel.app/api/v1/faculty?facultyId=${selectedFaculty}`)
      .then(r => r.json())
      .then(d => setDepartments(d?.data?.departments || []))
      .catch(console.error);
  }, [selectedFaculty]);

  // ── Fetch location data ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchGeo = async () => {
      setLocationLoading(true);
      try {
        const [divRes, distRes, upaRes, postRes] = await Promise.all([
          fetch("/src/assets/db/bangladesh-geojson-master/bd-divisions.json"),
          fetch("/src/assets/db/bangladesh-geojson-master/bd-districts.json"),
          fetch("/src/assets/db/bangladesh-geojson-master/bd-upazilas.json"),
          fetch("/src/assets/db/bangladesh-geojson-master/bd-postcodes.json"),
        ]);
        const [divData, distData, upaData, postData] = await Promise.all([
          divRes.json(), distRes.json(), upaRes.json(), postRes.json(),
        ]);
        setDivisions(divData.divisions);
        setDistricts(distData.districts);
        setUpazilas(upaData.upazilas);
        setPostcodes(postData.postcodes);
      } catch (e) { console.error(e); }
      finally { setLocationLoading(false); }
    };
    fetchGeo();
  }, []);

  useEffect(() => {
    if (selectedDivision) {
      setFilteredDistricts(districts.filter(d => d.division_id === selectedDivision.id));
      setSelectedDistrict(null); setSelectedUpazila(null);
      setFilteredUpazilas([]); setFilteredPostcodes([]);
    }
  }, [selectedDivision, districts]);

  useEffect(() => {
    if (selectedDistrict) {
      setFilteredUpazilas(upazilas.filter(u => u.district_id === selectedDistrict.id));
      setSelectedUpazila(null); setFilteredPostcodes([]);
    }
  }, [selectedDistrict, upazilas]);

  useEffect(() => {
    if (selectedUpazila)
      setFilteredPostcodes(postcodes.filter(p => p.upazila === selectedUpazila.name));
  }, [selectedUpazila, postcodes]);

  // ── Image upload ─────────────────────────────────────────────────────────
  const handleFileUpload = async (event: FormEvent<HTMLInputElement>, slotIndex: number) => {
    event.preventDefault();
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setUploadingIndex(slotIndex);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axios.post("http://localhost:5000/api/v1/books/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = [...productImages];
      updated[slotIndex] = response.data.url;
      setProductImages(updated);
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

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const t = e.target as HTMLFormElement & { [key: string]: any };

    const location = productType === "Physical"
      ? `${t.village?.value}, ${selectedUpazila?.name}, ${selectedDistrict?.name}, ${selectedDivision?.name}`
      : "Digital";

    const payload = {
      seller: id,
      title: t.title.value,
      slug: t.title.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: t.description.value,
      productType,
      category: selectedCategory,
      subcategory: selectedCategory === "Academic" ? "Academic" : t.subcategory?.value || selectedCategory,
      price: { basePrice: parseFloat(t.price.value), isNegotiable: t.isNegotiable?.checked || false },
      condition: productType === "Digital" ? "Digital Content" : t.condition?.value,
      images: productImages,
      location,
      isContactNoHidden: t.isContactNoHidden?.checked || false,
      fulfillmentOptions: {
        allowPickup: productType === "Physical" ? allowPickup : false,
        allowShipping: productType === "Physical" ? allowShipping : false,
        isDigitalDelivery: productType === "Digital",
      },
      bookMetadata: {
        author: t.author?.value || "",
        publisher: t.publisher?.value || "",
        publicationYear: t.publicationYear?.value ? parseInt(t.publicationYear.value) : undefined,
        isbn: t.isbn?.value || "",
        edition: t.edition?.value || "",
        language: t.language?.value || "English",
      },
      ...(productType === "Digital" && {
        digitalDetails: {
          fileType: t.fileType?.value || "",
          fileSize: t.fileSize?.value || "",
        },
      }),
      ...(selectedCategory === "Academic" && {
        academicMetadata: {
          level: selectedLevel,
          faculty: selectedFaculty,
          department: selectedDepartment,
        },
      }),
    };

    try {
      console.log({ payload })
      const response = await createProduct(payload);
      console.log(response, "response");
      if ((response as any)?.data)
        toast.success("Product listed successfully!");
      else toast.error("Something went wrong");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create listing");
    }
  };

  if (isLoading || locationLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">Create New Listing</h1>
          <p className="mt-1 text-sm text-stone-500">
            Fill in the details below to publish your product on the marketplace.
          </p>
        </div>

        {/* Product Type Toggle */}
        <div className="mb-6 flex gap-3">
          {(["Physical", "Digital"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setProductType(type)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${productType === type
                  ? "bg-stone-900 text-white border-stone-900 shadow-sm"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                }`}
            >
              {type === "Physical" ? <Package className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
              {type} Product
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── 1. Basic Information ── */}
          <Card>
            <SectionHeader icon={Book} title="Basic Information" subtitle="Title, description, price and condition" />
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Title" required span>
                <input name="title" type="text" required placeholder="e.g. Fundamentals of Physics, 3rd Edition" className={inputCls} />
              </Field>
              <Field label="Description" required span>
                <textarea name="description" rows={3} required placeholder="Describe the product condition, edition, or any important notes..." className={inputCls} />
              </Field>
              <Field label="Category" required>
                <div className="relative">
                  <select
                    required
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className={selectCls}
                  >
                    <option value="" disabled>Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="Base Price (৳)" required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">৳</span>
                  <input name="price" type="number" step="0.01" min="0" required placeholder="0.00" className={`${inputCls} pl-7`} />
                </div>
              </Field>
              {productType === "Physical" && (
                <Field label="Condition" required>
                  <div className="relative">
                    <select name="condition" required className={selectCls}>
                      {CONDITIONS_PHYSICAL.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </Field>
              )}
            </div>
          </Card>

          {/* ── 2. Book Metadata ── */}
          <Card>
            <SectionHeader icon={Book} title="Book Details" subtitle="Author, publisher, ISBN and more" />
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Author">
                <input name="author" type="text" placeholder="e.g. Halliday & Resnick" className={inputCls} />
              </Field>
              <Field label="Publisher">
                <input name="publisher" type="text" placeholder="e.g. Wiley" className={inputCls} />
              </Field>
              <Field label="ISBN">
                <input name="isbn" type="text" placeholder="e.g. 978-3-16-148410-0" className={inputCls} />
              </Field>
              <Field label="Edition">
                <input name="edition" type="text" placeholder="e.g. 3rd Edition" className={inputCls} />
              </Field>
              <Field label="Publication Year">
                <div className="relative">
                  <select name="publicationYear" className={selectCls}>
                    {previousYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="Language">
                <div className="relative">
                  <select name="language" className={selectCls}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </Field>
            </div>
          </Card>

          {/* ── 3. Digital Details (only for Digital) ── */}
          {productType === "Digital" && (
            <Card>
              <SectionHeader icon={Zap} title="Digital Product Details" subtitle="File format, size and download info" />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="File Format" required>
                  <div className="relative">
                    <select name="fileType" required className={selectCls}>
                      <option value="" disabled>Select format</option>
                      {DIGITAL_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="File Size (MB)">
                  <input name="fileSize" type="text" placeholder="e.g. 12.5" className={inputCls} />
                </Field>
                <Field label="Preview URL" span>
                  <input name="previewUrl" type="url" placeholder="https://... (optional free preview link)" className={inputCls} />
                </Field>
              </div>
              <div className="px-6 pb-5">
                <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                  <p className="text-xs text-amber-700 font-medium">
                    📎 The download URL for the paid file will be set by the platform after purchase. You only need to provide a preview link here.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* ── 4. Academic Details (conditional) ── */}
          {selectedCategory === "Academic" && (
            <Card>
              <SectionHeader icon={GraduationCap} title="Academic Metadata" subtitle="Target education level, faculty and department" />
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Level" required>
                  <div className="relative">
                    <select required onChange={e => setSelectedLevel(e.target.value)} defaultValue="" className={selectCls}>
                      <option value="" disabled>Select Level</option>
                      {data?.data?.map((item: TEducationCategory) => (
                        <option key={item._id} value={item._id}>{item.levelName}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="Faculty">
                  <div className="relative">
                    <select onChange={e => setSelectedFaculty(e.target.value)} defaultValue="" disabled={!faculties.length} className={selectCls}>
                      <option value="" disabled>Select Faculty</option>
                      {faculties.map((f: TFaculty) => (
                        <option key={f._id} value={f._id}>{f.faculty} ({f.facultyShorts})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="Department">
                  <div className="relative">
                    <select onChange={e => setSelectedDepartment(e.target.value)} defaultValue="" disabled={!departments.length} className={selectCls}>
                      <option value="" disabled>Select Department</option>
                      {departments.map((d: TDepartment) => (
                        <option key={d._id} value={d._id}>{d.department} ({d.deptShorts})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </Field>
              </div>
            </Card>
          )}

          {/* ── 5. Location (Physical only) ── */}
          {productType === "Physical" && (
            <Card>
              <SectionHeader icon={MapPin} title="Location" subtitle="Where can buyers pick up or where you're shipping from" />
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Division" required>
                  <div className="relative">
                    <select required name="division" value={selectedDivision?.id || ""} onChange={e => setSelectedDivision(divisions.find(d => d.id === e.target.value))} className={selectCls}>
                      <option value="" disabled>Select Division</option>
                      {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="District" required>
                  <div className="relative">
                    <select required name="district" value={selectedDistrict?.id || ""} onChange={e => setSelectedDistrict(filteredDistricts.find(d => d.id === e.target.value))} disabled={!selectedDivision} className={selectCls}>
                      <option value="" disabled>Select District</option>
                      {filteredDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="Upazila" required>
                  <div className="relative">
                    <select required name="upazila" value={selectedUpazila?.id || ""} onChange={e => setSelectedUpazila(filteredUpazilas.find(u => u.id === e.target.value))} disabled={!selectedDistrict} className={selectCls}>
                      <option value="" disabled>Select Upazila</option>
                      {filteredUpazilas.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="Postal Code">
                  <div className="relative">
                    <select disabled={!selectedUpazila} className={selectCls}>
                      <option value="" disabled>Select Postal Code</option>
                      {filteredPostcodes.map(p => <option key={p.postCode} value={p.postCode}>{p.postCode} — {p.postOffice}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                  </div>
                </Field>
                <Field label="Village / Street Address" required span>
                  <input required name="village" type="text" placeholder="House no., Road, Village name..." className={inputCls} />
                </Field>
              </div>

              {/* Fulfillment Options */}
              <div className="px-6 pb-6">
                <p className="text-xs font-semibold tracking-wide uppercase text-stone-500 mb-3">Fulfillment Options</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Allow Pickup", sub: "Buyer can collect in person", value: allowPickup, set: setAllowPickup },
                    { label: "Allow Shipping", sub: "Platform will handle delivery cost", value: allowShipping, set: setAllowShipping },
                  ].map(({ label, sub, value, set }) => (
                    <label key={label} className="flex items-start gap-3 p-4 rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                      <input type="checkbox" checked={value} onChange={e => set(e.target.checked)} className="mt-0.5 w-4 h-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500" />
                      <div>
                        <p className="text-sm font-medium text-stone-800">{label}</p>
                        <p className="text-xs text-stone-400">{sub}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* ── 6. Images ── */}
          <Card>
            <SectionHeader icon={ImageIcon} title="Product Images" subtitle="Upload up to 6 photos. First image will be the cover." />
            <div className="p-6">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="aspect-square relative rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 overflow-hidden group transition-colors hover:border-amber-400">
                    {uploadingIndex === index ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : productImages[index] ? (
                      <>
                        <img src={productImages[index]} alt="" className="w-full h-full object-cover" />
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">Cover</span>
                        )}
                        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-1">
                        <ImageIcon className="w-5 h-5 text-stone-300" />
                        <span className="text-[10px] text-stone-400 font-medium">{index === 0 ? "Cover" : `Photo ${index + 1}`}</span>
                        <input type="file" accept="image/*" onChange={e => handleFileUpload(e as any, index)} className="hidden" />
                      </label>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-4 text-center">JPG, PNG supported · Max 5MB per image</p>
            </div>
          </Card>

          {/* ── 7. Preferences ── */}
          <Card>
            <SectionHeader icon={Settings} title="Preferences" />
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "isNegotiable", label: "Price is Negotiable", sub: "Allow buyers to make an offer" },
                { name: "isContactNoHidden", label: "Hide Contact Number", sub: "Your phone won't be shown publicly" },
              ].map(({ name, label, sub }) => (
                <label key={name} className="flex items-start gap-3 p-4 rounded-xl border border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors">
                  <input name={name} type="checkbox" className="mt-0.5 w-4 h-4 text-amber-500 border-stone-300 rounded focus:ring-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-stone-800">{label}</p>
                    <p className="text-xs text-stone-400">{sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* ── Submit ── */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-8">
            <button type="button" className="px-5 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm hover:shadow-amber-200 hover:shadow-md">
              <CheckCircle2 className="w-4 h-4" />
              Publish Listing
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;