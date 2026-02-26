import React from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectCurrentUser, TUser } from '../../redux/features/auth/authSlice';
import { toast } from 'sonner';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { TBook } from './products';
import { ShoppingCart, Eye, MapPin } from 'lucide-react'; // Modern icons

const BookCard = ({ products }: { products: TBook[] }) => {
    const user = useAppSelector(selectCurrentUser) as TUser;
    const dispatch = useAppDispatch();

    const handleAddToCart = (product: TBook) => {
        const cartInfo = {
            quantity: 1,
            bookTitle: product.bookTitle,
            book: product._id,
            buyer: user?.id,
            seller: product.user,
            price: product.price,
            shippingCost: product.shippingCost || 0,
            deliveryOption: product.deliveryOption,
            isNegotiable: product.isNegotiable,
            productImage: product.images[0]
        };

        try {
            dispatch(addToCart(cartInfo));
            toast.success(`${product.bookTitle} added to bag`);
        } catch {
            toast.error("Failed to add to cart");
        }
    };

    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products?.map((product: TBook) => (
                <article 
                    key={product._id} 
                    className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    {/* Image Container */}
                    <div className="relative aspect-[4/4] overflow-hidden bg-gray-100">
                        <img
                            alt={product.bookTitle}
                            src={product.images[0]}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                           <Link 
                             to={`/products/${product._id}`}
                             className="p-3 bg-white rounded-full text-gray-900 hover:bg-yellow-500 hover:text-white transition-colors shadow-lg"
                             title="View Details"
                           >
                             <Eye size={20} />
                           </Link>
                        </div>

                        {/* Condition Badge */}
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-gray-700 rounded-lg shadow-sm">
                            {product.condition}
                        </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col flex-1">
                        <div className="mb-2 flex justify-between items-start">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-yellow-600 transition-colors">
                                <Link to={`/products/${product._id}`}>{product.bookTitle}</Link>
                            </h3>
                            <p className="text-lg font-bold text-gray-900">${product.price}</p>
                        </div>

                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-4">
                            <MapPin size={12} />
                            <span>{product.location}</span>
                        </div>

                        {/* Semantic Footer/Action */}
                        <div className="mt-auto">
                            <button
                                onClick={() => handleAddToCart(product)}
                                className="w-full py-2.5 bg-gray-50 hover:bg-yellow-600 text-gray-900 hover:text-white border border-gray-200 hover:border-yellow-600 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={16} />
                                Add to Bag
                            </button>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default BookCard;