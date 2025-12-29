
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { useWardrobe } from '../hooks/useWardrobe';
import { generateOutfits } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

const StylistPage: React.FC = () => {
  const [occasion, setOccasion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wardrobe } = useWardrobe();
  const navigate = useNavigate();

  const handleGenerateOutfits = async () => {
    if (!occasion.trim()) {
      setError('Please describe the occasion.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateOutfits(wardrobe, occasion);
      navigate('/stylist/results', { state: { outfitsData: result, occasion } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate outfits.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      {loading && <LoadingSpinner message="Generating your outfits..." />}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-primary font-serif">AI Stylist</h1>
        <p className="text-md text-text-secondary mt-2">Let Aura create the perfect look for you.</p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative my-6 text-center" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Get Outfit by Occasion */}
        <div className="bg-card p-8 rounded-lg shadow-lg flex flex-col border border-accent-secondary/30">
          <Sparkles className="w-10 h-10 text-accent-primary mb-4" />
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Get Outfit by Occasion</h2>
          <p className="text-text-secondary mb-6 flex-grow">Describe where you're going or what you're doing, and Aura will style you from your closet.</p>
          <div className="space-y-4">
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="e.g., Job interview, beach party..."
              className="w-full px-4 py-2 bg-background border border-accent-secondary/30 rounded-lg text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-transparent"
            />
            <button
              onClick={handleGenerateOutfits}
              disabled={loading}
              className="w-full px-4 py-3 bg-accent-primary text-background font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:bg-accent-secondary disabled:text-text-secondary"
            >
              Generate Outfits
            </button>
          </div>
        </div>

        {/* Get Outfit by Inspiration */}
        <div className="bg-card p-8 rounded-lg shadow-lg flex flex-col border border-accent-secondary/30">
          <ImageIcon className="w-10 h-10 text-accent-primary mb-4" />
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Shop Your Closet</h2>
          <p className="text-text-secondary mb-6 flex-grow">Upload a style inspiration photo and find similar items you already own.</p>
           <label htmlFor="inspiration-upload" className="w-full text-center px-4 py-3 bg-accent-secondary text-text-primary font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer">
            Upload Inspiration Photo
          </label>
          <input id="inspiration-upload" type="file" className="hidden" />
          <p className="text-xs text-center text-text-secondary mt-2">(Feature coming soon)</p>
        </div>
      </div>
    </div>
  );
};

export default StylistPage;