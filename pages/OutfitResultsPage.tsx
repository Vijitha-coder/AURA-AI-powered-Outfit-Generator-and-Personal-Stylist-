
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Wand2, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useWardrobe } from '../hooks/useWardrobe';
import { Outfit, ClothingItem } from '../types';
import { generateAIStyleboard, enhanceOutfits } from '../services/geminiService';

const OutfitCard: React.FC<{ outfit: Outfit }> = ({ outfit }) => {
  const { getItemById } = useWardrobe();
  const [isExpanded, setIsExpanded] = useState(false);
  const [styleboardImage, setStyleboardImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = outfit.itemIds.map(id => getItemById(id)).filter((item): item is ClothingItem => !!item);

  const handleGenerateStyleboard = async () => {
    setIsLoading(true);
    setError(null);
    setStyleboardImage(null);
    try {
      const resultBase64 = await generateAIStyleboard(items);
      setStyleboardImage(resultBase64);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate styleboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-accent-secondary/30">
      <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold font-serif text-text-primary">{outfit.name}</h2>
                <p className="text-sm font-semibold text-accent-primary capitalize mt-1">{outfit.vibe}</p>
                <p className="text-sm font-serif italic text-text-secondary mt-2">"{outfit.reasoning}"</p>
            </div>
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-text-secondary hover:text-accent-primary">
                {isExpanded ? <ChevronUp/> : <ChevronDown/>}
            </button>
        </div>
        <div className="mt-4 flex -space-x-4">
          {items.map(item => (
            <img 
              key={item.id} 
              src={item.imageData.startsWith('http') ? item.imageData : `data:${item.mimeType};base64,${item.imageData}`} 
              alt={item.description}
              className="w-16 h-16 rounded-full border-4 border-card object-cover"
            />
          ))}
        </div>
        {isExpanded && (
          <div className="mt-6 space-y-4 text-sm">
            <div>
                <h4 className="font-semibold text-text-primary">Styling Tips</h4>
                <p className="text-text-secondary">{outfit.stylingTips}</p>
            </div>
             <div>
                <h4 className="font-semibold text-text-primary">Suggested Accessories</h4>
                <p className="text-text-secondary">{outfit.accessories}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OutfitResultsPage: React.FC = () => {
  const location = useLocation();
  const { wardrobe } = useWardrobe();
  const { outfitsData, occasion } = location.state || { outfitsData: null, occasion: 'your event' };
  
  const [mustHaves, setMustHaves] = useState<string[] | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  const handleEnhance = async () => {
    setIsEnhancing(true);
    setEnhanceError(null);
    try {
      const result = await enhanceOutfits(wardrobe, occasion);
      setMustHaves(result.mustHaves);
    } catch (err) {
      setEnhanceError(err instanceof Error ? err.message : 'Could not get suggestions.');
    } finally {
      setIsEnhancing(false);
    }
  };
  
  if (!outfitsData || !outfitsData.outfits) {
    return (
      <div className="text-center p-10">
        <h2 className="text-xl font-semibold">No outfits to display.</h2>
        <Link to="/stylist" className="text-accent-primary hover:underline mt-4 inline-block">Try generating some!</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary font-serif">Your Outfits</h1>
        <p className="text-md text-text-secondary mt-2">Here are {outfitsData.outfits.length} stylish options for <span className="font-semibold text-accent-primary">{occasion}</span>.</p>
      </div>

      <div className="space-y-6">
        {outfitsData.outfits.map((outfit: Outfit, index: number) => (
          <OutfitCard key={index} outfit={outfit} />
        ))}
      </div>

      <div className="mt-10 text-center">
        {!mustHaves ? (
          <>
            <button 
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="inline-flex items-center justify-center px-6 py-3 bg-accent-primary text-background font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:bg-accent-secondary disabled:text-text-secondary shadow-md"
            >
                <Wand2 className="w-5 h-5 mr-2" />
                {isEnhancing ? 'Aura is thinking...' : 'Enhance Suggestions'}
            </button>
            <p className="text-sm text-text-secondary mt-3">Want more options? Let Aura suggest new items for your wardrobe.</p>
            {enhanceError && <p className="text-red-400 text-xs mt-2">{enhanceError}</p>}
          </>
        ) : (
          <div className="bg-card border border-accent-secondary/30 p-6 rounded-lg shadow-lg text-left">
            <h3 className="text-lg font-semibold text-accent-primary mb-2 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2"/>
                Wardrobe Suggestions
            </h3>
            <p className="text-text-secondary mb-4 text-sm">To perfect your look for this occasion, Aura suggests adding these items to your collection:</p>
            <ul className="list-disc list-inside space-y-1 text-text-primary text-sm">
                {mustHaves.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitResultsPage;