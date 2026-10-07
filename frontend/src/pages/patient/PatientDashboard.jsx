import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Calendar,
  Clock,
  User,
  HeartPulse,
  Brain,
  Bone,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Bell,
  RefreshCw,
  PlusCircle,
  Filter,
  Phone,
  MapPin,
  Stethoscope,
  Activity,
  X,
  ChevronRight
} from 'lucide-react';

const PatientDashboard = () => {
  const { user } = useAuth();

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'doctors' | 'notifications'

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [disease, setDisease] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [appoToReschedule, setAppoToReschedule] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newSlots, setNewSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  // Prescription View Modal State
  const [viewPrescriptionModal, setViewPrescriptionModal] = useState(false);
  const [activePrescriptionAppo, setActivePrescriptionAppo] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [docRes, appRes, notRes] = await Promise.all([
        api.get('/patient/doctors'),
        api.get('/patient/appointments'),
        api.get('/patient/notifications')
      ]);

      if (docRes.data.success) setDoctors(docRes.data.doctors || []);
      if (appRes.data.success) setAppointments(appRes.data.appointments || []);
      if (notRes.data.success) setNotifications(notRes.data.notifications || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Available Slots for Doctor on date change
  const fetchSlotsForDoc = async (docId, date) => {
    try {
      const res = await api.get(`/patient/doctors/${docId}/slots?date=${date}`);
      if (res.data.success) {
        setAvailableSlots(res.data.slots || []);
        // select first available
        const firstAvail = res.data.slots.find(s => s.available);
        setSelectedSlot(firstAvail ? firstAvail.time : '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openBookModal = (doc) => {
    setSelectedDoc(doc);
    const today = new Date().toISOString().split('T')[0];
    setBookDate(today);
    setSymptoms('');
    setDisease('');
    setBookingError('');
    setBookingSuccess('');
    setIsBookModalOpen(true);
    fetchSlotsForDoc(doc.Doc_id, today);
  };

  const handleBookDateChange = (date) => {
    setBookDate(date);
    if (selectedDoc) {
      fetchSlotsForDoc(selectedDoc.Doc_id, date);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!selectedSlot) {
      setBookingError('Please select an available time slot.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.post('/patient/appointments', {
        doc_id: selectedDoc.Doc_id,
        appo_date: bookDate,
        appo_time: selectedSlot,
        symptoms,
        disease
      });

      if (res.data.success) {
        setBookingSuccess('Appointment confirmed successfully!');
        setTimeout(() => {
          setIsBookModalOpen(false);
          fetchDashboardData();
          setActiveTab('appointments');
        }, 1200);
      }
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (appoId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await api.put(`/patient/appointments/${appoId}/cancel`);
      if (res.data.success) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  // Open Reschedule Modal
  const openRescheduleModal = async (appo) => {
    setAppoToReschedule(appo);
    setNewDate(appo.Appo_date);
    setRescheduleError('');
    setRescheduleModalOpen(true);

    try {
      const res = await api.get(`/patient/doctors/${appo.Doc_id}/slots?date=${appo.Appo_date}`);
      if (res.data.success) {
        setNewSlots(res.data.slots || []);
        setNewSlot(appo.Appo_time);
      }
    } catch (e) {}
  };

  const handleRescheduleDateChange = async (date) => {
    setNewDate(date);
    if (appoToReschedule) {
      try {
        const res = await api.get(`/patient/doctors/${appoToReschedule.Doc_id}/slots?date=${date}`);
        if (res.data.success) {
          setNewSlots(res.data.slots || []);
          const first = res.data.slots.find(s => s.available);
          setNewSlot(first ? first.time : '');
        }
      } catch (e) {}
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newSlot) {
      setRescheduleError('Please select an available time slot.');
      return;
    }

    setRescheduleLoading(true);
    setRescheduleError('');

    try {
      const res = await api.put(`/patient/appointments/${appoToReschedule.Appo_id}/reschedule`, {
        new_date: newDate,
        new_time: newSlot
      });

      if (res.data.success) {
        setRescheduleModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      setRescheduleError(err.response?.data?.message || 'Failed to reschedule.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Confirmed
          </span>
        );
      case 'Seen':
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {status}
          </span>
        );
      case 'Approved for Surgery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Activity className="w-3.5 h-3.5 text-purple-600" /> Surgery Approved
          </span>
        );
      case 'Rejected for Surgery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Non-Surgical
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
          </span>
        );
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec = selectedSpecialty === 'All' || doc.Specialization.toLowerCase() === selectedSpecialty.toLowerCase();
    const matchesSearch = doc.Name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.Specialization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesSearch;
  });

  const upcomingCount = appointments.filter(a => a.Status === 'Confirmed' || a.Status === 'Pending').length;
  const completedCount = appointments.filter(a => a.Status === 'Completed' || a.Status === 'Seen' || a.Status === 'Approved for Surgery').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/30 text-teal-200 text-xs font-semibold backdrop-blur-xs">
              <User className="w-3.5 h-3.5" /> Patient Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              Manage your doctor consultations, track appointment status, view medical prescriptions, and receive clinical alerts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('doctors')}
              className="px-4 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs shadow-md hover:bg-teal-50 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-teal-600" /> Book New Appointment
            </button>
            <button
              onClick={fetchDashboardData}
              className="p-2.5 rounded-xl bg-teal-800/80 hover:bg-teal-700/80 text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Upcoming Bookings</p>
              <p className="text-2xl font-bold text-slate-900">{upcomingCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Completed Visits</p>
              <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Alerts & Updates</p>
              <p className="text-2xl font-bold text-slate-900">{notifications.length}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 flex gap-4">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'appointments'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> My Appointments ({appointments.length})
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'doctors'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Find Specialists ({doctors.length})
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'notifications'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications ({notifications.length})
          </button>
        </div>

        {/* TAB 1: MY APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Appointments Booked</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't scheduled any doctor appointments yet. Browse our specialist faculty to schedule your consultation.
                </p>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm hover:bg-teal-700"
                >
                  Browse Doctors Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((appo) => (
                  <div
                    key={appo.Appo_id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                            {appo.Specialization}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 mt-1">
                            {appo.Doctor_name}
                          </h3>
                          <p className="text-xs text-slate-500">{appo.Room_no || 'Consultation Suite'}</p>
                        </div>
                        <div>{getStatusBadge(appo.Status)}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 my-3 py-2 border-y border-slate-100 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="font-semibold">{appo.Appo_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="font-semibold">{appo.Appo_time?.slice(0, 5)}</span>
                        </div>
                      </div>

                      {appo.Symptoms && (
                        <div className="text-xs text-slate-600 space-y-1">
                          <span className="font-semibold text-slate-800">Reported Symptoms:</span>
                          <p className="text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                            "{appo.Symptoms}"
                          </p>
                        </div>
                      )}

                      {appo.Disease && (
                        <div className="mt-2 text-xs">
                          <span className="font-semibold text-slate-800">Evaluated Condition:</span>{' '}
                          <span className="text-teal-700 font-medium">{appo.Disease}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {appo.Prescription && (
                          <button
                            onClick={() => {
                              setActivePrescriptionAppo(appo);
                              setViewPrescriptionModal(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 border border-emerald-200"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Rx & Notes
                          </button>
                        )}
                      </div>

                      {appo.Status !== 'Cancelled' && appo.Status !== 'Completed' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openRescheduleModal(appo)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" /> Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appo.Appo_id)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 border border-rose-200"
                          >
                            <XCircle className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FIND DOCTORS */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            {/* Filter controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedSpecialty(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedSpecialty === cat
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search doctor or clinic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Doctor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.Doc_id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                        {doc.Specialization}
                      </span>
                      <span className="text-[11px] text-slate-400">{doc.Experience_years || 5}+ Yrs Exp</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{doc.Name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {doc.Room_no || 'Consultation Suite'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{doc.Availability}</span>
                      </div>
                      {doc.Phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{doc.Phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => openBookModal(doc)}
                      className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20 transition-all"
                    >
                      <Calendar className="w-4 h-4" /> Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" /> Automated Clinical Notifications
              </h3>
              <span className="text-xs text-slate-400">{notifications.length} alerts received</span>
            </div>

            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No notifications found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.Not_id} className="py-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-slate-800">{n.Msg}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Date: {n.Date}</span>
                        <span>Time: {n.Time?.slice(0, 5)}</span>
                        {n.Doctor_name && <span>Doctor: {n.Doctor_name} ({n.Specialization})</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------- BOOKING MODAL ----------------- */}
      {isBookModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  {selectedDoc.Specialization}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Book Slot with {selectedDoc.Name}
                </h3>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {bookingSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{bookingSuccess}</span>
              </div>
            )}

            <form onSubmit={handleBookSubmit} className="mt-4 space-y-4">
              {/* Date Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Consultation Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookDate}
                  onChange={(e) => handleBookDateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {/* Time Slots Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Available Time Slots
                  </label>
                  <span className="text-[11px] text-slate-400">Strict conflict validation</span>
                </div>

                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-xl">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center ${
                        !slot.available
                          ? 'bg-slate-100 text-slate-400 line-through cursor-not-allowed border border-slate-200'
                          : selectedSlot === slot.time
                          ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-600 ring-offset-1'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-teal-50'
                      }`}
                    >
                      {slot.displayTime}
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms / Disease input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Symptoms & Health Concerns
                </label>
                <textarea
                  rows="2"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe what you are experiencing (e.g., chest tightness, joint swelling, skin rash)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Known Medical Condition / Suspected Disease (Optional)
                </label>
                <input
                  type="text"
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  placeholder="e.g. Hypertension, Migraine, Eczema"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading || !selectedSlot}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 disabled:opacity-50"
                >
                  {bookingLoading ? 'Validating...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- RESCHEDULE MODAL ----------------- */}
      {rescheduleModalOpen && appoToReschedule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Reschedule Appointment #{appoToReschedule.Appo_id}
              </h3>
              <button onClick={() => setRescheduleModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rescheduleError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {rescheduleError}
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => handleRescheduleDateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Time Slot</label>
                <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-xl">
                  {newSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setNewSlot(slot.time)}
                      className={`py-2 px-1 rounded-lg text-xs font-bold text-center ${
                        !slot.available
                          ? 'bg-slate-100 text-slate-400 line-through'
                          : newSlot === slot.time
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-teal-50'
                      }`}
                    >
                      {slot.displayTime}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
                >
                  {rescheduleLoading ? 'Updating...' : 'Save Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- PRESCRIPTION & CLINICAL NOTES MODAL ----------------- */}
      {viewPrescriptionModal && activePrescriptionAppo && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Medical Consultation Record #{activePrescriptionAppo.Appo_id}
                </h3>
              </div>
              <button onClick={() => setViewPrescriptionModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="font-semibold text-slate-800">
                  Consulting Doctor: {activePrescriptionAppo.Doctor_name} ({activePrescriptionAppo.Specialization})
                </p>
                <p className="text-slate-500">Date: {activePrescriptionAppo.Appo_date} at {activePrescriptionAppo.Appo_time?.slice(0, 5)}</p>
              </div>

              {activePrescriptionAppo.Disease && (
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Diagnosed Condition:</span>
                  <div className="p-2.5 bg-teal-50/50 border border-teal-100 rounded-xl text-teal-900 font-medium">
                    {activePrescriptionAppo.Disease}
                  </div>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-800 block mb-1">Prescription & Medication:</span>
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-950 font-mono whitespace-pre-wrap">
                  {activePrescriptionAppo.Prescription || 'No medications prescribed.'}
                </div>
              </div>

              {activePrescriptionAppo.Doctor_notes && (
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Doctor Advice / Clinical Notes:</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 whitespace-pre-wrap">
                    {activePrescriptionAppo.Doctor_notes}
                  </div>
                </div>
              )}

              {activePrescriptionAppo.Surgery_decision && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>Surgery Evaluation: {activePrescriptionAppo.Surgery_decision}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewPrescriptionModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
