import React, { useState, useEffect } from 'react';
import { 
  Sparkles, History, User, Camera, Award, HelpCircle, 
  Leaf, Search, FileText, ArrowUpRight, CheckCircle2, LogOut
} from 'lucide-react';
import { UserProfile, ScanResult } from './types';
import ScanHub from './components/ScanHub';
import HistoryPanel from './components/HistoryPanel';
import ProfileSection from './components/ProfileSection';
import Footer from './components/Footer';
import AuthGateway from './components/AuthGateway';

// Default mock values to fill in when the browser starts fresh
const DEFAULT_PROFILE: UserProfile = {
  id: 'vaidik-usr-77',
  name: 'Vaidik Naturalist',
  email: 'explorer@vaidik.ai',
  bio: 'Amateur nature collector and machine conservator. Focused on cataloging local plant species, neighborhood pets, and vintage workshop tools.',
  profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces',
  favoriteCategory: 'all',
  joinedAt: new Date().toISOString(),
  scanCount: 0,
  milestoneTitle: 'Novice Explorer'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'profile'>('scan');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load profile and scan history from local persistence
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('vaidik_ai_profile');
      const storedScans = localStorage.getItem('vaidik_ai_scans');
      const isAuthCached = localStorage.getItem('vaidik_ai_auth') === 'true';

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        localStorage.setItem('vaidik_ai_profile', JSON.stringify(DEFAULT_PROFILE));
      }

      if (storedScans) {
        setScans(JSON.parse(storedScans));
      }

      setIsAuthenticated(isAuthCached);
    } catch (e) {
      console.error('Could not load cached parameters from localStorage:', e);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Save updates to profile
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('vaidik_ai_profile', JSON.stringify(updatedProfile));
  };

  const handleLoginSuccess = (email: string, displayName?: string, profilePic?: string) => {
    const freshProfile = {
      ...profile,
      email: email,
      name: displayName || email.split('@')[0],
      profilePicture: profilePic || profile.profilePicture
    };
    setProfile(freshProfile);
    setIsAuthenticated(true);
    localStorage.setItem('vaidik_ai_auth', 'true');
    localStorage.setItem('vaidik_ai_profile', JSON.stringify(freshProfile));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('vaidik_ai_auth');
    localStorage.removeItem('vaidik_ai_profile');
    localStorage.removeItem('vaidik_ai_scans');
    setProfile(DEFAULT_PROFILE);
    setScans([]);
    setActiveTab('scan');
  };

  // Add individual scan to lists
  const handleAddScan = (newScan: ScanResult) => {
    const updatedScans = [newScan, ...scans];
    setScans(updatedScans);
    localStorage.setItem('vaidik_ai_scans', JSON.stringify(updatedScans));

    // Increment scan list length inside save profile stats
    const updatedProfile = {
      ...profile,
      scanCount: updatedScans.length
    };
    setProfile(updatedProfile);
    localStorage.setItem('vaidik_ai_profile', JSON.stringify(updatedProfile));
  };

  // Delete individual scan from list
  const handleDeleteScan = (id: string) => {
    const updatedScans = scans.filter(s => s.id !== id);
    setScans(updatedScans);
    localStorage.setItem('vaidik_ai_scans', JSON.stringify(updatedScans));

    // Update scan counters on profiles
    const updatedProfile = {
      ...profile,
      scanCount: updatedScans.length
    };
    setProfile(updatedProfile);
    localStorage.setItem('vaidik_ai_profile', JSON.stringify(updatedProfile));
  };

  // Completely erase scan logs
  const handleClearAllHistory = () => {
    setScans([]);
    localStorage.setItem('vaidik_ai_scans', JSON.stringify([]));

    const updatedProfile = {
      ...profile,
      scanCount: 0,
      milestoneTitle: 'Novice Explorer'
    };
    setProfile(updatedProfile);
    localStorage.setItem('vaidik_ai_profile', JSON.stringify(updatedProfile));
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center text-stone-500 font-sans">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold tracking-wider uppercase text-stone-400">Booting Vaidik Systems...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthGateway onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-stone-800 font-sans flex flex-col justify-between">
      
      {/* Dynamic Header navbar */}
      <div>
        <header className="w-full bg-[#fcfcfb]/80 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-50 py-4 px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            
            {/* Logo and company Slogan header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
                <Camera className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <span id="header-brand-title" className="text-md font-extrabold text-stone-900 tracking-tight font-sans block leading-none">
                  Vaidik AI Vision
                </span>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block mt-0.5 font-sans">
                  Intelligence & innovation
                </span>
              </div>
            </div>

            {/* Navigation Tabs bar */}
            <nav id="header-nav" className="flex items-center gap-1.5 font-sans">
              <button
                id="tab-scan-btn"
                onClick={() => setActiveTab('scan')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'scan'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
                }`}
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Identify</span>
              </button>

              <button
                id="tab-history-btn"
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
                }`}
              >
                <History className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Library</span>
                {scans.length > 0 && (
                  <span className="bg-emerald-600 text-white rounded-full text-[9px] px-1.5 py-0.2 shrink-0 font-extrabold">
                    {scans.length}
                  </span>
                )}
              </button>

              <button
                id="tab-profile-btn"
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/50'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Account</span>
              </button>

              {/* Mini account circle thumbnail shortcuts */}
              <button 
                onClick={() => setActiveTab('profile')}
                className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 shadow-xs flex items-center justify-center cursor-pointer ml-1 hover:ring-2 hover:ring-emerald-200 transition-all border-dashed"
                title="View user profile account settings"
              >
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Account thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-4 h-4 text-stone-400" />
                )}
              </button>

              <button
                id="header-logout-btn"
                onClick={handleLogout}
                className="p-1.5 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-rose-500 transition-all cursor-pointer"
                title="Log Out of your Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </nav>

          </div>
        </header>

        {/* Dashboard quick statistic alerts banner */}
        {scans.length === 0 && activeTab === 'scan' && (
          <div className="bg-emerald-50/50 border-b border-emerald-100/60 py-2.5 px-4 text-center text-xs font-medium text-emerald-800 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Welcome! Get started by capturing or dropping any image to run full cataloging scans.
          </div>
        )}

        {/* Dynamic Inner Tab Stage Area */}
        <main id="app-main-content" className="w-full max-w-5xl mx-auto py-8 px-6">
          {activeTab === 'scan' && (
            <ScanHub onAddScan={handleAddScan} />
          )}

          {activeTab === 'history' && (
            <HistoryPanel 
              scans={scans} 
              onDeleteScan={handleDeleteScan} 
              onClearAll={handleClearAllHistory} 
            />
          )}

          {activeTab === 'profile' && (
            <ProfileSection 
              profile={profile} 
              onChangeProfile={handleUpdateProfile} 
              scans={scans}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Footer credits element */}
      <Footer />

    </div>
  );
}
