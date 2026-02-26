export const BookSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="bg-gray-200 aspect-[3/4] w-full" />
      
      <div className="p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="h-5 bg-gray-200 rounded-md w-3/4" />
        
        {/* Price Skeleton */}
        <div className="h-6 bg-gray-200 rounded-md w-1/4" />
        
        {/* Details Skeleton */}
        <div className="flex gap-2">
          <div className="h-4 bg-gray-100 rounded-md w-1/3" />
          <div className="h-4 bg-gray-100 rounded-md w-1/3" />
        </div>
        
        {/* Button Skeleton */}
        <div className="h-10 bg-gray-200 rounded-lg w-full mt-2" />
      </div>
    </div>
  );
};