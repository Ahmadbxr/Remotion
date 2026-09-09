import React from 'react';
import {Composition} from 'remotion';
import {OffscriptPromo, TOTAL_DURATION} from './OffscriptPromo';
import {OffscriptFilm} from './film/OffscriptFilm';
import {TIMELINE} from './film/theme';

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
        durationInFrames={TIMELINE.totalFrames}
        fps={TIMELINE.fps}
        width={TIMELINE.width}
        height={TIMELINE.height}
      />
    </>
  );
};
