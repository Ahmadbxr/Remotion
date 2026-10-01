// Fonts are bundled locally (public/ad/fonts, from @fontsource) — the render
// never depends on an external font service.
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {BRAND} from './config';

const faces: Array<[string, string, string]> = [
  [BRAND.fonts.display, 'inter-tight-latin-600-normal.woff2', '600'],
  [BRAND.fonts.display, 'inter-tight-latin-700-normal.woff2', '700'],
  [BRAND.fonts.display, 'inter-tight-latin-800-normal.woff2', '800'],
  [BRAND.fonts.text, 'inter-latin-400-normal.woff2', '400'],
  [BRAND.fonts.text, 'inter-latin-500-normal.woff2', '500'],
  [BRAND.fonts.text, 'inter-latin-600-normal.woff2', '600'],
  [BRAND.fonts.text, 'inter-latin-700-normal.woff2', '700'],
];

let started = false;
export const ensureFonts = () => {
  if (started) return;
  started = true;
  for (const [family, file, weight] of faces) {
    loadFont({family, url: staticFile(`ad/fonts/${file}`), weight, format: 'woff2'}).catch((e) => {
      // a missing font must fail the render loudly, not fall back silently
      throw e;
    });
  }
};
