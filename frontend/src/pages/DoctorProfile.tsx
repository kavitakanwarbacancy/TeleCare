import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  MapPin, 
  Award, 
  Users, 
  Calendar, 
  ChevronLeft, 
  Video, 
  MessageSquare, 
  CheckCircle2,
  Stethoscope,
  Heart
} from 'lucide-react';
import { MOCK_DOCTORS } from '../constants';
import { motion } from 'motion/react';

export const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const doctor = MOCK_DOCTORS.find(d => d.id === id);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);
  const [isBooking, setIsBooking] = React.useState(false);

  if (!doctor) return <div className="p-20 text-center">Doctor not found</div>;

  const handleBook = () => {
    if (!selectedSlot) return;
    setIsBooking(true);
    setTimeout(() => {
      navigate('/patient/appointments');
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto space-y-10"
    >
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-500 transition-colors font-bold group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Results
      </button>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column - Doctor Info */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
              <div className="relative">
                <img 
                  src={doctor.avatar} 
                  alt={doctor.name} 
                  className="w-40 h-40 rounded-[40px] object-cover border-8 border-slate-50 shadow-xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-brand-500 p-3 rounded-2xl shadow-lg shadow-brand-100">
                  <CheckCircle2 className="text-white w-6 h-6" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <h2 className="text-4xl font-bold text-slate-900">{doctor.name}</h2>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-full text-sm font-bold">
                    <Star className="w-4 h-4 fill-amber-500" /> {doctor.rating} ({doctor.reviewsCount} Reviews)
                  </div>
                </div>
                <p className="text-xl font-bold text-brand-600 mb-6">{doctor.specialization}</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 rounded-3xl text-center">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm text-brand-500">
                      <Award className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Experience</p>
                    <p className="text-lg font-bold text-slate-900">{doctor.experience} Years</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-3xl text-center">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm text-brand-500">
                      <Users className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Patients</p>
                    <p className="text-lg font-bold text-slate-900">1.2k+</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-3xl text-center">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm text-brand-500">
                      <Heart className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rating</p>
                    <p className="text-lg font-bold text-slate-900">4.9/5</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
          </div>

          <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">About Doctor</h3>
            <p className="text-lg text-slate-500 leading-relaxed mb-10">
              {doctor.about}
            </p>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Specializations</h3>
            <div className="flex flex-wrap gap-3">
              {['Heart Failure', 'Non-Invasive Cardiology', 'Echocardiography', 'Hypertension'].map(spec => (
                <span key={spec} className="px-6 py-3 bg-slate-50 text-slate-600 font-bold rounded-2xl text-sm">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Booking */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-100 sticky top-28">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Book Appointment</h3>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fee</p>
                <p className="text-2xl font-bold text-brand-600">${doctor.fee}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-500" /> Select Date
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {[15, 16, 17, 18, 19].map(day => (
                    <button 
                      key={day}
                      className={`flex-shrink-0 w-16 h-20 rounded-3xl flex flex-col items-center justify-center transition-all ${
                        day === 15 
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-100' 
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase">Mar</span>
                      <span className="text-xl font-bold">{day}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-500" /> Select Time Slot
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {doctor.availableSlots.map(slot => (
                    <button 
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-4 rounded-2xl text-sm font-bold transition-all border-2 ${
                        selectedSlot === slot 
                          ? 'bg-brand-50 border-brand-500 text-brand-600' 
                          : 'bg-white border-slate-100 text-slate-500 hover:border-brand-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm text-brand-500">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Video Consultation</p>
                    <p className="text-xs text-slate-500">Secure 1-on-1 video call</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-brand-500" />
                </div>

                <button 
                  onClick={handleBook}
                  disabled={!selectedSlot || isBooking}
                  className={`w-full py-5 rounded-[24px] font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${
                    !selectedSlot 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-brand-500 text-white shadow-brand-100 hover:bg-brand-600'
                  }`}
                >
                  {isBooking ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    <>Confirm Booking <CheckCircle2 className="w-5 h-5" /></>
                  )}
                </button>
                <p className="text-center text-xs text-slate-400 font-medium">
                  No payment required now. Pay after consultation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
