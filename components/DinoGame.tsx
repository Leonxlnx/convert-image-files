import React, { useEffect, useRef, useState } from 'react';

export const DinoGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let isGameActive = true;
    let scoreVal = 0;
    
    // Game Physics
    let dinoY = 0;
    let dinoVy = 0;
    let isJumping = false;
    const gravity = 0.6;
    const groundY = 120;
    const dinoSize = 24;
    
    // Obstacles
    let obstacles: {x: number, w: number, h: number}[] = [];
    let frame = 0;
    const speed = 4;

    const resetGame = () => {
        obstacles = [];
        scoreVal = 0;
        frame = 0;
        isGameActive = true;
    };

    const jump = () => {
      if (!isJumping) {
        dinoVy = -10;
        isJumping = true;
      }
    };

    const handleInput = (e: KeyboardEvent | TouchEvent | MouseEvent) => {
       if (e.type === 'keydown') {
           if ((e as KeyboardEvent).code === 'Space' || (e as KeyboardEvent).code === 'ArrowUp') {
               jump();
               e.preventDefault();
           }
       } else {
           jump();
       }
    };

    window.addEventListener('keydown', handleInput);
    canvas.addEventListener('touchstart', handleInput);
    canvas.addEventListener('mousedown', handleInput);

    const loop = () => {
      if (!ctx) return;
      
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fafafa'; // background matches app
      ctx.fillRect(0,0, canvas.width, canvas.height);

      // Draw Ground Line
      ctx.beginPath();
      ctx.strokeStyle = '#e4e4e7';
      ctx.lineWidth = 2;
      ctx.moveTo(0, groundY + dinoSize);
      ctx.lineTo(canvas.width, groundY + dinoSize);
      ctx.stroke();

      if (isGameActive) {
          // Dino Physics
          dinoVy += gravity;
          dinoY += dinoVy;
          
          if (dinoY > groundY) {
            dinoY = groundY;
            dinoVy = 0;
            isJumping = false;
          }

          // Spawn Obstacles
          if (frame % 90 === 0 || (frame % 90 === 0 && Math.random() > 0.8)) {
             if (Math.random() > 0.3) { // chance to spawn
                 obstacles.push({ x: canvas.width, w: 15 + Math.random() * 10, h: 20 + Math.random() * 15 });
             }
          }

          // Update Obstacles
          for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.x -= speed;
            
            // Draw Obstacle
            ctx.fillStyle = '#18181b'; // zinc-900
            ctx.fillRect(obs.x, groundY + dinoSize - obs.h, obs.w, obs.h);

            // Collision
            if (
                50 < obs.x + obs.w &&
                50 + dinoSize > obs.x &&
                dinoY + groundY < groundY + dinoSize &&
                dinoY + groundY + dinoSize > groundY + dinoSize - obs.h
            ) {
               // Hit - just reset score for "loading" vibes (infinite play)
               scoreVal = 0;
               obstacles = [];
            }

            if (obs.x + obs.w < 0) obstacles.splice(i, 1);
          }

          scoreVal++;
          setScore(Math.floor(scoreVal / 10));
          frame++;
      }

      // Draw Dino
      ctx.fillStyle = '#18181b';
      ctx.fillRect(50, dinoY + groundY, dinoSize, dinoSize);
      // Eye
      ctx.fillStyle = 'white';
      ctx.fillRect(50 + 16, dinoY + groundY + 4, 4, 4);

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleInput);
      canvas.removeEventListener('touchstart', handleInput);
      canvas.removeEventListener('mousedown', handleInput);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative border border-zinc-100 rounded-xl overflow-hidden bg-[#fafafa]">
        <canvas 
            ref={canvasRef} 
            width={400} 
            height={160} 
            className="w-full max-w-[320px] h-auto cursor-pointer"
        />
        <div className="absolute top-2 right-4 font-mono text-xs text-zinc-400 font-bold">
            SCORE: {score.toString().padStart(4, '0')}
        </div>
      </div>
      <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-widest font-medium">Tap or Space to Jump</p>
    </div>
  );
};