import React, { useState } from 'react';
import { Mail, Lock, Sparkles, LogIn, ArrowRight, Chrome, Camera } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthGatewayProps {
  onLoginSuccess: (email: string, displayName?: string, profilePic?: string) => void;
}

export default function AuthGateway({ onLoginSuccess }: AuthGatewayProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please specify both your email address and password code.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long to keep your credentials secure.');
      return;
    }

    setIsLoading(true);

    // Simulate short check for validation
    setTimeout(() => {
      setIsLoading(false);
      const name = isRegister ? (fullName.trim() || 'Explorer') : email.split('@')[0];
      // Generate a nice random avatar if registration
      const randomId = Math.floor(Math.random() * 100);
      const avatar = `https://images.unsplash.com/photo-${1500000000000 + randomId * 100000}?w=150&h=150&fit=crop&crop=faces`;
      
      onLoginSuccess(email, name, avatar);
    }, 1200);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setErrorMsg('');
    
    setTimeout(() => {
      setIsLoading(false);
      // Retrieve friendly default names based on typical Google logs or simple strings
      onLoginSuccess('google.user@gmail.com', 'Google Explorer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces');
    }, 1500);
  };

  return (
    <div id="auth-gateway" className="min-h-screen bg-[#fcfcfb] flex flex-col justify-between text-stone-800 font-sans">
      
      {/* Visual Brand Area top center */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 p-8 shadow-sm space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mx-auto shadow-sm shadow-emerald-200">
              <Camera className="w-6 h-6 text-emerald-100" />
            </div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              {isRegister ? 'Create Vaidik Account' : 'Welcome back to Vaidik'}
            </h2>
            <p className="text-stone-500 font-medium text-xs leading-normal max-w-xs mx-auto">
              Scan plants, creatures, and antiques with natural-science expert classification
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-stone-500 font-bold uppercase tracking-wider text-[10px]" htmlFor="auth-fullname">
                  Full Name
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  placeholder="e.g. Vaidik Explorer"
                  className="w-full px-3.5 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 text-stone-800"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-stone-500 font-bold uppercase tracking-wider text-[10px]" htmlFor="auth-email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-3.5 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 text-stone-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-stone-500 font-bold uppercase tracking-wider text-[10px]" htmlFor="auth-password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 text-stone-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  {isRegister ? 'Register Account' : 'Sign in securely'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign In Divider line */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-4 text-stone-400 text-[10px] font-extrabold uppercase tracking-widest">or integrate</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <button
            id="auth-google-btn"
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Chrome className="w-4 h-4 text-rose-500 shrink-0" />
            Continue with Google account
          </button>

          <button
            id="auth-skip-btn"
            type="button"
            disabled={isLoading}
            onClick={() => onLoginSuccess('guest@vaidik.ai', 'Vaidik Guest', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces')}
            className="w-full py-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100/50 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-dashed border-stone-200"
          >
            Skip & Browse As Guest
          </button>

          {/* Switch toggle layout */}
          <p className="text-center text-xs text-stone-500 font-medium">
            {isRegister ? 'Already registered on Vaidik?' : "New to Vaidik Vision AI? "}
            <button
              id="auth-toggle-btn"
              onClick={() => {
                setErrorMsg('');
                setIsRegister(!isRegister);
              }}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              {isRegister ? 'Sign In Now' : 'Create Free Account'}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
}
