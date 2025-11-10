import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const ProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="aspect-square w-full" />
      
      {/* Content Skeleton */}
      <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
        {/* Title Skeleton */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        
        {/* Price Section Skeleton */}
        <div className="rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4 bg-gray-200">
          {/* Button Skeleton */}
          <Skeleton className="h-6 w-full mb-2 sm:mb-3" />
          
          {/* Price Skeleton */}
          <div className="flex justify-center items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};







