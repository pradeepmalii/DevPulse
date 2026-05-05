import React, { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        setLeaders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) return <div className="text-white text-center py-10">Loading Leaderboard...</div>;
  if (error) return <div className="text-red-400 text-center py-10">Make sure your backend is running! Error: {error}</div>;

  return (
    <div className="flex flex-col h-full text-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-yellow-400">🏆 DevPulse Global Leaderboard 🏆</h2>
      
      <div className="bg-[#000000] border border-[#222222] rounded-lg overflow-hidden flex-grow">
        <div className="grid grid-cols-12 bg-[#111111] p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#222222]">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-5">Developer</div>
          <div className="col-span-3 text-right">Total Commits</div>
          <div className="col-span-3 text-right">Active Days</div>
        </div>
        
        <div className="overflow-y-auto h-full pb-10">
          {leaders.map((dev, index) => (
            <div 
              key={dev.username} 
              className={`grid grid-cols-12 items-center p-4 border-b border-[#222222] transition hover:bg-[#1a1a1a] ${index === 0 ? 'bg-yellow-900/20' : ''} ${index === 1 ? 'bg-gray-400/10' : ''} ${index === 2 ? 'bg-orange-900/20' : ''}`}
            >
              <div className="col-span-1 text-center font-bold text-xl">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              
              <div className="col-span-5 flex items-center gap-3">
                <img src={dev.avatarUrl} alt={dev.username} className="w-10 h-10 rounded-full border border-[#333333]" />
                <div>
                  <div className="font-bold text-md">{dev.name || dev.username}</div>
                  <a 
                    href={`https://github.com/${dev.username}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-devpulse-primary hover:underline cursor-pointer"
                  >
                    @{dev.username}
                  </a>
                </div>
              </div>
              
              <div className="col-span-3 text-right font-black text-devpulse-accent text-lg">
                {dev.totalCommits.toLocaleString()}
              </div>
              
              <div className="col-span-3 text-right text-gray-300 font-medium">
                {dev.activeDays} days
              </div>
            </div>
          ))}
          
          {leaders.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No developers on the leaderboard yet. Search for someone to add them!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
