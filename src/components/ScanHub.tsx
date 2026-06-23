import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Sparkles, AlertCircle, Info, HelpCircle, 
  MapPin, Check, Send, RotateCw, RefreshCw, Leaf, ShieldAlert
} from 'lucide-react';
import { ItemCategory, ScanResult, ChatMessage } from '../types';

interface ScanHubProps {
  onAddScan: (result: ScanResult) => void;
}

// Preset demo images so users can test immediately
const DEMO_ITEMS = [
  {
    name: 'Monstera Deliciosa',
    category: 'plant' as const,
    label: '🌿 Monstera Plant',
    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&auto=format&fit=crop&q=60'
  },
  {
    name: 'Red Cardinal Bird',
    category: 'animal' as const,
    label: '🐦 Red Cardinal',
    url: 'https://images.unsplash.com/photo-1552728089-57bdde30ebd3?w=400&auto=format&fit=crop&q=60'
  },
  {
    name: 'Vintage Watch Mechanism',
    category: 'thing' as const,
    label: '⚙️ Antique Watch',
    url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&auto=format&fit=crop&q=60'
  }
];

const LOADING_STEPS = [
  "Analyzing image colors and textures...",
  "Running taxonomical categorization...",
  "Evaluating visual characteristics...",
  "Searching Vaidik intelligence libraries...",
  "Generating care guides and fun trivia..."
];

