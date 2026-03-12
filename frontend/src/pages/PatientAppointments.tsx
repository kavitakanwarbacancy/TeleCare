import React from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const MOCK_PATIENT_APPOINTMENTS = [
  { id: '1', doctor: 'Dr. Sarah Johnson', specialty: 'Cardiologist', date: 'Mar 15, 2024', time: '10:00 AM', status: 'Upcoming', type: 'Video Consultation', avatar: 'https://picsum.photos/seed/doctor1/100/100' },
  { id: '2', doctor: 'Dr. Michael Chen', specialty: 'Dermatologist', date: 'Mar 12, 2024', time: '11:30 AM', status: 'Completed', type: 'Video Consultation', avatar: 'https://picsum.photos/seed/doctor2/100/100' },
  { id: '3', doctor: 'Dr. Emily White', specialty: 'Pediatrician', date: 'Mar 08, 2024', time: '02:00 PM', status: 'Cancelled', type: 'Video Consultation', avatar: 'https://picsum.photos/seed/doctor3/100/100' },
];

export const PatientAppointments = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">My Appointments</h2>
          <p className="text-slate-500 font-medium">Keep track of your upcoming and past consultations.</p>
        </div>
        <button 
          onClick={() => navigate('/patient/doctors')}
          className="px-6 py-4 bg-brand-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-100 hover:bg-brand-600 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Book New Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        {['Upcoming', 'Past', 'Cancelled'].map((tab, i) => (
          <button 
            key={tab}
            className={`pb-4 text-sm font-bold transition-all relative ${
              i === 0 ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
            {i === 0 && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="grid gap-6">
        {MOCK_PATIENT_APPOINTMENTS.map((appt) => (
          <div 
            key={appt.id}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
          >
            <div className="flex items-center gap-5">
              <img src={appt.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-sm" alt={appt.doctor} />
              <div>
                <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{appt.doctor}</h4>
                <p className="text-sm font-medium text-slate-500 mb-2">{appt.specialty}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full w-fit">
                  <Video className="w-3.5 h-3.5" /> {appt.type}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 md:gap-12">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" /> Date
                </div>
                <p className="text-sm font-bold text-slate-700">{appt.date}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" /> Time
                </div>
                <p className="text-sm font-bold text-slate-700">{appt.time}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Status
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                  appt.status === 'Upcoming' ? 'text-blue-500' :
                  appt.status === 'Completed' ? 'text-green-500' :
                  'text-red-500'
                }`}>
                  {appt.status === 'Upcoming' ? <AlertCircle className="w-4 h-4" /> :
                   appt.status === 'Completed' ? <CheckCircle2 className="w-4 h-4" /> :
                   <XCircle className="w-4 h-4" />}
                  {appt.status}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {appt.status === 'Upcoming' && (
                <button 
                  onClick={() => navigate('/consultation')}
                  className="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 active:scale-95"
                >
                  Join Consultation
                </button>
              )}
              <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
