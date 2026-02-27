import { Artwork } from '../data/artworks';

export const filterArtworks = (artworks: Artwork[], query: string): Artwork[] => {
  if (!query) return artworks;
  const lowerQuery = query.toLowerCase();
  return artworks.filter(art => 
    art.title.toLowerCase().includes(lowerQuery) ||
    art.author.toLowerCase().includes(lowerQuery) ||
    art.style.toLowerCase().includes(lowerQuery)
  );
};
