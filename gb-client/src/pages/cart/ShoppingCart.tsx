'use client';
import React, { useState, FormEvent } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {  Plus, Minus, ShoppingBag,  Truck, Wallet, CheckCircle, Info } from 'lucide-react';

import { useAppSelector } from "../../redux/hooks";
import { 
    clearCart,
    getProductsFromCart, 
    updateQuantity 
} from '../../redux/features/cart/cartSlice';
import { selectCurrentUser, TUser } from "../../redux/features/auth/authSlice";
import { useCreateOrderMutation } from "../../redux/features/order/orderApi";

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [createOrder, { isLoading }] = useCreateOrderMutation();
    
    const cartItems = useSelector(getProductsFromCart);
    const user = useAppSelector(selectCurrentUser) as TUser;

    // State for Dynamic Logic
    const [agreed, setAgreed] = useState(false);
    const [shippingArea, setShippingArea] = useState<"inside" | "outside">("inside");
    const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash">("cod");

    // Dynamic Constants
    const SHIPPING_COST = shippingArea === "inside" ? 70 : 130;
    const BKASH_MARCHENT_NUMBER = "01883-350118"; 

    // Calculations
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalAmount = subtotal + SHIPPING_COST;

    const handleQuantity = (productId: string, current: number, delta: number) => {
        const newQty = current + delta;
        if (newQty >= 1) dispatch(updateQuantity({ productId, quantity: newQty }));
    };

    const handleCheckoutSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const checkoutData = {
            books: cartItems,
            buyer: user?.id,
            totalAmount: totalAmount,
            shippingCost: SHIPPING_COST,
            deliveryAddress: formData.get("deliveryaddress"),
            phoneNumber: formData.get("phone"),
            email: formData.get("email"),
            paymentMethod: paymentMethod,
            transactionId: formData.get("trxId") || "COD",
            shippingArea: shippingArea,
            comment: formData.get("notes"),
        };

        try {
            console.log({checkoutData});
            const response = await createOrder(checkoutData).unwrap();
            if (response.success) {
                toast.success("Order Placed Successfully!");
                dispatch(clearCart());
            //     navigate('/order-confirmation');
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        }
    };

    if (cartItems.length === 0) return <EmptyCartView navigate={navigate} />;

    return (
        <div className="bg-slate-50 min-h-screen py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT: Shipping & Payment Details */}
                    <div className="lg:col-span-7 space-y-6 mt-8 ">
                        <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-6">
                            
                            {/* 1. Shipping Information */}
                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <Truck size={22} className="text-yellow-600" /> Shipping Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold text-gray-600">Full Name *</label>
                                        <input name="name" type="text" required defaultValue={user?.name} className="w-full mt-1 p-3 rounded-xl border-gray-200 bg-gray-50 focus:ring-yellow-500 border" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Phone Number *</label>
                                        <input name="phone" type="tel" required placeholder="01XXXXXXXXX" className="w-full mt-1 p-3 rounded-xl border-gray-200 bg-gray-50 border" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Email *</label>
                                        <input name="email" type="email" defaultValue={user?.email} className="w-full mt-1 p-3 rounded-xl border-gray-200 bg-gray-50 border" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold text-gray-600">Delivery Area</label>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <button type="button" onClick={() => setShippingArea("inside")} className={`p-3 rounded-xl border flex flex-col items-center transition-all ${shippingArea === "inside" ? "border-yellow-600 bg-yellow-50 text-yellow-700" : "border-gray-200"}`}>
                                                <span className="font-bold">Inside Chattogram</span>
                                                <span className="text-xs">Charge: ৳70</span>
                                            </button>
                                            <button type="button" onClick={() => setShippingArea("outside")} className={`p-3 rounded-xl border flex flex-col items-center transition-all ${shippingArea === "outside" ? "border-yellow-600 bg-yellow-50 text-yellow-700" : "border-gray-200"}`}>
                                                <span className="font-bold">Outside Chattogram</span>
                                                <span className="text-xs">Charge: ৳130</span>
                                            </button>
                                        </div>
                                    </div>
                                       <div className="md:col-span-2">
                                        <label className="text-sm font-semibold text-gray-600">Notes *</label>
                                        <textarea name="notes" required rows={2} className="w-full mt-1 p-3 rounded-xl border-gray-200 bg-gray-50 border" placeholder="Share your notes..." />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold text-gray-600">Full Address*</label>
                                        <textarea name="deliveryaddress" required rows={2} className="w-full mt-1 p-3 rounded-xl border-gray-200 bg-gray-50 border" placeholder="House no, Road no, Area..." />
                                    </div>
                                 
                                </div>
                            </section>

                            {/* 2. Payment Method */}
                            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Wallet size={22} className="text-yellow-600" /> Payment Method *
                                </h2>

                                {/* Important Notice */}
                                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl flex gap-3">
                                    <Info className="text-blue-500 shrink-0" size={20} />
                                    <p className="text-sm text-blue-800">
                                        <strong>Note:</strong> Delivery charge (৳{SHIPPING_COST}) must be paid in advance via bKash to confirm your order.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "cod" ? "border-yellow-600 bg-yellow-50" : "border-gray-100"}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-yellow-600" />
                                            <div>
                                                <p className="font-bold text-gray-800">Cash on Delivery</p>
                                                <p className="text-xs text-gray-500">Pay balance amount at your doorstep</p>
                                            </div>
                                        </div>
                                        <Truck size={20} className="text-gray-400" />
                                    </label>

                                    <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "bkash" ? "border-pink-600 bg-pink-50" : "border-gray-100"}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="payment" checked={paymentMethod === "bkash"} onChange={() => setPaymentMethod("bkash")} className="accent-pink-600" />
                                            <div>
                                                <p className="font-bold text-gray-800">bKash Merchant Pay</p>
                                                <p className="text-xs text-gray-500">Pay full or delivery charge via bKash</p>
                                            </div>
                                        </div>
                                        <img src="https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg" alt="bKash" className="h-6" />
                                    </label>

                                    {/* Conditional bKash Info */}
                                    {paymentMethod === "bkash" && (
                                        <div className="mt-4 p-4 bg-pink-100/50 border border-pink-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <p className="text-sm text-pink-900">
                                                Please Send Money/Payment to: <strong className="text-lg block">{BKASH_MARCHENT_NUMBER}</strong>
                                            </p>
                                            <div>
                                                <label className="text-xs font-bold text-pink-800 uppercase">Transaction ID (TrxID)</label>
                                                <input name="trxId" required type="text" placeholder="8N7X654WQ" className="w-full mt-1 p-2 rounded-lg border-pink-300 focus:ring-pink-500 border capitalize" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </form>
                    </div>

                    {/* RIGHT: Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-white mt-8 rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
                            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
                                <h2 className="text-lg font-bold">Order Summary</h2>
                                <span className="bg-yellow-600 px-2 py-1 rounded text-xs uppercase">{cartItems.length} Items</span>
                            </div>

                            <div className="p-6 max-h-[350px] overflow-y-auto divide-y">
                                {cartItems.map((item) => (
                                    <div key={item.book} className="py-4 flex gap-4">
                                        <img src={item.productImage} className="w-16 h-20 object-cover rounded-lg shadow-sm" alt="" />
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold line-clamp-1">{item.bookTitle}</h4>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-3 border rounded-lg px-2 py-1">
                                                    <button onClick={() => handleQuantity(item.book, item.quantity, -1)} className="hover:text-yellow-600"><Minus size={14}/></button>
                                                    <span className="text-sm font-bold">{item.quantity}</span>
                                                    <button onClick={() => handleQuantity(item.book, item.quantity, 1)} className="hover:text-yellow-600"><Plus size={14}/></button>
                                                </div>
                                                <p className="font-bold text-sm">৳{item.price * item.quantity}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-slate-50 space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Subtotal</span>
                                    <span>৳{subtotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Shipping ({shippingArea})</span>
                                    <span>৳{SHIPPING_COST}</span>
                                </div>
                                <div className="pt-4 border-t flex justify-between items-center">
                                    <span className="font-bold text-gray-800">Total Amount</span>
                                    <span className="text-2xl font-black text-yellow-600">৳{totalAmount}</span>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <label className="flex gap-2 items-center cursor-pointer">
                                        <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="rounded accent-yellow-600" />
                                        <span className="text-xs text-gray-500">I agree to pay the delivery charge upfront to confirm.</span>
                                    </label>
                                    <button
                                        form="checkout-form"
                                        disabled={!agreed || isLoading}
                                        className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${agreed ? "bg-yellow-600 hover:bg-yellow-700 active:scale-95 shadow-yellow-200" : "bg-gray-300 cursor-not-allowed"}`}
                                    >
                                        {isLoading ? "Processing..." : <><CheckCircle size={20}/> Confirm Order</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component for Empty Cart
const EmptyCartView = ({ navigate }: { navigate: any }) => (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
            <ShoppingBag size={60} className="text-gray-300" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Empty Cart?</h2>
        <p className="text-gray-500 mt-2 mb-8">Add some books to your library first!</p>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-yellow-600 text-white font-bold rounded-xl shadow-lg hover:bg-yellow-700 transition-all">
            Browse Books
        </button>
    </div>
);

export default CheckoutPage;