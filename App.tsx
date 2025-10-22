import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import OutfitDisplay from './components/OutfitDisplay';
import { fileToBase64 } from './utils/fileUtils';
import { generateAllOutfits, generateOutfitForStyle, OUTFIT_STYLES, Outfit } from './services/geminiService';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (file: File) => {
    setGeneratedOutfits([]);
    setError(null);
    setOriginalImageFile(file);
    try {
      const base64 = await fileToBase64(file);
      setUploadedImage(base64);
    } catch (e) {
      setError('Failed to read the image file. Please try again.');
      setUploadedImage(null);
      setOriginalImageFile(null);
    }
  }, []);

  const handleGenerateClick = useCallback(async () => {
    if (!originalImageFile || !uploadedImage) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedOutfits([]);

    try {
      const base64Data = uploadedImage.split(',')[1];
      const outfits = await generateAllOutfits(base64Data, originalImageFile.type);
      setGeneratedOutfits(outfits);
    } catch (e) {
      console.error(e);
      setError('Sorry, we couldn\'t generate outfits. The AI might be busy. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, uploadedImage]);
  
  const handleGenerateMoreClick = useCallback(async () => {
    if (!originalImageFile || !uploadedImage || isGeneratingMore) {
      return;
    }

    const nextStyleIndex = generatedOutfits.length;
    if (nextStyleIndex >= OUTFIT_STYLES.length) {
      // All styles have been generated
      return;
    }
    
    const nextStyle = OUTFIT_STYLES[nextStyleIndex];
    setIsGeneratingMore(true);
    setError(null);

    try {
      const base64Data = uploadedImage.split(',')[1];
      const newOutfit = await generateOutfitForStyle(base64Data, originalImageFile.type, nextStyle);
      setGeneratedOutfits(prevOutfits => [...prevOutfits, newOutfit]);
    } catch (e) {
      console.error(e);
      setError(`Sorry, we couldn't generate the '${nextStyle}' outfit. Please try again.`);
    } finally {
      setIsGeneratingMore(false);
    }
  }, [originalImageFile, uploadedImage, generatedOutfits.length, isGeneratingMore]);


  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setOriginalImageFile(null);
    setGeneratedOutfits([]);
    setError(null);
    setIsLoading(false);
    setIsGeneratingMore(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const triggerFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  const hasMoreStylesToGenerate = generatedOutfits.length < OUTFIT_STYLES.length;


  return (
    <div className="min-h-screen font-sans text-slate-800">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center py-16 md:py-20">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
            Instant Outfit Ideas
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
            Upload a piece of clothing and let our AI create complete looks for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          <div className={`flex-col space-y-6 lg:col-start-1 lg:row-start-1 ${!uploadedImage ? 'hidden' : 'flex'}`}>
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Your Item</h2>
              <p className="text-slate-500 mb-6">Change your item by clicking the image below.</p>
              <div className="max-w-sm mx-auto">
                <ImageUploader 
                  ref={fileInputRef}
                  onImageUpload={handleImageUpload} 
                  uploadedImage={uploadedImage} 
                  isDisabled={isLoading || isGeneratingMore}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleGenerateClick}
                disabled={isLoading || !uploadedImage || isGeneratingMore}
                className="flex-1 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-full shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Styling...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Generate Outfits
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3 bg-white text-slate-700 font-semibold rounded-full border border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200"
              >
                Start Over
              </button>
            </div>
          </div>
          
          <div className={`bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 min-h-[300px] ${!uploadedImage ? 'lg:col-span-2' : 'lg:col-start-2'}`}>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">AI-Generated Outfits</h2>
            <p className="text-slate-500 mb-6">Unique looks styled by AI, just for you.</p>
            <OutfitDisplay 
              outfits={generatedOutfits} 
              isLoading={isLoading} 
              error={error}
              hasUploadedItem={!!uploadedImage}
              onUploadClick={triggerFileUpload}
              isGeneratingMore={isGeneratingMore}
            />
            {!isLoading && generatedOutfits.length > 0 && hasMoreStylesToGenerate && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleGenerateMoreClick}
                  disabled={isGeneratingMore}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-violet-600 font-semibold rounded-full border border-violet-300 hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:border-slate-300 disabled:cursor-not-allowed"
                >
                  {isGeneratingMore ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    "Generate More"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;