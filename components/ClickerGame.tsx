import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ClickerGame = () => {
  const [count, setCount] = useState(0);
  const [particles, setParticles] = useState<{id: number, angle: number, speed: number, size: number}[]>([]);

  const handleClick = () => {
    setCount(c => c + 1);
    
    // Create explosion particles with randomized physics
    const particleCount = 12;
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      angle: (i / particleCount) * 360 + (Math.random() * 30 - 15),
      speed: 50 + Math.random() * 60,
      size: 3 + Math.random() * 4
    }));

    setParticles(prev => [...prev, ...newParticles]);
    
    // Cleanup particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 select-none relative z-10">
      <div className="relative">
        {/* Main Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          className="relative w-36 h-36 rounded-[3rem] bg-zinc-900 flex items-center justify-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] group outline-none z-20 cursor-pointer overflow-hidden ring-8 ring-zinc-50"
        >
          {/* Shine effect */}
          <div className="absolute -inset-full top-0 block bg-gradient-to-r from-transparent to-white opacity-5 -skew-x-12 group-hover:animate-shine" />
          
          <motion.span 
            key={count} 
            initial={{ scale: 1.3, y: 5, opacity: 0, filter: 'blur(4px)' }}
            animate={{ scale: 1, y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="text-5xl font-black text-white tracking-tighter tabular-nums z-10"
          >
            {count}
          </motion.span>
        </motion.button>

        {/* Particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0.8, x: 0, y: 0, scale: 0 }}
              animate={{ 
                opacity: 0, 
                x: Math.cos(p.angle * Math.PI / 180) * p.speed, 
                y: Math.sin(p.angle * Math.PI / 180) * p.speed,
                scale: 1 
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ width: p.size, height: p.size }}
              className="absolute top-1/2 left-1/2 rounded-full bg-zinc-800 pointer-events-none -ml-1 -mt-1 z-0"
            />
          ))}
        </AnimatePresence>
        
        {/* Shockwave Ring */}
        <AnimatePresence>
            {count > 0 && (
                 <motion.div 
                   key={`ring-${count}`}
                   initial={{ opacity: 0.4, scale: 1, borderWidth: '2px' }}
                   animate={{ opacity: 0, scale: 1.8, borderWidth: '0px' }}
                   transition={{ duration: 0.5, ease: "easeOut" }}
                   className="absolute inset-0 rounded-[3rem] border border-zinc-300 pointer-events-none z-10"
                 />
            )}
        </AnimatePresence>
      </div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-10 text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em]"
      >
        Tap to relax
      </motion.p>
    </div>
  );
};