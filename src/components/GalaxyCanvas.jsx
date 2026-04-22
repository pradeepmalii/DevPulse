import React, { useRef, useEffect } from 'react';

const GalaxyCanvas = ({ profile }) => {
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
    };

    // Initialize size and draw
    updateSize();

    // Re-draw if the window size changes
    window.addEventListener('resize', updateSize);
    
    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', updateSize);

  }, [profile]); // If the user profile changes (e.g. they search a new user), re-run this drawing effect!

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
