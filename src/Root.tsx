import React from 'react';
import {Composition} from 'remotion';
import {OffscriptPromo, TOTAL_DURATION} from './OffscriptPromo';
import {OffscriptFilm} from './film/OffscriptFilm';
import {TOTAL_FRAMES, FPS, WIDTH, HEIGHT} from './film/theme';
import {OffscriptReel} from './reel/OffscriptReel';
import {TOTAL_FRAMES as REEL_FRAMES, FPS as REEL_FPS, WIDTH as REEL_WIDTH, HEIGHT as REEL_HEIGHT} from './reel/theme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OffscriptPromo"
        component={OffscriptPromo}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="OffscriptFilm"
        component={OffscriptFilm}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="OffscriptReel"
        component={OffscriptReel}
        durationInFrames={REEL_FRAMES}
        fps={REEL_FPS}
        width={REEL_WIDTH}
        height={REEL_HEIGHT}
      />
    </>
  );
};
