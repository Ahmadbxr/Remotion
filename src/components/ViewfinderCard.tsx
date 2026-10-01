import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, MONO_FONT_FAMILY, FONT_FAMILY} from '../theme';

type Props = {
  index: string;
  title: string;
  category: string;
  width?: number;
  height?: number;
};

const Corner: React.FC<{style: React.CSSProperties}> = ({style}) => (
  <div
    style={{
      position: 'absolute',
      width: 18,
      height: 18,
      borderColor: 'rgba(255,255,255,0.55)',
      ...style,
    }}
  />
);

/**
 * The camera-viewfinder motif from offscript.ch's own project cards: REC
 * indicator, live timecode, aspect-ratio label and corner brackets over a
 * dark gradient placeholder.
 */
export const ViewfinderCard: React.FC<Props> = ({
  index,
  title,
  category,
  width = 560,
  height = 760,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const totalSeconds = frame / fps;
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(Math.floor(totalSeconds % 60)).padStart(2, '0');
  const ff = String(Math.floor(frame % fps)).padStart(2, '0');

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          position: 'relative',
          width,
          height,
          borderRadius: 28,
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 50% 100%, rgba(242,5,5,0.55), rgba(17,17,19,0.95) 55%, #0A0A0B 75%)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.18)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 18,
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: 8,
          }}
        />
        <Corner style={{top: 10, left: 10, borderTop: '2px solid', borderLeft: '2px solid'}} />
        <Corner style={{top: 10, right: 10, borderTop: '2px solid', borderRight: '2px solid'}} />
        <Corner style={{bottom: 10, left: 10, borderBottom: '2px solid', borderLeft: '2px solid'}} />
        <Corner style={{bottom: 10, right: 10, borderBottom: '2px solid', borderRight: '2px solid'}} />

        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: MONO_FONT_FAMILY,
            color: COLORS.accent,
            fontSize: 18,
            letterSpacing: 1,
          }}
        >
          <div
            style={{
              width: 9,
              height: 9,
              borderRadius: 9,
              backgroundColor: COLORS.accent,
            }}
          />
          {index}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 30,
            right: 32,
            fontFamily: MONO_FONT_FAMILY,
            color: 'rgba(255,255,255,0.85)',
            fontSize: 16,
            letterSpacing: 1,
          }}
        >
          9:16
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: 32,
            fontFamily: MONO_FONT_FAMILY,
            color: 'rgba(255,255,255,0.7)',
            fontSize: 15,
            letterSpacing: 1,
          }}
        >
          00:{mm}:{ss}:{ff}
        </div>

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 68,
            height: 68,
            borderRadius: 68,
            border: '1.5px solid rgba(255,255,255,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              marginLeft: 6,
              borderTop: '13px solid transparent',
              borderBottom: '13px solid transparent',
              borderLeft: '20px solid rgba(255,255,255,0.9)',
            }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          width,
        }}
      >
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: 28,
            color: COLORS.ink,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: MONO_FONT_FAMILY,
            fontSize: 15,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: COLORS.muted,
          }}
        >
          {category}
        </div>
      </div>
    </div>
  );
};
