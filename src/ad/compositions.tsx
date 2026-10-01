// Composition registry for the ad. IDs follow <cut>-<hook>-<format>.
import React from 'react';
import {Composition} from 'remotion';
import {AdFilm, AdProps} from './AdFilm';
import {DURATION, FPS} from './config';

const Ad: React.FC<AdProps> = (p) => <AdFilm {...p} />;

const defs: Array<{id: string; props: AdProps; h: number}> = [
  {id: 'Ad-Main-A-9x16', props: {cut: 'main', hook: 'A', format: '9x16'}, h: 1920},
  {id: 'Ad-Main-B-9x16', props: {cut: 'main', hook: 'B', format: '9x16'}, h: 1920},
  {id: 'Ad-Main-C-9x16', props: {cut: 'main', hook: 'C', format: '9x16'}, h: 1920},
  {id: 'Ad-Short-A-9x16', props: {cut: 'short', hook: 'A', format: '9x16'}, h: 1920},
  {id: 'Ad-Main-A-4x5', props: {cut: 'main', hook: 'A', format: '4x5'}, h: 1350},
  {id: 'Ad-Main-A-9x16-Fallback', props: {cut: 'main', hook: 'A', format: '9x16', proofMode: 'fallback'}, h: 1920},
];

export const AdCompositions: React.FC = () => (
  <>
    {defs.map((d) => (
      <Composition
        key={d.id}
        id={d.id}
        component={Ad}
        durationInFrames={DURATION[d.props.cut]}
        fps={FPS}
        width={1080}
        height={d.h}
        defaultProps={{qa: 'none', silent: false, ...d.props} as AdProps}
      />
    ))}
  </>
);
