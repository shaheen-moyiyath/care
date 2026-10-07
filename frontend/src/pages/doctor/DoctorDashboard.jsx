import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  Activity,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  Phone,
  MapPin,
  RefreshCw,
  Edit3,
  X,
  Send,
  Sliders,
  Scissors
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ todayCount: 0, pendingCount: 0, surgeryCount: 0, totalCount: 0 });
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Clinical Consultation Modal State
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [activeAppo, setActiveAppo] = useState(null);
  const [diseaseInput, setDiseaseInput] = useState('');
  const [prescriptionInput, setPrescriptionInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [statusInput, setStatusInput] = useState('Seen');
  const [savingRecord, setSavingRecord] = useState(false);

  // Surgery Decision Modal State
  const [surgeryModalOpen, setSurgeryModalOpen] = useState(false);
  const [surgeryAppo, setSurgeryAppo] = useState(null);
  const [surgeryDecision, setSurgeryDecision] = useState('Approved');
  const [surgeryNotes, setSurgeryNotes] = useState('');
  const [savingSurgery, setSavingSurgery] = useState(false);

  // Availability Settings Modal State
  const [availModalOpen, setAvailModalOpen] = useState(false);
  const [availString, setAvailString] = useState(user?.availability || 'Mon-Fri 09:00-17:00');
  const [phoneString, setPhoneString] = useState(user?.phone || '');
  const [roomString, setRoomString] = useState(user?.room_no || 'Room 101');
  const [savingAvail, setSavingAvail] = useState(false);

  useEffect(() => {
    fetchDoctorData();
  }, [selectedDate, statusFilter]);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      let url = '/doctor/appointments?';
      if (selectedDate) url += `date=${selectedDate}&`;
      if (statusFilter && statusFilter !== 'All') url += `status=${statusFilter}&`;

      const [appoRes, statsRes] = await Promise.all([
        api.get(url),
        api.get('/doctor/stats')
      ]);

      if (appoRes.data.success) setAppointments(appoRes.data.appointments || []);
      if (statsRes.data.success) setStats(statsRes.data.stats || {});
    } catch (err) {
      console.error('Failed to load doctor console data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openConsultModal = (appo) => {
    setActiveAppo(appo);
    setDiseaseInput(appo.Disease || '');
    setPrescriptionInput(appo.Prescription || '');
    setNotesInput(appo.Doctor_notes || '');
    setStatusInput(appo.Status === 'Confirmed' || appo.Status === 'Pending' ? 'Seen' : appo.Status);
    setConsultModalOpen(true);
  };

  const handleSaveConsult = async (e) => {
    e.preventDefault();
    setSavingRecord(true);
    try {
      const res = await api.put(`/doctor/appointments/${activeAppo.Appo_id}/clinical`, {
        disease: diseaseInput,
        prescription: prescriptionInput,
        doctor_notes: notesInput,
        status: statusInput
      });

      if (res.data.success) {
        setConsultModalOpen(false);
        fetchDoctorData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update clinical record.');
    } finally {
      setSavingRecord(false);
    }
  };

  const openSurgeryModal = (appo) => {
    setSurgeryAppo(appo);
    setSurgeryDecision(appo.Surgery_decision || 'Approved');
    setSurgeryNotes(appo.Doctor_notes || '');
    setSurgeryModalOpen(true);
  };

  const handleSaveSurgery = async (e) => {
    e.preventDefault();
    setSavingSurgery(true);
    try {
      const res = await api.put(`/doctor/appointments/${surgeryAppo.Appo_id}/surgery-decision`, {
        decision: surgeryDecision,
        notes: surgeryNotes
      });

      if (res.data.success) {
        setSurgeryModalOpen(false);
        fetchDoctorData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save surgery evaluation.');
    } finally {
      setSavingSurgery(false);
    }
  };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    setSavingAvail(true);
    try {
      const res = await api.put('/doctor/availability', {
        availability: availString,
        phone: phoneString,
        room_no: roomString
      });

      if (res.data.success) {
        setAvailModalOpen(false);
        alert('Availability schedule updated!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update schedule.');
    } finally {
      setSavingAvail(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Seen':
      case 'Completed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Seen / Completed</span>;
      case 'Approved for Surgery':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Surgery Approved</span>;
      case 'Rejected for Surgery':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Non-Surgical</span>;
      case 'No-Show':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700">No-Show</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Confirmed / Scheduled</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Doctor Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
              <Stethoscope className="w-3.5 h-3.5" /> Department of {user?.specialization || 'Medicine'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 flex items-center gap-3">
              <span>{user?.room_no || 'Consultation Suite Room 101'}</span>
              <span>•</span>
              <span>Availability: {user?.availability || 'Mon-Fri 09:00-17:00'}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setAvailModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-emerald-700" /> Manage Schedule & Hours
            </button>
            <button
              onClick={fetchDoctorData}
              className="p-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-white transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Doctor KPI Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Today's Appointments</p>
              <p className="text-2xl font-bold text-slate-900">{stats.todayCount || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pending Review</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingCount || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Surgeries Cleared</p>
              <p className="text-2xl font-bold text-slate-900">{stats.surgeryCount || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Consultations</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCount || 0}</p>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-slate-700">Filter Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {['All', 'Confirmed', 'Seen', 'Approved for Surgery', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Appointments Queue List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading patient queue...</div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">No Appointments Found</h3>
              <p className="text-xs text-slate-500">There are no patient bookings matching your active filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((appo) => (
                <div
                  key={appo.Appo_id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          Appo #{appo.Appo_id}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{appo.Patient_name}</h3>
                        <p className="text-xs text-slate-500">
                          Age: {appo.Patient_age} • {appo.Patient_place || 'Nilambur'}
                        </p>
                      </div>
                      <div>{getStatusBadge(appo.Status)}</div>
                    </div>

                    {/* Time / Contact info */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{appo.Appo_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{appo.Appo_time?.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 text-slate-500 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{appo.Patient_phone}</span>
                      </div>
                    </div>

                    {/* Patient Symptoms */}
                    {appo.Symptoms && (
                      <div className="text-xs space-y-1">
                        <span className="font-semibold text-slate-800">Patient Symptoms / Complaint:</span>
                        <p className="text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                          "{appo.Symptoms}"
                        </p>
                      </div>
                    )}

                    {/* Disease / Prescription Summary if already done */}
                    {appo.Disease && (
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800">Verified Condition:</span>{' '}
                        <span className="text-emerald-700 font-medium">{appo.Disease}</span>
                      </div>
                    )}

                    {appo.Prescription && (
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800">Prescription:</span>{' '}
                        <span className="text-slate-600 font-mono text-[11px] block truncate">{appo.Prescription}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => openConsultModal(appo)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-emerald-600/20"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Clinical Consultation & Rx
                    </button>

                    <button
                      onClick={() => openSurgeryModal(appo)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1.5 border border-purple-200"
                    >
                      <Scissors className="w-3.5 h-3.5 text-purple-600" /> Surgery Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ----------------- CLINICAL CONSULTATION MODAL ----------------- */}
      {consultModalOpen && activeAppo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Consultation
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Patient: {activeAppo.Patient_name} (Age: {activeAppo.Patient_age})
                </h3>
              </div>
              <button onClick={() => setConsultModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConsult} className="mt-4 space-y-4">
              {activeAppo.Symptoms && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                  <span className="font-semibold text-slate-800 block mb-1">Presented Symptoms:</span>
                  <p className="text-slate-600">{activeAppo.Symptoms}</p>
                </div>
              )}

              {/* Disease Verification */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnosed Condition / Disease Verification
                </label>
                <input
                  type="text"
                  required
                  value={diseaseInput}
                  onChange={(e) => setDiseaseInput(e.target.value)}
                  placeholder="e.g. Stage 1 Essential Hypertension, Acute Bronchitis"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Prescription */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prescription & Medicine Dosage
                </label>
                <textarea
                  rows="3"
                  value={prescriptionInput}
                  onChange={(e) => setPrescriptionInput(e.target.value)}
                  placeholder="e.g.&#10;1. Tab Metoprolol 25mg - 1-0-1 (after meals) for 14 days&#10;2. Tab Aspirin 75mg - 0-1-0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Doctor Clinical Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doctor Advice / Clinical Observations
                </label>
                <textarea
                  rows="2"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Advised low sodium diet, avoid strenuous exertion, review in 2 weeks."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultation Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Seen">Seen (Consultation Completed)</option>
                  <option value="Completed">Completed</option>
                  <option value="No-Show">No-Show (Patient absent)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConsultModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRecord}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  {savingRecord ? 'Updating...' : 'Save & Prescribe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- SURGERY DECISION MODAL (DFD Level 2.2.1) ----------------- */}
      {surgeryModalOpen && surgeryAppo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Surgery Evaluation for {surgeryAppo.Patient_name}
                </h3>
              </div>
              <button onClick={() => setSurgeryModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSurgery} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Surgical Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSurgeryDecision('Approved')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      surgeryDecision === 'Approved'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve Surgery
                  </button>

                  <button
                    type="button"
                    onClick={() => setSurgeryDecision('Rejected')}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      surgeryDecision === 'Rejected'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4" /> Non-Surgical / Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Surgical / Pre-Op Notes & Justification
                </label>
                <textarea
                  rows="3"
                  value={surgeryNotes}
                  onChange={(e) => setSurgeryNotes(e.target.value)}
                  placeholder="e.g. Patient cleared for arthroscopic reconstruction under regional anesthesia..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSurgeryModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSurgery}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-md shadow-purple-600/20"
                >
                  {savingSurgery ? 'Saving...' : 'Submit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- AVAILABILITY SETTINGS MODAL ----------------- */}
      {availModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Update Working Hours & Clinic Room
                </h3>
              </div>
              <button onClick={() => setAvailModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAvailability} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Availability Schedule String
                </label>
                <input
                  type="text"
                  required
                  value={availString}
                  onChange={(e) => setAvailString(e.target.value)}
                  placeholder="e.g. Mon-Fri 09:00-16:00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinic Consultation Room
                </label>
                <input
                  type="text"
                  value={roomString}
                  onChange={(e) => setRoomString(e.target.value)}
                  placeholder="e.g. Cardio Wing A-204"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doctor Direct Extension / Phone
                </label>
                <input
                  type="text"
                  value={phoneString}
                  onChange={(e) => setPhoneString(e.target.value)}
                  placeholder="+1 (555) 234-5671"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAvailModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAvail}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  {savingAvail ? 'Saving...' : 'Update Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
