import React from 'react';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, MoreVertical, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const TimeSlot = ({ time, status, patient }: { time: string, status: 'available' | 'booked' | 'blocked', patient?: string }) => (
  <div className={`p-6 rounded-[32px] border transition-all flex items-center justify-between group ${
    status === 'booked' 
      ? 'bg-white border-slate-100 shadow-sm' 
      : status === 'blocked'
      ? 'bg-slate-50 border-transparent opacity-60'
      : 'bg-brand-50 border-brand-100 border-dashed hover:bg-brand-100 cursor-pointer'
  }`}>
    <div className="flex items-center gap-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm ${
        status === 'booked' ? 'bg-brand-50 text-brand-600' : 'bg-white text-slate-400'
      }`}>
        {time}
      </div>
      <div>
        {status === 'booked' ? (
          <>
            <h4 className="font-bold text-slate-900">{patient}</h4>
            <p className="text-xs text-slate-500 font-medium">Video Consultation • 30 mins</p>
          </>
        ) : (
          <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs">
            {status === 'available' ? 'Available Slot' : 'Blocked'}
          </h4>
        )}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {status === 'booked' ? (
        <button className="p-3 text-slate-400 hover:text-brand-500 rounded-xl transition-all">
          <MoreVertical className="w-5 h-5" />
        </button>
      ) : status === 'available' ? (
        <button className="p-3 text-brand-500 hover:bg-white rounded-xl transition-all">
          <Plus className="w-5 h-5" />
        </button>
      ) : null}
    </div>
  </div>
);

export const DoctorSchedule = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Calendar Sidebar */}
        <div className="lg:w-80 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">March 2026</h3>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-brand-500 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                <button className="p-2 text-slate-400 hover:text-brand-500 transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <span key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <button 
                  key={day}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    day === 12 
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-100' 
                      : day === 15 || day === 18
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4">Schedule Stats</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm font-medium">Monthly Appointments</span>
                  <span className="font-bold">124</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm font-medium">Avg. Daily Hours</span>
                  <span className="font-bold">6.5h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm font-medium">Cancellation Rate</span>
                  <span className="font-bold text-green-400">2.4%</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Daily Slots */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Thursday, March 12</h3>
              <p className="text-slate-500 font-medium">You have 8 slots today (4 booked, 2 available, 2 blocked)</p>
            </div>
            <button className="px-6 py-4 bg-brand-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-100 hover:bg-brand-600 transition-all flex items-center gap-2 active:scale-95">
              <Plus className="w-5 h-5" /> Add New Slot
            </button>
          </div>

          <div className="space-y-4">
            <TimeSlot time="09:00 AM" status="booked" patient="John Doe" />
            <TimeSlot time="09:30 AM" status="booked" patient="Emily Smith" />
            <TimeSlot time="10:00 AM" status="available" />
            <TimeSlot time="10:30 AM" status="blocked" />
            <TimeSlot time="11:00 AM" status="booked" patient="Michael Brown" />
            <TimeSlot time="11:30 AM" status="available" />
            <TimeSlot time="12:00 PM" status="blocked" />
            <TimeSlot time="01:30 PM" status="booked" patient="Sarah Wilson" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
