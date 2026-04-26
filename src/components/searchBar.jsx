import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [username, setUsername] = useState(''); // Default to empty

  const handleSearch = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    if (onSearch) {
      onSearch(username.trim());
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full mt-4">
      <input 
        type="text" 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter GitHub Username..."
        className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 px-4 py-2 rounded-lg focus:outline-none focus:border-devpulse-glow transition-colors"
      />
      <button 
        type="submit"
        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold transition-transform hover:scale-105 active:scale-95"
      >
        Search 🚀
      </button>
    </form>
  );
}
