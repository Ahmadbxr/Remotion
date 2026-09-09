import React from 'react';
import {Composition} from 'remotion';
import {OffscriptPromo, TOTAL_DURATION} from './OffscriptPromo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="OffscriptPromo"
      component={OffscriptPromo}
      durationInFrames={TOTAL_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
