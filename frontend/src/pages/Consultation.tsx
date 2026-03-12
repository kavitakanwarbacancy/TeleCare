import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  FileText, 
  MoreVertical, 
  Send, 
  Paperclip, 
  User, 
  X,
  Maximize2,
  Minimize2,
  ChevronRight,
  Plus
} from 'lucide-react';
import { MOCK_APPOINTMENTS } from '../constants';
import { motion } from 'motion/react';

export const Consultation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const appointment = MOCK_APPOINTMENTS.find(a => a.id === id);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(true);
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([
    { id: 1, sender: 'doctor', text: 'Hello John, how are you feeling today?', time: '10:30 AM' },
    { id: 2, sender: 'patient', text: 'Hi doctor, I have been feeling a bit dizzy lately.', time: '10:31 AM' },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'patient', text: message, time: '10:32 AM' }]);
    setMessage('');
  };

  const handleEndCall = () => {
    navigate(-1);
  };

  const [showPrescriptionModal, setShowPrescriptionModal] = React.useState(false);
  const [showUploadModal, setShowUploadModal] = React.useState(false);

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col lg:flex-row overflow-hidden">
      {/* Main Video Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Header Overlay */}
        <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Video className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{appointment?.doctorName || 'Dr. Sarah Johnson'}</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-white/70 text-sm font-medium">12:45 • Live</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <button 
              onClick={() => setShowPrescriptionModal(true)}
              className="px-4 py-2 bg-brand-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Prescription
            </button>
            <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">
              <Maximize2 className="w-5 h-5" />
            </button>
            <button 
              className="lg:hidden p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Feeds */}
        <div className="flex-1 relative bg-slate-800 flex items-center justify-center">
          {/* Remote Feed (Doctor) */}
          <div className="w-full h-full relative overflow-hidden">
            <img 
              src="https://picsum.photos/seed/doctor-video/1920/1080" 
              alt="Doctor Feed" 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <User className="text-white/30 w-16 h-16" />
                </div>
                <p className="text-white/50 font-medium">Connecting audio...</p>
              </div>
            </div>
          </div>

          {/* Local Feed (Patient) */}
          <div className="absolute bottom-24 lg:bottom-10 right-10 w-48 h-64 lg:w-64 lg:h-48 bg-slate-700 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 z-10">
            {isVideoOff ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <VideoOff className="text-slate-600 w-10 h-10" />
              </div>
            ) : (
              <img 
                src="https://picsum.photos/seed/patient-video/400/300" 
                alt="Patient Feed" 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] text-white font-bold uppercase tracking-wider">
              You
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="h-24 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-4 lg:gap-8 px-6 z-20">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-2xl transition-all active:scale-95 ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-2xl transition-all active:scale-95 ${isVideoOff ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all active:scale-95"
            title="Upload Medical Reports"
          >
            <Paperclip className="w-6 h-6" />
          </button>
          <button 
            onClick={handleEndCall}
            className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 active:scale-95 flex items-center gap-3 px-8"
          >
            <PhoneOff className="w-6 h-6" />
            <span className="font-bold hidden sm:block">End Call</span>
          </button>
          <button className="p-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all active:scale-95">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chat & Info Panel */}
      {isChatOpen && (
        <motion.aside 
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          className="w-full lg:w-[400px] bg-white flex flex-col shadow-2xl z-30"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Consultation Chat</h3>
            </div>
            <button 
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              onClick={() => setIsChatOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${
                  msg.sender === 'patient' 
                    ? 'bg-brand-500 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Patient Info Panel (Collapsible) */}
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Patient Info</h4>
              <button className="text-xs font-bold text-brand-600 hover:text-brand-700">View History</button>
            </div>
            <div className="flex items-center gap-4">
              <img src="https://picsum.photos/seed/user/100/100" className="w-12 h-12 rounded-2xl object-cover" alt="Patient" />
              <div>
                <p className="text-sm font-bold text-slate-900">John Doe</p>
                <p className="text-xs text-slate-500">Age: 28 • Male • O+</p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-slate-100">
            <form onSubmit={handleSendMessage} className="relative group">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="w-full pl-6 pr-14 py-4 bg-slate-100 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-500 outline-none transition-all font-medium text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.aside>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPrescriptionModal(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-brand-500 text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6" />
                <h3 className="text-xl font-bold">Digital Prescription</h3>
              </div>
              <button onClick={() => setShowPrescriptionModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Name</p>
                  <p className="font-bold text-slate-900">John Doe</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</p>
                  <p className="font-bold text-slate-900">Mar 12, 2024</p>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Medicines</h4>
                {[1, 2].map((_, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="Medicine name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500" />
                      <div className="flex gap-2">
                        <input type="text" placeholder="Dosage (e.g. 1-0-1)" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500" />
                        <input type="text" placeholder="Duration" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500" />
                      </div>
                    </div>
                    <button className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                  </div>
                ))}
                <button className="text-brand-600 font-bold text-sm flex items-center gap-2 hover:text-brand-700 transition-all">
                  <Plus className="w-4 h-4" /> Add Medicine
                </button>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Additional Advice</h4>
                <textarea placeholder="Type your advice here..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 h-32 resize-none"></textarea>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
              <button onClick={() => setShowPrescriptionModal(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
              <button onClick={() => setShowPrescriptionModal(false)} className="flex-1 py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100">Save & Send</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upload Reports Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Upload Reports</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-4 hover:border-brand-500 hover:bg-brand-50/50 transition-all cursor-pointer">
                <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Paperclip className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-500 font-medium">PDF, JPG, or PNG (Max 10MB)</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Files</h4>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-brand-500" />
                    <span className="text-sm font-bold text-slate-700">Blood_Report_Feb.pdf</span>
                  </div>
                  <button className="text-red-500"><X className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
              <button onClick={() => setShowUploadModal(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
              <button onClick={() => setShowUploadModal(false)} className="flex-1 py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100">Upload & Share</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
