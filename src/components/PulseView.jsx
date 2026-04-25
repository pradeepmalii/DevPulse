import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const PulseView = ({ commits }) => {
  // 1. Create a ref to hook into our container div
  const svgRef = useRef(null);

  useEffect(() => {
    // 2. Select the DOM element using D3
    const container = d3.select(svgRef.current);
    
    // Clear any existing SVG so we don't draw duplicates on hot-reload
    container.selectAll('*').remove();

    // 3. Append an SVG canvas to our container
    const svg = container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '300px')
      .style('background-color', '#0f172a'); // Tailwind devpulse-dark

    // 4. Draw a single rectangle to prove D3 is working!
    // D3 Method Chaining pattern: select -> append -> attr -> attr...
    svg.append('rect')
      .attr('x', 50)
      .attr('y', 50)
      .attr('width', 200)
      .attr('height', 100)
      .attr('fill', '#7c3aed') // Tailwind devpulse-purple
      .attr('rx', 8); // rounded corners!

  }, [commits]);

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h2 className="text-xl font-bold text-slate-200">Weekly Commit Pulse</h2>
      <div 
        ref={svgRef} 
        className="w-full shadow-lg rounded-xl overflow-hidden border border-slate-700" 
      />
    </div>
  );
};

export default PulseView;
