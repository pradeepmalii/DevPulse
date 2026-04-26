import React, { useState, useEffect } from 'react';
import SearchBar from './components/searchBar.jsx';
import { mockProfile, mockRepos, mockCommits, mockCollaborators } from './data/mockData.js';
import GalaxyCanvas from './components/GalaxyCanvas.jsx';
import PulseView from './components/PulseView.jsx';
import CollabsView from './components/CollabsView.jsx';
import { fetchProfile, fetchRepos, fetchCommits, fetchCollaborators } from './services/githubService.js';

function App() {
  // We use state to track which tab is currently selected
  const [activeTab, setActiveTab] = useState('galaxy');

  // Core Data State (Initialized with our mock data so the app isn't blank on load!)
  const [profile, setProfile] = useState(mockProfile);
  const [repos, setRepos] = useState(mockRepos);
  const [commits, setCommits] = useState(mockCommits);
  const [collaborators, setCollaborators] = useState(mockCollaborators);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // The master fetch function triggered by the SearchBar
  const handleSearch = async (username) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Profile & Repos in parallel (since they don't depend on each other)
      const [newProfile, newRepos, newCommits] = await Promise.all([
        fetchProfile(username),
        fetchRepos(username),
        fetchCommits(username)
      ]);
      
      // 2. Fetch Collaborators (This depends on the repos we just fetched!)
      const newCollabs = await fetchCollaborators(username, newRepos);

      // 3. Update React State!
      setProfile(newProfile);
      setRepos(newRepos);
      setCommits(newCommits);
      setCollaborators(newCollabs);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch user data. Check the username or your GitHub Token.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to render the correct component based on activeTab state
  const renderContent = () => {
    // If we are loading new data, show a massive spinner!
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-devpulse-glow gap-4">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-devpulse-glow rounded-full animate-spin"></div>
          <p className="font-bold text-xl animate-pulse">Initializing Hyperdrive...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'galaxy': return <GalaxyCanvas profile={profile} repos={repos} />;
      case 'pulse': return <PulseView commits={commits} repos={repos} />;
      case 'collabs': return <CollabsView collabs={collaborators} />;
      default: return <GalaxyCanvas profile={profile} repos={repos} />;
    }
  };

  return (
    <div className="min-h-screen bg-devpulse-dark text-slate-200 font-sans">
      
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 bg-devpulse-card px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-devpulse-glow to-blue-400 bg-clip-text text-transparent">
          DevPulse
        </h1>
        <div className="text-sm font-medium text-slate-400">GitHub Visualizer</div>
      </nav>

      {/* Main Layout Grid */}
      <main className="max-w-7xl mx-auto p-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          
          {/* Left Sidebar: Search & Stats */}
          <div className="bg-devpulse-card p-6 rounded-xl border border-slate-800 shadow-xl flex flex-col gap-6 col-span-1">
             <h2 className="text-xl text-slate-200 font-bold w-full text-left">Search Profile</h2>
             <SearchBar onSearch={handleSearch} />
             
             {error && (
               <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg text-sm font-medium">
                 ⚠️ {error}
               </div>
             )}
             
             {/* Profile Summary Card */}
             <div className="flex flex-col gap-4 mt-2">
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden border-2 border-devpulse-glow shrink-0">
                   {profile.avatar_url ? (
                     <img src={profile.avatar_url} alt="Profile Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                       {profile.login ? profile.login.charAt(0).toUpperCase() : '?'}
                     </div>
                   )}
                 </div>
                 <div className="flex flex-col overflow-hidden">
                   <h3 className="text-lg font-bold text-slate-200 truncate">{profile.name || profile.login}</h3>
                   <a href={`https://github.com/${profile.login}`} target="_blank" rel="noreferrer" className="text-sm text-devpulse-purple hover:text-devpulse-glow transition-colors truncate">
                     @{profile.login}
                   </a>
                 </div>
               </div>
               
               {profile.bio && (
                 <p className="text-sm text-slate-400 italic">"{profile.bio}"</p>
               )}
             </div>

             {/* Stat Grid */}
             <div className="grid grid-cols-2 gap-4 mt-2 border-t border-slate-800 pt-6">
               <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-700 flex flex-col items-center transform transition hover:-translate-y-1 hover:shadow-lg hover:border-slate-500">
                 <span className="text-2xl font-black text-devpulse-glow">{profile.public_repos || 0}</span>
                 <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 text-center">Repositories</span>
               </div>
               <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-700 flex flex-col items-center transform transition hover:-translate-y-1 hover:shadow-lg hover:border-slate-500">
                 <span className="text-2xl font-black text-devpulse-purple">{profile.followers || 0}</span>
                 <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 text-center">Followers</span>
               </div>
               <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-700 flex flex-col items-center transform transition hover:-translate-y-1 hover:shadow-lg hover:border-slate-500">
                 <span className="text-2xl font-black text-slate-300">{commits?.length || 0}</span>
                 <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 text-center">Days Active</span>
               </div>
               <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-700 flex flex-col items-center transform transition hover:-translate-y-1 hover:shadow-lg hover:border-slate-500">
                 <span className="text-2xl font-black text-slate-300">{collaborators?.nodes?.length || 0}</span>
                 <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 text-center">Connections</span>
               </div>
             </div>
          </div>

          {/* Right Area: Tab Navigation & Main Content */}
          <div className="bg-devpulse-card rounded-xl border border-slate-800 shadow-xl col-span-1 md:col-span-2 flex flex-col overflow-hidden">
            
            {/* The Tab Buttons */}
            <div className="flex border-b border-slate-800">
              <button 
                onClick={() => setActiveTab('galaxy')} 
                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'galaxy' ? 'border-b-2 border-devpulse-glow text-devpulse-glow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                Galaxy
              </button>
              <button 
                onClick={() => setActiveTab('pulse')} 
                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'pulse' ? 'border-b-2 border-devpulse-purple text-devpulse-purple' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                Pulse
              </button>
              <button 
                onClick={() => setActiveTab('collabs')} 
                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'collabs' ? 'border-b-2 border-slate-300 text-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
              >
                Collabs
              </button>
            </div>

            {/* The dynamically rendered View */}
            <div className="flex-grow p-6 bg-[#0f172a]/50 overflow-y-auto">
              {renderContent()}
            </div>

          </div>

        </div>
      </main>

    </div>
  )
}

export default App;