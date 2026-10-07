import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  ShieldCheck,
  Users,
  Stethoscope,
  Calendar,
  Activity,
  PlusCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Phone,
  Mail,
  Clock,
  MapPin,
  Building,
  KeyRound,
  X,
  Sliders,
  Filter
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'doctors' | 'appointments' | 'patients' | 'security'
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Doctor Filter & CRUD State
  const [selectedSpecFilter, setSelectedSpecFilter] = useState('All');
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: 'Cardiology',
    availability: 'Mon-Fri 09:00-17:00',
    email: '',
    password: '',
    phone: '',
    experience_years: 5,
    room_no: 'Room 101'
  });
  const [doctorModalLoading, setDoctorModalLoading] = useState(false);
  const [doctorModalError, setDoctorModalError] = useState('');

  // Master Appointments Filter & Action State
  const [appoSearch, setAppoSearch] = useState('');
  const [appoStatusFilter, setAppoStatusFilter] = useState('All');
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppoToEdit, setSelectedAppoToEdit] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    new_doc_id: '',
    new_date: '',
    new_time: '10:00',
    status: 'Confirmed'
  });

  // Admin Security Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [selectedSpecFilter]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      let docUrl = '/admin/doctors';
      if (selectedSpecFilter && selectedSpecFilter !== 'All') {
        docUrl += `?specialization=${selectedSpecFilter}`;
      }

      const [statsRes, docRes, appoRes, patRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get(docUrl),
        api.get('/admin/appointments'),
        api.get('/admin/patients')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (docRes.data.success) setDoctors(docRes.data.doctors || []);
      if (appoRes.data.success) setAppointments(appoRes.data.appointments || []);
      if (patRes.data.success) setPatients(patRes.data.patients || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open Doctor Modal (Add or Edit)
  const openDoctorModal = (doc = null) => {
    setDoctorModalError('');
    if (doc) {
      setEditingDoctor(doc);
      setDoctorForm({
        name: doc.Name,
        specialization: doc.Specialization,
        availability: doc.Availability,
        email: doc.Email,
        password: '',
        phone: doc.Phone || '',
        experience_years: doc.Experience_years || 5,
        room_no: doc.Room_no || 'Room 101'
      });
    } else {
      setEditingDoctor(null);
      setDoctorForm({
        name: '',
        specialization: selectedSpecFilter !== 'All' ? selectedSpecFilter : 'Cardiology',
        availability: 'Mon-Fri 09:00-17:00',
        email: '',
        password: '',
        phone: '',
        experience_years: 5,
        room_no: 'Room 101'
      });
    }
    setDoctorModalOpen(true);
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setDoctorModalError('');
    setDoctorModalLoading(true);

    try {
      if (editingDoctor) {
        // Update
        const res = await api.put(`/admin/doctors/${editingDoctor.Doc_id}`, doctorForm);
        if (res.data.success) {
          setDoctorModalOpen(false);
          fetchAdminData();
        }
      } else {
        // Create
        if (!doctorForm.password) {
          setDoctorModalError('Password is required for new doctor account.');
          setDoctorModalLoading(false);
          return;
        }
        const res = await api.post('/admin/doctors', doctorForm);
        if (res.data.success) {
          setDoctorModalOpen(false);
          fetchAdminData();
        }
      }
    } catch (err) {
      setDoctorModalError(err.response?.data?.message || 'Failed to save doctor.');
    } finally {
      setDoctorModalLoading(false);
    }
  };

  const handleDeleteDoctor = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this doctor from faculty? Associated appointments will be handled.')) return;
    try {
      const res = await api.delete(`/admin/doctors/${docId}`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete doctor.');
    }
  };

  // Reschedule / Conflict Resolve
  const openRescheduleModal = (appo) => {
    setSelectedAppoToEdit(appo);
    setRescheduleForm({
      new_doc_id: appo.Doc_id,
      new_date: appo.Appo_date,
      new_time: appo.Appo_time?.slice(0, 5) || '10:00',
      status: appo.Status
    });
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/admin/appointments/${selectedAppoToEdit.Appo_id}/reschedule`, rescheduleForm);
      if (res.data.success) {
        setRescheduleModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Scheduling conflict or update error.');
    }
  };

  const handleAdminCancel = async (appoId) => {
    const reason = window.prompt('Please enter cancellation reason for the patient notification:', 'Administrative Schedule Adjustment');
    if (reason === null) return;

    try {
      const res = await api.put(`/admin/appointments/${appoId}/cancel`, { reason });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  // Change Admin Password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/auth/change-admin-password', {
        currentPassword,
        newPassword
      });

      if (res.data.success) {
        setPasswordMsg({ type: 'success', text: 'Admin password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter((appo) => {
    const matchesStatus = appoStatusFilter === 'All' || appo.Status === appoStatusFilter;
    const matchesSearch = appo.Patient_name?.toLowerCase().includes(appoSearch.toLowerCase()) ||
                          appo.Doctor_name?.toLowerCase().includes(appoSearch.toLowerCase()) ||
                          appo.Specialization?.toLowerCase().includes(appoSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5" /> Hospital Administration & Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Master Console
            </h1>
            <p className="text-xs sm:text-sm text-purple-200">
              Manage clinical departments (Cardiology, Neurology, Orthopedics, Dermatology), resolve scheduling conflicts, monitor KPIs, and oversee hospital accounts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => openDoctorModal()}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Add New Doctor
            </button>
            <button
              onClick={fetchAdminData}
              className="p-2.5 rounded-xl bg-purple-800/80 hover:bg-purple-700/80 text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" /> Reports & Analytics
          </button>

          <button
            onClick={() => setActiveTab('doctors')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'doctors'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Doctor Management ({doctors.length})
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'appointments'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> Master Scheduler ({appointments.length})
          </button>

          <button
            onClick={() => setActiveTab('patients')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'patients'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Patients Directory ({patients.length})
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'security'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" /> Account Security
          </button>
        </div>

        {/* ---------------- TAB 1: REPORTS & ANALYTICS ---------------- */}
        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            {/* Top 3 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Patients</p>
                  <p className="text-3xl font-extrabold text-slate-900">{stats.totalPatients}</p>
                  <p className="text-[11px] text-purple-600 font-medium mt-0.5">Registered Patient Records</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active Doctors</p>
                  <p className="text-3xl font-extrabold text-slate-900">{stats.totalDoctors}</p>
                  <p className="text-[11px] text-teal-600 font-medium mt-0.5">Across 4 Specialties</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Appointments Logged</p>
                  <p className="text-3xl font-extrabold text-slate-900">{stats.totalAppointments}</p>
                  <p className="text-[11px] text-blue-600 font-medium mt-0.5">All-time Hospital Bookings</p>
                </div>
              </div>
            </div>

            {/* Status Breakdown & Department Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" /> Appointment Status Distribution
                </h3>
                <div className="space-y-3">
                  {stats.statusBreakdown?.map((st) => (
                    <div key={st.Status} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{st.Status}</span>
                        <span>{st.count} booking(s)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: `${Math.min(100, (st.count / (stats.totalAppointments || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialization Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Building className="w-5 h-5 text-teal-600" /> Doctors by Department
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {stats.specialtyBreakdown?.map((sp) => (
                    <div key={sp.Specialization} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-bold text-slate-800">{sp.Specialization}</p>
                      <p className="text-xl font-extrabold text-teal-700 mt-1">{sp.count} Specialists</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Recent Appointment Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">ID</th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3">Doctor & Specialty</th>
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentAppointments?.map((appo) => (
                      <tr key={appo.Appo_id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-400">#{appo.Appo_id}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{appo.Patient_name}</td>
                        <td className="py-2.5 px-3 text-slate-700">{appo.Doctor_name} ({appo.Specialization})</td>
                        <td className="py-2.5 px-3 text-slate-500">{appo.Appo_date} at {appo.Appo_time?.slice(0, 5)}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {appo.Status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB 2: DOCTOR MANAGEMENT (DFD 2.1.1, 2.1.2) ---------------- */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            {/* Specialization Filter Pill Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedSpecFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedSpecFilter === cat
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => openDoctorModal()}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-purple-700"
              >
                <PlusCircle className="w-4 h-4" /> Add Doctor
              </button>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div
                  key={doc.Doc_id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                        {doc.Specialization}
                      </span>
                      <span className="text-xs text-slate-400">{doc.Experience_years || 5} Yrs Experience</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{doc.Name}</h3>
                    <p className="text-xs text-slate-500">{doc.Room_no || 'Room 101'}</p>

                    <div className="pt-2 space-y-1.5 text-xs text-slate-600 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="truncate">{doc.Availability}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.Email}</span>
                      </div>
                      {doc.Phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{doc.Phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {doc.total_appointments || 0} appointments
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDoctorModal(doc)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Edit Doctor"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc.Doc_id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                        title="Remove Doctor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- TAB 3: MASTER APPOINTMENTS SCHEDULER ---------------- */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search patient or doctor..."
                    value={appoSearch}
                    onChange={(e) => setAppoSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['All', 'Confirmed', 'Pending', 'Seen', 'Approved for Surgery', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setAppoStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      appoStatusFilter === st
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Patient</th>
                    <th className="py-3 px-3">Assigned Doctor</th>
                    <th className="py-3 px-3">Specialty</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((appo) => (
                    <tr key={appo.Appo_id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">#{appo.Appo_id}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div>{appo.Patient_name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{appo.Patient_phone}</div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{appo.Doctor_name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-purple-50 text-purple-700 font-semibold border border-purple-100">
                          {appo.Specialization}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {appo.Appo_date} at {appo.Appo_time?.slice(0, 5)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                          {appo.Status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => openRescheduleModal(appo)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-xs font-semibold"
                        >
                          Reschedule / Conflict
                        </button>
                        {appo.Status !== 'Cancelled' && (
                          <button
                            onClick={() => handleAdminCancel(appo.Appo_id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- TAB 4: PATIENTS DIRECTORY ---------------- */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Registered Hospital Patients</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-3">Patient ID</th>
                    <th className="py-3 px-3">Full Name</th>
                    <th className="py-3 px-3">Age</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Place & Address</th>
                    <th className="py-3 px-3 text-right">Appointments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((pat) => (
                    <tr key={pat.Patient_id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">#{pat.Patient_id}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{pat.Name}</td>
                      <td className="py-3 px-3 text-slate-600">{pat.Age}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{pat.Phone}</td>
                      <td className="py-3 px-3 text-slate-500">{pat.Email || 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {pat.Place ? `${pat.Place}, ` : ''}{pat.Address || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-purple-700">
                        {pat.total_appointments || 0} visits
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- TAB 5: ADMIN PASSWORD RESET & SECURITY (DFD 2.1.3) ---------------- */}
        {activeTab === 'security' && (
          <div className="max-w-xl bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Administrator Password Management</h3>
                <p className="text-xs text-slate-500">DFD Level 2.1.3 - Secure Admin Credentials Change</p>
              </div>
            </div>

            {passwordMsg.text && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current admin password"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20"
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Admin Credentials'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ---------------- DOCTOR ADD/EDIT MODAL ---------------- */}
      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingDoctor ? `Edit Doctor: ${editingDoctor.Name}` : 'Add New Medical Specialist'}
              </h3>
              <button onClick={() => setDoctorModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {doctorModalError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {doctorModalError}
              </div>
            )}

            <form onSubmit={handleDoctorSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  placeholder="e.g. Dr. Sarah Al-Mansoor"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
                  <select
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Years Experience</label>
                  <input
                    type="number"
                    value={doctorForm.experience_years}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experience_years: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Availability Schedule</label>
                <input
                  type="text"
                  required
                  value={doctorForm.availability}
                  onChange={(e) => setDoctorForm({ ...doctorForm, availability: e.target.value })}
                  placeholder="e.g. Mon-Fri 09:00-15:00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email (Login ID)</label>
                  <input
                    type="email"
                    required
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    placeholder="doctor@hospital.org"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {editingDoctor ? 'New Password (Optional)' : 'Account Password'}
                  </label>
                  <input
                    type="password"
                    required={!editingDoctor}
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                    placeholder={editingDoctor ? 'Leave blank to keep' : 'Min 6 characters'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                    placeholder="+1 (555) 234-5671"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinic Room No</label>
                  <input
                    type="text"
                    value={doctorForm.room_no}
                    onChange={(e) => setDoctorForm({ ...doctorForm, room_no: e.target.value })}
                    placeholder="Cardio Suite A-204"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDoctorModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={doctorModalLoading}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-md shadow-purple-600/20"
                >
                  {doctorModalLoading ? 'Saving...' : editingDoctor ? 'Update Doctor' : 'Create Doctor Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- ADMIN RESCHEDULE / CONFLICT RESOLVE MODAL ---------------- */}
      {rescheduleModalOpen && selectedAppoToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Resolve Schedule & Conflict (Appo #{selectedAppoToEdit.Appo_id})
              </h3>
              <button onClick={() => setRescheduleModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reassign Doctor</label>
                <select
                  value={rescheduleForm.new_doc_id}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, new_doc_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {doctors.map((d) => (
                    <option key={d.Doc_id} value={d.Doc_id}>
                      {d.Name} ({d.Specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appointment Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleForm.new_date}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, new_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appointment Time</label>
                <input
                  type="time"
                  required
                  value={rescheduleForm.new_time}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, new_time: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Booking Status</label>
                <select
                  value={rescheduleForm.status}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Seen">Seen</option>
                  <option value="Approved for Surgery">Approved for Surgery</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-md shadow-purple-600/20"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
