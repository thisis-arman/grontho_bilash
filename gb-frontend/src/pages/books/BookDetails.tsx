'use client'


import { useState } from 'react'
import { StarIcon } from '@heroicons/react/20/solid'
import { Radio, RadioGroup } from '@headlessui/react'
import { TBook } from './books';
import { useParams } from 'react-router-dom';
import { useGetBookByIdQuery } from '../../redux/features/book/bookApi';

const BookDetails = () => {

    const {id} = useParams()
    console.log(id);

    const { data:product, isLoading } = useGetBookByIdQuery(id);

 
    if (isLoading) { 
        return <div className='w-full h-full flex justify-center items-center'>
            loading
        </div>
    }

    
    // console.log({product});


    const reviews = { href: '#', average: 4, totalCount: 117 }
    function classNames(...classes) {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <div>

            <div className="bg-white">
                <div className="pt-6">
                    <nav aria-label="Breadcrumb">
                        <ol role="list" className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                            {/* {product?.breadcrumbs.map((breadcrumb) => (
                                <li key={breadcrumb.id}>
                                    <div className="flex items-center">
                                        <a href={breadcrumb.href} className="mr-2 text-sm font-medium text-gray-900">
                                            {breadcrumb?.name}
                                        </a>
                                        <svg
                                            fill="currentColor"
                                            width={16}
                                            height={20}
                                            viewBox="0 0 16 20"
                                            aria-hidden="true"
                                            className="h-5 w-4 text-gray-300"
                                        >
                                            <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                                        </svg>
                                    </div>
                                </li>
                            ))} */}
                            <li className="text-sm">
                                <a href={product?._id} aria-current="page" className="font-medium text-gray-500 hover:text-gray-600">
                                    {/* {product?.bookTitle} */}
                                </a>
                            </li>
                        </ol>
                    </nav>

                    {/* Image gallery */}
                    <div className='grid md:grid-cols-2 grid-cols-1 border m-4'>
                        
                        <div className="mx-auto  mt-6 grid-cols-1  lg:gap-x-8 lg:px-8">
                            <img
                                alt={product?.bookTitle}
                                src={product?.images[0]}
                                className="hidden aspect-[3/4] rounded-lg object-cover lg:block"
                            />
                            {/* <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
                                <img
                                    alt={product?.bookTitle}
                                    src={product?.images[1]}
                                    className="aspect-[3/2] size-full rounded-lg object-cover"
                                />
                                <img
                                    alt={product?.bookTitle}
                                    src={product?.images[2]}
                                    className="aspect-[3/2] size-full rounded-lg object-cover"
                                />
                            </div>
                            <img
                                alt={product?.bookTitle}
                                src={product?.images[3]}
                                className="aspect-[4/5] size-full object-cover sm:rounded-lg lg:aspect-[3/4]"
                            /> */}
                        </div>

                        {/* Product info */}
                        <div className="mx-auto grid-cols-1 px-4 pb-16 pt-10 sm:px-6 lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
                            <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product?.bookTitle}</h1>
                            </div>

                            {/* Options */}
                            <div className="mt-4 lg:row-span-3 lg:mt-0">
                                <h2 className="sr-only">Product information</h2>
                                <p className="text-3xl tracking-tight text-gray-900">{product?.price}</p>

                                {/* Reviews */}
                                <div className="mt-6">
                                    <h3 className="sr-only">Reviews</h3>
                                    <div className="flex items-center">
                                        <div className="flex items-center">
                                            {[0, 1, 2, 3, 4].map((rating) => (
                                                <StarIcon
                                                    key={rating}
                                                    aria-hidden="true"
                                                    className={classNames(
                                                        reviews.average > rating ? 'text-gray-900' : 'text-gray-200',
                                                        'size-5 shrink-0',
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className="sr-only">{reviews?.average} out of 5 stars</p>
                                        <a href={reviews.href} className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                            {reviews?.totalCount} reviews
                                        </a>
                                    </div>
                                </div>

                                <form className="mt-10">
                                    {/* Colors */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Color</h3>

                                        <fieldset aria-label="Choose a color" className="mt-4">
                                            {/* <RadioGroup value={selectedColor} onChange={setSelectedColor} className="flex items-center space-x-3">
                                            {product?.colors.map((color) => (
                                                <Radio
                                                    key={color.name}
                                                    value={color}
                                                    aria-label={color.name}
                                                    className={classNames(
                                                        color.selectedClass,
                                                        'relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none data-[checked]:ring-2 data-[focus]:data-[checked]:ring data-[focus]:data-[checked]:ring-offset-1',
                                                    )}
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className={classNames(color.class, 'size-8 rounded-full border border-black/10')}
                                                    />
                                                </Radio>
                                            ))}
                                        </RadioGroup> */}
                                        </fieldset>
                                    </div>

                                    {/* Sizes */}
                                    <div className="mt-10">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-900">Size</h3>
                                            <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                                Size guide
                                            </a>
                                        </div>

                                        <fieldset aria-label="Choose a size" className="mt-4">
                                            {/* <RadioGroup
                                            value={selectedSize}
                                            onChange={setSelectedSize}
                                            className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4"
                                        >
                                            {product.sizes.map((size) => (
                                                <Radio
                                                    key={size.name}
                                                    value={size}
                                                    disabled={!size.inStock}
                                                    className={classNames(
                                                        size.inStock
                                                            ? 'cursor-pointer bg-white text-gray-900 shadow-sm'
                                                            : 'cursor-not-allowed bg-gray-50 text-gray-200',
                                                        'group relative flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none data-[focus]:ring-2 data-[focus]:ring-indigo-500 sm:flex-1 sm:py-6',
                                                    )}
                                                >
                                                    <span>{size.name}</span>
                                                    {size.inStock ? (
                                                        <span
                                                            aria-hidden="true"
                                                            className="pointer-events-none absolute -inset-px rounded-md border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-indigo-500"
                                                        />
                                                    ) : (
                                                        <span
                                                            aria-hidden="true"
                                                            className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"
                                                        >
                                                            <svg
                                                                stroke="currentColor"
                                                                viewBox="0 0 100 100"
                                                                preserveAspectRatio="none"
                                                                className="absolute inset-0 size-full stroke-2 text-gray-200"
                                                            >
                                                                <line x1={0} x2={100} y1={100} y2={0} vectorEffect="non-scaling-stroke" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </Radio>
                                            ))}
                                        </RadioGroup> */}
                                        </fieldset>
                                    </div>

                                    <button
                                        type="submit"
                                        className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Add to bag
                                    </button>
                                </form>
                            </div>
                 </div>
                 </div>

                    

                        <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
                            {/* Description and details */}
                            <div>
                                <h3 className="sr-only">Description</h3>

                                <div className="space-y-6">
                                    <p className="text-base text-gray-900">{product?.description}</p>
                                </div>
                            </div>

                            <div className="mt-10">
                                <h3 className="text-sm font-medium text-gray-900">Highlights</h3>

                                {/* <div className="mt-4">
                                    <ul role="list" className="list-disc space-y-2 pl-4 text-sm">
                                        {product.highlights.map((highlight) => (
                                            <li key={highlight} className="text-gray-400">
                                                <span className="text-gray-600">{highlight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div> */}
                            </div>

                            <div className="mt-10">
                                <h2 className="text-sm font-medium text-gray-900">Details</h2>

                                <div className="mt-4 space-y-6">
                                    <p className="text-sm text-gray-600">{product?.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
         
        
    );
};

export default BookDetails;