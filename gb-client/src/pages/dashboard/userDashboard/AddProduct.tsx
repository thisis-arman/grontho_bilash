import  { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';

import { Book, MapPin, GraduationCap, Image as ImageIcon, Settings, CheckCircle2 } from 'lucide-react';
// import { useCreateBookMutation } from '../../../redux/features/book/bookApi';
import { useGetCategoriesQuery, } from '../../../redux/features/category/categoryApi';
import { toast } from 'sonner';
import { useCreateBookMutation } from '../../../redux/features/book/bookApi';
import { useAppSelector } from '../../../redux/hooks';
import { selectCurrentUser, TUser } from '../../../redux/features/auth/authSlice';



export type TEducationCategory = {
    _id: string;
    levelId: string;
    levelName: string;
    faculties: TFaculty[];
};

export type TFaculty = {
    _id: string;
    facultyId: string;
    faculty: string; //science,humanities,bba,bsc,bss
    facultyShorts: string; //bba,
    departments: TDepartment[];
};

export type TDepartment = {
    _id: string;
    deptId: string;
    department: string; //accounting,chemistry,english
    deptShorts: string;
};

const AddProduct = () => {

    const {id} = useAppSelector(selectCurrentUser) as TUser;
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [faculties, setFaculties] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [upazilas, setUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [postcodes, setPostcodes] = useState([]);
    const [filteredPostcodes, setFilteredPostcodes] = useState([]);
    const [selectedDivision, setSelectedDivision] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedUpazila, setSelectedUpazila] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null);
    const [imageURL, setImageURL] = useState(null);
    const [productImages, setProductImages] = useState<string[]>([]);
    console.log({ selectedDeliveryOption });
    // const [categoryId, setCategoryId] = useState(null);
    // const { data, isLoading } = useGetSingleCategoryQuery(categoryId);


    const { data, isLoading } = useGetCategoriesQuery(undefined);
    // RTK


    const handleLevelChange = (level: string) => {
        console.log({ level });
        console.log({ selectedLevel });
        console.log(faculties);
        setSelectedLevel(level);
    };

    useEffect(() => {
        if (selectedLevel) {
            fetch(`https://grontho-bilash-server.vercel.app/api/v1/level?level=${selectedLevel}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data.data.faculties);
                    setFaculties(data?.data?.faculties);
                })
                .catch((error) => {
                    console.error("Error fetching level data:", error);
                });
        }
    }, [selectedLevel]);

    useEffect(() => {
        if (selectedFaculty) {
            fetch(`https://grontho-bilash-server.vercel.app/api/v1/faculty?facultyId=${selectedFaculty}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data?.data?.departments);
                    setDepartments(data?.data?.departments)
                })
                .catch((error) => {
                    console.error("Error fetching level data:", error);
                });
        }
    }, [selectedFaculty]);


    const handleFacultyChange = (facultyId: string) => {
        console.log({ facultyId });
        setSelectedFaculty(facultyId);
        console.log(faculties);
        console.log(departments);

    };
    const handleDepartmentChange = (departmentId: string) => {
        console.log({ departmentId });
        setSelectedDepartment(departmentId);
        console.log(faculties);
        console.log(departments);

    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [divisionRes, districtRes, upazilaRes, postcodeRes] = await Promise.all([
                    fetch("/src/assets/db/bangladesh-geojson-master/bd-divisions.json"),
                    fetch("/src/assets/db/bangladesh-geojson-master/bd-districts.json"),
                    fetch("/src/assets/db/bangladesh-geojson-master/bd-upazilas.json"),
                    fetch("/src/assets/db/bangladesh-geojson-master/bd-postcodes.json")
                ]);

                if (![divisionRes, districtRes, upazilaRes, postcodeRes].every(res => res.ok)) {
                    throw new Error("One or more requests failed");
                }

                const [divisionData, districtData, upazilaData, postcodeData] = await Promise.all([
                    divisionRes.json(),
                    districtRes.json(),
                    upazilaRes.json(),
                    postcodeRes.json()
                ]);

                setDivisions(divisionData.divisions);
                setDistricts(districtData.districts);
                setUpazilas(upazilaData.upazilas);
                setPostcodes(postcodeData.postcodes);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedDivision) {
            setFilteredDistricts(districts.filter(d => d.division_id === selectedDivision.id));
            setSelectedDistrict(null); // Reset district and further selections
            setSelectedUpazila(null);
            setFilteredUpazilas([]);
            setFilteredPostcodes([]);
        }
    }, [selectedDivision, districts]);

    // Update filtered upazilas when a district is selected
    useEffect(() => {
        if (selectedDistrict) {
            setFilteredUpazilas(upazilas.filter(u => u.district_id === selectedDistrict.id));
            setSelectedUpazila(null); // Reset upazila and postcodes
            setFilteredPostcodes([]);
        }
    }, [selectedDistrict, upazilas]);

    // Update filtered postcodes when an upazila is selected
    useEffect(() => {
        if (selectedUpazila) {
            setFilteredPostcodes(postcodes.filter(p => p.upazila === selectedUpazila.name));
        }
    }, [selectedUpazila, postcodes]);

    const condition = ["Fresh", "Used"]
    const deliveryOptions = ["Picked up", "Shipping"]
    const CurrentYear = new Date().getFullYear();
    const previousYears = Array.from({ length: 30 }, (_, i) => CurrentYear - i);


    const [createBook] = useCreateBookMutation();
    if (isLoading) {
        return <p className='h-full flex justify-center items-center'>Please loading...</p>
    }




    const handleFileUpload = async (event: FormEvent<HTMLInputElement>) => {
        event.preventDefault();
        const file = event.target?.files[0];
        if (!file) return;
        // Create a form data object
        const formData = new FormData();
        formData.append("image", file); // Change "file" to "image"
        try {
            const response = await axios.post("https://grontho-bilash-server.vercel.app/api/v1/books/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("response", response);
            setImageURL(response.data.url);
            productImages.push(response.data.url)
        } catch (error) {
            console.error("Error uploading the image:", error);
        }
        console.log({ formData });
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const target = e.target
        // setCategoryId(target.level.value)
        const user = id;
        const bookTitle = target?.title.value;
        const description = target?.description.value;
        const publicationYear = parseInt(target.publicationYear.value);
        const level = selectedLevel;
        const faculty = selectedFaculty;
        const department = selectedDepartment;
        const price = parseFloat(target.price.value);
        const images = [imageURL];
        const condition = target.condition.value;
        const deliveryOption = selectedDeliveryOption;
        const isContactNoHidden = false;

        const isNegotiable = false;
        const location = `${target?.village?.value}, ${target?.upazila?.value}, ${target?.district?.value}, ${target?.division?.value}`

        console.log({ user, bookTitle, price, level, condition, isNegotiable, location, isContactNoHidden, publicationYear, description, images, deliveryOption });
        try {
            const response = await createBook({ user, bookTitle, price, level, faculty, department,condition, isNegotiable, location, isContactNoHidden, publicationYear, description, images, deliveryOption })
            if (response?.success) {
                toast.success("Book created successfully")
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleRemoveImage = (index: number) => {
        setProductImages(productImages.filter((_, i) => i !== index));
    };


    return (
        <div className="min-h-screen bg-gray-50/50 py-10 m-0 sm:px-6 lg:px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add New Product</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Fill out the details below to list your book. Accurate details help buyers find what they need.
                    </p>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-8">
                    
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <Book className="w-5 h-5 text-yellow-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                <input required id="title" name="title" type="text" placeholder="e.g. Fundamentals of Physics" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea id="description" name="description" rows={3} placeholder="Describe the condition, edition, and any other relevant details..." className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (৳) <span className="text-red-500">*</span></label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">৳</span>
                                    </div>
                                    <input required id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" className="w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
                                <select id="publicationYear" name="publicationYear" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500">
                                    {previousYears.map((year) => (<option key={year} value={year}>{year}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Condition <span className="text-red-500">*</span></label>
                                <select required id="condition" name="condition" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500">
                                    {condition.map((item, i) => (<option key={i} value={item}>{item}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Option <span className="text-red-500">*</span></label>
                                <div className="flex gap-4 mt-2">
                                    {deliveryOptions.map((item, idx) => (
                                        <label key={idx} className="flex items-center gap-2 cursor-pointer">
                                            <input required type="radio" name="deliveryOption" value={item} checked={selectedDeliveryOption === item} onChange={(e) => setSelectedDeliveryOption(e.target.value)} className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300" />
                                            <span className="text-sm text-gray-700">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-yellow-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Academic Target</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Level <span className="text-red-500">*</span></label>
                                <select required onChange={(e) => handleLevelChange(e.target.value)} defaultValue="" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500">
                                    <option value="" disabled>Select Level</option>
                                    {data?.data?.map((item: TEducationCategory, i: number) => (
                                        <option key={i} value={item._id}>{item.levelName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty</label>
                                <select onChange={(e) => handleFacultyChange(e.target.value)} defaultValue="" disabled={!faculties?.length} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 disabled:bg-gray-50">
                                    <option value="" disabled>Select Faculty</option>
                                    {faculties?.map((item: TFaculty, i: number) => (
                                        <option key={i} value={item._id}>{item.faculty} ({item.facultyShorts})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <select onChange={(e) => handleDepartmentChange(e.target.value)} defaultValue="" disabled={!departments?.length} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 disabled:bg-gray-50">
                                    <option value="" disabled>Select Department</option>
                                    {departments?.map((item: TDepartment, i: number) => (
                                        <option key={i} value={item._id}>{item.department} ({item.deptShorts})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-yellow-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Location Details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Division <span className="text-red-500">*</span></label>
                                <select required name="division" value={selectedDivision?.id || ""} onChange={(e) => setSelectedDivision(divisions.find(d => d.id === e.target.value))} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500">
                                    <option value="" disabled>Select Division</option>
                                    {divisions.map((d: any) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
                                <select required name="district" value={selectedDistrict?.id || ""} onChange={(e) => setSelectedDistrict(filteredDistricts.find(d => d.id === e.target.value))} disabled={!selectedDivision} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 disabled:bg-gray-50">
                                    <option value="" disabled>Select District</option>
                                    {filteredDistricts.map((d: any) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upazila <span className="text-red-500">*</span></label>
                                <select required name="upazila" value={selectedUpazila?.id || ""} onChange={(e) => setSelectedUpazila(filteredUpazilas.find(u => u.id === e.target.value))} disabled={!selectedDistrict} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 disabled:bg-gray-50">
                                    <option value="" disabled>Select Upazila</option>
                                    {filteredUpazilas.map((u: any) => (<option key={u.id} value={u.id}>{u.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                <select disabled={!selectedUpazila} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 disabled:bg-gray-50">
                                    <option value="" disabled>Select Postal Code</option>
                                    {filteredPostcodes.map((p: any) => (<option key={p.postCode} value={p.postCode}>{p.postCode} - {p.postOffice}</option>))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Village / Street Address <span className="text-red-500">*</span></label>
                                <input required id="village" name="village" type="text" placeholder="House/Road no., Village name..." className="w-full rounded-lg border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500" />
                            </div>
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-yellow-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="aspect-square relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors overflow-hidden group">
                                        {productImages[index] ? (
                                            <>
                                                <img src={productImages[index]} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </>
                                        ) : (
                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-2 text-center">
                                                <ImageIcon className="w-6 h-6 text-gray-400 mb-2" />
                                                <span className="text-xs font-medium text-gray-500">Upload</span>
                                                <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                                            </label>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-4 text-center">Supported formats: JPG, PNG. Max size: 5MB per image. First image will be the cover photo.</p>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-yellow-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center h-5">
                                    <input id="isNegotiable" name="isNegotiable" type="checkbox" className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">Price is Negotiable</span>
                                    <span className="text-sm text-gray-500">Allow buyers to negotiate the price with you.</span>
                                </div>
                            </label>
                            
                            <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center h-5">
                                    <input id="isContactNoHidden" name="isContactNoHidden" type="checkbox" className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">Hide Contact Number</span>
                                    <span className="text-sm text-gray-500">Hide your phone number from potential buyers by default.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6">
                        <button type="button" className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-xl hover:bg-yellow-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Submit
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddProduct;