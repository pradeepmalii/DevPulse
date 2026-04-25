import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const CollabsView = ({ collabs }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!collabs || !collabs.nodes || !collabs.links) return;

    const container = d3.select(containerRef.current);
    container.selectAll('*').remove();

    // Grab the exact pixel dimensions of our container div
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. CREATE SVG WITH ZOOM SUPPORT
    const svg = container
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height])
      .style('background-color', '#0f172a') // devpulse-dark
      // d3.zoom() attaches mouse wheel and drag events automatically!
      .call(d3.zoom().on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));

    // We put all lines and circles inside a <g> group. 
    // When the user zooms, we transform this single group, moving everything together!
    const g = svg.append('g');

    // 2. DEEP COPY DATA
    // CRITICAL: D3 force simulation physically mutates the data arrays by adding x, y, and velocity properties.
    // In React, mutating props is a cardinal sin! We MUST deep copy the data.
    const nodes = collabs.nodes.map(d => ({ ...d }));
    const links = collabs.links.map(d => ({ ...d }));

    // 3. INITIALIZE FORCE SIMULATION
    const simulation = d3.forceSimulation(nodes)
      // Pull connected nodes together
      .force('link', d3.forceLink(links).id(d => d.id).distance(120)) 
      // Push all nodes away from each other (like magnets)
      .force('charge', d3.forceManyBody().strength(-400)) 
      // Pull the entire network toward the center of the screen
      .force('center', d3.forceCenter(width / 2, height / 2)); 

    // 4. DRAW LINKS (Lines)
    const link = g.append('g')
      .attr('stroke', '#334155') // slate-700
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.max(1, d.value || 2)); // Thicker line if they collaborated more

    // 5. DRAW NODES (Circles)
    const node = g.append('g')
      .attr('stroke', '#a78bfa') // purple border
      .attr('stroke-width', 2)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 16) // Node size
      .attr('fill', '#1e293b'); // dark card color

    // 6. TICK FUNCTION (The Animation Loop)
    // The force simulation calculates physics at 60 FPS. 
    // We must manually update the SVG DOM attributes on every "tick" to match the new math!
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

    // Cleanup: Stop the physics simulation when leaving the tab to save CPU!
    return () => {
      simulation.stop();
    };

  }, [collabs]);

  return (
    <div className="w-full h-full flex flex-col gap-4 pb-10">
      <h2 className="text-xl font-bold text-slate-200">Collaboration Network</h2>
      <p className="text-sm text-slate-400">Scroll to zoom. Drag to pan around the galaxy of developers.</p>
      
      <div 
        ref={containerRef} 
        // We set a fixed height here so the network graph has plenty of room
        className="w-full h-[600px] shadow-lg rounded-xl overflow-hidden border border-slate-700 cursor-grab active:cursor-grabbing" 
      />
    </div>
  );
};

export default CollabsView;
