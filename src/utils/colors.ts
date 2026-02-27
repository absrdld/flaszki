export const getStyleColor = (style: string): string => {
  const map: Record<string, string> = {
    'Renesans': '#FFC942',
    'Manieryzm': '#FFC2EC',
    'Barok': '#757575',
    'Rokoko': '#CDF4D4',
    'Klasycyzm': '#AD660A',
    'Neoklasycyzm': '#AD660A',
    'Romantyzm': '#F849C1',
    'Akademizm': '#D9D2E9',
    'Realizm': '#1E7129',
    'Impresjonizm': '#C2E5FF',
    'Postimpresjonizm': '#874FFF',
    'Symbolizm': '#B6D7A8',
    'Secesja': '#A2C4C9',
    'Fowizm': '#F6B26B',
    'Ekspresjonizm': '#FFE599',
    'Kubizm': '#B4A7D6',
    'Surrealizm': '#D5A6BD',
    'Sztuka Japońska': '#FFC2EC',
  };
  return map[style] || '#f5f5f5';
};
