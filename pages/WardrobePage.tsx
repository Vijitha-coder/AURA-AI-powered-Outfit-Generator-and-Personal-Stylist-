
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useWardrobe } from '../hooks/useWardrobe';
import ClothingCard from '../components/ClothingCard';
import { ClothingCategory, ClothingStyle } from '../types';

const categories: ClothingCategory[] = ["tops", "bottoms", "dress", "shoes", "accessories", "outerwear"];
const styles: ClothingStyle[] = ["casual", "formal", "business", "athletic", "streetwear", "bohemian", "minimalist"];

const WardrobePage: React.FC = () => {
  const { wardrobe, deleteItem } = useWardrobe();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all');
  const [selectedStyle, setSelectedStyle] = useState<ClothingStyle | 'all'>('all');

  const filteredWardrobe = useMemo(() => {
    return wardrobe.filter(item => {
      const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) || item.color.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStyle = selectedStyle === 'all' || item.style === selectedStyle;
      return matchesSearch && matchesCategory && matchesStyle;
    });
  }, [wardrobe, searchTerm, selectedCategory, selectedStyle]);

  const FilterButton = <T,>({ value, selectedValue, setSelectedValue, children }: { value: T | 'all', selectedValue: T | 'all', setSelectedValue: React.Dispatch<React.SetStateAction<T | 'all'>>, children: React.ReactNode }) => (
    <button
      onClick={() => setSelectedValue(value)}
      className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedValue === value ? 'bg-accent-primary text-background' : 'bg-card hover:bg-accent-secondary/50 text-text-secondary hover:text-text-primary'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="sticky top-16 bg-background/80 backdrop-blur-md py-4 z-30">
        <h1 className="text-3xl font-bold text-text-primary mb-4 font-serif">My Wardrobe</h1>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by description, color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-accent-secondary/30 rounded-lg text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <FilterButton value="all" selectedValue={selectedCategory} setSelectedValue={setSelectedCategory}>All Categories</FilterButton>
          {categories.map(cat => <FilterButton key={cat} value={cat} selectedValue={selectedCategory} setSelectedValue={setSelectedCategory}><span className="capitalize">{cat}</span></FilterButton>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterButton value="all" selectedValue={selectedStyle} setSelectedValue={setSelectedStyle}>All Styles</FilterButton>
          {styles.map(style => <FilterButton key={style} value={style} selectedValue={selectedStyle} setSelectedValue={setSelectedStyle}><span className="capitalize">{style}</span></FilterButton>)}
        </div>
      </div>
      
      {filteredWardrobe.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredWardrobe.map(item => (
            <ClothingCard key={item.id} item={item} onDelete={deleteItem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
            <p className="text-text-secondary">No items match your filters.</p>
        </div>
      )}

      <Link
        to="/wardrobe/new"
        className="fixed bottom-8 right-8 bg-accent-primary text-background p-4 rounded-full shadow-lg hover:opacity-90 transition-transform hover:scale-110"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default WardrobePage;