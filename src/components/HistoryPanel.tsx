import React, { useState } from 'react';
import { 
  Trash2, Trash, Clipboard, Calendar, Clock, ArrowRight, 
  MapPin, Sparkles, Search, SlidersHorizontal, BookOpen, AlertCircle
} from 'lucide-react';
import { ScanResult, ItemCategory } from '../types';

interface HistoryPanelProps {
  scans: ScanResult[];
  onDeleteScan: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryPanel({ scans, onDeleteScan, onClearAll }: HistoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('all');
  const [selectedReviewItem, setSelectedReviewItem] = useState<ScanResult | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Filter scans
  const filteredScans = scans.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.scientificName && item.scientificName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelectReviewItem = (item: ScanResult) => {
    setSelectedReviewItem(item);
  };

  const handleBackToHistoryList = () => {
    setSelectedReviewItem(null);
  };

  return (
    <div id="history-panel-root" className="max-w-5xl mx-auto space-y-6 animate-fade-in text-left">
      
      {!selectedReviewItem ? (
        <div className="space-y-6">
          
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Your Scanning Library</h2>
              <p className="text-xs text-stone-500 mt-0.5">Explore files of previously identified flora, creatures, and materials</p>
            </div>
            {scans.length > 0 && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {showConfirmClear ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1.5 rounded-xl">
                    <span className="text-[10px] font-bold text-rose-800 px-1">Are you sure?</span>
                    <button
                      id="confirm-clear-yes"
                      onClick={() => {
                        onClearAll();
                        setShowConfirmClear(false);
                      }}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold hover:bg-rose-700 cursor-pointer transition-colors"
                    >
                      Yes, Clear
                    </button>
                    <button
                      id="confirm-clear-no"
                      onClick={() => setShowConfirmClear(false)}
                      className="px-2.5 py-1 bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold hover:bg-stone-300 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    id="clear-all-history"
                    onClick={() => setShowConfirmClear(true)}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 font-semibold text-xs transition-colors hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Database Log
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filtering and search rows */}
          {scans.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4">
              
              {/* Search bar input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="history-search"
                  type="text"
                  placeholder="Search scans by botanical or common name..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-200 text-stone-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Tag filters */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {(['all', 'plant', 'animal', 'thing'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                        : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {cat === 'all' && 'All'}
                    {cat === 'plant' && 'Plants 🌿'}
                    {cat === 'animal' && 'Animals 🐾'}
                    {cat === 'thing' && 'Objects 🛠️'}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* Scanning rows layout */}
          {filteredScans.length > 0 ? (
            <div id="history-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredScans.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail representation */}
                    <div className="relative h-44 w-full bg-stone-100">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                      />
                      <span className="absolute bottom-3 right-3 text-[10px] font-bold uppercase uppercase tracking-wider text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white font-semibold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        {item.confidence}%
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-stone-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        {item.scientificName && item.scientificName !== 'N/A' && (
                          <p className="text-[10px] font-semibold text-stone-400 italic font-mono line-clamp-1">
                            {item.scientificName}
                          </p>
                        )}
                      </div>

                      <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-stone-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-stone-50 mt-2 flex items-center justify-between">
                    <button
                      onClick={() => handleSelectReviewItem(item)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      Browse Dossier
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteScan(item.id)}
                      className="p-1.5 rounded-lg border border-transparent hover:border-stone-200 text-stone-400 hover:text-rose-500 transition-all cursor-pointer"
                      title="Delete this record"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200/50 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-stone-100 flex items-center justify-center text-stone-400 mx-auto shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-700 text-sm">Library is Empty</h4>
                <p className="text-xs text-stone-400">
                  {scans.length > 0 
                    ? "Adjust search keywords or category filters." 
                    : "No photographs have been scanned yet. Go to the Identify tab to take your first snap!"
                  }
                </p>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Expanded full view for history detail */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <button
              onClick={handleBackToHistoryList}
              className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              ← Back to Library list
            </button>
            <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Scanned on: {new Date(selectedReviewItem.timestamp).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
            {/* Expanded image column */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <img src={selectedReviewItem.imageUrl} alt={selectedReviewItem.name} className="w-full h-64 object-cover" />
                <div className="p-5 space-y-3">
                  <div>
                    <h2 className="text-2xl font-extrabold text-stone-900 leading-tight">{selectedReviewItem.name}</h2>
                    {selectedReviewItem.scientificName && selectedReviewItem.scientificName !== 'N/A' && (
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest italic font-mono pt-0.5">{selectedReviewItem.scientificName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Origin: <b>{selectedReviewItem.origin}</b></span>
                  </div>
                  {selectedReviewItem.dangerWarning && selectedReviewItem.dangerWarning !== "None" && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-2.5 text-xs text-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h6 className="font-bold text-amber-900">Safety Tip</h6>
                        <p className="mt-0.5 leading-relaxed">{selectedReviewItem.dangerWarning}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dossier Tabs/Bentos Expanded */}
            <div className="md:col-span-7 space-y-5">
              
              {/* Features and Description */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-stone-400 uppercase tracking-widest">Naturalist's Log</h4>
                  <p className="text-sm text-stone-600 leading-relaxed">{selectedReviewItem.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-stone-400 uppercase tracking-widest">Identified Characteristics</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedReviewItem.keyFeatures.map((trait, i) => (
                      <li key={i} className="text-xs text-stone-700 bg-stone-50 border border-stone-100 p-3 rounded-xl flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        {trait}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Care Tips */}
              <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">Professional Care Guidelines</h4>
                  <h3 className="text-md font-bold text-stone-800">Preservation & Upkeep Summary</h3>
                </div>

                <div className="space-y-3.5">
                  {selectedReviewItem.careTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trivia / Fun facts */}
              {selectedReviewItem.facts && selectedReviewItem.facts.length > 0 && (
                <div className="bg-amber-50/20 border border-amber-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-3.5">
                  <h4 className="text-xs font-extrabold text-amber-600 uppercase tracking-widest">Surprising Trivia</h4>
                  <div className="space-y-3">
                    {selectedReviewItem.facts.map((fact, idx) => (
                      <p key={idx} className="text-xs text-stone-700 leading-relaxed font-sans">
                        💡 {fact}
                      </p>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
