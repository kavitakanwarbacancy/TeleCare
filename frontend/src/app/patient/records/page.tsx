"use client";

import React from 'react';
import { FileText, Download, Search, Filter, Calendar, User, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { MOCK_RECORDS } from '@/constants';
import { motion } from 'motion/react';

const RecordCard = ({ record }: any) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-start justify-between mb-8">
      <div className="w-16 h-16 bg-brand-50 rounded-[24px] flex items-center justify-center group-hover:bg-brand-500 transition-colors duration-300">
        <FileText className="w-8 h-8 text-brand-500 group-hover:text-white transition-colors duration-300" />
      </div>
      <button className="p-3 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded-2xl transition-all">
        <Download className="w-6 h-6" />
      </button>
    </div>
    
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
        <Calendar className="w-3 h-3" /> {record.date}
      </div>
      <h4 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{record.diagnosis}</h4>
      <div className="flex items-center gap-3 py-4 border-y border-slate-50">
        <img src={`https://picsum.photos/seed/${record.doctorName}/100/100`} className="w-10 h-10 rounded-xl object-cover" alt="Doctor" referrerPolicy="no-referrer" />
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Doctor</p>
          <p className="text-sm font-bold text-slate-900">{record.doctorName}</p>
        </div>
      </div>
      <div className="pt-4">
        <button className="w-full py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group">
          View Full Report <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  </div>
);

export default function MedicalRecords() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="w-full lg:w-1/2 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search records, prescriptions, or doctors..." 
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[24px] focus:border-brand-500 outline-none transition-all font-medium text-lg shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none px-8 py-5 bg-white border border-slate-200 text-slate-600 font-bold rounded-[24px] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95">
            <Filter className="w-5 h-5" /> Filter
          </button>
          <button className="flex-1 lg:flex-none px-8 py-5 bg-brand-500 text-white font-bold rounded-[24px] hover:bg-brand-600 transition-all shadow-xl shadow-brand-100 flex items-center justify-center gap-3 active:scale-95">
            <Download className="w-5 h-5" /> Export All
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
        {['All Records', 'Prescriptions', 'Lab Reports', 'Scans', 'Consultations'].map((cat, i) => (
          <button
            key={cat}
            className={`px-8 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              i === 0 
                ? 'bg-slate-900 text-white shadow-xl' 
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Records Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-10">
        {MOCK_RECORDS.map(record => (
          <RecordCard key={record.id} record={record} />
        ))}
        {/* Placeholder for more records */}
        <RecordCard record={{ id: 'r2', date: '2026-02-15', doctorName: 'Dr. Sarah Johnson', diagnosis: 'Annual Checkup' }} />
        <RecordCard record={{ id: 'r3', date: '2026-01-20', doctorName: 'Dr. Emily White', diagnosis: 'Flu Vaccination' }} />
      </div>

      {/* Prescription Viewer Section (Example) */}
      <div className="bg-white p-10 lg:p-16 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-brand-500 rounded-[32px] flex items-center justify-center shadow-xl shadow-brand-100">
                <FileText className="text-white w-10 h-10" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900">Latest Prescription</h3>
                <p className="text-slate-500 font-medium">From your consultation on March 10, 2026</p>
              </div>
            </div>
            <button className="px-10 py-5 bg-slate-900 text-white font-bold rounded-[24px] hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xl active:scale-95">
              <Download className="w-5 h-5" /> Download PDF
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Medicines</h4>
                <div className="space-y-6">
                  {[
                    { name: 'Hydrocortisone Cream', dosage: 'Apply twice daily', duration: '7 days' },
                    { name: 'Cetirizine 10mg', dosage: '1 tablet daily', duration: '10 days' }
                  ].map(med => (
                    <div key={med.name} className="flex items-start gap-4">
                      <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle2 className="text-white w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{med.name}</p>
                        <p className="text-sm text-slate-500">{med.dosage} • {med.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Doctor's Notes</h4>
                <p className="text-slate-600 leading-relaxed font-medium italic">
                  "Avoid harsh soaps and keep skin moisturized. Follow up if symptoms persist after 7 days. Ensure you complete the full course of Cetirizine even if itching stops."
                </p>
              </div>
              <div className="flex items-center gap-4 p-6 bg-brand-50 rounded-[32px] border border-brand-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-500 shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Follow-up Appointment</p>
                  <p className="text-xs text-brand-600 font-bold uppercase tracking-wider">Scheduled for Mar 20, 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-medical-soft rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-0"></div>
      </div>
    </motion.div>
  );
}
