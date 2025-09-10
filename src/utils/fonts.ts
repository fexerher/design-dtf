// Carga Google Fonts insertando un <link> único por familia+weights
export function ensureGoogleFont(family: string, weights = [400,700]) {
  const key = `${family}:${weights.join(',')}`;
  const id = `gf-${key.replace(/\s+/g,'-')}`;
  if (document.getElementById(id)) return;

  // Normaliza familia para URL (Noto Sans -> Noto+Sans)
  const fam = family.trim().replace(/\s+/g, '+');
  const w = `wght@${weights.join(';')}`;
  const href = `https://fonts.googleapis.com/css2?family=${fam}:${w}&display=swap`;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export const POPULAR_FONTS = [
  'Inter', 'Poppins', 'Montserrat', 'Raleway',
  'Roboto', 'Open Sans', 'Lato', 'Nunito',
  'Oswald', 'Merriweather', 'Playfair Display',
];