export default function ScanHub({ onAddScan }: ScanHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('all');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analyzedResult, setAnalyzedResult] = useState<ScanResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'overview' | 'care' | 'facts' | 'chat'>('overview');
  
  // Follow up chat states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("Please select a photograph smaller than 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        setErrorMsg(null);
        setAnalyzedResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Convert a public Unsplash URL into base64 via temporary canvas to bypass CORS or trigger direct analysis
  const selectDemo = async (demo: typeof DEMO_ITEMS[0]) => {
    setErrorMsg(null);
    setAnalyzedResult(null);
    setIsAnalyzing(true);
    setLoadingStep(0);
    
    // Cycle loading prompts
    let step = 0;
    loadingIntervalRef.current = setInterval(() => {
      step = (step + 1) % LOADING_STEPS.length;
      setLoadingStep(step);
    }, 2500);

    try {
      // In order to send the image to Gemini, we can download it on behalf of the user or base64 encode it.
      // Since fetching client-side can trigger CORS, we can get standard base64 or pass the URL to server.
      // But wait! Let's download clean base64 via fetch with crossorigin or fallback to a hardcoded high quality replica if it fails,
      // or simply use Unsplash images where cors is supported.
      const response = await fetch(demo.url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImage(base64);
        // Trigger identification
        await runAnalysis(base64, demo.category);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("CORS limit hit during demo download. Please upload any photo of your own choosing!");
      setIsAnalyzing(false);
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setLoadingStep(0);
    setErrorMsg(null);

    let step = 0;
    loadingIntervalRef.current = setInterval(() => {
      step = (step + 1) % LOADING_STEPS.length;
      setLoadingStep(step);
    }, 2500);

    await runAnalysis(image, selectedCategory);
  };

  const runAnalysis = async (imgBase64: string, categoryPreference: string) => {
    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imgBase64, category: categoryPreference })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Server failed to process analysis request.");
      }

      const formattedResult: ScanResult = {
        ...data,
        id: 'scan-' + Math.random().toString(36).substr(2, 9),
        imageUrl: imgBase64,
        timestamp: new Date().toISOString()
      };

      setAnalyzedResult(formattedResult);
      onAddScan(formattedResult);

      // Initialize the care-chat with welcome message
      setChatMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hi there! I detected a **${formattedResult.name}** classified as a **${formattedResult.category}**. Ask me any care tips, origin history, or safety precautions!`,
          timestamp: new Date().toISOString()
        }
      ]);
      setActiveResultTab('overview');

    } catch (err: any) {
      console.error("Analysis failed:", err);
      setErrorMsg(err.message || "Failed to communicate with the Vaidik AI Server.");
    } finally {
      setIsAnalyzing(false);
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !analyzedResult || isSendingChat) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Math.random().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: analyzedResult,
          messages: [...chatMessages, userMessage]
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Could not generate assistance reply.");
      }

      setChatMessages(prev => [...prev, {
        id: 'msg-' + Math.random().toString(),
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toISOString()
      }]);

    } catch (err: any) {
      console.error("Followup fail:", err);
      setChatMessages(prev => [...prev, {
        id: 'msg-err-' + Math.random().toString(),
        sender: 'ai',
        text: `⚠️ **System Assistant Error:** ${err.message || 'Connecting server failed. Please try again later.'}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsSendingChat(false);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    }
  };

  const resetAll = () => {
    setImage(null);
    setAnalyzedResult(null);
    setErrorMsg(null);
    setChatMessages([]);
  };

  return (
    <div id="scanhub-root" className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {!analyzedResult && !isAnalyzing && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight leading-none">
              Explore the World Around You
            </h1>
            <p className="text-stone-500 font-medium text-sm max-w-xl mx-auto">
              Identify flowers, house plants, strange animals, wildlife, tools, and antiques. Just snap a photograph and receive detailed classification and care advice.
            </p>
          </div>

          {/* Classification Preference Selection */}
          <div className="flex flex-wrap justify-center gap-2">
            {(['all', 'plant', 'animal', 'thing'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat === 'all' && '🔍 Auto-Identify Anything'}
                {cat === 'plant' && '🌿 Plants & Flora'}
                {cat === 'animal' && '🦄 Animals & Wildlife'}
                {cat === 'thing' && '🛠️ Objects & Apparels'}
              </button>
            ))}
          </div>

          {/* Interactive Drag Drop File Upload Area */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-stone-300 hover:border-emerald-500 bg-white rounded-2xl p-8 text-center transition-all cursor-pointer group shadow-xs hover:bg-emerald-50/10"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
            
            {image ? (
              <div className="space-y-4 max-w-sm mx-auto">
                <img src={image} alt="Selected photograph" className="w-full h-48 object-cover rounded-xl shadow-md border border-stone-200" />
                <div className="flex items-center justify-center gap-2 justify-items-center">
                  <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Photo Loaded!</p>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); resetAll(); }}
                    className="text-xs font-semibold text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-6">
                <div className="w-16 h-16 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform text-stone-400 group-hover:text-emerald-600 shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-stone-700">Click to upload, or drag and drop photo here</p>
                  <p className="text-xs text-stone-400">Supports JPEG, PNG, WEBP, and HEIC up to 8MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Large Action Scan Button */}
          {image && (
            <div className="flex justify-center">
              <button
                id="sh-scan-action"
                onClick={startAnalysis}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm tracking-wide shadow-md hover:shadow-emerald-200 flex items-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                Run AI Vision Identification
              </button>
            </div>
          )}

          {/* Quick Demo Option for Users without files */}
          <div className="text-center space-y-3 pt-4">
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-10 bg-stone-200"></div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Or Click a Demo to Test Instantly</p>
              <div className="h-px w-10 bg-stone-200"></div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {DEMO_ITEMS.map((demo, idx) => (
                <button
                  key={idx}
                  onClick={() => selectDemo(demo)}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-200/80 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-semibold shadow-xs flex items-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <img src={demo.url} className="w-5 h-5 rounded-md object-cover border border-stone-200" alt="demo thumb" />
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading analysis state with steps */}
      {isAnalyzing && (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 md:p-12 text-center space-y-6 shadow-sm animate-pulse max-w-lg mx-auto">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-stone-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-stone-800">Vaidik AI Vision at Work</h3>
            <p className="text-xs font-bold text-emerald-600 min-h-[1.5rem] tracking-tight transition-all duration-300">
              {LOADING_STEPS[loadingStep]}
            </p>
          </div>

          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-1000"
              style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-stone-400">Usually completes within 3-6 seconds. Hold on tightly!</p>
        </div>
      )}

      {/* Error alerts */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 max-w-xl mx-auto">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-900 text-xs text-left">Scan Unsuccessful</h4>
            <p className="text-xs text-rose-700 text-left leading-relaxed">{errorMsg}</p>
            <div className="pt-2 text-left">
              <button 
                onClick={resetAll}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[10px] uppercase tracking-wider"
              >
                Reset and Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Identified Response Dashboard */}
      {analyzedResult && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in text-left">
          
          {/* Left Column: Image Card and quick metadata */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="relative h-64 md:h-80 w-full bg-stone-100">
                <img 
                  id="result-image"
                  src={analyzedResult.imageUrl} 
                  alt={analyzedResult.name} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Confidence Badge overlay */}
                <span id="result-confidence-overlay" className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-black/70 backdrop-blur-xs text-white rounded-full text-[11px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {analyzedResult.confidence}% confidence
                </span>

                {/* Category label */}
                <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 px-3 py-1 bg-emerald-600/90 text-white rounded-lg text-[10px] uppercase font-bold tracking-wider shadow-sm">
                  {analyzedResult.category}
                </span>
              </div>

              {/* Title summary */}
              <div className="p-5 space-y-1 border-b border-stone-100">
                <h2 id="result-name" className="text-2xl font-extrabold text-stone-900 leading-tight">
                  {analyzedResult.name}
                </h2>
                {analyzedResult.scientificName && analyzedResult.scientificName !== 'N/A' && (
                  <p id="result-scientific" className="text-xs font-medium text-emerald-600 uppercase tracking-widest italic font-mono">
                    {analyzedResult.scientificName}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-stone-400 text-xs pt-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Origin: <b>{analyzedResult.origin}</b></span>
                </div>
              </div>

              {/* Warnings details inside */}
              {analyzedResult.dangerWarning && analyzedResult.dangerWarning !== 'None' && (
                <div id="result-danger-banner" className="p-4 bg-amber-50/60 border-t border-amber-100 flex items-start gap-2.5 text-xs text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-amber-900">Safety Advisory</h5>
                    <p className="text-left leading-relaxed mt-0.5">{analyzedResult.dangerWarning}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Back button */}
            <button 
              id="result-reset-btn"
              onClick={resetAll}
              className="w-full py-2.5 rounded-xl border border-stone-200/80 hover:bg-stone-50 font-bold text-xs text-stone-500 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer bg-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Scan Another Photo
            </button>
          </div>

          {/* Right Column: Tabbed scientific insights bento */}
          <div className="md:col-span-7 bg-white rounded-2xl border border-stone-200 flex flex-col overflow-hidden shadow-sm">
            
            {/* Tab items */}
            <div className="flex border-b border-stone-200 bg-stone-50/60 p-2 gap-1 font-sans">
              {(['overview', 'care', 'facts', 'chat'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveResultTab(tab)}
                  className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    activeResultTab === tab
                      ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-stone-200'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  {tab === 'overview' && '🔍 Facts'}
                  {tab === 'care' && '🌿 Care Tips'}
                  {tab === 'facts' && '💡 Trivia'}
                  {tab === 'chat' && '💬 Ask AI'}
                </button>
              ))}
            </div>

            {/* Tab content viewer */}
            <div id="result-tab-content" className="p-6 md:p-8 flex-1 min-h-[300px]">
              
              {/* Overview panel */}
              {activeResultTab === 'overview' && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-stone-400 uppercase tracking-widest">Classification Details</h4>
                    <p id="result-desc" className="text-sm text-stone-600 leading-relaxed">
                      {analyzedResult.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-stone-400 uppercase tracking-widest">Key Structural Features</h4>
                    <div id="result-features-list" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {analyzedResult.keyFeatures.map((trait, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-stone-50 border border-stone-200/50 p-3 rounded-xl">
                          <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="text-stone-700 text-xs font-medium leading-tight">{trait}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Care tips panel */}
              {activeResultTab === 'care' && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div className="space-y-1">
                    <h3 className="text-md font-bold text-stone-800">Care & Preservation Guides</h3>
                    <p className="text-xs text-stone-400">Actionable steps compiled by Vaidik intelligence systems</p>
                  </div>

                  <div id="result-care-list" className="space-y-4">
                    {analyzedResult.careTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 border-l-4 border-emerald-500 pl-4 py-1">
                        <div>
                          <p className="text-xs text-stone-700 font-medium leading-relaxed">
                            {tip}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fun Facts panel */}
              {activeResultTab === 'facts' && (
                <div className="space-y-6 animate-fade-in text-left">
                  <div className="space-y-1">
                    <h3 className="text-md font-bold text-stone-800">Did You Know?</h3>
                    <p className="text-xs text-stone-400">Remarkable science secrets and fun facts</p>
                  </div>

                  <div id="result-facts-list" className="space-y-4">
                    {analyzedResult.facts.map((fact, i) => (
                      <div key={i} className="flex items-start gap-3 bg-stone-50 border border-stone-100 p-4 rounded-xl">
                        <span className="text-xl shrink-0 mt-0.5">💡</span>
                        <p className="text-xs text-stone-600 font-medium leading-relaxed">
                          {fact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Chat panel */}
              {activeResultTab === 'chat' && (
                <div className="flex flex-col h-[350px] animate-fade-in">
                  
                  {/* Message displays */}
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-3.5 pr-2 text-xs text-left"
                  >
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`max-w-[85%] p-3 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'ml-auto bg-emerald-600 text-white rounded-br-xs'
                            : 'bg-stone-100 text-stone-800 rounded-bl-xs border border-stone-200/50'
                        }`}
                      >
                        {msg.sender === 'user' ? (
                          <p className="font-sans leading-relaxed whitespace-pre-line">{msg.text}</p>
                        ) : (
                          // Quick rendering helper for simple markdown links/bolds in response
                          <p className="font-sans leading-relaxed whitespace-pre-line">
                            {msg.text.split('**').map((part, i) => i % 2 === 1 ? <b key={i} className="font-extrabold text-stone-900">{part}</b> : part)}
                          </p>
                        )}
                      </div>
                    ))}

                    {isSendingChat && (
                      <div className="bg-stone-50 border border-stone-100 p-3 rounded-2xl max-w-[50%] flex items-center gap-2">
                        <RotateCw className="w-3 h-3 text-emerald-600 animate-spin" />
                        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Vaidik is responding...</span>
                      </div>
                    )}
                  </div>

                  {/* Send form */}
                  <form onSubmit={handleSendChat} className="mt-4 flex gap-2 border-t border-stone-100 pt-3">
                    <input
                      id="chat-input"
                      type="text"
                      className="flex-1 px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 text-stone-800"
                      placeholder={`Ask me anything about ${analyzedResult.name}...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isSendingChat}
                    />
                    <button
                      id="chat-send-btn"
                      type="submit"
                      disabled={isSendingChat || !chatInput.trim()}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-transform hover:scale-105 disabled:opacity-55 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
