import React, { useRef, useEffect } from 'react';

// Standard GitHub language colors
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Python: '#3572A5',
  Go: '#00ADD8',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'C++': '#f34b7d',
  C: '#555555',
  Rust: '#dea584'
};

const GalaxyCanvas = ({ profile, repos = [] }) => {
  // 1. We create a ref to hook into the actual <canvas> DOM element
  const canvasRef = useRef(null);

  useEffect(() => {
    // 2. Extract the actual DOM element from our ref
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 3. Get the 2D rendering context (our "paintbrush")
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0; // This will act as our "clock" that increments every frame

    // 4. Handle resizing: make the canvas fill its parent container entirely
    const updateSize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    // 5. The Main Animation Loop
    const render = () => {
      // Step A: Clear the entire canvas from the previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Step B: Draw Orbit Rings
      const INNER_ORBIT = 130;
      const OUTER_ORBIT = 230;

      const drawRing = (radius) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#334155'; 
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]); 
        ctx.stroke();
        ctx.closePath();
        ctx.setLineDash([]); 
      };

      drawRing(INNER_ORBIT);
      drawRing(OUTER_ORBIT);

      // Step C: Draw the Developer Node (Center)
      const radius = 35; 
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); 
      ctx.fillStyle = '#1e293b'; 
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#a78bfa'; 
      ctx.stroke();
      ctx.closePath();

      let initials = "NA"; 
      if (profile && profile.name) {
        const nameParts = profile.name.split(' ');
        initials = nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase();
      }

      ctx.fillStyle = '#e2e8f0'; 
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';      
      ctx.textBaseline = 'middle';   
      ctx.fillText(initials, centerX, centerY);

      // Step D: Draw the Repositories (Planets!)
      if (repos && repos.length > 0) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        repos.forEach((repo, index) => {
          // Base angle so they are evenly spread out
          const baseAngle = (index / repos.length) * (Math.PI * 2);
          
          const repoDate = new Date(repo.pushed_at);
          const isRecent = repoDate > sixMonthsAgo;
          const orbitRadius = isRecent ? INNER_ORBIT : OUTER_ORBIT;
          
          // ANIMATION MAGIC: 
          // We add the current 'time' to the base angle. 
          // We multiply time by a tiny number to control the speed. 
          // Inner planets orbit slightly faster (0.003) than outer planets (0.0015).
          const speed = isRecent ? 0.003 : 0.0015;
          const currentAngle = baseAngle + (time * speed);
          
          const x = centerX + Math.cos(currentAngle) * orbitRadius;
          const y = centerY + Math.sin(currentAngle) * orbitRadius;
          
          const planetRadius = Math.max(5, repo.stargazers_count / 12);
          
          ctx.beginPath();
          ctx.arc(x, y, planetRadius, 0, Math.PI * 2);
          ctx.fillStyle = LANGUAGE_COLORS[repo.language] || '#94a3b8';
          ctx.fill();
          
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.fillStyle;
          ctx.fill();
          ctx.shadowBlur = 0; 

          ctx.closePath();
        });
      }

      // Step E: Advance time and request the browser to draw the next frame!
      time += 1;
      animationFrameId = window.requestAnimationFrame(render);
    };

    // Initialize size and start the loop!
    updateSize();
    render();

    // Re-draw if the window size changes
    window.addEventListener('resize', updateSize);
    
    // Cleanup listener and cancel animation loop on unmount
    return () => {
      window.removeEventListener('resize', updateSize);
      window.cancelAnimationFrame(animationFrameId);
    };

  }, [profile, repos]); // Re-run if profile OR repos change

  return (
    // The parent div acts as a sturdy container for the canvas to fill
    <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
};

export default GalaxyCanvas;
