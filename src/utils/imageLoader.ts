import { Artwork } from '../data/artworks';

// This utility will try to find a Wikimedia Commons thumbnail for a given artwork
// Since we can't easily crawl for 83 URLs in real-time, we'll use a deterministic 
// approach or a known API if possible. 
// For this app, we'll update the data file directly with URLs found via Gemini.

export const getArtworkImageUrl = (artwork: Artwork): string => {
  // If we have a direct URL in the data, use it
  if (artwork.imageUrl) return artwork.imageUrl;
  
  // Fallback to local PNG
  const cleanFilename = artwork.filename.replace(/^"|"$/g, '');
  return `/images/${cleanFilename}.png`;
};
