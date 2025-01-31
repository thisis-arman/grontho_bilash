import React, { useState } from 'react';
import { TBook } from './new_products';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useGetBookByIdQuery } from '../../redux/features/book/bookApi';
import { selectCurrentUser, TUser } from '../../redux/features/auth/authSlice';
import { toast } from 'sonner';
import { addToCart } from '../../redux/features/cart/cartSlice';

const BookCard = ({ products }: { products: TBook[] }) => {

    const [productId, setProductId] = useState("");
    const { _id } = useAppSelector(selectCurrentUser) as TUser;
    const { data: product } = useGetBookByIdQuery(productId);
    const dispatch = useAppDispatch();

    const handleSubmit = async (event: React.FormEvent, id: string) => {
        event.preventDefault();
        setProductId(id);
        const cartInfo = {
            quantity: 1,
            bookTitle: product?.bookTitle,
            book: product!._id,
            buyer: _id,
            seller: product?.user,
            price: product?.price,
            shippingCost: product?.shippingCost,
            deliveryOption: product?.deliveryOption,
            isNegotiable: product?.isNegotiable,
            productImage: product?.images[0]

        }
        try {

            dispatch(addToCart(cartInfo))
            toast.success("Added to cart", { duration: 2000 })
        } catch {
            toast.error("failed", { duration: 2000 })


        }


    };
    return (
        <div>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {products?.map((product: TBook) => (
                    <div>
                        <div key={product._id} className="group relative">
                            <Link to={`/products/${product._id}`}>
                                <img
                                    alt={product.bookTitle}
                                    src={product.images[0]}
                                    className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                                /></Link>
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
                            {/* <button onClick={(e) => handleSubmit(e, product._id)}
                                type="submit" className='flex  gap-4   w-full items-center justify-center rounded-md border border-transparent bg-yellow-600 px-8 py-1 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none'> <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                </svg>
                                <span>Add to Cart</span></button> */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookCard;