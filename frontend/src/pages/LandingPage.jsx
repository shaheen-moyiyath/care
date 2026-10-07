import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse,
  CalendarCheck,
  Stethoscope,
  ShieldCheck,
  Clock,
  ArrowRight,
  Activity,
  Brain,
  Bone,
  Sparkles,
  Users,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';

const LandingPage = () => {
  const { quickDemoLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedDoctors();
  }, []);

  const fetchFeaturedDoctors = async () => {
    try {
      const res = await api.get('/patient/doctors');
      if (res.data.success) {
        setDoctors(res.data.doctors || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    const res = await quickDemoLogin(role);
    if (res.success) {
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    }
  };

  const specialties = [
    {
      id: 'Cardiology',
      name: 'Cardiology',
      icon: HeartPulse,
      desc: 'Expert heart health diagnostics, ECG review & vascular care',
      color: 'from-rose-500 to-red-600',
      badge: 'Heart Care'
    },
    {
      id: 'Neurology',
      name: 'Neurology',
      icon: Brain,
      desc: 'Specialized brain, migraine, neuropathy & spinal assessments',
      color: 'from-indigo-500 to-purple-600',
      badge: 'Neuro Health'
    },
    {
      id: 'Orthopedics',
      name: 'Orthopedics',
      icon: Bone,
      desc: 'Joint replacement, trauma care, fracture & surgical evaluation',
      color: 'from-amber-500 to-orange-600',
      badge: 'Joints & Bones'
    },
    {
      id: 'Dermatology',
      name: 'Dermatology',
      icon: Sparkles,
      desc: 'Skin conditions, allergy screening & dermatological therapies',
      color: 'from-teal-500 to-cyan-600',
      badge: 'Skin & Aesthetics'
    }
  ];

  const filteredDoctors = selectedSpec === 'All'
    ? doctors
    : doctors.filter(d => d.Specialization.toLowerCase() === selectedSpec.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-900 via-slate-900 to-slate-900 text-white pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                <Activity className="w-3.5 h-3.5" /> Next-Generation Medical Scheduling
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Seamless Healthcare. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400">
                  Zero Double-Bookings.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                CareConnect Online Patient Appointment System provides real-time specialist availability, conflict-free booking, clinical disease evaluation, and streamlined administration in one unified platform.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                {isAuthenticated ? (
                  <Link
                    to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-0.5"
                  >
                    Go to Your Dashboard <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-0.5"
                    >
                      Book Appointment Now <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold border border-slate-700 transition-all"
                    >
                      Sign In to Account
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-4 text-slate-300 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>24/7 Online Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Instant Conflict Check</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Role-Based Security</span>
                </div>
              </div>
            </div>

            {/* Right Quick-Demo Sandbox Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <div className="flex items-center gap-2 text-white font-bold text-base">
                    <Lock className="w-4 h-4 text-teal-400" />
                    <span>Quick Interactive Demo Access</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    One-Click Testing
                  </span>
                </div>

                <p className="text-xs text-slate-400 my-4">
                  Experience full role-based workflows directly. Click any role below to instantly authenticate and evaluate the system:
                </p>

                <div className="space-y-3">
                  {/* Admin Demo Button */}
                  <button
                    onClick={() => handleDemoLogin('admin')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-purple-200 group-hover:text-white">
                          Administrator / Receptionist
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Doctor CRUD by specialty, master scheduler, reports
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Doctor Demo Button */}
                  <button
                    onClick={() => handleDemoLogin('doctor')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-emerald-200 group-hover:text-white">
                          Specialist Doctor (Dr. Sarah)
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Consultations, prescription writer, surgery approval
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Patient Demo Button */}
                  <button
                    onClick={() => handleDemoLogin('patient')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-teal-950/40 hover:bg-teal-900/60 border border-teal-800/60 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-600/30 text-teal-300 flex items-center justify-center font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-teal-200 group-hover:text-white">
                          Patient (Michael Davis)
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Browse doctors, book slots, view status & alerts
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Overview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialties.map((spec) => {
            const Icon = spec.icon;
            return (
              <div
                key={spec.id}
                onClick={() => setSelectedSpec(spec.id)}
                className={`p-6 rounded-2xl bg-white border cursor-pointer transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-md ${
                  selectedSpec === spec.id ? 'ring-2 ring-teal-500 border-teal-500' : 'border-slate-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${spec.color} text-white flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 mb-2 inline-block">
                  {spec.badge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{spec.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{spec.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Doctors Directory */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Clinical Faculty</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Available Medical Specialists</h2>
            <p className="text-sm text-slate-600 mt-1">Verified consultants ready for in-clinic and surgical consultations</p>
          </div>

          {/* Specialty Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedSpec(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedSpec === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading specialist directory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.Doc_id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-teal-300 hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                      {doc.Specialization}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {doc.Experience_years || 5}+ yrs exp
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{doc.Name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{doc.Room_no || 'Consultation Suite'}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span className="truncate">{doc.Availability}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    to={isAuthenticated ? '/patient/dashboard' : '/login'}
                    className="w-full py-2 px-3 rounded-lg bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CalendarCheck className="w-4 h-4" /> Book Slot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DFD Architectural Process Flow Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">System Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              End-to-End Automated Care Coordination
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Engineered according to rigorous Data Flow Diagrams (DFD Levels 0, 1.1, 1.2, 1.3, 2.1, 2.2, 2.3)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Patient Search & Slot Validation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients select category (Cardiology, Neurology, Orthopedics, Dermatology), pick available calendar slots, enter symptoms, and trigger automated duplicate-booking prevention.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Specialist Disease & Surgery Analysis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Specialists access daily consultation queues, analyze patient history & disease symptoms, prescribe treatment medicines, mark 'Seen'/'No-Show', and approve/reject surgery.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Centralized Admin Scheduling & Security</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Administrators oversee specialist faculty across departments, resolve scheduling conflicts, monitor aggregate analytics reports, and maintain encrypted credentials.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
