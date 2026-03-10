'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface JarvisFaceProps {
  status: string;
  isPlaying: boolean;
  isListening: boolean;
  audioLevel?: number;
}

export const JarvisFace: React.FC<JarvisFaceProps> = ({ status, isPlaying, isListening, audioLevel = 0 }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [isSurprised, setIsSurprised] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    const handleMouseDown = () => {
      setBlink(true);
      setIsSurprised(true);
      setTimeout(() => {
        setBlink(false);
        setIsSurprised(false);
      }, 500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      clearInterval(blinkInterval);
    };
  }, []);

  // Expression logic
  const getExpression = () => {
    if (isSurprised) return 'surprised';
    if (status === 'ERROR') return 'worried';
    if (status === 'CONNECTING...') return 'thinking';
    if (status === 'ONLINE' && !isListening && !isPlaying) return 'happy';
    if (isListening) return 'attentive';
    if (isPlaying) return 'speaking';
    return 'neutral';
  };

  const expression = getExpression();

  // Dynamic color based on status
  const getThemeColor = () => {
    if (status === 'ERROR') return '#ff4444';
    if (status === 'CONNECTING...') return '#f59e0b';
    if (isListening) return '#10b981';
    if (isPlaying) return '#6366f1';
    return '#00d2ff';
  };

  const themeColor = getThemeColor();

  const mouthBars = [
    { height: [8, 24, 8], duration: 0.25 },
    { height: [8, 32, 8], duration: 0.3 },
    { height: [8, 18, 8], duration: 0.2 },
    { height: [8, 40, 8], duration: 0.35 },
    { height: [8, 28, 8], duration: 0.28 },
    { height: [8, 35, 8], duration: 0.32 },
    { height: [8, 22, 8], duration: 0.22 },
    { height: [8, 38, 8], duration: 0.38 },
    { height: [8, 26, 8], duration: 0.26 },
  ];

  return (
    <motion.div 
      animate={{ 
        rotateX: -mousePos.y * 0.5,
        rotateY: mousePos.x * 0.5,
        y: [0, -5, 0],
        x: expression === 'worried' ? [0, -2, 2, -1, 0] : 0,
        filter: expression === 'worried' ? ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)'] : 'hue-rotate(0deg)',
        opacity: isListening ? [0.8, 1, 0.9, 1, 0.8] : 1
      }}
      transition={{ 
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        x: { duration: 0.1, repeat: expression === 'worried' ? Infinity : 0 },
        filter: { duration: 0.2, repeat: expression === 'worried' ? Infinity : 0 },
        opacity: { duration: 0.5, repeat: isListening ? Infinity : 0 }
      }}
      className="relative w-64 h-64 flex items-center justify-center pointer-events-none"
      style={{ perspective: 1000 }}
    >
      {/* Face Glow Background */}
      <motion.div 
        animate={{ 
          scale: isSurprised ? [1, 1.5, 1] : (isPlaying ? [1, 1.1 + audioLevel, 1] : 1),
          opacity: isSurprised ? [0.4, 0.8, 0.4] : (isListening ? [0.4, 0.7, 0.4] : 0.3),
          backgroundColor: themeColor
        }}
        transition={{ duration: isSurprised ? 0.5 : 2, repeat: isSurprised ? 0 : Infinity }}
        className="absolute inset-0 rounded-full blur-[80px]"
      />

      {/* Organic Fluid Core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.05, 0.95, 1],
            rotate: [0, 90, 180, 270, 360],
            borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-48 h-48 border border-white/10 backdrop-blur-sm bg-white/5"
        />
      </div>

      {/* Cheek Glows */}
      <div className="absolute inset-0 flex justify-between px-12 items-center opacity-10 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: isPlaying ? [1, 1.3, 1] : (expression === 'thinking' ? [1, 1.1, 1] : 1),
            opacity: expression === 'worried' ? [0.1, 0.4, 0.1] : (expression === 'happy' ? 0.4 : 0.1),
            backgroundColor: expression === 'happy' ? '#ff00d2' : (expression === 'worried' ? '#ff0000' : '#00d2ff')
          }}
          transition={{ 
            scale: { duration: isPlaying ? 0.2 : 1, repeat: (isPlaying || expression === 'thinking') ? Infinity : 0 },
            opacity: { duration: 0.1, repeat: expression === 'worried' ? Infinity : 0 }
          }}
          className="w-16 h-8 rounded-full blur-2xl"
        />
        <motion.div 
          animate={{ 
            scale: isPlaying ? [1, 1.3, 1] : (expression === 'thinking' ? [1, 1.1, 1] : 1),
            opacity: expression === 'worried' ? [0.1, 0.4, 0.1] : (expression === 'happy' ? 0.4 : 0.1),
            backgroundColor: expression === 'happy' ? '#ff00d2' : (expression === 'worried' ? '#ff0000' : '#00d2ff')
          }}
          transition={{ 
            scale: { duration: isPlaying ? 0.2 : 1, repeat: (isPlaying || expression === 'thinking') ? Infinity : 0 },
            opacity: { duration: 0.1, repeat: expression === 'worried' ? Infinity : 0 }
          }}
          className="w-16 h-8 rounded-full blur-2xl"
        />
      </div>

      {/* Eyes Container */}
      <div className="flex gap-12 mb-8 relative">
        {[0, 1].map((i) => (
          <div key={i} className="relative w-12 h-12">
            {/* Eyebrow */}
            <motion.div 
              animate={{ 
                y: expression === 'thinking' ? [-5, -8, -5] : (expression === 'worried' ? [-2, -4, -2] : (expression === 'surprised' ? -12 : 0)),
                rotate: expression === 'thinking' ? (i === 0 ? 10 : -10) : (expression === 'worried' ? (i === 0 ? -15 : 15) : 0),
                opacity: (expression === 'thinking' || expression === 'worried') ? [0.4, 1, 0.4] : 0.4,
                backgroundColor: themeColor
              }}
              transition={{ 
                y: { duration: expression === 'worried' ? 0.1 : 1, repeat: Infinity },
                opacity: { duration: expression === 'worried' ? 0.1 : 1, repeat: Infinity }
              }}
              className="absolute -top-4 left-0 w-full h-1 rounded-full"
            />

            {/* Eye Socket */}
            <motion.div 
              animate={{ 
                borderColor: isListening ? themeColor : (expression === 'thinking' ? themeColor : (expression === 'worried' ? '#ff0000' : 'rgba(255,255,255,0.1)')),
                boxShadow: isListening ? `0 0 20px ${themeColor}44` : (expression === 'thinking' ? `0 0 10px ${themeColor}22` : (expression === 'worried' ? '0 0 15px rgba(255,0,0,0.4)' : 'none')),
                scale: expression === 'surprised' ? 1.2 : 1,
                x: expression === 'worried' ? [0, -1, 1, 0] : 0
              }}
              transition={{ x: { duration: 0.1, repeat: expression === 'worried' ? Infinity : 0 } }}
              className="absolute inset-0 rounded-full border bg-white/5 backdrop-blur-md overflow-hidden"
            >
              {/* Pupil / Iris */}
              <motion.div 
                animate={{ 
                  x: mousePos.x, 
                  y: mousePos.y,
                  scale: blink ? 0.1 : (1 + audioLevel * 0.5),
                  opacity: blink ? 0 : 1,
                  backgroundColor: themeColor,
                  boxShadow: `0 0 15px ${themeColor}`
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="absolute inset-2 rounded-full"
              >
                <div className="absolute inset-1 rounded-full bg-white/40 blur-[1px]" />
                <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/60" />
              </motion.div>
            </motion.div>
            
            {/* Eye Lid / Expression Overlay */}
            <motion.div 
              animate={{ 
                height: expression === 'thinking' ? '40%' : expression === 'worried' ? '60%' : '0%' 
              }}
              className="absolute top-0 left-0 w-full bg-[#050505] z-10"
            />
          </div>
        ))}
      </div>

      {/* Nose */}
      <motion.div 
        animate={{ 
          y: mousePos.y * 0.2,
          x: mousePos.x * 0.2,
          opacity: isListening ? [0.2, 0.5, 0.2] : 0.2,
          backgroundColor: themeColor
        }}
        transition={{ opacity: { duration: 1, repeat: Infinity } }}
        className="absolute top-[45%] w-1 h-4 rounded-full blur-[1px]"
      />

      {/* Mouth / Audio Visualizer */}
      <div className="absolute bottom-16 flex items-center justify-center gap-1 h-8">
        {isPlaying || (isListening && audioLevel > 0.01) ? (
          // Animated Mouth when speaking or listening with audio
          [...Array(9)].map((_, i) => {
            const baseHeight = 8;
            const boost = audioLevel * 100;
            const randomBoost = Math.sin(i * 1.5) * boost * 0.3;
            const finalHeight = Math.max(baseHeight, baseHeight + boost + randomBoost);
            
            return (
              <motion.div
                key={i}
                animate={{ 
                  height: finalHeight,
                  opacity: [0.4, 1, 0.4],
                  backgroundColor: themeColor
                }}
                transition={{ 
                  duration: 0.1,
                  repeat: 0
                }}
                className="w-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              />
            );
          })
        ) : (
          // Static Mouth Line
          <motion.div 
            animate={{ 
              width: isListening ? 40 : (expression === 'happy' ? 30 : (expression === 'surprised' ? 15 : 20)),
              height: isListening ? 4 : (expression === 'happy' ? 6 : (expression === 'surprised' ? 15 : 2)),
              borderRadius: isListening ? 10 : (expression === 'happy' ? '0 0 10px 10px' : (expression === 'surprised' ? '50%' : 2)),
              y: expression === 'happy' ? 2 : (expression === 'surprised' ? 5 : 0),
              opacity: (expression === 'thinking' || expression === 'worried') ? [0.4, 1, 0.4] : 0.6,
              x: expression === 'worried' ? [0, -2, 2, 0] : 0,
              backgroundColor: themeColor
            }}
            transition={{ 
              opacity: { duration: expression === 'worried' ? 0.1 : 1, repeat: (expression === 'thinking' || expression === 'worried') ? Infinity : 0 },
              x: { duration: 0.1, repeat: expression === 'worried' ? Infinity : 0 }
            }}
            className="shadow-[0_0_5px_rgba(255,255,255,0.3)]"
          />
        )}
      </div>

      {/* Chin */}
      <motion.div 
        animate={{ 
          opacity: isListening ? 0.4 : (isPlaying ? 0.8 : 0.1),
          y: isPlaying ? [2, 4, 2] : 0,
          scaleX: isPlaying ? [1, 1.2, 1] : 1,
          backgroundColor: themeColor
        }}
        transition={{ 
          y: { duration: 0.2, repeat: Infinity },
          scaleX: { duration: 0.2, repeat: Infinity }
        }}
        className="absolute bottom-10 w-12 h-0.5 rounded-full blur-[0.5px] shadow-[0_0_10px_rgba(255,255,255,0.3)]"
      />

      {/* Holographic Scan Lines */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-20">
        <motion.div 
          animate={{ 
            y: ['-100%', '100%'],
            opacity: expression === 'surprised' ? [0.2, 1, 0.2] : 0.2
          }}
          transition={{ 
            y: { duration: expression === 'surprised' ? 0.5 : 3, repeat: Infinity, ease: "linear" },
            opacity: { duration: 0.1, repeat: expression === 'surprised' ? Infinity : 0 }
          }}
          className="w-full h-1 bg-gradient-to-r from-transparent via-[#00d2ff] to-transparent"
        />
      </div>

      {/* Status Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <motion.circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke={themeColor}
          strokeWidth={expression === 'surprised' ? 2 : 0.5}
          strokeDasharray="1 10"
          animate={{ 
            strokeDashoffset: [0, 100],
            opacity: expression === 'surprised' ? [0.2, 0.8, 0.2] : 0.1
          }}
          transition={{ 
            strokeDashoffset: { duration: expression === 'thinking' ? 2 : 20, repeat: Infinity, ease: "linear" },
            opacity: { duration: 0.2, repeat: expression === 'surprised' ? Infinity : 0 }
          }}
        />
      </svg>
    </motion.div>
  );
};
