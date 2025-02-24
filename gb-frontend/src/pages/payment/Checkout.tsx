import React, { useState, FormEvent } from "react";
import { RootState } from "../../redux/store"; // Adjust this import based on your store setup
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUser, TUser } from "../../redux/features/auth/authSlice";
import { useCreateOrderMutation } from "../../redux/features/order/orderApi";
import { toast } from "sonner";

const Checkout = () => {
    const [agreed, setAgreed] = useState(false);
    const cartItems = useAppSelector((state: RootState) => state.cart.items);
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const user = useAppSelector(selectCurrentUser) as TUser;
    const [createOrder] = useCreateOrderMutation();


    const handleCheckoutForm = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);

        const checkoutData = {
            books: cartItems,
            buyer: user.id,
            totalAmount: subtotal,
            shippingCost: Number(formData.get("shippingcost")),
            deliveryOption: formData.get("deliveryoption"),
            deliveryAddress: formData.get("deliveryaddress"),
            phoneNumber: formData.get("phone"),
            email: formData.get("email"),
            comment: formData.get("comments"),
        };

        try {
            const response = await createOrder(checkoutData).unwrap();
            if (response.success) {
                toast.success("Order placed successfully")
            }

        } catch (e) {
            console.log(e)
            
                            toast.error(`failed to place order ${e}`,)
        }
        console.log("Checkout Data:", checkoutData);
        console.log(cartItems);
        // Submit `checkoutData` to the backend here
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h2>


            <form onSubmit={handleCheckoutForm} className="space-y-4">
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-900">
                        Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="block w-full rounded-md bg-white px-3.5 py-2 shadow-sm focus:ring-yellow-500"
                    />
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="block w-full rounded-md bg-white px-3.5 py-2 shadow-sm focus:ring-yellow-500"
                    />
                </div>

                {/* Delivery Address Field */}
                <div>
                    <label htmlFor="deliveryaddress" className="block text-sm font-semibold text-gray-900">
                        Delivery Address
                    </label>
                    <input
                        id="deliveryaddress"
                        name="deliveryaddress"
                        type="text"
                        required
                        className="block w-full rounded-md bg-white px-3.5 py-2 shadow-sm focus:ring-yellow-500"
                    />
                </div>

                {/* Phone Number Field */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
                        Phone Number
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="text"
                        maxLength={11}
                        required
                        className="block w-full rounded-md bg-white px-3.5 py-2 shadow-sm focus:ring-yellow-500"
                    />
                </div>

                {/* Comments Field */}
                <div>
                    <label htmlFor="comments" className="block text-sm font-semibold text-gray-900">
                        Comments (Optional)
                    </label>
                    <textarea
                        id="comments"
                        name="comments"
                        className="block w-full rounded-md bg-white px-3.5 py-2 shadow-sm focus:ring-yellow-500"
                    />
                </div>

                {/* Shipping Cost Field */}
                <div>
                    <label htmlFor="shippingcost" className="block text-sm font-semibold text-gray-900">
                        Shipping Cost
                    </label>
                    <input
                        id="shippingcost"
                        name="shippingcost"
                        type="number"
                        min={0}
                        required
                        className="block w-full rounded-md bg-white px-3.5 py-2 shadow-sm focus:ring-yellow-500"
                    />
                </div>

                {/* Delivery Option Field */}
                <div>
                    <label htmlFor="deliveryoption" className="block text-sm font-semibold text-gray-900">
                        Delivery Option
                    </label>
                    <select
                        id="deliveryoption"
                        name="deliveryoption"
                        required
                        className="block w-full rounded-md bg-white px-3.5 py-2 shadow-sm focus:ring-yellow-500"
                    >
                        <option value="pickup">Pickup</option>
                        <option value="shipping">Shipping</option>
                    </select>
                </div>
                {/* Cart Summary */}
                <div className="mt-6 bg-white p-4 rounded-md shadow">
                    <h3 className="text-lg font-semibold text-gray-800">Cart Summary</h3>
                    <ul className="divide-y divide-gray-200">
                        {cartItems.map((item) => (
                            <li key={item.book} className="py-2 flex justify-between text-sm text-gray-700">
                                <span>{item.bookTitle}</span>
                                <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 flex justify-between text-gray-900 font-semibold">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                </div>


                {/* Agreement Checkbox */}
                <div className="flex items-center">
                    <input
                        id="agreed"
                        name="agreed"
                        type="checkbox"
                        checked={agreed}
                        onChange={() => setAgreed(!agreed)}
                        className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <label htmlFor="agreed" className="ml-2 text-sm text-gray-700">
                        I agree to the terms and conditions
                    </label>
                </div>


                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!agreed}
                    className={`mt-4 w-full rounded-md px-4 py-2 text-white ${agreed ? "bg-yellow-600 hover:bg-yellow-700" : "bg-gray-400 cursor-not-allowed"
                        }`}
                >
                    Place Order
                </button>
            </form>


        </div>
    );
};

export default Checkout;
