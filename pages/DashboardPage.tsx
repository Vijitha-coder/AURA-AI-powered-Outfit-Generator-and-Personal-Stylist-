
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles, Calendar, Sun, Wand2 } from 'lucide-react';
import { useWardrobe } from '../hooks/useWardrobe';
import { generateOutfitOfTheDay } from '../services/geminiService';
import { OutfitOfTheDay, ClothingItem } from '../types';

const OutfitOfTheDayLoader: React.FC = () => (
    <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow-lg animate-pulse">
      <div className="h-6 bg-accent-secondary/20 rounded w-1/3 mb-4"></div>
      <div className="flex items-center justify-between text-text-secondary mb-4 pb-4 border-b border-accent-secondary/30">
        <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-accent-secondary/20 rounded-full"></div>
            <div className="h-4 bg-accent-secondary/20 rounded w-20"></div>
        </div>
        <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-accent-secondary/20 rounded-full"></div>
            <div className="h-4 bg-accent-secondary/20 rounded w-24"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-accent-secondary/20 rounded-md aspect-square"></div>
        <div className="bg-accent-secondary/20 rounded-md aspect-square"></div>
        <div className="bg-accent-secondary/20 rounded-md aspect-square"></div>
      </div>
      <div className="h-4 bg-accent-secondary/20 rounded w-3/4 mt-4"></div>
    </div>
);


const DashboardPage: React.FC = () => {
  const { wardrobe, getItemById } = useWardrobe();
  const recentlyAdded = wardrobe.slice(-5).reverse();

  const [outfitOfTheDay, setOutfitOfTheDay] = useState<OutfitOfTheDay | null>(null);
  const [weather] = useState<string>('Sunny, 22°C'); // Mock weather
  const [calendar] = useState<string>('Team Lunch at Noon'); // Mock calendar
  const [isLoadingOotd, setIsLoadingOotd] = useState(true);
  const [ootdItems, setOotdItems] = useState<ClothingItem[]>([]);

  useEffect(() => {
    const getOotd = async () => {
      setIsLoadingOotd(true);
      const today = new Date().toISOString().split('T')[0];

      try {
        const cachedOotdString = localStorage.getItem('outfitOfTheDay');
        if (cachedOotdString) {
          const cachedOotd: OutfitOfTheDay = JSON.parse(cachedOotdString);
          if (cachedOotd.date === today && wardrobe.length > 0) {
            setOutfitOfTheDay(cachedOotd);
            setIsLoadingOotd(false);
            return;
          }
        }
        
        if (wardrobe.length > 0) {
            const suggestion = await generateOutfitOfTheDay(wardrobe, weather, calendar);
            if (suggestion && suggestion.itemIds) {
                const newOotd: OutfitOfTheDay = { ...suggestion, date: today };
                localStorage.setItem('outfitOfTheDay', JSON.stringify(newOotd));
                setOutfitOfTheDay(newOotd);
            }
        }
      } catch (error) {
        console.error("Failed to generate Outfit of the Day:", error);
        // Could set an error state here to show a message to the user
      } finally {
        // Even if generation fails, we stop loading
        setIsLoadingOotd(false);
      }
    };

    if (wardrobe.length > 0) {
      getOotd();
    } else {
      setIsLoadingOotd(false);
    }
  }, [wardrobe, weather, calendar]);

  const regenerateOotd = async () => {
    if (wardrobe.length === 0) return;
    setIsLoadingOotd(true);
    try {
      const suggestion = await generateOutfitOfTheDay(wardrobe, weather, calendar);
      if (suggestion && suggestion.itemIds) {
        const today = new Date().toISOString().split('T')[0];
        const newOotd: OutfitOfTheDay = { ...suggestion, date: today };
        localStorage.setItem('outfitOfTheDay', JSON.stringify(newOotd));
        setOutfitOfTheDay(newOotd);
      }
    } catch (error) {
      console.error('Failed to regenerate Outfit of the Day:', error);
    } finally {
      setIsLoadingOotd(false);
    }
  };

  useEffect(() => {
    if (outfitOfTheDay) {
        const items = outfitOfTheDay.itemIds
            .map(id => getItemById(id))
            .filter((item): item is ClothingItem => !!item);
        setOotdItems(items);
    }
  }, [outfitOfTheDay, getItemById]);


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-primary font-serif">Welcome Back!</h1>
        <p className="text-md text-text-secondary mt-2">Here's your style summary for today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Proactive Stylist */}
        {isLoadingOotd ? <OutfitOfTheDayLoader /> : (
            <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow-lg border border-accent-secondary/30">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Outfit of the Day</h2>
            <div className="flex items-center justify-between text-text-secondary mb-4 pb-4 border-b border-accent-secondary/30">
                <div className="flex items-center space-x-2">
                    <Sun className="w-5 h-5 text-accent-primary" />
                    <span>{weather}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-accent-primary" />
                    <span>{calendar}</span>
                </div>
            </div>
            {ootdItems.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ootdItems.map(item => (
                        <div key={item.id} className="relative group">
                            <img 
                                src={item.imageData.startsWith('http') ? item.imageData : `data:${item.mimeType};base64,${item.imageData}`}
                                alt={item.description} 
                                className="rounded-md object-cover aspect-square" 
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                                <p className="text-white text-center text-sm p-2">{item.description}</p>
                            </div>
                        </div>
                    ))}
                    </div>
                    <p className="text-sm text-text-secondary font-serif italic mt-4">
                        "{outfitOfTheDay?.reasoning}"
                    </p>
                </>
            ) : (
                <div className="text-center py-10">
                    <p className="text-text-secondary">Aura couldn't generate an outfit. <br/> Add more items to your wardrobe for better suggestions!</p>
                </div>
            )}
            </div>
        )}

        {/* Quick Actions & Recently Added */}
        <div className="space-y-8">
            <div className="bg-card p-6 rounded-lg shadow-lg border border-accent-secondary/30">
                 <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
                 <div className="space-y-3">
                    <button
                      onClick={regenerateOotd}
                      disabled={isLoadingOotd}
                      className="w-full flex items-center justify-center px-4 py-3 bg-accent-primary text-background font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:bg-accent-secondary disabled:text-text-secondary shadow-md"
                    >
                      <Wand2 className="w-5 h-5 mr-2" />
                      {isLoadingOotd ? 'Regenerating...' : 'Regenerate Outfit of the Day'}
                    </button>
                    
                    <Link to="/stylist" className="w-full flex items-center justify-center px-4 py-3 bg-accent-primary text-background font-semibold rounded-lg hover:opacity-90 transition-opacity">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Get New Outfit
                    </Link>
                    <Link to="/wardrobe/new" className="w-full flex items-center justify-center px-4 py-3 bg-accent-secondary text-text-primary font-semibold rounded-lg hover:opacity-90 transition-opacity">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Clothing
                    </Link>
                 </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-lg border border-accent-secondary/30">
                <h2 className="text-xl font-semibold text-text-primary mb-4">Recently Added</h2>
                <div className="space-y-4">
                  {recentlyAdded.length > 0 ? recentlyAdded.map(item => (
                    <div key={item.id} className="flex items-center space-x-3">
                        <img src={item.imageData.startsWith('http') ? item.imageData : `data:${item.mimeType};base64,${item.imageData}`} alt={item.description} className="w-12 h-12 rounded-md object-cover"/>
                        <div>
                            <p className="text-sm font-medium text-text-primary">{item.description}</p>
                            <p className="text-xs text-text-secondary capitalize">{item.style}</p>
                        </div>
                    </div>
                  )) : (
                    <p className="text-sm text-text-secondary">No recent items.</p>
                  )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;