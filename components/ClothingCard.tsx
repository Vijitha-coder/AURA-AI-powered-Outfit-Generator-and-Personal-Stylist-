import React from 'react';
import { ClothingItem } from '../types';
import { X } from 'lucide-react';

interface ClothingCardProps {
  item: ClothingItem;
  onDelete?: (id: string) => void;
}

const ClothingCard: React.FC<ClothingCardProps> = ({ item, onDelete }) => {
  const imageUrl = item.imageData.startsWith('http') ? item.imageData : `data:${item.mimeType};base64,${item.imageData}`;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete(item.id);
    }
  };

  return (
    <div className="relative bg-card rounded-lg shadow-md overflow-hidden group transition-transform duration-300 hover:scale-105">
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 z-10 p-1 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
          aria-label="Delete item"
        >
          <X size={16} />
        </button>
      )}
      <img
        src={imageUrl}
        alt={item.description}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <p className="text-sm font-medium text-text-primary truncate">{item.description}</p>
        <p className="text-xs text-text-secondary capitalize">{item.category}</p>
      </div>
    </div>
  );
};

export default ClothingCard;