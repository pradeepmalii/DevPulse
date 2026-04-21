import React, { useRef, useEffect } from 'react';

const GalaxyCanvas = () => {
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

      // 5. Draw a single filled circle in the center!
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 25; // Size of our center node

      // Start drawing a path
      ctx.beginPath();
      // arc(x, y, radius, startAngle, endAngle) -> Math.PI * 2 is a full circle
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); 
      ctx.fillStyle = '#a78bfa'; // Using our Tailwind devpulse-glow color
      ctx.fill();
      ctx.closePath();
    };

    // Initialize size and draw
    updateSize();

    // Re-draw if the window size changes
    window.addEventListener('resize', updateSize);
    
    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', updateSize);

  }, []); // Empty dependency array: run this setup once on mount

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
