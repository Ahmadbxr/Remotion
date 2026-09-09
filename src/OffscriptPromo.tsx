import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {GlowBackground} from './components/GlowBackground';
import {FadeWrapper} from './components/FadeWrapper';
import {OVERLAP} from './theme';
import {Logo} from './scenes/Logo';
import {Hook} from './scenes/Hook';
import {Positioning} from './scenes/Positioning';
import {ProcessList} from './scenes/ProcessList';
import {Platforms} from './scenes/Platforms';
import {Individuality} from './scenes/Individuality';
import {Outro} from './scenes/Outro';

const SCENES: {component: React.FC; durationInFrames: number}[] = [
  {component: Logo, durationInFrames: 100},
  {component: Hook, durationInFrames: 110},
  {component: Positioning, durationInFrames: 130},
  {component: ProcessList, durationInFrames: 160},
  {component: Platforms, durationInFrames: 130},
  {component: Individuality, durationInFrames: 110},
  {component: Outro, durationInFrames: 150},
];

export const TOTAL_DURATION =
  SCENES.reduce((sum, scene) => sum + scene.durationInFrames, 0) -
  OVERLAP * (SCENES.length - 1);

export const OffscriptPromo: React.FC = () => {
  let cursor = 0;

  return (
    <AbsoluteFill>
      <GlowBackground />
      {SCENES.map((scene, index) => {
        const from = cursor;
        cursor += scene.durationInFrames - OVERLAP;
        const SceneComponent = scene.component;

        return (
          <Sequence
            key={index}
            from={from}
            durationInFrames={scene.durationInFrames}
          >
            <FadeWrapper
              durationInFrames={scene.durationInFrames}
              fadeIn={OVERLAP}
              fadeOut={OVERLAP}
            >
              <SceneComponent />
            </FadeWrapper>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
