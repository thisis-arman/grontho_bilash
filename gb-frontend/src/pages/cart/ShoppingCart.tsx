'use client';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getProductsFromCart } from '../../redux/features/cart/cartSlice';
import { useSelector } from 'react-redux'; // Import Redux selector
import { DialogBackdrop, DialogTitle } from '@headlessui/react';
import { useState } from 'react';



export type TCart = {
    quantity: number,
    bookTitle: string,
    book: string,
    buyer: string,
    seller: string,
    price: number,
    shippingCost?: number,
    deliveryOption: string,
    isNegotiable: boolean,
    productImage: string,
}
const ShoppingCart = () => {
    // Fetch cart items from Redux store
    const [open, setOpen] = useState(true)
    const cartItems = useSelector(getProductsFromCart);

    // State for retired products
    // const [retiredProducts, setRetiredProducts] = useState([]);

   
    console.log(cartItems);

    return (
        <div className='min-h-screen'>
            <div className="relative gird grid-cols-1 w-full justify-center items-center">
          

                <div className=" border  w-3/6 mx-auto mt-4 ">
                    <div className=" ">
                        <div className="pointer-events-none  ">
                         
                                <div className="flex h-full flex-col  bg-white shadow-xl">
                                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                        <div className="flex items-start justify-between">
                                            <div className="text-lg font-medium text-gray-900">Shopping cart</div>
                                           
                                        </div>

                                        <div className="mt-8">
                                            <div className="flow-root">
                                                <ul role="list" className="-my-6 divide-y divide-gray-200">
                                                    {cartItems.map((product) => (
                                                        <li key={product?.id} className="flex py-6">
                                                            <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                                <img alt={product.bookTitle} src={product?.productImage} className="size-full object-cover" />
                                                            </div>

                                                            <div className="ml-4 flex flex-1 flex-col">
                                                                <div>
                                                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                                                        <h3>
                                                                            <a href={product.bookTitle}>{product.bookTitle}</a>
                                                                        </h3>
                                                                        <p className="ml-4">{product.price}</p>
                                                                    </div>
                                                                    <p className="mt-1 text-sm text-gray-500">{product?.color}</p>
                                                                </div>
                                                                <div className="flex flex-1 items-end justify-between text-sm">
                                                                    <p className="text-gray-500">Qty {product.quantity}</p>

                                                                    <div className="flex">
                                                                        <button type="button" className="font-medium text-yellow-600 hover:text-yellow-500">
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <p>Subtotal</p>
                                            <p>$262.00</p>
                                        </div>
                                        <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                                        <div className="mt-6">
                                            <a
                                                href="#"
                                                className="flex cursor-pointer items-center justify-center rounded-md border border-transparent bg-yellow-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-yellow-700"
                                            >
                                                Checkout
                                            </a>
                                        </div>
                                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                                            <p>
                                                or{' '}
                                                <button
                                                    type="button"
                                                    onClick={() => setOpen(false)}
                                                    className="font-medium text-yellow-600 hover:text-yellow-500"
                                                >
                                                    Continue Shopping
                                                    <span aria-hidden="true"> &rarr;</span>
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
     
    );
};

export default ShoppingCart;
