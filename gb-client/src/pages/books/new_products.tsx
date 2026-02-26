import BookCard from './bookCard';
import { useGetBooksQuery } from '../../redux/features/book/bookApi';
import { BookSkeleton } from './ProductSkeleton';

// Skeleton Grid for the loading state
const LoadingState = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, index) => (
      <BookSkeleton key={index} />
    ))}
  </div>
);

const Products = () => {
    const { data: books, isLoading } = useGetBooksQuery(undefined);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            Available Books
                        </h2>
                        <p className="text-gray-500 mt-2">Explore the latest additions to our collection</p>
                    </div>
                    {/* Optional: Add a filter/sort button here later */}
                </div>

                {isLoading ? (
                    <LoadingState />
                ) : (
                    <div className="w-full">
                        {/* Ensure your BookCard component handles the grid layout internally, 
                            or wrap it in a grid div if it doesn't */}
                        <BookCard products={books?.data} />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && books?.data?.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No books found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;