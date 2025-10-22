import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  uploadedImage: string | null;
  isDisabled: boolean;
}

const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

const ImageUploader = React.forwardRef<HTMLInputElement, ImageUploaderProps>(
  ({ onImageUpload, uploadedImage, isDisabled }, ref) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onImageUpload(e.target.files[0]);
      }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (isDisabled || isMobile) return;
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onImageUpload(e.dataTransfer.files[0]);
      }
    }, [onImageUpload, isDisabled]);

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (isMobile) return;
      if (e.type === 'dragenter' || e.type === 'dragover') {
        if (!isDisabled) setIsDragging(true);
      } else if (e.type === 'dragleave') {
        setIsDragging(false);
      }
    };
    
    const triggerClick = () => {
        const input = ref as React.RefObject<HTMLInputElement>;
        if (!isDisabled && input.current) {
            input.current.click();
        }
    };

    const HiddenInput = () => (
        <input
          ref={ref}
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          disabled={isDisabled}
          capture="environment"
        />
    );

    if (uploadedImage) {
      return (
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 group">
          <HiddenInput />
          <img src={uploadedImage} alt="Uploaded item" className="w-full h-full object-cover" />
           <button
            onClick={triggerClick}
            disabled={isDisabled}
            className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none disabled:cursor-not-allowed"
            aria-label="Change photo"
          >
            Change Photo
          </button>
        </div>
      );
    }

    return (
      <div
        onDrop={handleDrop}
        onDragEnter={handleDragEvents}
        onDragLeave={handleDragEvents}
        onDragOver={handleDragEvents}
        className={`relative w-full aspect-square border-2 rounded-2xl flex flex-col items-center justify-center text-center p-4 transition-colors duration-200
          ${isDragging ? 'border-solid border-blue-600 bg-blue-100' : 'border-dashed border-slate-300 bg-slate-50'}
          ${isDisabled ? 'cursor-not-allowed bg-slate-100' : 'cursor-pointer hover:border-blue-400'}`}
        onClick={triggerClick}
      >
        <HiddenInput />
        <div className="flex flex-col items-center justify-center text-slate-500 pointer-events-none">
          <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
          {isMobile ? (
            <p className="font-semibold">Tap to upload a photo</p>
          ) : (
            <p className="font-semibold">
              Drop an image or <span className="text-blue-600">Browse</span>
            </p>
          )}
          <p className="text-xs mt-1">PNG, JPG, or WEBP</p>
        </div>
      </div>
    );
  }
);

export default ImageUploader;