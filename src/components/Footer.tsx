import React from 'react';
import { Camera } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#fafaf9] border-t border-stone-200 mt-16 py-8 px-6 text-stone-500">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Right Brand info & Attribution */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Camera className="w-4 h-4 text-emerald-100" />
          </div>
          <div className="text-left">
            <p id="footer-logo-text" className="text-sm font-semibold text-stone-800 tracking-wide font-sans">
              Vaidik Vision AI
            </p>
            <p className="text-xs text-stone-400">© {new Date().getFullYear()} All rights reserved</p>
          </div>
        </div>

        {/* Required Attribution */}
        <div className="text-center md:text-right border-l md:border-l-0 pl-4 md:pl-0 border-stone-200">
          <p id="footer-dev-by" className="text-sm font-bold text-stone-700 tracking-tight font-sans">
            Developed by:Vaidik AI Innovations
          </p>
          <p id="footer-dev-slogan" className="text-xs font-medium text-emerald-600 tracking-wide font-sans italic mt-0.5">
            Where intelligence meets innovations
          </p>
        </div>
      </div>
    </footer>
  );
}
