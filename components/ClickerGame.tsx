import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ClickerGame = () => {
  const [count, setCount] = useState(0);
  const [particles, setParticles] = useState<{id: number, angle: number, dist: number}[]>([]);

  const handleClick = () => {
    setCount(c => c + 1);
    
    // Create explosion particles
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      angle: (i / 8) * 360 + Math.random() * 20, // Distribute radially
      dist: 60 + Math.random() * 40
    }));

    setParticles(prev => [...prev, ...newParticles]);
    
    // Cleanup
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 select-none">
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
          className="relative w-32 h-32 rounded-[2rem] bg-black flex items-center justify-center shadow-2xl shadow-black/20 group outline-none z-10 overflow-hidden"
        >
          {/* Subtle sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <motion.span 
            key={count} 
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black text-white tracking-tighter tabular-nums z-10"
          >
            {count}
          </motion.span>
        </motion.button>

        {/* Explosion Particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
              animate={{ 
                opacity: 0, 
                x: Math.cos(p.angle * Math.PI / 180) * p.dist, 
                y: Math.sin(p.angle * Math.PI / 180) * p.dist,
                scale: 0 
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-zinc-900 pointer-events-none -ml-1 -mt-1"
            />
          ))}
        </AnimatePresence>
        
        {/* Floating Ring */}
        <AnimatePresence>
            {count > 0 && (
                 <motion.div 
                   key={count} // Re-triggers on count change
                   initial={{ opacity: 0.5, scale: 1, borderWidth: '2px' }}
                   animate={{ opacity: 0, scale: 2, borderWidth: '0px' }}
                   transition={{ duration: 0.5 }}
                   className="absolute inset-0 rounded-[2rem] border border-black pointer-events-none"
                 />
            )}
        </AnimatePresence>
      </div>
      
      <p className="mt-8 text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em]">
        Click to Boost
      </p>
    </div>
  );
};