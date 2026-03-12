import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Clock, MapPin, ArrowRight, ChevronRight } from 'lucide-react';
import { MOCK_DOCTORS } from '../constants';
import { motion } from 'motion/react';

const DoctorCard = ({ doctor }: any) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-start gap-6 mb-6">
      <div className="relative">
        <img 
          src={doctor.avatar} 
          alt={doctor.name} 
          className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-md"
        />
        <div className="absolute -bottom-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-4 border-white shadow-sm"></div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{doctor.name}</h4>
          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-full text-xs font-bold">
            <Star className="w-3 h-3 fill-amber-500" /> {doctor.rating}
          </div>
        </div>
        <p className="text-sm font-semibold text-brand-600 mb-2">{doctor.specialization}</p>
        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doctor.experience} Years Exp.</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Online</span>
        </div>
      </div>
    </div>
    
    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Consultation Fee</p>
        <p className="text-xl font-bold text-slate-900">${doctor.fee}</p>
      </div>
      <Link 
        to={`/patient/doctors/${doctor.id}`}
        className="px-6 py-3 bg-brand-500 text-white text-sm font-bold rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 active:scale-95 flex items-center gap-2 group"
      >
        View Profile <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </div>
);

export const DoctorDiscovery = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSpecialty, setSelectedSpecialty] = React.useState('All');

  const specialties = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'General Physician'];

  const filteredDoctors = MOCK_DOCTORS.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialization === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      {/* Search & Filter Header */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by doctor name or specialization..." 
              className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-brand-500 outline-none transition-all font-medium text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="w-full lg:w-auto px-8 py-5 bg-slate-900 text-white font-bold rounded-[24px] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95">
            <Filter className="w-5 h-5" /> Filter Results
          </button>
        </div>

        <div className="flex items-center gap-3 mt-8 overflow-x-auto pb-2 no-scrollbar">
          {specialties.map(specialty => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                selectedSpecialty === specialty 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-100' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-bold text-slate-900">
            {filteredDoctors.length} Specialists Found
          </h3>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            Sort by: <span className="text-slate-900 cursor-pointer hover:text-brand-500">Popularity</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredDoctors.map(doctor => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="p-20 bg-white rounded-[40px] border border-dashed border-slate-200 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">No doctors found</h4>
            <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
