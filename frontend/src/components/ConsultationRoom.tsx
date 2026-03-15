"use client";

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  FileText, 
  Send, 
  Paperclip, 
  User, 
  X,
  Maximize2,
  Minimize2,
  Plus,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { videoApi, filesApi, VideoInfoResponse, Message, FileRecord } from '@/services/api';
import { consultationSocket } from '@/services/socket';

interface ParticipantVideo {
  sessionId: string;
  userName: string;
  isLocal: boolean;
  videoTrack: MediaStreamTrack | null;
  audioTrack: MediaStreamTrack | null;
}

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'left';

export default function ConsultationRoom() {
  const params = useParams();
  const appointmentId = params?.id as string;
  const router = useRouter();

  // Video state
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState<ParticipantVideo[]>([]);
  const callObjectRef = useRef<DailyCall | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Appointment info
  const [appointmentInfo, setAppointmentInfo] = useState<VideoInfoResponse | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modal state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [sharedFiles, setSharedFiles] = useState<FileRecord[]>([]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (connectionState === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [connectionState]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize socket and fetch appointment info
  useEffect(() => {
    if (!appointmentId) return;

    // Clear previous state when appointment changes
    setMessages([]);
    setSharedFiles([]);
    setAppointmentInfo(null);
    setConnectionState('idle');
    setError(null);

    const initializeConsultation = async () => {
      try {
        // Fetch appointment info
        const info = await videoApi.getInfo(appointmentId);
        setAppointmentInfo(info);

        // Initialize socket
        consultationSocket.connect();
        consultationSocket.setListeners({
          onJoined: (data) => {
            setMessages(data.messages);
          },
          onMessage: (msg) => {
            setMessages(prev => [...prev, msg]);
          },
          onUserTyping: (data) => {
            setRemoteTyping(data.isTyping);
          },
          onParticipantJoined: () => {
            // Remote participant joined
          },
          onParticipantLeft: () => {
            // Remote participant left
          },
          onFileUploaded: (data) => {
            const newFile = data.file as FileRecord;
            setSharedFiles(prev => {
              if (prev.some(f => f.id === newFile.id)) return prev;
              return [newFile, ...prev];
            });
          },
          onError: (err) => {
            console.error('Socket error:', err);
          },
        });
        consultationSocket.joinConsultation(appointmentId);

        // Load existing files
        const existingFiles = await filesApi.getByAppointment(appointmentId);
        setSharedFiles(existingFiles);
      } catch (err) {
        console.error('Failed to initialize consultation:', err);
        setError('Failed to load consultation details');
      }
    };

    initializeConsultation();

    return () => {
      consultationSocket.disconnect();
    };
  }, [appointmentId]);

  // Initialize video call
  const initializeVideoCall = useCallback(async () => {
    if (!appointmentId || connectionState !== 'idle') return;

    setConnectionState('connecting');
    setError(null);

    try {
      // Create room if needed
      await videoApi.createRoom(appointmentId);

      // Get token
      const { token, roomUrl } = await videoApi.getToken(appointmentId);

      // Create Daily call object
      const callObject = DailyIframe.createCallObject({
        videoSource: true,
        audioSource: true,
      });

      callObjectRef.current = callObject;

      // Set up event listeners
      callObject.on('joined-meeting', () => {
        setConnectionState('connected');
        consultationSocket.notifyCallStarted();
        videoApi.startSession(appointmentId);
        updateParticipants(callObject);
      });

      callObject.on('left-meeting', () => {
        setConnectionState('left');
        consultationSocket.notifyCallEnded();
      });

      callObject.on('participant-joined', () => {
        updateParticipants(callObject);
      });

      callObject.on('participant-left', () => {
        updateParticipants(callObject);
      });

      callObject.on('participant-updated', () => {
        updateParticipants(callObject);
      });

      callObject.on('track-started', (event) => {
        if (event.participant) {
          updateVideoElements(callObject);
        }
      });

      callObject.on('track-stopped', () => {
        updateVideoElements(callObject);
      });

      callObject.on('error', (event) => {
        console.error('Daily error:', event);
        setError('Video call error occurred');
        setConnectionState('error');
      });

      // Join the call
      await callObject.join({ url: roomUrl, token });
    } catch (err) {
      console.error('Failed to join video call:', err);
      setError('Failed to join video call. Please check your camera and microphone permissions.');
      setConnectionState('error');
    }
  }, [appointmentId, connectionState]);

  // Update participants list
  const updateParticipants = (callObject: DailyCall) => {
    const participantsObj = callObject.participants();
    const participantsList: ParticipantVideo[] = [];

    Object.values(participantsObj).forEach((p) => {
      participantsList.push({
        sessionId: p.session_id,
        userName: p.user_name || 'Unknown',
        isLocal: p.local,
        videoTrack: p.tracks.video?.persistentTrack || null,
        audioTrack: p.tracks.audio?.persistentTrack || null,
      });
    });

    setParticipants(participantsList);
    updateVideoElements(callObject);
  };

  // Update video elements with tracks
  const updateVideoElements = (callObject: DailyCall) => {
    const participantsObj = callObject.participants();

    Object.values(participantsObj).forEach((p) => {
      const videoTrack = p.tracks.video?.persistentTrack;
      const audioTrack = p.tracks.audio?.persistentTrack;

      if (p.local && localVideoRef.current && videoTrack) {
        const stream = new MediaStream([videoTrack]);
        if (localVideoRef.current.srcObject !== stream) {
          localVideoRef.current.srcObject = stream;
        }
      } else if (!p.local) {
        // Handle remote video
        if (remoteVideoRef.current && videoTrack) {
          const stream = new MediaStream([videoTrack]);
          if (remoteVideoRef.current.srcObject !== stream) {
            remoteVideoRef.current.srcObject = stream;
          }
        }
        // Handle remote audio
        if (remoteAudioRef.current && audioTrack) {
          const audioEl = remoteAudioRef.current;
          const currentStream = audioEl.srcObject as MediaStream | null;
          const currentTrackId = currentStream?.getAudioTracks()[0]?.id;
          
          if (currentTrackId !== audioTrack.id) {
            const stream = new MediaStream([audioTrack]);
            audioEl.srcObject = stream;
            audioEl.play().catch((e) => {
              console.log('Audio autoplay blocked, will play on user interaction');
            });
          }
        }
      }
    });
  };

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (callObjectRef.current) {
      callObjectRef.current.setLocalAudio(isMuted);
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (callObjectRef.current) {
      callObjectRef.current.setLocalVideo(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  }, [isVideoOff]);

  // Leave call
  const leaveCall = useCallback(async () => {
    if (callObjectRef.current) {
      await callObjectRef.current.leave();
      callObjectRef.current.destroy();
      callObjectRef.current = null;
    }
    
    if (appointmentInfo?.isDoctor) {
      await videoApi.endSession(appointmentId);
    }

    router.push(appointmentInfo?.isDoctor ? '/doctor/appointments' : '/patient/appointments');
  }, [appointmentId, appointmentInfo?.isDoctor, router]);

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    consultationSocket.sendMessage(message.trim());
    setMessage('');
    consultationSocket.setTyping(false);
    setIsTyping(false);
  };

  // Handle typing
  const handleTyping = (value: string) => {
    setMessage(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      consultationSocket.setTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      consultationSocket.setTyping(false);
    }, 2000);
  };

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.leave();
        callObjectRef.current.destroy();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const remoteParticipant = participants.find(p => !p.isLocal);
  const localParticipant = participants.find(p => p.isLocal);

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
              <h3 className="text-white font-bold text-lg">
                {appointmentInfo?.isPatient 
                  ? appointmentInfo.doctor.name 
                  : appointmentInfo?.patient.name || 'Loading...'}
              </h3>
              <div className="flex items-center gap-2">
                {connectionState === 'connected' && (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-white/70 text-sm font-medium">
                      {formatDuration(callDuration)} • Live
                    </span>
                  </>
                )}
                {connectionState === 'connecting' && (
                  <span className="text-white/70 text-sm font-medium">Connecting...</span>
                )}
                {connectionState === 'idle' && (
                  <span className="text-white/70 text-sm font-medium">Ready to start</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            {appointmentInfo?.isDoctor && (
              <button 
                onClick={() => setShowPrescriptionModal(true)}
                className="px-4 py-2 bg-brand-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Prescription
              </button>
            )}
            <button 
              onClick={toggleFullscreen}
              className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
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
          {/* Connection State Overlay */}
          {connectionState === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center space-y-6">
                <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto border border-white/20">
                  <Video className="text-white/50 w-16 h-16" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl mb-2">Ready to Start Consultation</p>
                  <p className="text-white/50 mb-6">Click below to join the video call</p>
                  <button
                    onClick={initializeVideoCall}
                    className="px-8 py-4 bg-brand-500 text-white rounded-2xl font-bold text-lg hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30"
                  >
                    Join Video Call
                  </button>
                </div>
              </div>
            </div>
          )}

          {connectionState === 'connecting' && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center space-y-4">
                <Loader2 className="w-16 h-16 text-brand-500 animate-spin mx-auto" />
                <p className="text-white font-medium">Connecting to video call...</p>
              </div>
            </div>
          )}

          {connectionState === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center space-y-4 max-w-md px-4">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                <p className="text-white font-bold text-xl">Connection Error</p>
                <p className="text-white/60">{error}</p>
                <button
                  onClick={() => {
                    setConnectionState('idle');
                    setError(null);
                  }}
                  className="px-6 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Remote Feed - Only show when connected */}
          {connectionState === 'connected' && (
            <div className="w-full h-full relative overflow-hidden">
              {remoteParticipant ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                      <User className="text-white/30 w-16 h-16" />
                    </div>
                    <p className="text-white/50 font-medium">Waiting for other participant...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Local Feed (Picture-in-Picture) - Only show when connected */}
          {connectionState === 'connected' && (
            <div className="absolute bottom-24 lg:bottom-10 right-10 w-48 h-64 lg:w-64 lg:h-48 bg-slate-700 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 z-10">
              {isVideoOff || !localParticipant ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <VideoOff className="text-slate-600 w-10 h-10" />
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                />
              )}
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] text-white font-bold uppercase tracking-wider">
                You
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="h-24 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-4 lg:gap-8 px-6 z-20">
          <button 
            onClick={toggleMute}
            disabled={connectionState !== 'connected'}
            className={`p-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isMuted 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button 
            onClick={toggleVideo}
            disabled={connectionState !== 'connected'}
            className={`p-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isVideoOff 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
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
            onClick={leaveCall}
            className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 active:scale-95 flex items-center gap-3 px-8"
          >
            <PhoneOff className="w-6 h-6" />
            <span className="font-bold hidden sm:block">End Call</span>
          </button>
        </div>
      </div>

      {/* Chat & Info Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.aside 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
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
              {messages.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isOwnMessage = msg.sender.role === (appointmentInfo?.isDoctor ? 'DOCTOR' : 'PATIENT');
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${
                        isOwnMessage 
                          ? 'bg-brand-500 text-white rounded-tr-none' 
                          : 'bg-slate-100 text-slate-700 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              {remoteTyping && (
                <div className="flex items-start">
                  <div className="bg-slate-100 text-slate-500 p-4 rounded-3xl rounded-tl-none text-sm">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Shared Files */}
            {sharedFiles.length > 0 && (
              <div className="p-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Shared Files</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {sharedFiles.map((file) => (
                    <a
                      key={file.id}
                      href={filesApi.getDownloadUrl(file.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
                    >
                      <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.originalName}</p>
                        <p className="text-xs text-slate-400">by {file.uploadedBy.name}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Patient Info Panel */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {appointmentInfo?.isDoctor ? 'Patient Info' : 'Doctor Info'}
                </h4>
                <button className="text-xs font-bold text-brand-600 hover:text-brand-700">View History</button>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                  <Image 
                    src={`https://picsum.photos/seed/${appointmentInfo?.isDoctor ? 'patient' : 'doctor'}/100/100`} 
                    fill 
                    className="rounded-2xl object-cover" 
                    alt="User" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {appointmentInfo?.isDoctor 
                      ? appointmentInfo.patient.name 
                      : appointmentInfo?.doctor.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {appointmentInfo?.isDoctor 
                      ? 'Patient' 
                      : appointmentInfo?.doctor.specialization}
                  </p>
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
                  onChange={(e) => handleTyping(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!message.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Prescription Modal */}
      <AnimatePresence>
        {showPrescriptionModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => setShowPrescriptionModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
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
                    <p className="font-bold text-slate-900">{appointmentInfo?.patient.name}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</p>
                    <p className="font-bold text-slate-900">{new Date().toLocaleDateString()}</p>
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
      </AnimatePresence>

      {/* Upload Reports Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
              onClick={() => setShowUploadModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Upload Reports</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <label className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-4 hover:border-brand-500 hover:bg-brand-50/50 transition-all cursor-pointer block">
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                  <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-2xl flex items-center justify-center mx-auto">
                    <Paperclip className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-500 font-medium">PDF, JPG, or PNG (Max 10MB)</p>
                  </div>
                </label>
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Files</h4>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-brand-500" />
                          <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <button onClick={() => removeFile(index)} className="text-red-500 hover:bg-red-50 p-1 rounded-lg">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
                <button onClick={() => setShowUploadModal(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
                <button 
                  onClick={async () => {
                    if (uploadedFiles.length === 0) return;
                    setIsUploading(true);
                    try {
                      for (const file of uploadedFiles) {
                        const uploaded = await filesApi.upload(file, appointmentId);
                        consultationSocket.shareFile(uploaded.id);
                      }
                      setShowUploadModal(false);
                      setUploadedFiles([]);
                    } catch (err) {
                      console.error('Upload failed:', err);
                    } finally {
                      setIsUploading(false);
                    }
                  }} 
                  disabled={uploadedFiles.length === 0 || isUploading}
                  className="flex-1 py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload & Share'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden audio element for remote participant */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
