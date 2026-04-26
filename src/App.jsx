import React, { useState, useEffect } from 'react';
import SearchBar from './components/searchBar.jsx';
import { mockProfile, mockRepos, mockCommits, mockCollaborators } from './data/mockData.js';
import GalaxyCanvas from './components/GalaxyCanvas.jsx';
import PulseView from './components/PulseView.jsx';
import CollabsView from './components/CollabsView.jsx';
import { fetchProfile, fetchRepos, fetchCommits, fetchCollaborators, fetchHourlyActivity } from './services/githubService.js';

function App() {
  // We use state to track which tab is currently selected
  const [activeTab, setActiveTab] = useState('galaxy');

  // Data State starts as null!
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState(null);
  const [commits, setCommits] = useState(null);
  const [collaborators, setCollaborators] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // The master fetch function triggered by the SearchBar
  const handleSearch = async (username) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch Profile, Repos, Commits, and Events in parallel
      const [newProfile, newRepos, newCommits, newHourly] = await Promise.all([
        fetchProfile(username),
        fetchRepos(username),
        fetchCommits(username),
        fetchHourlyActivity(username)
      ]);
      
      // 2. Fetch Collaborators (This depends on the repos we just fetched!)
      const newCollabs = await fetchCollaborators(username, newRepos);

      // 3. Update React State!
      setProfile(newProfile);
      setRepos(newRepos);
      setCommits(newCommits);
      setCollaborators(newCollabs);
      setHourlyData(newHourly);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch user data. Check the username or your GitHub Token.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to render the correct component based on activeTab state
  const renderContent = () => {
    switch (activeTab) {
      case 'galaxy': return <GalaxyCanvas profile={profile} repos={repos} />;
      case 'pulse': return <PulseView commits={commits} repos={repos} hourlyData={hourlyData} />;
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
          {/* Profile Card */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700">
             <SearchBar onSearch={handleSearch} />
             
             {profile ? (
               <>
                 <div className="mt-8 flex items-center gap-4">
                   <img 
                     src={profile.avatar_url} 
                     alt="Profile" 
                     className="w-16 h-16 rounded-full border-2 border-devpulse-purple"
                   />
                   <div>
                     <h2 className="text-xl font-bold text-white">{profile.name || profile.login}</h2>
                     <p className="text-devpulse-purple">@{profile.login}</p>
                   </div>
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
                     <span className="text-2xl font-black text-slate-300">
                       {commits ? commits.reduce((sum, d) => sum + d.count, 0) : 0}
                     </span>
                     <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 text-center flex flex-col">
                       Total Commits
                       <span className="text-[10px] normal-case opacity-75">(Last 365 Days)</span>
                     </span>
                   </div>
                   <div className="bg-[#0f172a] p-4 rounded-lg border border-slate-700 flex flex-col items-center transform transition hover:-translate-y-1 hover:shadow-lg hover:border-slate-500">
                     <span className="text-2xl font-black text-slate-300">{collaborators?.nodes?.length || 0}</span>
                     <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 text-center">Connections</span>
                   </div>
                   
                   {/* Wide Card for Active Days */}
                   <div className="col-span-2 bg-[#0f172a] p-4 rounded-lg border border-slate-700 flex flex-col items-center transform transition hover:-translate-y-1 hover:shadow-lg hover:border-slate-500">
                     <span className="text-2xl font-black text-emerald-400">
                       {commits ? commits.filter(d => d.count > 0).length : 0}
                     </span>
                     <span className="text-xs text-slate-400 uppercase tracking-wider mt-1 text-center">Active Days (Last 365 Days)</span>
                   </div>
                 </div>
               </>
             ) : (
               <div className="mt-8 text-center text-slate-400 py-10 border-t border-slate-800">
                 <div className="text-4xl mb-4 opacity-50">🚀</div>
                 <p className="text-sm">Enter a GitHub username above to load their DevPulse.</p>
               </div>
             )}
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