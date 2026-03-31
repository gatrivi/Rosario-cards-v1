import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RosaryCanvas } from './components/RosaryCanvas';
import { BeadData } from './data/rosaryData';

export default function App() {
  const [selectedBead, setSelectedBead] = useState<BeadData | null>(null);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());
  const [showIds, setShowIds] = useState(false);

  const handleSelectBead = (bead: BeadData | null) => {
    setSelectedBead(bead);
    if (bead && bead.prayer && bead.prayer.trim() !== '') {
      setPrayedIds(prev => new Set(prev).add(bead.id));
    }
  };

  const handleResetProgress = () => {
    setPrayedIds(new Set());
    setSelectedBead(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#fdfbf7] font-sans">
      {/* Prayer Panel (Behind Rosary) */}
      <AnimatePresence>
        {selectedBead && selectedBead.prayer && selectedBead.prayer.trim() !== '' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none select-none"
          >
            <div className="max-w-2xl text-center">
              <h2 className="text-xl font-serif text-stone-400/30 mb-4 uppercase tracking-widest">
                {selectedBead.label}
              </h2>
              <p className="text-4xl md:text-5xl font-serif text-stone-400/40 leading-relaxed italic">
                {selectedBead.prayer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Rosary Layer */}
      <RosaryCanvas
        showIds={showIds}
        selectedBeadId={selectedBead?.id}
        prayedIds={prayedIds}
        onSelectBead={handleSelectBead}
      />

      {/* Header Controls */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 shadow-sm">
          <h1 className="text-2xl font-serif text-stone-800">Virtual Rosary</h1>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-stone-200">
          <button
            onClick={handleResetProgress}
            className="text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors px-2 py-1 rounded-md hover:bg-stone-100"
          >
            Reset
          </button>
          <div className="w-px h-4 bg-stone-200" />
          <label htmlFor="show-ids" className="text-sm font-medium text-stone-600 cursor-pointer select-none">
            Show IDs
          </label>
          <button
            id="show-ids"
            role="switch"
            aria-checked={showIds}
            onClick={() => setShowIds(!showIds)}
            className={`w-10 h-6 rounded-full transition-colors relative ${showIds ? 'bg-stone-800' : 'bg-stone-300'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${showIds ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
      </header>
    </div>
  );
}
