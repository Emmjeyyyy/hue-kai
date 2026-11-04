import React from 'react';
import { motion } from 'framer-motion';

interface SteppedBarsProps {
  topColor?: string;
  bottomColor?: string;
}

export default function SteppedBars({ topColor = '#000000', bottomColor = '#ffffff' }: SteppedBarsProps) {
  const bars = [0, 1, 2, 3, 4, 5];
  const mids = [17, 32, 47, 62, 77, 90];
  const amp = 5;
  const steps = 40;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#0B0F19', overflow: 'hidden' }}>
      {bars.map((i) => {
        // Generate 40-step sine wave for ultra-smooth linear interpolation
        const keyframes = [];
        for (let step = 0; step <= steps; step++) {
          const t = step / steps;
          const val = mids[i] + amp * Math.sin(t * Math.PI * 2 - i * (Math.PI / 3) + Math.PI / 2);
          keyframes.push(`${val.toFixed(2)}%`);
        }

        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              bottom: 0,
              left: `${i * 16.666}%`,
              width: '17%', // Slight overlap completely prevents gaps
              background: `linear-gradient(180deg, ${topColor}, ${bottomColor})`,
              // Drop shadow casting to the left, falling on the previous bar
              boxShadow: i > 0 ? '-15px 0 35px rgba(0,0,0,0.12)' : 'none',
              filter: 'blur(0.7px)',
              transformOrigin: 'bottom',
              willChange: 'height'
            }}
            animate={{ height: keyframes }}
            transition={{
              duration: 10,
              ease: 'linear',
              repeat: Infinity
            }}
          />
        );
      })}
    </div>
  );
}
