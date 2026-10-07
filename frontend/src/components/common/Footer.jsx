import React from 'react';
import { HeartPulse, ShieldCheck, Activity, PhoneCall, MapPin, Building2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CareConnect OPAS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modern, automated Online Patient Appointment System designed to streamline healthcare access, eliminate double bookings, and empower patients and specialists.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> 256-Bit Encrypted Healthcare Architecture
            </div>
          </div>

          {/* Specializations */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Clinical Specialties</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-teal-400 transition-colors">Cardiology & Heart Care</li>
              <li className="hover:text-teal-400 transition-colors">Neurology & Brain Health</li>
              <li className="hover:text-teal-400 transition-colors">Orthopedics & Joint Surgery</li>
              <li className="hover:text-teal-400 transition-colors">Dermatology & Skin Center</li>
            </ul>
          </div>

          {/* Institutional Info & Project Credits */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Institution</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="font-medium text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-400" /> Amal College of Advanced Studies
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> Nilambur, Kerala - 679329
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Major Course: CSC5CJ302 FYUGP Computer Science
              </p>
            </div>
          </div>

          {/* 24/7 Helpline */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">Medical Assistance</h4>
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
                <PhoneCall className="w-4 h-4" /> 24/7 Clinical Helpdesk
              </div>
              <p className="text-xs text-slate-300 font-mono">+1 (800) 555-CARE-OPAS</p>
              <p className="text-[11px] text-slate-400">Emergency OPD Desk Room 101-104</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} CareConnect Online Patient Appointment System. All rights reserved.</span>
          <span className="text-slate-400">Role-Based Access Control • Conflict Prevention • Real-Time Availability</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
