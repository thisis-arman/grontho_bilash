import React, { FormEvent, FormHTMLAttributes, useEffect, useState } from 'react';
import axios from 'axios';

import { PhotoIcon } from '@heroicons/react/24/solid'
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
            fetch(`http://localhost:5000/api/v1/level?level=${selectedLevel}`)
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
            fetch(`http://localhost:5000/api/v1/faculty?facultyId=${selectedFaculty}`)
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

    // Update filtered districts when a division is selected
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
            const response = await axios.post("http://localhost:5000/api/v1/books/upload", formData, {
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
        <div className='p-10'>
            <form onSubmit={handleAddProduct}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-gray-900">Add Product</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                            This information will be displayed publicly so be careful what you share.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                    Title
                                </label>
                                <div className="mt-2">
                                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-yellow-600 sm:max-w-md">

                                        <input
                                            id="title"
                                            name="title"
                                            type="text"
                                            placeholder="Keep it short!"
                                            autoComplete="title"
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="about" className="block text-sm font-medium leading-6 text-gray-900">
                                    Description
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                                        defaultValue={''}
                                    />
                                </div>
                                <p className="mt-3 text-sm leading-6 text-gray-600">Write description about your product.</p>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="publicationYear" className="block text-sm font-medium leading-6 text-gray-900">
                                    Publication Year
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="publicationYear"
                                        name="publicationYear"
                                        autoComplete="publicationYear"
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                    >
                                        {previousYears.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="sm:col-span-3">
                                <h2 className="text-gray-800 font-medium">Level</h2>
                                <ul className="mt-3  flex items-center gap-10">
                                    <select onChange={(e) => handleLevelChange(e.target.value)}
                                        id="level"
                                        name="level"
                                        autoComplete="level"
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                    >
                                        <option value="" disabled selected>
                                            Select level
                                        </option>
                                        {data?.data?.map((item:TEducationCategory, i: number) => (
                                            <option key={i} value={item._id}>
                                                {item.levelName}
                                            </option>
                                        ))}
                                    </select>
                                </ul>
                            </div>
                            <div className="sm:col-span-3">
                                <h2 className="text-gray-800 font-medium">Faculty</h2>
                                <ul className="mt-3  flex items-center gap-10">
                                    <select onChange={(e) => handleFacultyChange(e.target.value)}
                                        id="faculty"
                                        name="faculty"
                                        autoComplete="faculty"
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                    >
                                        <option value="" disabled selected>
                                            Select Faculty
                                        </option>
                                        {faculties?.map((item: TFaculty, i: number) => (
                                            <option key={i} value={item._id}>
                                                {item.faculty} ({item.facultyShorts})
                                            </option>
                                        ))}
                                    </select>
                                </ul>
                            </div>
                            <div className="sm:col-span-3">
                                <h2 className="text-gray-800 font-medium">Faculty</h2>
                                <ul className="mt-3  flex items-center gap-10">
                                    <select onChange={(e) => handleDepartmentChange(e.target.value)}
                                        id="department"
                                        name="department"
                                        autoComplete="department"
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                    >
                                        <option value="" disabled selected>
                                            Select Department
                                        </option>
                                        {departments?.map((item: TDepartment, i: number) => (
                                            <option key={i} value={item._id}>
                                                {item.department} ({item.deptShorts})
                                            </option>
                                        ))}
                                    </select>
                                </ul>
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
                                    Price
                                </label>
                                <div className="relative mt-2 rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-md">৳</span>
                                    </div>
                                    <input
                                        id="price"
                                        name="price"
                                        type="text"
                                        placeholder="0.00"
                                        className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                                    />

                                </div>
                            </div>
                            {/*  */}

                            {/* Condition */}
                            <div>
                                <h2 className="text-gray-800 font-medium">Condition</h2>
                                <ul className="mt-3  flex items-center gap-10">
                                    <select
                                        id="condition"
                                        name="condition"
                                        autoComplete="condition"
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                    >
                                        {condition.map((item, i) => (
                                            <option key={i} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </ul>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
                                    Product Images
                                </label>
                                <div className="mt-2 flex gap-4 justify-center rounded-lg border border-dashed border-gray-900/25 py-10">
                                    <div className="grid grid-cols-3 gap-5">
                                        {/* Show placeholders or uploaded images */}
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <div key={index} className="text-center border p-2  relative">
                                                {/* Show placeholder if image is not uploaded at this index */}
                                                {productImages[index] ? (
                                                    <div className="relative">
                                                        <img src={productImages[index]} alt="Uploaded" className="h-24 w-auto mx-auto" />
                                                        {/* Cross button to remove image */}
                                                        <button
                                                            onClick={() => handleRemoveImage(index)}
                                                            className="absolute -top-2 right-0 text-red-500  text-3xl"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // Placeholder
                                                    <>
                                                        <PhotoIcon aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                                                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                                            <label
                                                                htmlFor={`file-upload-${index}`}
                                                                className="relative cursor-pointer rounded-md bg-white font-semibold text-yellow-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-yellow-600 focus-within:ring-offset-2 hover:text-yellow-500"
                                                            >
                                                                <span>Upload a file</span>
                                                                <input
                                                                    id={`file-upload-${index}`}
                                                                    name="file-upload"
                                                                    type="file"
                                                                    onChange={handleFileUpload}
                                                                    className="sr-only"
                                                                />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-gray-900">Address</h2>


                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="col-span-full">
                                <label htmlFor="Village" className="block text-sm font-medium leading-6 text-gray-900">
                                    Village
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="village"
                                        name="village"
                                        type="text"
                                        autoComplete="village"

                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2 sm:col-start-1">
                                <label htmlFor="division" className="block text-sm font-medium leading-6 text-gray-900">
                                    Division
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="division"
                                        required
                                        name='division'
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                        value={selectedDivision?.id || ""}
                                        onChange={(e) => {
                                            const division = divisions.find(d => d.id === e.target.value);
                                            setSelectedDivision(division);
                                        }}
                                    >
                                        <option value="" disabled>Select Division</option>
                                        {divisions.map((division) => (
                                            <option key={division.id} value={division.id}>{division.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-2 sm:col-start-1">
                                <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                                    District
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="district"
                                        required
                                        name='district'
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                        value={selectedDistrict?.id || ""}
                                        onChange={(e) => {
                                            const district = filteredDistricts.find(d => d.id === e.target.value);
                                            setSelectedDistrict(district);
                                        }}
                                        disabled={!selectedDivision}
                                    >
                                        <option value="" disabled>Select District</option>
                                        {filteredDistricts.map((district) => (
                                            <option key={district.id} value={district.id}>{district.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="region" className="block text-sm font-medium leading-6 text-gray-900">
                                    Upazila
                                </label>
                                <div className="mt-2">

                                    <select
                                        id="upazila"
                                        required
                                        name='upazila'
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                        value={selectedUpazila?.id || ""}
                                        onChange={(e) => {
                                            const upazila = filteredUpazilas.find(u => u.id === e.target.value);
                                            setSelectedUpazila(upazila);
                                        }}
                                        disabled={!selectedDistrict}
                                    >
                                        <option value="" disabled>Select Upazila</option>
                                        {filteredUpazilas.map((upazila) => (
                                            <option key={upazila.id} value={upazila.id}>{upazila.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-gray-900">
                                    ZIP / Postal code
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="postcode"
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-yellow-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                        value={selectedUpazila?.id || ""}
                                        disabled={!selectedUpazila}
                                    >
                                        <option value="" disabled>Select Postcode</option>
                                        {filteredPostcodes.map((postcode) => (
                                            <option key={postcode.postCode} value={postcode.postCode}>
                                                {postcode.postCode} - {postcode.postOffice}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div>
                        <h2 className="text-gray-800 font-medium">Delivery Option</h2>
                        <ul className="mt-3  flex items-center gap-10">
                            {deliveryOptions.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-x-2.5">
                                    <input
                                        required
                                        type="radio"
                                        name="deliveryOption"
                                        id={`option-${idx}`}
                                        value={item} // Set value to distinguish options
                                        checked={selectedDeliveryOption === item} // Check if the option is selected
                                        onChange={(e) => setSelectedDeliveryOption(e.target.value)} // Update state when selected
                                        className="form-radio border-gray-400 text-yellow-600 focus:ring-yellow-600 duration-150"
                                    />
                                    <label htmlFor={`option-${idx}`} className="text-sm text-gray-700 font-medium">
                                        {item}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-b border-gray-900/10 pb-12">


                        <div className="mt-10 space-y-10">
                            <fieldset>
                                <div className="mt-6 space-y-6">
                                    <div className="relative flex gap-x-3">
                                        <div className="flex h-6 items-center">
                                            <input
                                                id="isContactNoHidden"
                                                name="isContactNoHidden"
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-600"
                                            />
                                        </div>
                                        <div className="text-sm leading-6">
                                            <label htmlFor="comments" className="font-medium text-gray-900">
                                                Do you want to show your contact number?
                                            </label>
                                            {/* <p className="text-gray-500">Get notified when someones posts a comment on a posting.</p> */}
                                        </div>
                                    </div>
                                    <div className="relative flex gap-x-3">
                                        <div className="flex h-6 items-center">
                                            <input
                                                id="isNegotiable"
                                                name="isNegotiable"
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-600"
                                            />
                                        </div>
                                        <div className="text-sm leading-6">
                                            <label htmlFor="candidates" className="font-medium text-gray-900">
                                                Negotiable
                                            </label>
                                            <p className="text-gray-500">If your price is negotiable then check the box.</p>
                                        </div>
                                    </div>

                                </div>
                            </fieldset>
                            {/* <fieldset>
                                <legend className="text-sm font-semibold leading-6 text-gray-900">Push Notifications</legend>
                                <p className="mt-1 text-sm leading-6 text-gray-600">These are delivered via SMS to your mobile phone.</p>
                                <div className="mt-6 space-y-6">
                                    <div className="flex items-center gap-x-3">
                                        <input
                                            id="push-everything"
                                            name="push-notifications"
                                            type="radio"
                                            className="h-4 w-4 border-gray-300 text-yellow-600 focus:ring-yellow-600"
                                        />
                                        <label htmlFor="push-everything" className="block text-sm font-medium leading-6 text-gray-900">
                                            Everything
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-x-3">
                                        <input
                                            id="push-email"
                                            name="push-notifications"
                                            type="radio"
                                            className="h-4 w-4 border-gray-300 text-yellow-600 focus:ring-yellow-600"
                                        />
                                        <label htmlFor="push-email" className="block text-sm font-medium leading-6 text-gray-900">
                                            Same as email
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-x-3">
                                        <input
                                            id="push-nothing"
                                            name="push-notifications"
                                            type="radio"
                                            className="h-4 w-4 border-gray-300 text-yellow-600 focus:ring-yellow-600"
                                        />
                                        <label htmlFor="push-nothing" className="block text-sm font-medium leading-6 text-gray-900">
                                            No push notifications
                                        </label>
                                    </div>
                                </div>
                            </fieldset> */}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
                    >
                        Save
                    </button>
                </div>
            </form>

        </div>
    );
};

export default AddProduct;