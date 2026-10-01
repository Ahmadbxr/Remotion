// NaiaPreview: original clip (with sound) + the animation layer.
// NaiaOverlay: the identical animation layer on a transparent background, no
// sound — exported as ProRes 4444 with alpha to lay over the clip in the edit.
import React from 'react';
import {AbsoluteFill, CalculateMetadataFunction, Composition, staticFile} from 'remotion';
import {Video} from '@remotion/media';
import {NAIA} from './config';
import {Guides, NaiaGraphics} from './Graphics';

type PreviewProps = {guides: boolean};

const NaiaPreview: React.FC<PreviewProps> = ({guides}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Video src={staticFile(NAIA.source)} />
    <NaiaGraphics tempLabel={!NAIA.logo.src} />
    {guides ? <Guides /> : null}
  </AbsoluteFill>
);

// no background at all: every pixel outside the graphics stays fully transparent
const NaiaOverlay: React.FC = () => <NaiaGraphics />;

const overlayDefaults: CalculateMetadataFunction<Record<string, unknown>> = async () => ({
  defaultCodec: 'prores',
  defaultProResProfile: '4444',
  defaultPixelFormat: 'yuva444p10le',
  defaultVideoImageFormat: 'png',
});

const common = {
  durationInFrames: NAIA.durationInFrames,
  fps: NAIA.fps,
  width: NAIA.width,
  height: NAIA.height,
};

export const NaiaCompositions: React.FC = () => (
  <>
    <Composition id="NaiaPreview" component={NaiaPreview} defaultProps={{guides: false}} {...common} />
    <Composition id="NaiaOverlay" component={NaiaOverlay} calculateMetadata={overlayDefaults} {...common} />
  </>
);
