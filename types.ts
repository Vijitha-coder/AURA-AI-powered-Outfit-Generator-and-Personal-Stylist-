export type ClothingCategory = "tops" | "bottoms" | "dress" | "shoes" | "accessories" | "outerwear";
export type ClothingPattern = "solid" | "striped" | "floral" | "plaid" | "graphic" | "polka dot" | null;
export type ClothingStyle = "casual" | "formal" | "business" | "athletic" | "streetwear" | "bohemian" | "minimalist";
export type ClothingSeason = "spring" | "summer" | "fall" | "winter" | "all-season";

export interface ClothingItem {
  id: string;
  imageData: string; // base64 string or URL
  mimeType: string;
  category: ClothingCategory;
  color: string;
  pattern: ClothingPattern;
  style: ClothingStyle;
  season: ClothingSeason;
  description: string;
}

export interface Outfit {
  name: string;
  itemIds: string[];
  reasoning: string;
  stylingTips: string;
  accessories: string;
  vibe: string;
}

export interface GeneratedOutfits {
  outfits: Outfit[];
  mustHaves?: string[];
}

export interface ChatMessage {
  sender: 'user' | 'aura';
  text: string;
}

export interface WardrobeContextType {
  wardrobe: ClothingItem[];
  addItem: (item: ClothingItem) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => ClothingItem | undefined;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export interface OutfitOfTheDaySuggestion {
  itemIds: string[];
  reasoning: string;
}

export interface OutfitOfTheDay extends OutfitOfTheDaySuggestion {
  date: string; // YYYY-MM-DD format
}

export interface OutfitCritique {
  headline: string;
  overall_rating: number;
  what_works: string[];
  what_to_improve: string[];
}
