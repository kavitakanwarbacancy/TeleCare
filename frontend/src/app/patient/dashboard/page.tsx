"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Video, 
  MessageSquare, 
  FileText, 
  ArrowRight, 
  Clock, 
  User, 
  Plus,
  ChevronRight,
  Activity,
  Heart,
  Thermometer,
  Search
} from 'lucide-react';
import { MOCK_APPOINTMENTS, MOCK_RECORDS } from '@/constants';
import { motion } from 'motion/react';

const StatCard = ({ icon: Icon, label, value, color, trend }: { icon: any, label: string, value: string, color: string, trend?: string }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const AppointmentCard = ({ appointment }: any) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-500 transition-colors">
        <Video className="w-7 h-7 text-brand-500 group-hover:text-white transition-colors" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900">{appointment.doctorName}</h4>
        <p className="text-sm text-slate-500">{appointment.doctorSpecialization}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
            <Calendar className="w-3 h-3" /> {appointment.date}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
            <Clock className="w-3 h-3" /> {appointment.time}
          </span>
        </div>
      </div>
    </div>
    <Link 
      href={`/patient/consultation/${appointment.id}`}
      className="px-6 py-3 bg-brand-500 text-white text-sm font-bold rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 active:scale-95"
    >
      Join Call
    </Link>
  </div>
);

export default function PatientDashboard() {
  const upcomingAppointments = MOCK_APPOINTMENTS.filter(a => a.status === 'upcoming');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Hello, John Doe 👋</h2>
          <p className="text-slate-500 font-medium">How are you feeling today? Here's your health summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/patient/doctors" className="px-6 py-4 bg-brand-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-100 hover:bg-brand-600 transition-all flex items-center gap-2 group active:scale-95">
            <Plus className="w-5 h-5" /> Book Appointment
          </Link>
          <button className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all">
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Heart} 
          label="Heart Rate" 
          value="72 bpm" 
          color="bg-red-50 text-red-500" 
          trend="+2% normal"
        />
        <StatCard 
          icon={Activity} 
          label="Blood Pressure" 
          value="120/80" 
          color="bg-blue-50 text-blue-500" 
          trend="Stable"
        />
        <StatCard 
          icon={Thermometer} 
          label="Temperature" 
          value="36.6 °C" 
          color="bg-orange-50 text-orange-500" 
        />
        <StatCard 
          icon={Calendar} 
          label="Next Appointment" 
          value="Mar 15, 2026" 
          color="bg-brand-50 text-brand-500" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900">Upcoming Appointments</h3>
            <Link href="/patient/appointments" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group">
              View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(app => (
                <AppointmentCard key={app.id} appointment={app} />
              ))
            ) : (
              <div className="p-10 bg-white rounded-[32px] border border-dashed border-slate-200 text-center">
                <p className="text-slate-400 font-medium">No upcoming appointments found.</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-4">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/patient/doctors" className="p-6 bg-brand-50 rounded-3xl border border-brand-100 hover:bg-brand-100 transition-all group">
                <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-100">
                  <Search className="text-white w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Find a Specialist</h4>
                <p className="text-sm text-slate-500">Search for top-rated doctors near you.</p>
              </Link>
              <Link href="/patient/records" className="p-6 bg-medical-soft rounded-3xl border border-teal-100 hover:bg-teal-50 transition-all group">
                <div className="w-12 h-12 bg-medical-teal rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-teal-100">
                  <FileText className="text-white w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Medical Records</h4>
                <p className="text-sm text-slate-500">Access your prescriptions and reports.</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Consultations & Records */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Records</h3>
            <div className="space-y-6">
              {MOCK_RECORDS.map(record => (
                <div key={record.id} className="flex items-start gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                    <FileText className="w-6 h-6 text-slate-400 group-hover:text-brand-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">{record.diagnosis}</h4>
                    <p className="text-xs text-slate-500">{record.doctorName} • {record.date}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all mt-1" />
                </div>
              ))}
            </div>
            <Link href="/patient/records" className="w-full mt-8 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
              View All Records
            </Link>
          </div>

          <div className="bg-brand-600 p-8 rounded-[32px] text-white relative overflow-hidden shadow-xl shadow-brand-100">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-3">Health Tip of the Day</h3>
              <p className="text-brand-100 text-sm leading-relaxed mb-6">
                Drinking at least 8 glasses of water daily helps maintain energy levels and improves skin health.
              </p>
              <button className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-white transition-colors">
                Read More
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
