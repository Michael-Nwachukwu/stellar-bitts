"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  width?: string;
}

export function LoadingSkeleton({
  count = 1,
  height = "h-12",
  width = "w-full",
}: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`${width} ${height} rounded-md`} />
      ))}
    </>
  );
}
