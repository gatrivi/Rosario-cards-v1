import React, { useState } from 'react';
import MatterScene from './components/MatterScene';
import ColorPicker from './components/ColorPicker';

const App: React.FC = () => {
  // State for bead colors
  const [mainLoopStartColor, setMainLoopStartColor] = useState('#a855f7'); // Purple
  const [mainLoopEndColor, setMainLoopEndColor] = useState('#14b8a6'); // Teal
  const [tailColor, setTailColor] = useState('#64748b'); // Slate
  const [crossColor, setCrossColor] = useState('#a855f7'); // Purple

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-200">
      <header className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">
            Interactive Bead Chain
          </span>
        </h1>
        <p className="text-slate-400 text-lg">A physics-based chain simulation with React & Matter.js</p>
      </header>
      
      <div className="w-full max-w-4xl mb-4 p-4 bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 flex flex-wrap justify-center items-center gap-4 md:gap-8">
        <ColorPicker label="Chain Start" color={mainLoopStartColor} onChange={setMainLoopStartColor} />
        <ColorPicker label="Chain End" color={mainLoopEndColor} onChange={setMainLoopEndColor} />
        <ColorPicker label="Tail" color={tailColor} onChange={setTailColor} />
        <ColorPicker label="Cross" color={crossColor} onChange={setCrossColor} />
      </div>

      <main className="w-full max-w-4xl aspect-[4/3] bg-slate-800/50 rounded-xl shadow-2xl shadow-purple-500/10 border border-slate-700 overflow-hidden">
        <MatterScene 
          mainLoopStartColor={mainLoopStartColor}
          mainLoopEndColor={mainLoopEndColor}
          tailColor={tailColor}
          crossColor={crossColor}
        />
      </main>
      <footer className="mt-8 text-center text-slate-500">
        <p>Click and drag any bead to see the entire chain react.</p>
      </footer>
    </div>
  );
};

export default App;