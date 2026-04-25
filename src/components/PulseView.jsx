import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const PulseView = ({ commits }) => {
  // 1. Create a ref to hook into our container div
  const svgRef = useRef(null);

  useEffect(() => {
    // We need data to draw!
    if (!commits || commits.length === 0) return;

    // --- DATA PREPARATION ---
    // Chunk our 364 days of commits into 52 weekly totals
    const weeklyCommits = [];
    for (let i = 0; i < commits.length; i += 7) {
      const week = commits.slice(i, i + 7);
      const total = week.reduce((sum, day) => sum + day.count, 0);
      weeklyCommits.push({
        weekNum: i / 7,
        total: total,
        startDate: week[0].date,
        endDate: week[week.length - 1].date
      });
    }

    // --- D3 SETUP ---
    const container = d3.select(svgRef.current);
    container.selectAll('*').remove(); // Clear previous renders

    // Standard D3 Margin Convention
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Append the SVG and a <g> (group) element shifted by our margins
    const svg = container
      .append('svg')
      .attr('viewBox', `0 0 800 300`) // viewBox makes it responsive!
      .style('background-color', '#0f172a')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // --- SCALES ---
    // X Scale: scaleBand is used for categorical data (like bars in a bar chart)
    const x = d3.scaleBand()
      .domain(weeklyCommits.map(d => d.weekNum))
      .range([0, width])
      .padding(0.2); // 20% gap between bars

    // Y Scale: scaleLinear maps our data domain to the physical pixel range
    // Note: Y pixel coordinates go DOWN on a screen, so range is [height, 0]
    const y = d3.scaleLinear()
      .domain([0, d3.max(weeklyCommits, d => d.total)])
      .range([height, 0]);

    // Color Scale: Automatically maps low/high values to light/dark purple!
    const colorScale = d3.scaleSequential(d3.interpolatePurples)
      .domain([0, d3.max(weeklyCommits, d => d.total)]);

    // --- AXES ---
    // Draw X Axis (Bottom)
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter(d => d % 5 === 0))) // Only show every 5th week label
      .attr('color', '#475569'); // slate-600

    // Draw Y Axis (Left)
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .attr('color', '#475569');

    // --- TOOLTIP SETUP ---
    // Tooltips are easier to style as standard HTML <div> tags appended to the body, not inside the SVG
    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute bg-slate-800 text-slate-200 p-3 rounded-lg shadow-xl border border-slate-700 text-sm pointer-events-none opacity-0 transition-opacity z-50');

    // --- DRAW BARS ---
    // The famous D3 Data Binding pattern: .data().join()
    svg.selectAll('.bar')
      .data(weeklyCommits)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.weekNum))
      .attr('y', d => y(d.total))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.total))
      .attr('fill', d => d.total > 0 ? colorScale(d.total) : '#1e293b') // Highlight active weeks, grey out zero weeks
      .attr('rx', 2) // rounded corners
      // --- INTERACTION ---
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 0.7); // visually highlight the bar
        tooltip.style('opacity', 1)
          .html(`<div class="font-bold text-devpulse-glow">${d.total} Commits</div>
                 <div class="text-xs text-slate-400 mt-1">${d.startDate} to ${d.endDate}</div>`);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('opacity', 1); // un-highlight the bar
        tooltip.style('opacity', 0);
      });

    // Cleanup: When React unmounts this component, remove the stray tooltip div from the body!
    return () => {
      tooltip.remove();
    };

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
