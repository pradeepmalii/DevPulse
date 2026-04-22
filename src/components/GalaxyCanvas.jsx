import React, { useRef, useEffect } from 'react';

const GalaxyCanvas = ({ profile, repos = [] }) => {
  // 1. We create a ref to hook into the actual <canvas> DOM element
  const canvasRef = useRef(null);

  useEffect(() => {
    // 2. Extract the actual DOM element from our ref
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 3. Get the 2D rendering context (our "paintbrush")
    const ctx = canvas.getContext('2d');

    // 4. Handle resizing: make the canvas fill its parent container entirely
    const updateSize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      
      // Clear the canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 5. Draw the Developer Node (Center)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 35; // Size of our center node, slightly larger for text

      // Draw the deep circle with a bright border
      ctx.beginPath();
      // arc(x, y, radius, startAngle, endAngle) -> Math.PI * 2 is a full circle
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); 
      ctx.fillStyle = '#1e293b'; // Tailwind devpulse-card (dark)
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#a78bfa'; // Tailwind devpulse-glow (purple)
      ctx.stroke();
      ctx.closePath();

      // 6. Draw avatar initials inside the circle
      let initials = "NA"; // Default fallback
      if (profile && profile.name) {
        // "Ninja Developer" -> ["Ninja", "Developer"] -> "ND"
        const nameParts = profile.name.split(' ');
        initials = nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase();
      }

      ctx.fillStyle = '#e2e8f0'; // Tailwind slate-200 (light text)
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';      // Horizontally center text
      ctx.textBaseline = 'middle';   // Vertically center text
      // Note: we place it at centerX, centerY and the alignment takes care of spacing
      ctx.fillText(initials, centerX, centerY);

      // 7. Draw the Repositories (Planets!)
      if (repos && repos.length > 0) {
        const orbitRadius = 160; // How far away the planets orbit from the center
        
        repos.forEach((repo, index) => {
          // Calculate where on the 360-degree circle this planet belongs
          // Math.PI * 2 is a full circle in radians. We divide it equally among all repos.
          const angle = (index / repos.length) * (Math.PI * 2);
          
          // TRIGONOMETRY MAGIC:
          // X is derived from Cosine, Y is derived from Sine.
          // We multiply by orbitRadius to push it outward, then add centerX/centerY to move the origin to the middle.
          const x = centerX + Math.cos(angle) * orbitRadius;
          const y = centerY + Math.sin(angle) * orbitRadius;
          
          // 8. Size by Stars
          // We use Math.max to guarantee a minimum size of 5 pixels.
          // Then we scale the stargazers_count down so huge repos don't cover the whole screen.
          const planetRadius = Math.max(5, repo.stargazers_count / 12);
          
          // Draw the planet
          ctx.beginPath();
          ctx.arc(x, y, planetRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#38bdf8'; // Temporary blue color (we'll do language colors next!)
          ctx.fill();
          ctx.closePath();
        });
      }
    };

    // Initialize size and draw
    updateSize();

    // Re-draw if the window size changes
    window.addEventListener('resize', updateSize);
    
    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', updateSize);

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
