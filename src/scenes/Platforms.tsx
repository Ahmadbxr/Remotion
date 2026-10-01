import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {WhipIn} from '../components/WhipIn';

const PLATFORMS: {label: string; direction: 'left' | 'right'}[] = [
  {label: 'Instagram', direction: 'left'},
  {label: 'TikTok', direction: 'right'},
  {label: 'YouTube Shorts', direction: 'left'},
];

export const Platforms: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <WhipIn delay={0}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: 52,
            lineHeight: 1.2,
            letterSpacing: -1,
            textAlign: 'center',
            color: COLORS.ink,
            padding: '0 100px',
            marginBottom: 56,
          }}
        >
          Modernes Short-Form-Content, das gesehen wird.
        </div>
      </WhipIn>
      <div style={{display: 'flex', flexDirection: 'column', gap: 22, width: 460}}>
        {PLATFORMS.map(({label, direction}, index) => (
          <WhipIn key={label} delay={16 + index * 8} direction={direction} distance={90}>
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontWeight: 700,
                fontSize: 30,
                color: COLORS.ink,
                border: `2px solid ${COLORS.ink}`,
                borderRadius: 999,
                padding: '18px 0',
                textAlign: 'center',
              }}
            >
              {label}
            </div>
          </WhipIn>
        ))}
      </div>
    </AbsoluteFill>
  );
};
