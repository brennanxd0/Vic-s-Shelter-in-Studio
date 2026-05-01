import { Animal } from '../types';

export const INAPPROPRIATE_KEYWORDS = ['bone', 'skeleton', 'skull', 'death', 'dead', 'gore', 'corpse', 'thin', 'sad', 'cage', 'hurt'];

export const isAppropriateAnimal = (animal: Animal): boolean => {
  const textToSafeCheck = `${animal.name} ${animal.description} ${animal.breed} ${animal.tags.join(' ')}`.toLowerCase();
  
  // Check text content
  const hasInappropriateText = INAPPROPRIATE_KEYWORDS.some(word => textToSafeCheck.includes(word));
  if (hasInappropriateText) return false;

  // Check image URL for suspicious keywords
  const imageUrl = animal.image.toLowerCase();
  if (INAPPROPRIATE_KEYWORDS.some(word => imageUrl.includes(word))) return false;

  return true;
};
