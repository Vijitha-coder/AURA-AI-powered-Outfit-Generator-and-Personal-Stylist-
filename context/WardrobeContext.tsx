import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ClothingItem, WardrobeContextType } from '../types';
import { fetchWardrobe, deleteWardrobeItem } from '../services/api';

// The initial set of clothes when the app starts.
const initialWardrobe: ClothingItem[] = [
  {
    id: '1',
    imageData: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=464&auto=format&fit=crop',
    mimeType: 'image/jpeg',
    category: 'tops',
    color: 'Black',
    pattern: 'graphic',
    style: 'streetwear',
    season: 'all-season',
    description: 'Black Graphic T-Shirt',
  },
  {
    id: '2',
    imageData: 'https://images.unsplash.com/photo-1602293589914-9e19577a756b?q=80&w=387&auto=format&fit=crop',
    mimeType: 'image/jpeg',
    category: 'bottoms',
    color: 'Blue',
    pattern: 'solid',
    style: 'casual',
    season: 'all-season',
    description: 'Blue Denim Jeans',
  },
  {
    id: '3',
    imageData: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=387&auto=format&fit=crop',
    mimeType: 'image/jpeg',
    category: 'shoes',
    color: 'White',
    pattern: 'solid',
    style: 'casual',
    season: 'all-season',
    description: 'White Sneakers',
  },
  {
    id: '4',
    imageData: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=435&auto=format&fit=crop',
    mimeType: 'image/jpeg',
    category: 'outerwear',
    color: 'Brown',
    pattern: 'solid',
    style: 'casual',
    season: 'fall',
    description: 'Brown Leather Jacket',
  },
];


const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>(initialWardrobe);
  const [loading, setLoading] = useState<boolean>(false);

  // Load from backend on mount; if backend fails, keep initialWardrobe as fallback
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchWardrobe()
      .then((items: ClothingItem[]) => {
        if (mounted && Array.isArray(items) && items.length > 0) {
          setWardrobe(items as ClothingItem[]);
        }
      })
      .catch(() => {
        // keep the seeded initialWardrobe on failure
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, []);

  const addItem = (item: ClothingItem) => {
    // local state update; persistence should be done by callers using the API helper
    setWardrobe((prev) => [...prev, item]);
  };

  const deleteItem = (id: string) => {
    // Optimistically update UI
    setWardrobe((prev) => prev.filter(item => item.id !== id));
    // Try to delete from backend, ignore errors (could show toast instead)
    deleteWardrobeItem(id).catch(() => {
      // If delete failed, refetch wardrobe could be implemented; for now we ignore
    });
  };

  const getItemById = (id: string | number): ClothingItem | undefined => {
    return wardrobe.find(item => String(item.id) === String(id));
  }

  const contextValue = {
      wardrobe,
      addItem,
      deleteItem,
      getItemById,
      loading,
      setLoading,
  };

  return (
    <WardrobeContext.Provider value={contextValue}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = (): WardrobeContextType => {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
