import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {EnterText} from '../components/EnterText';

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube Shorts'];

const Pill: React.FC<{label: string; delay: number}> = ({label, delay}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {damping: 200, mass: 0.6, stiffness: 140},
  });
  const translateX = (1 - progress) * 40;

  return (
    <div
      style={{
        opacity: Math.max(0, Math.min(1, progress)),
        transform: `translateX(${translateX}px)`,
        fontFamily: FONT_FAMILY,
        fontWeight: 600,
        fontSize: 30,
        color: COLORS.foreground,
        border: `1.5px solid rgba(245,245,247,0.35)`,
        borderRadius: 999,
        padding: '16px 40px',
      }}
    >
      {label}
    </div>
  );
};

export const Platforms: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <EnterText delay={0}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: 64,
            lineHeight: 1.2,
            letterSpacing: -1,
            textAlign: 'center',
            color: COLORS.foreground,
            padding: '0 200px',
            marginBottom: 56,
          }}
        >
          Modernes Short-Form-Content, das gesehen wird.
        </div>
      </EnterText>
      <div style={{display: 'flex', gap: 24}}>
        {PLATFORMS.map((label, index) => (
          <Pill key={label} label={label} delay={18 + index * 8} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
