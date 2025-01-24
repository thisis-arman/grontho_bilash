import React from 'react';
import { TBook } from './products';
import { Link } from 'react-router-dom';

const BookCard = ({products}:{products:TBook[]}) => {
    return (
        <div>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {products?.map((product: TBook) => (
                    <Link to={`/products/${product._id}`}>
                        <div key={product._id} className="group relative">
                            <img
                                alt={product.bookTitle}
                                src={product.images[0]}
                                className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                            />
                            <div className="mt-4 flex justify-between">
                                <div>
                                    <h3 className="text-sm text-gray-700">
                                        <a href={`/products/${product._id}`}>
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.bookTitle}
                                        </a>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">{product.condition}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{product.price}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BookCard;