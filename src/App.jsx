import SearchBar from './components/searchBar.jsx';

import React from 'react'

function App(){
  return (
    <div className="min-h-screen bg-devpulse-dark text-slate-200 font-sans">

      <nav className='border-b border-slate-800 bg-devpulse-card px-6 py-4 flex justify-between items-center shadow-Lg'>
        <h1 className='text-2xl font-bold bg-gradient-to-r from-devpulse-glow to-blue-400 bg-clip-text text-transparent'>DevPulse</h1>
        <div className='text-sm font-medium text-slate-400'>Github Visualizer</div>
      </nav>

      <main className='max-w-7xl mx-auto p-6 mt-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>

          <div className='bg-devpulse-card p-6 rounded-xl border border-slate-800 shadow-xl h-64 flex items-center justify-center'>
             <h2 className="text-xl text-slate-200 font-bold mb-2 w-full text-left">Search Profile</h2>
            <SearchBar />
          </div>

          <div className='bg-devpulse-card p-6 rounded-xl border border-slate-800 shadow-xl h-64 flex items-center justify-center col-span-1 md:col-span-2'>
            <span className='text-slate-500 font-medium'>Galaxy Canvas</span>
          </div>

        </div>
      </main>
    </div>
  )
}

export default App  