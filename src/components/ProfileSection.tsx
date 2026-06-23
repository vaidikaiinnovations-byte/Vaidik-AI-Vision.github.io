import React, { useState, useRef, useEffect } from 'react';
import { User, Camera, Award, Shield, Milestone, Calendar, Leaf, HelpCircle, Save, CheckCircle } from 'lucide-react';
import { UserProfile, ScanResult } from '../types';

interface ProfileSectionProps {
  profile: UserProfile;
  onChangeProfile: (updated: UserProfile) => void;
  scans: ScanResult[];
  onLogout: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=faces'
];

export default function ProfileSection({ profile, onChangeProfile, scans, onLogout }: ProfileSectionProps) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [profilePicture, setProfilePicture] = useState(profile.profilePicture);
  const [isEditing, setIsEditing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group stats based on categories
  const plantsCount = scans.filter(s => s.category === 'plant').length;
  const animalsCount = scans.filter(s => s.category === 'animal').length;
  const thingsCount = scans.filter(s => s.category === 'thing').length;

  // Determine Milestone Level based on count
  const totalScans = scans.length;
  let milestoneTitle = "Novice Explorer";
  let milestoneColor = "bg-stone-100 text-stone-700 border-stone-200";
  let nextMilestone = "Botanist (5 scans)";
  let progressToNext = (totalScans / 5) * 100;

  if (totalScans >= 15) {
    milestoneTitle = "Vaidik Visionary Grandmaster";
    milestoneColor = "bg-purple-100 text-purple-700 border-purple-200 ring-2 ring-purple-400/20";
    nextMilestone = "Maximum Level Achieved! 🏆";
    progressToNext = 100;
  } else if (totalScans >= 10) {
    milestoneTitle = "Master Eco-Conservator";
    milestoneColor = "bg-amber-100 text-amber-800 border-amber-200";
    nextMilestone = "Vaidik Visionary (15 scans)";
    progressToNext = ((totalScans - 10) / 5) * 100;
  } else if (totalScans >= 5) {
    milestoneTitle = "Expert Field Naturalist";
    milestoneColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
    nextMilestone = "Master Eco-Conservator (10 scans)";
    progressToNext = ((totalScans - 5) / 5) * 100;
  }

  useEffect(() => {
    setName(profile.name);
    setBio(profile.bio);
    setProfilePicture(profile.profilePicture);
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select a photo smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProfilePicture(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    onChangeProfile({
      ...profile,
      name: name.trim(),
      bio: bio.trim(),
      profilePicture: profilePicture,
      scanCount: scans.length,
      milestoneTitle: milestoneTitle
    });

    setIsEditing(false);
    setStatusMsg('Profile successfully updated!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="profile-container" className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Profile Header Block */}
      <div id="profile-card" className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          
          {/* Avatar Picture with custom upload buttons */}
          <div className="relative group">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-stone-100 shadow-md bg-stone-50 flex items-center justify-center">
              {profilePicture ? (
                <img 
                  id="profile-picture-view"
                  src={profilePicture} 
                  alt={name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-12 h-12 text-stone-300" />
              )}
            </div>
            
            {isEditing && (
              <button 
                id="profile-upload-btn"
                onClick={triggerUpload}
                type="button" 
                className="absolute inset-0 bg-black/60 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold"
              >
                <Camera className="w-4 h-4 mb-1" />
                Upload Photo
              </button>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>

          {/* Profile Name & Biography Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              {isEditing ? (
                <input 
                  id="profile-input-name"
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-1 text-lg font-bold text-stone-800 border-2 border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 max-w-sm "
                  placeholder="Enter your name"
                />
              ) : (
                <h2 id="profile-text-name" className="text-2xl font-bold text-stone-900 tracking-tight">
                  {profile.name || "Explorer"}
                </h2>
              )}

              {/* Milestone badge */}
              <span id="profile-milestone-badge" className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${milestoneColor} self-center inline-flex items-center gap-1`}>
                <Award className="w-3.5 h-3.5" />
                {milestoneTitle}
              </span>
            </div>

            {isEditing ? (
              <textarea 
                id="profile-input-bio"
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2 text-stone-600 border border-stone-300 rounded-lg text-sm h-16 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Share a short bio about your curiosity of plants, animals, and things..."
              />
            ) : (
              <p id="profile-text-bio" className="text-stone-600 text-sm max-w-xl leading-relaxed">
                {profile.bio || "No bio specified yet. Click edit to customize."}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-stone-400 pt-1 justify-center md:justify-start">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined: {new Date(profile.joinedAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span className="font-semibold text-emerald-600">ID: #{profile.id}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            {isEditing ? (
              <>
                <button 
                  id="profile-save-btn"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button 
                  id="profile-cancel-btn"
                  onClick={() => {
                    setName(profile.name);
                    setBio(profile.bio);
                    setProfilePicture(profile.profilePicture);
                    setIsEditing(false);
                  }}
                  className="px-5 py-2 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 font-semibold text-sm flex items-center justify-center transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  id="profile-edit-btn"
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Edit Profile
                </button>
                <button 
                  id="profile-logout-btn"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to log out of your Vaidik AI account?")) {
                      onLogout();
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Update Feedback Alert */}
        {statusMsg && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-100">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {statusMsg}
          </div>
        )}

        {/* Preset selections for fast setup while editing */}
        {isEditing && (
          <div className="border-t border-stone-100 mt-6 pt-4">
            <p className="text-xs font-semibold text-stone-500 mb-2">Or select a preset botanical face avatar:</p>
            <div className="flex gap-2.5">
              {PRESET_AVATARS.map((url, i) => (
                <button 
                  key={i}
                  type="button"
                  onClick={() => setProfilePicture(url)}
                  className={`w-10 h-10 rounded-lg overflow-hidden border-2 ${profilePicture === url ? 'border-emerald-500 scale-105' : 'border-transparent'} hover:scale-105 transition-all`}
                >
                  <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Explorer Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-stone-50 border border-stone-200/60 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Scans</p>
          <p className="text-3xl font-extrabold text-stone-800 mt-2">{totalScans}</p>
          <div className="text-[10px] text-stone-500 mt-1">Across all categories</div>
        </div>

        <div className="bg-indigo-50/40 border border-indigo-100 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Plants ID'd</p>
          <p className="text-3xl font-extrabold text-indigo-800 mt-2">{plantsCount}</p>
          <div className="text-[10px] text-indigo-500 mt-1">🌿 Flora, trees & shrubs</div>
        </div>

        <div className="bg-amber-50/40 border border-amber-100 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Animals ID'd</p>
          <p className="text-3xl font-extrabold text-amber-800 mt-2">{animalsCount}</p>
          <div className="text-[10px] text-amber-500 mt-1">🦁 Birds, pets & beasts</div>
        </div>

        <div className="bg-teal-50/40 border border-teal-100 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Things ID'd</p>
          <p className="text-3xl font-extrabold text-teal-800 mt-2">{thingsCount}</p>
          <div className="text-[10px] text-teal-500 mt-1">🛠️ Materials & tools</div>
        </div>
      </div>

      {/* Milestone levels & accomplishments progress */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-stone-800">Your Vaidik Journey Progress</h3>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-stone-500">Current Title: <b className="text-emerald-700">{milestoneTitle}</b></span>
            <span className="text-stone-400">Total Scans: {totalScans}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
            <div 
              id="profile-progress-bar"
              className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(8, progressToNext))}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-stone-400">
            <span>Level Goal</span>
            <span>Next Milestone: <b>{nextMilestone}</b></span>
          </div>
        </div>

        {/* Informative card */}
        <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 flex items-start gap-2 text-xs text-stone-500">
          <Milestone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Scanning more surrounding flora, fauna, fauna, and machinery increases your intelligence rank. Unlock the custom 
            <b>Grandmaster</b> status by completing 15 successful scans!
          </p>
        </div>
      </div>
    </div>
  );
}
