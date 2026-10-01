import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {NAIA} from './config';

let started = false;
export const ensureNaiaFonts = () => {
  if (started) return;
  started = true;
  for (const f of [NAIA.fonts.display, NAIA.fonts.text]) {
    for (const [weight, file] of Object.entries(f.files)) {
      loadFont({family: f.family, url: staticFile(`naia/fonts/${file}`), weight, format: 'woff2'});
    }
  }
};
