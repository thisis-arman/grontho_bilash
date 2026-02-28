import { useSearchParams } from 'react-router-dom';
import BookCard from './bookCard';
import { useGetBooksQuery } from '../../redux/features/book/bookApi';
import { BookSkeleton } from './ProductSkeleton';
import { useMemo } from 'react';

// Skeleton Grid for the loading state
const LoadingState = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, index) => (
      <BookSkeleton key={index} />
    ))}
  </div>
);

const Products = () => {
    const { data: booksResponse, isLoading } = useGetBooksQuery(undefined);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search')?.toLowerCase() || "";

    const filteredBooks = useMemo(() => {
        if (!booksResponse?.data) return [];
        if (!searchQuery) return booksResponse.data;

        return booksResponse.data.filter((book: any) => {
            const titleMatch = book?.bookTitle?.toLowerCase().includes(searchQuery);
            const descMatch = book?.description?.toLowerCase().includes(searchQuery);
            const conditionMatch = book?.condition?.toLowerCase().includes(searchQuery);
            const categoryMatch = book?.category?.toLowerCase().includes(searchQuery);
            return titleMatch || descMatch || conditionMatch || categoryMatch;
        });
    }, [booksResponse?.data, searchQuery]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            {searchQuery ? `Search Results for "${searchQuery}"` : "Available Books & Resources"}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {searchQuery ? `Found ${filteredBooks.length} items matching your search.` : "Explore the latest additions to our collection"}
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <LoadingState />
                ) : (
                    <div className="w-full">
                        <BookCard products={filteredBooks} />
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredBooks?.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {searchQuery 
                                ? "We couldn't find any resources matching your search. Try different keywords or check your spelling."
                                : "No books or resources are currently available."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;