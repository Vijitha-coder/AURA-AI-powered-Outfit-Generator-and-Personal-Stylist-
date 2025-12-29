import React, { useState } from 'react';
import { UploadCloud, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useWardrobe } from '../hooks/useWardrobe';
import { rateOutfit } from '../services/geminiService';
import { fileToBase64 } from '../lib/utils';
import { OutfitCritique } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const RateOutfitPage: React.FC = () => {
  const { setLoading: setGlobalLoading } = useWardrobe();
  const [critique, setCritique] = useState<OutfitCritique | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setCritique(null);
      setIsLoading(true);
      setGlobalLoading(true);
      setImageDataUrl(URL.createObjectURL(file));

      try {
        const base64Image = await fileToBase64(file);
        const result = await rateOutfit(base64Image, file.type);
        setCritique(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
        setImageDataUrl(''); // Clear image on error
      } finally {
        setIsLoading(false);
        setGlobalLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      {isLoading && <LoadingSpinner message="Aura is critiquing your outfit..." />}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-primary font-serif">Rate My Outfit</h1>
        <p className="text-md text-text-secondary mt-2">Get an expert AI critique on your look. Upload a photo to begin.</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative my-6 text-center" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!critique && !isLoading && (
        <div className="mt-8">
            <label htmlFor="outfit-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-accent-secondary border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent-secondary/10 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 mb-3 text-text-secondary" />
                    <p className="mb-2 text-sm text-text-secondary"><span className="font-semibold text-accent-primary">Click to upload your outfit</span></p>
                    <p className="text-xs text-text-secondary">PNG, JPG, or WEBP</p>
                </div>
                <input id="outfit-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" disabled={isLoading} />
            </label>
        </div>
      )}
      
      {critique && imageDataUrl && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-card p-6 sm:p-8 rounded-lg shadow-lg border border-accent-secondary/30">
          <div>
            <img src={imageDataUrl} alt="Your outfit" className="rounded-lg w-full object-cover aspect-[9/16]" />
            <button
                onClick={() => {
                    setCritique(null);
                    setImageDataUrl('');
                    setError(null);
                }}
                className="w-full mt-4 px-4 py-2 bg-accent-secondary text-text-primary font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
                Rate Another Outfit
            </button>
          </div>
          <div className="flex flex-col">
            <div className="text-center md:text-left">
                <p className="text-4xl font-bold text-accent-primary">{critique.overall_rating.toFixed(1)}<span className="text-2xl text-text-secondary">/10</span></p>
                <h2 className="text-2xl font-semibold font-serif text-text-primary mt-2">{critique.headline}</h2>
            </div>
            
            <div className="mt-6 space-y-6 flex-grow">
                <div>
                    <h3 className="flex items-center text-lg font-semibold text-green-400">
                        <ThumbsUp className="w-5 h-5 mr-2"/> What Works
                    </h3>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-text-secondary text-sm">
                        {critique.what_works.map((point, index) => <li key={`work-${index}`}>{point}</li>)}
                    </ul>
                </div>
                <div>
                    <h3 className="flex items-center text-lg font-semibold text-amber-400">
                        <ThumbsDown className="w-5 h-5 mr-2"/> What to Improve
                    </h3>
                     <ul className="list-disc list-inside mt-2 space-y-1 text-text-secondary text-sm">
                        {critique.what_to_improve.map((point, index) => <li key={`improve-${index}`}>{point}</li>)}
                    </ul>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RateOutfitPage;
