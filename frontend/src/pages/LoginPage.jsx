import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse,
  Lock,
  Mail,
  UserCheck,
  Stethoscope,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const LoginPage = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password, activeRole);
      if (res.success) {
        if (res.user.role === 'admin') navigate('/admin/dashboard');
        else if (res.user.role === 'doctor') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setActiveRole(role);
    if (role === 'patient') {
      setEmail('michael.davis@example.com');
      setPassword('patient123');
    } else if (role === 'doctor') {
      setEmail('cardio.sarah@hospital.org');
      setPassword('doctor123');
    } else if (role === 'admin') {
      setEmail('admin@hospital.org');
      setPassword('admin123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/30">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to OPAS
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            CareConnect Online Patient Appointment System
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="bg-slate-200/80 p-1 rounded-xl flex gap-1 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveRole('patient');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'patient'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Patient
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('doctor');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'doctor'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Doctor
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole('admin');
              setError('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeRole === 'admin'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin
          </button>
        </div>

        {/* Card Body */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Pre-Fill buttons */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Fast Fill Demo Credentials
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => fillDemo('patient')}
                className="py-1 px-2 text-[10px] font-bold bg-teal-50 text-teal-700 hover:bg-teal-100 rounded border border-teal-200 transition-colors truncate"
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => fillDemo('doctor')}
                className="py-1 px-2 text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors truncate"
              >
                Dr. Sarah
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="py-1 px-2 text-[10px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 transition-colors truncate"
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeRole === 'admin'
                      ? 'admin@hospital.org'
                      : activeRole === 'doctor'
                      ? 'doctor@hospital.org'
                      : 'patient@example.com'
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                activeRole === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                  : activeRole === 'doctor'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Authenticating...' : `Sign In as ${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)}`}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {activeRole === 'patient' && (
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-600">
                New to CareConnect?{' '}
                <Link to="/register" className="text-teal-600 font-bold hover:underline">
                  Create a Patient Account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
