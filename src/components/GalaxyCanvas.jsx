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
    
    // NEW: Track the mouse position relative to the canvas
    let mouse = { x: -1000, y: -1000 };
    let hoveredRepo = null; // Elevated to be accessible by the click handler
    let clickedPlanetId = null; // Track which planet to pulse
    let pulseTimer = 0; // Countdown for the pulse animation

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // NEW: Handle Clicks
    const handleClick = () => {
      if (hoveredRepo) {
        // 1. Open the repository URL in a new browser tab
        window.open(hoveredRepo.html_url, '_blank', 'noopener,noreferrer');
        
        // 2. Trigger the pulse animation
        clickedPlanetId = hoveredRepo.id;
        pulseTimer = 20; // The pulse will last for 20 frames
      }
    };
    canvas.addEventListener('click', handleClick);

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
      ctx.fillStyle = '#111111'; 
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
      hoveredRepo = null; // Reset every frame so we don't get stuck hovering
      let hoveredPlanetPos = null;

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
          
          let planetRadius = Math.max(5, repo.stargazers_count / 12);
          
          // NEW: Pulse Animation Math
          // If this planet was just clicked, temporarily increase its radius based on the timer!
          if (repo.id === clickedPlanetId && pulseTimer > 0) {
            // As pulseTimer counts down from 20 to 0, it adds extra padding that shrinks back to normal
            planetRadius += (pulseTimer / 2);
          }
          
          // NEW: Hit Detection using the Pythagorean Theorem
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Add a tiny bit of padding (3px) to make hovering easier
          if (distance <= planetRadius + 3) {
            hoveredRepo = repo;
            hoveredPlanetPos = { x, y, radius: planetRadius };
          }
          
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

      // Step E: Draw Tooltip and Update Cursor
      if (hoveredRepo && hoveredPlanetPos) {
        canvas.style.cursor = 'pointer'; // Turn mouse into a pointing hand

        // Box dimensions
        const boxWidth = 220;
        const boxHeight = 70;
        // Offset it slightly from the planet so the cursor doesn't cover it
        const boxX = hoveredPlanetPos.x + 15; 
        const boxY = hoveredPlanetPos.y + 15;

        // Draw Tooltip Background
        ctx.beginPath();
        // roundRect(x, y, width, height, borderRadius)
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 8); 
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; // devpulse-dark with 90% opacity
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#334155'; // slate-700
        ctx.stroke();
        ctx.closePath();

        // Draw Tooltip Text
        ctx.textAlign = 'left';
        
        // Repo Name
        ctx.fillStyle = '#e2e8f0'; // slate-200
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(hoveredRepo.name, boxX + 12, boxY + 22);
        
        // Repo Language
        const lang = hoveredRepo.language || 'Unknown';
        ctx.fillStyle = LANGUAGE_COLORS[lang] || '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.fillText(lang, boxX + 12, boxY + 42);
        
        // Repo Stars
        ctx.fillStyle = '#94a3b8'; // slate-400
        ctx.fillText(`⭐ ${hoveredRepo.stargazers_count}`, boxX + 12, boxY + 60);

      } else {
        canvas.style.cursor = 'default'; // Normal mouse cursor
      }

      // Step F: Advance time and request the browser to draw the next frame!
      time += 1;
      if (pulseTimer > 0) {
        pulseTimer -= 1; // Decrease the pulse timer every frame
      }
      
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
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
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

