export const getStyleColor = (style: string): string => {
  const map: Record<string, string> = {
    'Renesans': '#F4CCCC',
    'Manieryzm': '#FCE5CD',
    'Barok': '#FFF2CC',
    'Rokoko': '#D9EAD3',
    'Klasycyzm': '#D0E0E3',
    'Neoklasycyzm': '#D0E0E3', // Map Neoklasycyzm to Klasycyzm
    'Romantyzm': '#CFE2F3',
    'Akademizm': '#D9D2E9',
    'Realizm': '#EAD1DC',
    'Impresjonizm': '#E6B8AF',
    'Postimpresjonizm': '#F9CB9C',
    'Symbolizm': '#B6D7A8',
    'Secesja': '#A2C4C9',
    'Fowizm': '#F6B26B',
    'Ekspresjonizm': '#FFE599',
    'Kubizm': '#B4A7D6',
    'Surrealizm': '#D5A6BD',
    'Sztuka Japońska': '#E0E0E0',
  };
  return map[style] || '#f5f5f5';
};
