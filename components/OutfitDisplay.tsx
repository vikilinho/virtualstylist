import React from 'react';
import { TshirtIcon } from './icons/TshirtIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ShareIcon } from './icons/ShareIcon';
import { dataUrlToFile } from '../utils/fileUtils';
import { Outfit } from '../services/geminiService';

interface OutfitDisplayProps {
  outfits: Outfit[];
  isLoading: boolean;
  isGeneratingMore?: boolean;
  error: string | null;
  hasUploadedItem: boolean;
  onUploadClick: () => void;
}

const INITIAL_OUTFIT_LABELS = ["Casual", "Business", "Night Out"];

const OutfitCard: React.FC<{ label: string; imageSrc: string }> = ({ label, imageSrc }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `Virtual-Stylist-${label.replace(' ', '-')}-Outfit.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      const fileName = `Virtual-Stylist-${label.replace(' ', '-')}-Outfit.png`;
      const file = await dataUrlToFile(imageSrc, fileName);
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My AI-Generated Outfit',
          text: `Check out this ${label} outfit I created with Virtual Stylist!`,
        });
      } else {
        alert('Sharing is not supported on your browser. You can download the image instead.');
        handleDownload();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Share action was canceled by the user.');
      } else {
        console.error('Error sharing:', error);
        alert('Could not share the image. Please try downloading it.');
      }
    }
  };

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square bg-slate-50 rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <img src={imageSrc} alt={`${label} outfit`} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button
            onClick={handleDownload}
            className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
            title="Download"
            aria-label={`Download ${label} outfit`}
          >
            <DownloadIcon className="w-6 h-6" />
          </button>
          {canShare && (
            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
              title="Share"
              aria-label={`Share ${label} outfit`}
            >
              <ShareIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
      <h3 className="text-center font-medium text-slate-700">{label}</h3>
    </div>
  );
};

const SkeletonCard: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex flex-col gap-3">
    <div className="aspect-square bg-slate-200 rounded-xl overflow-hidden">
       <div className="w-full h-full bg-slate-200 animate-pulse shimmer"></div>
    </div>
    <div className="h-6 bg-slate-200 rounded-md w-3/4 mx-auto animate-pulse shimmer"></div>
    <style>{`
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

const OutfitDisplay: React.FC<OutfitDisplayProps> = ({ outfits, isLoading, isGeneratingMore, error, hasUploadedItem, onUploadClick }) => {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {INITIAL_OUTFIT_LABELS.map(label => <SkeletonCard key={label} />)}
      </div>
    );
  }

  if (error && outfits.length === 0) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {outfits.map((outfit) => (
          <OutfitCard key={outfit.style} label={outfit.style} imageSrc={outfit.src} />
        ))}
        {isGeneratingMore && <SkeletonCard />}
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
                <span className="text-violet-600 group-hover:underline">Upload</span> a photo to get started
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
      className="group flex flex-col items-center justify-center h-full w-full min-h-[200px] text-center text-slate-500 space-y-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 hover:bg-slate-50 transition-colors"
      aria-label="Upload an item to get started"
    >
      <EmptyStateContent />
    </button>
  );
};

export default OutfitDisplay;