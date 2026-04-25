import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const PulseView = ({ commits }) => {
  // 1. Create refs to hook into our container divs
  const barChartRef = useRef(null);
  const heatmapRef = useRef(null);
  const radialChartRef = useRef(null);

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
    const container = d3.select(barChartRef.current);
    container.selectAll('*').remove(); // Clear previous renders

    // Standard D3 Margin Convention
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Append the SVG and a <g> (group) element shifted by our margins
    const svg = container
      .append('svg')
      .attr('viewBox', `0 0 800 300`) // viewBox coordinates
      .attr('width', '100%')          // Force it to scale horizontally to fit the card!
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

  // --- HEATMAP EFFECT ---
  useEffect(() => {
    if (!commits || commits.length === 0) return;

    const container = d3.select(heatmapRef.current);
    container.selectAll('*').remove();

    // 1. DATA PREPARATION: Map 364 items into Grid Coordinates
    // Index 0-6 is Week 0. Index 7-13 is Week 1.
    const heatmapData = commits.map((d, i) => ({
      ...d,
      weekIndex: Math.floor(i / 7), // X coordinate
      dayIndex: i % 7               // Y coordinate
    }));

    // 2. SVG SETUP
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const cellSize = 14; // Size of each square
    const cellGap = 3;   // Gap between squares
    
    // NEW: We calculate the exact width dynamically based on the ACTUAL data length!
    // If the mock data generated more than 364 days, we must expand the viewBox to fit it!
    const totalWeeks = Math.ceil(heatmapData.length / 7);
    const width = (totalWeeks * (cellSize + cellGap)) + margin.left + margin.right; 
    const height = (7 * (cellSize + cellGap)) + margin.top + margin.bottom;

    const svg = container
      .append('svg')
      // Using viewBox along with width="100%" forces the SVG to scale down gracefully!
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .style('background-color', '#0f172a')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 3. COLOR SCALE
    // Same purple sequential scale as the bar chart
    const maxCount = d3.max(heatmapData, d => d.count);
    const colorScale = d3.scaleSequential(d3.interpolatePurples).domain([0, maxCount]);

    // 4. DRAW DAY LABELS
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    svg.selectAll('.day-label')
      .data(days)
      .join('text')
      .attr('x', -30)
      // Position each label vertically aligned with its row
      .attr('y', (d, i) => i * (cellSize + cellGap) + cellSize / 2 + 4) 
      // Show all days!
      .text(d => d)
      .attr('font-size', '10px')
      .attr('fill', '#64748b'); // slate-500

    // 5. TOOLTIP
    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute bg-slate-800 text-slate-200 p-2 rounded shadow-lg border border-slate-700 text-sm pointer-events-none opacity-0 z-50 transition-opacity');

    // 6. DRAW THE 364 SQUARES
    svg.selectAll('.cell')
      .data(heatmapData)
      .join('rect')
      .attr('class', 'cell')
      .attr('width', cellSize)
      .attr('height', cellSize)
      // Math: X is week column, Y is day row
      .attr('x', d => d.weekIndex * (cellSize + cellGap))
      .attr('y', d => d.dayIndex * (cellSize + cellGap))
      // Empty days get the dark background color, active days get the color scale
      .attr('fill', d => d.count > 0 ? colorScale(d.count) : '#1e293b')
      .attr('rx', 3) // Soft rounded corners
      // INTERACTION
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr('stroke', '#a78bfa').attr('stroke-width', 2);
        tooltip.style('opacity', 1)
          .html(`<strong class="text-devpulse-glow">${d.count} commits</strong> on ${d.date}`);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).attr('stroke', 'none');
        tooltip.style('opacity', 0);
      });

    // 7. DRAW LEGEND
    // Position legend in the bottom right corner
    const legendGroup = svg.append('g')
      .attr('transform', `translate(${width - margin.right - 140}, ${height - margin.bottom + 20})`);
      
    legendGroup.append('text')
      .attr('x', -30)
      .attr('y', 10)
      .text('Less')
      .attr('font-size', '10px')
      .attr('fill', '#64748b');

    // Draw 5 sample blocks representing intensity
    const legendData = [0, 1, 2, 3, 4];
    legendGroup.selectAll('.legend-cell')
      .data(legendData)
      .join('rect')
      .attr('x', (d, i) => i * (cellSize + cellGap))
      .attr('y', 0)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 2)
      .attr('fill', d => d === 0 ? '#1e293b' : colorScale(d * (maxCount / 4)));

    legendGroup.append('text')
      .attr('x', 5 * (cellSize + cellGap) + 5)
      .attr('y', 10)
      .text('More')
      .attr('font-size', '10px')
      .attr('fill', '#64748b');

    return () => tooltip.remove();
  }, [commits]);

  // --- RADIAL CHART EFFECT (Clock Face) ---
  useEffect(() => {
    const container = d3.select(radialChartRef.current);
    container.selectAll('*').remove();

    // 1. DATA PREPARATION: Simulate hourly commit data (0 to 23 hours)
    // We mock typical developer hours: quiet at night, peaks around 10am and 3pm.
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      let count = Math.floor(Math.random() * 5); 
      if (i >= 9 && i <= 17) count += Math.floor(Math.random() * 20) + 10; 
      if (i === 10 || i === 15) count += 15; 
      return { hour: i, count };
    });

    // 2. SVG SETUP
    const width = 400;
    const height = 400;
    const innerRadius = 40; // The empty hole in the middle
    const outerRadius = Math.min(width, height) / 2 - 40; // Max radius for bars

    const svg = container
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .style('background-color', '#0f172a')
      .append('g')
      // CRITICAL: Radial charts must have their origin (0,0) in the CENTER!
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // 3. SCALES
    // X Scale maps 24 hours to a full 360-degree circle (2 * Math.PI in radians)
    const x = d3.scaleLinear()
      .domain([0, 24])
      .range([0, 2 * Math.PI]);

    // Y Scale maps the commit count to the physical radius (distance from center)
    const y = d3.scaleLinear()
      .domain([0, d3.max(hourlyData, d => d.count)])
      .range([innerRadius, outerRadius]);

    const colorScale = d3.scaleSequential(d3.interpolatePurples)
      .domain([0, d3.max(hourlyData, d => d.count)]);

    // 4. DRAW THE CIRCULAR BARS
    // D3 has an arc generator specifically for drawing wedge shapes!
    const arcGenerator = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(d => y(d.count))
      .startAngle(d => x(d.hour))
      .endAngle(d => x(d.hour + 1))
      .padAngle(0.05) // Small 5% gap between wedges
      .padRadius(innerRadius);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute bg-slate-800 text-slate-200 p-2 rounded shadow-lg border border-slate-700 text-sm pointer-events-none opacity-0 z-50 transition-opacity');

    // Bind data and draw paths
    svg.selectAll('path')
      .data(hourlyData)
      .join('path')
      .attr('fill', d => colorScale(d.count))
      .attr('d', arcGenerator) // Pass our arc generator logic directly to the path 'd' attribute!
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).attr('fill', '#a78bfa'); // Highlight wedge
        
        // Format 24h to 12h for humans
        const ampm = d.hour >= 12 ? 'PM' : 'AM';
        const displayHour = d.hour % 12 || 12;
        
        tooltip.style('opacity', 1)
          .html(`<strong class="text-devpulse-glow">${d.count} commits</strong><br/>around ${displayHour} ${ampm}`);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', (event.pageX + 15) + 'px').style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', (event, d) => {
        d3.select(event.currentTarget).attr('fill', colorScale(d.count)); // Reset color
        tooltip.style('opacity', 0);
      });

    // 5. DRAW CLOCK LABELS
    const labels = [
      { h: 0, text: '12 AM' },
      { h: 6, text: '6 AM' },
      { h: 12, text: '12 PM' },
      { h: 18, text: '6 PM' }
    ];

    svg.selectAll('.clock-label')
      .data(labels)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('transform', d => {
        // Find the angle of the hour, shift by 90deg because D3 arcs start at 12 o'clock
        const angle = x(d.h + 0.5) - Math.PI / 2; 
        const r = outerRadius + 20; // Push text slightly past the longest bar
        return `translate(${Math.cos(angle) * r},${Math.sin(angle) * r})`;
      })
      .text(d => d.text)
      .attr('font-size', '12px')
      .attr('fill', '#64748b')
      .attr('font-weight', 'bold');

    return () => tooltip.remove();
  }, []);

  return (
    <div className="w-full flex flex-col gap-10 pb-10">
      {/* Bar Chart Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-200">Weekly Commit Pulse</h2>
        <div 
          ref={barChartRef} 
          className="w-full shadow-lg rounded-xl overflow-hidden border border-slate-700" 
        />
      </div>

      {/* Heatmap Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-slate-200">52-Week Contribution Grid</h2>
        <div 
          ref={heatmapRef} 
          className="w-full shadow-lg rounded-xl overflow-hidden border border-slate-700" 
        />
      </div>

      {/* Radial Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-200">Activity by Hour</h2>
          <div 
            ref={radialChartRef} 
            className="w-full shadow-lg rounded-xl overflow-hidden border border-slate-700 bg-[#0f172a] flex items-center justify-center" 
          />
        </div>
        
        {/* Placeholder for future expansion */}
        <div className="flex flex-col gap-4">
           <h2 className="text-xl font-bold text-slate-200">Top Languages</h2>
           <div className="w-full h-full shadow-lg rounded-xl overflow-hidden border border-slate-700 bg-[#0f172a] flex items-center justify-center text-slate-500 min-h-[300px]">
             Pie chart coming in the next step!
           </div>
        </div>
      </div>

    </div>
  );
};

export default PulseView;
