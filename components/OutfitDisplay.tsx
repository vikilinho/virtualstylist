import React from 'react';
import { TshirtIcon } from './icons/TshirtIcon';

interface OutfitDisplayProps {
  outfits: string[];
  isLoading: boolean;
  error: string | null;
  hasUploadedItem: boolean;
  onUploadClick: () => void;
}

const OUTFIT_LABELS = ["Casual", "Business", "Night Out"];

const OutfitCard: React.FC<{ label: string; imageSrc: string }> = ({ label, imageSrc }) => (
  <div className="flex flex-col gap-3">
    <div className="aspect-square bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <img src={imageSrc} alt={`${label} outfit`} className="w-full h-full object-cover" />
    </div>
    <h3 className="text-center font-medium text-slate-700">{label}</h3>
  </div>
);

const SkeletonCard: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col gap-3">
    <div className="aspect-square bg-slate-200 rounded-xl overflow-hidden">
       <div className="w-full h-full bg-slate-200 animate-pulse shimmer"></div>
    </div>
    <div className="h-6 bg-slate-200 rounded-md w-3/4 mx-auto animate-pulse shimmer"></div>
    <style jsx>{`
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      .shimmer {
        background-image: linear-gradient(to right, #e2e8f0 0%, #f1f5f9 20%, #e2e8f0 40%, #e2e8f0 100%);
        background-repeat: no-repeat;
        background-size: 2000px 100%;
        animation: shimmer 2s infinite;
      }
    `}</style>
  </div>
);

const OutfitDisplay: React.FC<OutfitDisplayProps> = ({ outfits, isLoading, error, hasUploadedItem, onUploadClick }) => {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {OUTFIT_LABELS.map(label => <SkeletonCard key={label} label={label} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Oh no! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (outfits.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {outfits.map((src, index) => (
          <OutfitCard key={index} label={OUTFIT_LABELS[index]} imageSrc={src} />
        ))}
      </div>
    );
  }
  
  const EmptyStateContent = () => (
    <>
      <TshirtIcon className="w-16 h-16 text-slate-300" />
      <div>
        <p className="font-semibold text-slate-600">
          {hasUploadedItem 
            ? "Your generated outfits will appear here."
            : (
              <>
                <span className="text-blue-600 group-hover:underline">Upload</span> a photo to get started
              </>
            )
          }
        </p>
        {!hasUploadedItem && (
          <p className="text-sm text-slate-500 mt-1">
            Upload a clear photo of a single clothing item.
          </p>
        )}
      </div>
    </>
  );

  if (hasUploadedItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center text-slate-500 space-y-3">
        <EmptyStateContent />
      </div>
    );
  }

  return (
    <button
      onClick={onUploadClick}
      className="group flex flex-col items-center justify-center h-full w-full min-h-[200px] text-center text-slate-500 space-y-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:bg-slate-50 transition-colors"
      aria-label="Upload an item to get started"
    >
      <EmptyStateContent />
    </button>
  );
};

export default OutfitDisplay;