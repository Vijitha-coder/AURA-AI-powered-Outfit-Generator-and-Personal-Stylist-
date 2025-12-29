
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, Wand2, Save } from 'lucide-react';
import { useWardrobe } from '../hooks/useWardrobe';
import { analyzeClothingImage } from '../services/geminiService';
import { analyzeImage } from '../services/api';
import { addWardrobeItem } from '../services/api';
import { fileToBase64 } from '../lib/utils';
import { ClothingItem } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

type Step = 'upload' | 'analyzing' | 'confirm';

const AddItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem, setLoading: setGlobalLoading } = useWardrobe();
  const [step, setStep] = useState<Step>('upload');
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [itemDetails, setItemDetails] = useState<Omit<ClothingItem, 'id' | 'imageData' | 'mimeType'>>({
    category: 'tops',
    color: '',
    pattern: 'solid',
    style: 'casual',
    season: 'all-season',
    description: '',
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setImageFile(file);
      setImageDataUrl(URL.createObjectURL(file));
      setStep('analyzing');
      setGlobalLoading(true);

      try {
        const base64Image = await fileToBase64(file);
        // Prefer server-side analysis for security/stability. Fall back to client geminiService if desired.
        let analysisResult;
        try {
          analysisResult = await analyzeImage(base64Image, file.type);
        } catch (e) {
          // If server-side analysis is unavailable, try client-side (if configured)
          analysisResult = await analyzeClothingImage(base64Image, file.type);
        }
        setItemDetails(analysisResult);
        setStep('confirm');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
        setStep('upload');
      } finally {
        setGlobalLoading(false);
      }
    }
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setItemDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!imageFile) return;
  setGlobalLoading(true);
  fileToBase64(imageFile).then(async (base64) => {
    try {
      const saved = await addWardrobeItem({
        imageData: base64,
        mimeType: imageFile.type,
        category: itemDetails.category,
        color: itemDetails.color,
        pattern: itemDetails.pattern,
        style: itemDetails.style,
        season: itemDetails.season,
        description: itemDetails.description,
      });
      // saved should be the created item (with id)
      addItem(saved as ClothingItem);
      navigate('/wardrobe');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save image. Please try again.');
    } finally {
      setGlobalLoading(false);
    }
  }).catch(err => {
    setError('Failed to read image. Please try again.');
    setGlobalLoading(false);
  });
  };
  
  const formInputClass = "mt-1 block w-full bg-card border border-accent-secondary/30 rounded-md shadow-sm focus:ring-accent-primary focus:border-accent-primary text-text-primary";

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      {step === 'analyzing' && <LoadingSpinner message="Aura is analyzing your item..." />}
      <h1 className="text-3xl font-bold text-text-primary mb-2 font-serif">Add New Item</h1>
      <p className="text-text-secondary mb-8">Upload a photo and let Aura's AI do the hard work.</p>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {step === 'upload' && (
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-accent-secondary border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent-secondary/10 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-10 h-10 mb-3 text-text-secondary" />
            <p className="mb-2 text-sm text-text-secondary"><span className="font-semibold text-accent-primary">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-text-secondary">PNG, JPG, or WEBP (MAX. 5MB)</p>
          </div>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
        </label>
      )}

      {step === 'confirm' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card p-8 rounded-lg shadow-lg border border-accent-secondary/30">
          <div>
            <img src={imageDataUrl} alt="Uploaded item" className="rounded-lg w-full object-cover aspect-square" />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary flex items-center"><Wand2 className="w-5 h-5 mr-2 text-accent-primary"/> AI Analysis Complete</h2>
            <p className="text-sm text-text-secondary">Review and edit the details below, then save the item to your wardrobe.</p>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
              <input type="text" name="description" value={itemDetails.description} onChange={handleDetailChange} className={formInputClass} />
            </div>
            {/* Form fields here */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text-secondary">Category</label>
              <select name="category" value={itemDetails.category} onChange={handleDetailChange} className={formInputClass}>
                {["tops", "bottoms", "dress", "shoes", "accessories", "outerwear"].map(c => <option key={c} value={c} className="capitalize bg-card text-text-primary">{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-text-secondary">Color</label>
              <input type="text" name="color" value={itemDetails.color} onChange={handleDetailChange} className={formInputClass} />
            </div>
            <div>
              <label htmlFor="style" className="block text-sm font-medium text-text-secondary">Style</label>
              <select name="style" value={itemDetails.style} onChange={handleDetailChange} className={formInputClass}>
                {["casual", "formal", "business", "athletic", "streetwear", "bohemian", "minimalist"].map(s => <option key={s} value={s} className="capitalize bg-card text-text-primary">{s}</option>)}
              </select>
            </div>
            <button onClick={handleSave} className="w-full flex items-center justify-center px-4 py-3 bg-accent-primary text-background font-semibold rounded-lg hover:opacity-90 transition-opacity mt-6">
                <Save className="w-5 h-5 mr-2" />
                Save to Wardrobe
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItemPage;