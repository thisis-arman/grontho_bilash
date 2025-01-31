'use client';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getProductsFromCart, removeFromCart, updateQuantity,  } from '../../redux/features/cart/cartSlice';

const ShoppingCart = () => {
    const cartItems = useSelector(getProductsFromCart);
    const dispatch = useDispatch();

    console.log({cartItems});
    // Function to handle quantity change
    const handleQuantityChange = (productId:string, newQuantity:number) => {
        if (newQuantity < 1) return; // Prevent quantity from going below 1
        dispatch(updateQuantity({ productId, quantity: newQuantity }));
    };

    // Function to remove a product
    const handleRemoveProduct = (productId:string) => {
        dispatch(removeFromCart(productId));
    };

    // Calculate subtotal
    const subtotal = cartItems.reduce((total, product) => total + product.price * product.quantity, 0);

    return (
        <div className="min-h-screen">
            <div className="relative grid grid-cols-1 w-full justify-center items-center">
                <div className="border w-3/6 mx-auto mt-4 bg-white shadow-xl">
                    <div className="flex flex-col">
                        <div className="px-4 py-6 sm:px-6">
                            <div className="flex items-start justify-between">
                                <div className="text-lg font-medium text-gray-900">Shopping Cart</div>
                            </div>

                            <div className="mt-8">
                                <div className="flow-root">
                                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                                        {cartItems.map((product) => (
                                            <li key={product.book} className="flex py-6">
                                                <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                    <img
                                                        alt={product.bookTitle}
                                                        src={product.productImage}
                                                        className="size-full object-cover"
                                                    />
                                                </div>

                                                <div className="ml-4 flex flex-1 flex-col">
                                                    <div>
                                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                                            <h3>{product.bookTitle}</h3>
                                                            <p>${product.price * product.quantity}</p>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500">{product.deliveryOption}</p>
                                                    </div>
                                                    <div className="flex flex-1 items-end justify-between text-sm">
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => handleQuantityChange(product.book, product.quantity - 1)}
                                                                className="px-2 py-1 bg-gray-200 rounded-md"
                                                            >
                                                                -
                                                            </button>
                                                            <span>{product.quantity}</span>
                                                            <button
                                                                onClick={() => handleQuantityChange(product.book, product.quantity + 1)}
                                                                className="px-2 py-1 bg-gray-200 rounded-md"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <button
                                                            onClick={() => handleRemoveProduct(product.book)}
                                                            className="font-medium text-red-600 hover:text-red-500"
                                                        >
                                                            Remove
                                                        </button>
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
                                <p>${subtotal.toFixed(2)}</p>
                            </div>
                            <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                            <div className="mt-6">
                                <a href="/checkout">
                                    <button className="flex w-full items-center justify-center rounded-md border border-transparent bg-yellow-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-yellow-700">
                                        Checkout
                                    </button>
                               </a>
                            </div>
                            <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                                <p>
                                    or{' '}
                                    <a
                                        href="/"
                                        className="font-medium text-yellow-600 hover:text-yellow-500"
                                    >
                                        Continue Shopping <span aria-hidden="true"> &rarr;</span>
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShoppingCart;
