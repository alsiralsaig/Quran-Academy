import React from 'react';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-4 sm:p-6">
      {/* Top Banner Skeleton */}
      <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse p-4 space-y-3">
            <div className="h-4 w-1/2 bg-slate-300 dark:bg-slate-700 rounded-md" />
            <div className="h-8 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    </div>
  );
};

export const QuranSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-6">
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse p-4 space-y-2">
            <div className="h-4 w-1/4 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-6 w-full bg-slate-300 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};
