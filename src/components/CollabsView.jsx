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
      .attr('stroke-width', d => Math.max(1, d.value || 2));

    // --- NEW: DRAG INTERACTIVITY FUNCTIONS ---
    // These functions allow the user to grab a node and throw it around!
    const dragStarted = (event, d) => {
      // Re-heat the simulation so physics resume (alphaTarget > 0)
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x; // "Fix" the node's position to where the mouse grabbed it
      d.fy = d.y;
    };

    const dragged = (event, d) => {
      d.fx = event.x; // Move the fixed position alongside the mouse cursor
      d.fy = event.y;
    };

    const dragEnded = (event, d) => {
      // Let the simulation cool down and restabilize
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null; // Unfix the position so gravity takes over again!
      d.fy = null;
    };

    // --- NEW: TOOLTIP ---
    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute bg-slate-800 text-slate-200 p-2 rounded shadow-lg border border-slate-700 text-sm pointer-events-none opacity-0 z-50 transition-opacity');

    // 5. DRAW NODES (Groups containing circles and text)
    // We change this from just 'circle' to a 'g' so we can attach text labels inside!
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      // Attach our drag event listeners!
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded)
      )
      // Attach tooltip hover events
      .on('mouseover', (event, d) => {
        // Highlight the hovered node with a glowing blue border
        d3.select(event.currentTarget).select('circle')
          .transition().duration(200)
          .attr('stroke', '#38bdf8') // glow blue
          .attr('stroke-width', 4);

        tooltip.style('opacity', 1)
          .html(`<strong class="text-devpulse-glow">${d.id}</strong><br/><span class="text-slate-400">Collaborator</span>`);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event, d) => {
        // Reset the node styling
        d3.select(event.currentTarget).select('circle')
          .transition().duration(200)
          .attr('stroke', '#a78bfa')
          .attr('stroke-width', 2);
        
        tooltip.style('opacity', 0);
      });

    // Add the glowing circle background
    node.append('circle')
      .attr('r', 16)
      .attr('fill', '#1e293b') // dark card color
      .attr('stroke', '#a78bfa') // purple border
      .attr('stroke-width', 2);

    // Add the developer's initial (First letter of their ID)
    node.append('text')
      .text(d => d.id.charAt(0).toUpperCase())
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      // CRITICAL: Prevent text from blocking mouse/drag events!
      .attr('pointer-events', 'none');

    // 6. TICK FUNCTION (The Animation Loop)
    // The force simulation calculates physics at 60 FPS. 
    // We must manually update the SVG DOM attributes on every "tick" to match the new math!
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      // Since 'node' is now a <g> group, we update its transform instead of cx/cy!
      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Cleanup: Stop the physics simulation and remove tooltip when leaving the tab
    return () => {
      simulation.stop();
      tooltip.remove();
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
