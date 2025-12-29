
import { useContext } from 'react';
import { WardrobeContextType } from '../types';
// This is a re-export from the context file, but some architectures prefer a dedicated hooks file.
// For simplicity, we can just use the one from context, but creating this for structural clarity.
import { useWardrobe as useWardrobeFromContext } from '../context/WardrobeContext';

export const useWardrobe = (): WardrobeContextType => {
  return useWardrobeFromContext();
};
