"use client";

import React from 'react';
import Image from 'next/image';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Bell, 
  CreditCard,
  Edit,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';

export default function PatientProfile() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-10"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">My Profile</h2>
        <button className="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all flex items-center gap-2 active:scale-95">
          <Edit className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center relative group">
            <div className="relative inline-block w-32 h-32">
              <Image 
                src="https://picsum.photos/seed/user/200/200" 
                alt="Profile" 
                fill
                className="rounded-[40px] object-cover border-4 border-white shadow-xl"
                referrerPolicy="no-referrer"
              />
              <button className="absolute bottom-0 right-0 p-2 bg-brand-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-6">John Doe</h3>
            <p className="text-slate-500 font-medium">Patient ID: #P-12345</p>
            
            <div className="mt-8 pt-8 border-t border-slate-50 flex justify-around">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">12</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Visits</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">A+</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Blood</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">72kg</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Weight</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 px-2">Quick Settings</h4>
            <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Bell className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-700">Notifications</span>
              </div>
              <div className="w-10 h-5 bg-brand-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-500 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-700">Security</span>
              </div>
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { icon: User, label: "Full Name", value: "John Doe" },
                { icon: Mail, label: "Email Address", value: "john.doe@example.com" },
                { icon: Phone, label: "Phone Number", value: "+1 (234) 567-8901" },
                { icon: Calendar, label: "Date of Birth", value: "May 15, 1990" },
                { icon: MapPin, label: "Address", value: "123 Medical St, Health City, HC 12345" },
                { icon: CreditCard, label: "Insurance ID", value: "POL-987654321" },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </div>
                  <p className="text-sm font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Medical History Summary</h3>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">
                Known allergies to Penicillin. History of mild hypertension managed with lifestyle changes. No major surgeries in the last 5 years. Regular blood donor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
