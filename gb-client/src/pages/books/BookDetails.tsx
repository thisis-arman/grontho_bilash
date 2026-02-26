'use client'
import { useParams } from 'react-router-dom';
import { useGetBookByIdQuery } from '../../redux/features/book/bookApi';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addToCart } from '../../redux/features/cart/cartSlice';
import bookLoading from "../../assets/book-loading.gif";
import { selectCurrentUser, TUser } from '../../redux/features/auth/authSlice';
import { toast } from 'sonner';
import { ShoppingBag, MapPin, Calendar, BookOpen, CheckCircle, Truck } from 'lucide-react'; // Suggested icons

const BookDetails = () => {
    const { id: userId } = useAppSelector(selectCurrentUser) as TUser;
    const { id } = useParams()
    const { data: product, isLoading } = useGetBookByIdQuery(id);
    const dispatch = useAppDispatch();

    if (isLoading) {
        return (
            <div className='w-full h-screen flex justify-center items-center bg-gray-50'>
                <img className='h-32 w-auto' src={bookLoading} alt="Loading..." />
            </div>
        )
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const cartInfo = {
            quantity: 1,
            bookTitle: product?.bookTitle || "Unknown Book",
            book: product!._id,
            buyer: userId,
            seller: product?.user || "",
            price: product?.price || 0,
            shippingCost: product?.shippingCost || 0,
            deliveryOption: product?.deliveryOption || "Pickup",
            isNegotiable: product?.isNegotiable || false,
            productImage: product?.images?.[0] || "/placeholder.png"
        };

        try {
            dispatch(addToCart(cartInfo))
            toast.success("Added to bag successfully!");
        } catch {
            toast.error("Failed to add to bag");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 mt-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 ">
                        
                        {/* Left: Image Section */}
                        <div className="p-6 bg-gray-100 flex items-center justify-center">
                            <div className="relative group w-full max-w-md">
                                <img
                                    alt={product?.bookTitle}
                                    src={product?.images?.[0] || "/placeholder.png"}
                                    className="w-full aspect-[3/4] object-cover rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                                />
                                {product?.isNegotiable && (
                                    <span className="absolute top-4 left-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Negotiable
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Right: Info Section */}
                        <div className="p-8 md:p-12 flex flex-col">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        {product?.condition}
                                    </span>
                                    <span className="text-gray-400 text-sm">ID: {product?._id}</span>
                                </div>

                                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-2">
                                    {product?.bookTitle}
                                </h1>
                                
                                <div className="flex items-baseline gap-4 mb-6">
                                    <span className="text-4xl font-light text-gray-900">${product?.price}</span>
                                    {product?.shippingCost === 0 ? (
                                        <span className="text-green-600 text-sm font-medium">Free Shipping</span>
                                    ) : (
                                        <span className="text-gray-500 text-sm">+ ${product?.shippingCost} Shipping</span>
                                    )}
                                </div>

                                <hr className="my-6 border-gray-100" />

                                {/* Book Specs Grid */}
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Published</p>
                                            <p className="text-sm font-medium text-gray-900">{product?.publicationYear}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Location</p>
                                            <p className="text-sm font-medium text-gray-900">{product?.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Delivery</p>
                                            <p className="text-sm font-medium text-gray-900">{product?.deliveryOption}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Condition</p>
                                            <p className="text-sm font-medium text-gray-900">{product?.condition}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Description</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {product?.description}
                                    </p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-600 transition-colors duration-200"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Add to Bag
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Details Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Seller Notes</h2>
                        <div className="prose prose-yellow text-gray-600">
                           <p>This book is currently {product?.isPublished ? 'available' : 'on hold'}. 
                           Contact information is {product?.isContactNoHidden ? 'private' : 'visible upon purchase'}.</p>
                        </div>
                    </div>
                    <div className="bg-yellow-50 p-8 rounded-2xl border border-yellow-100">
                        <h2 className="text-xl font-bold text-yellow-900 mb-4">Safety Tips</h2>
                        <ul className="space-y-3 text-sm text-yellow-800">
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 shrink-0" /> Inspect book condition on delivery.</li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 shrink-0" /> Always communicate via the platform.</li>
                            <li className="flex gap-2"><CheckCircle className="w-4 h-4 shrink-0" /> Check publication year matches your curriculum.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;