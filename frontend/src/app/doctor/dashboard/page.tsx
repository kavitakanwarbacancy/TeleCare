"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Calendar, 
  Clock, 
  Video, 
  MessageSquare, 
  FileText, 
  ArrowRight, 
  TrendingUp, 
  Star, 
  CheckCircle2,
  MoreVertical,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

const StatCard = ({ icon: Icon, label, value, color, trend }: { icon: any, label: string, value: string, color: string, trend?: string }) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
    <div className="flex items-center justify-between mb-6">
      <div className={`w-14 h-14 rounded-[24px] flex items-center justify-center ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-50 px-3 py-1.5 rounded-full">
          <TrendingUp className="w-3 h-3" /> {trend}
        </div>
      )}
    </div>
    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-3xl font-bold text-slate-900">{value}</p>
  </div>
);

const AppointmentRow = ({ patient, time, type, status }: { patient: string, time: string, type: string, status: string }) => (
  <div className="flex items-center justify-between p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center gap-5">
      <div className="relative w-14 h-14">
        <Image 
          src={`https://picsum.photos/seed/${patient}/100/100`} 
          alt={patient} 
          fill
          className="rounded-2xl object-cover border-4 border-slate-50 shadow-sm"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-4 border-white z-10"></div>
      </div>
      <div>
        <h4 className="font-bold text-slate-900">{patient}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Clock className="w-3 h-3" /> {time}
          </span>
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            type === 'Video' ? 'bg-brand-50 text-brand-600' : 'bg-medical-soft text-medical-teal'
          }`}>
            {type}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button className="p-3 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all">
        <MessageSquare className="w-5 h-5" />
      </button>
      <Link 
        href="/doctor/consultation/1"
        className="px-6 py-3 bg-brand-500 text-white text-sm font-bold rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 active:scale-95 flex items-center gap-2"
      >
        <Video className="w-4 h-4" /> Start Call
      </Link>
      <button className="p-3 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  </div>
);

export default function DoctorDashboard() {
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
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, Dr. Johnson! 👋</h2>
          <p className="text-slate-500 font-medium">You have 8 appointments scheduled for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95">
            <Calendar className="w-5 h-5" /> View Schedule
          </button>
          <button className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          icon={Users} 
          label="Total Patients" 
          value="1,248" 
          color="bg-brand-50 text-brand-500" 
          trend="12%"
        />
        <StatCard 
          icon={Calendar} 
          label="Appointments" 
          value="42" 
          color="bg-purple-50 text-purple-500" 
          trend="8%"
        />
        <StatCard 
          icon={Star} 
          label="Avg. Rating" 
          value="4.9" 
          color="bg-amber-50 text-amber-500" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Earnings" 
          value="$8,450" 
          color="bg-green-50 text-green-500" 
          trend="15%"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-bold text-slate-900">Today's Appointments</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mar 12, 2026</span>
              <button className="text-sm font-bold text-brand-600 hover:text-brand-700">View All</button>
            </div>
          </div>
          
          <div className="space-y-4">
            <AppointmentRow patient="John Doe" time="10:30 AM" type="Video" status="Upcoming" />
            <AppointmentRow patient="Emily Smith" time="11:15 AM" type="Chat" status="Upcoming" />
            <AppointmentRow patient="Michael Brown" time="01:30 PM" type="Video" status="Upcoming" />
            <AppointmentRow patient="Sarah Wilson" time="02:45 PM" type="Video" status="Upcoming" />
          </div>
        </div>

        {/* Recent Patients & Activity */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-8">Recent Patients</h3>
            <div className="space-y-8">
              {['David Miller', 'Sophia Garcia', 'James Taylor'].map(name => (
                <div key={name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12">
                      <Image src={`https://picsum.photos/seed/${name}/100/100`} fill className="rounded-2xl object-cover shadow-sm" alt={name} referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{name}</p>
                      <p className="text-xs text-slate-500 font-medium">Last visit: 2 days ago</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
              View All Patients
            </button>
          </div>

          <div className="bg-medical-soft p-8 rounded-[40px] border border-teal-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-medical-teal rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-teal-100">
                <FileText className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Pending Prescriptions</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                You have 3 prescriptions waiting to be finalized from yesterday's consultations.
              </p>
              <button className="px-6 py-3 bg-medical-teal text-white text-sm font-bold rounded-xl hover:bg-teal-600 transition-all shadow-lg shadow-teal-100 active:scale-95">
                Review Now
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
