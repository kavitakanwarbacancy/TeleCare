'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Stethoscope,
    Shield,
    Clock,
    Video,
    ArrowRight,
    Star,
    Users,
    Calendar,
    FileText,
} from 'lucide-react';
import { motion } from 'motion/react';

const FeatureCard = ({
    icon: Icon,
    title,
    description,
}: {
    icon: any;
    title: string;
    description: string;
}) => (
    <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-500 transition-colors duration-300">
            <Icon className="w-7 h-7 text-brand-500 group-hover:text-white transition-colors duration-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
);

export default function Landing() {
    return (
        <div className="min-h-screen bg-white overflow-hidden">
            {/* Navbar */}
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-100">
                        <Stethoscope className="text-white w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">
                        TeleCare
                    </span>
                </div>
                {/* <div className="hidden md:flex items-center gap-10">
                    <a
                        href="#features"
                        className="text-slate-600 font-medium hover:text-brand-500 transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#how-it-works"
                        className="text-slate-600 font-medium hover:text-brand-500 transition-colors"
                    >
                        How it works
                    </a>
                    <a
                        href="#doctors"
                        className="text-slate-600 font-medium hover:text-brand-500 transition-colors"
                    >
                        For Doctors
                    </a>
                </div> */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <Link
                        href="/login"
                        className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-slate-600 font-semibold hover:text-brand-500 transition-colors"
                    >
                        Login
                    </Link>
                    <Link
                        href="/signup"
                        className="px-6 sm:px-8 py-2.5 sm:py-3 bg-brand-500 text-white text-sm sm:text-base font-bold rounded-full shadow-lg shadow-brand-100 hover:bg-brand-600 hover:shadow-brand-200 transition-all active:scale-95"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-12 pb-24 lg:pt-24 lg:pb-40">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-sm font-bold mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
                            Trusted by 10,000+ Patients
                        </div>
                        <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight">
                            Quality Healthcare,{' '}
                            <span className="text-brand-500">Anywhere, Anytime.</span>
                        </h1>
                        <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-lg">
                            Connect with top-rated doctors for instant video consultations, digital
                            prescriptions, and personalized care from the comfort of your home.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/signup"
                                className="px-10 py-5 bg-brand-500 text-white text-lg font-bold rounded-full shadow-xl shadow-brand-100 hover:bg-brand-600 hover:shadow-brand-200 transition-all flex items-center justify-center gap-2 group"
                            >
                                Book an Appointment{' '}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {/* <Link
                                href="/patient/doctors"
                                className="px-10 py-5 bg-white text-slate-900 border-2 border-slate-100 text-lg font-bold rounded-full hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                Find a Doctor
                            </Link> */}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white aspect-[4/5]">
                            <Image
                                src="https://picsum.photos/seed/telemedicine/800/1000"
                                alt="Telemedicine Consultation"
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        {/* Floating Cards */}
                        {/* <div className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl z-20 border border-slate-50 hidden md:block animate-bounce-slow">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Video className="text-green-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Live Consultation</p>
                  <p className="text-xs text-slate-500">Dr. Sarah Johnson</p>
                </div>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-2/3"></div>
              </div>
            </div> */}

                        {/* <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl z-20 border border-slate-50 hidden md:block animate-pulse-slow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                                    <Star className="text-brand-600 w-6 h-6 fill-brand-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">4.9/5</p>
                                    <p className="text-xs text-slate-500">Patient Satisfaction</p>
                                </div>
                            </div>
                        </div> */}

                        {/* Background elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-50 rounded-full blur-3xl -z-10 opacity-50"></div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                            Why Choose TeleCare?
                        </h2>
                        <p className="text-xl text-slate-500 leading-relaxed">
                            We combine cutting-edge technology with compassionate care to provide
                            the best healthcare experience.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Video}
                            title="Video Consultations"
                            description="High-quality video calls with specialized doctors from anywhere in the world."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Secure & Private"
                            description="Your medical data is encrypted and stored securely, ensuring complete privacy."
                        />
                        <FeatureCard
                            icon={Clock}
                            title="24/7 Availability"
                            description="Access healthcare services around the clock, even on weekends and holidays."
                        />
                        <FeatureCard
                            icon={FileText}
                            title="Digital Prescriptions"
                            description="Receive and manage your prescriptions digitally, ready for any pharmacy."
                        />
                        <FeatureCard
                            icon={Users}
                            title="Expert Doctors"
                            description="Our platform hosts verified specialists across multiple medical fields."
                        />
                        <FeatureCard
                            icon={Calendar}
                            title="Easy Scheduling"
                            description="Book appointments in seconds with our intuitive calendar interface."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-brand-600 rounded-[48px] p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl shadow-brand-200">
                        <div className="relative z-10">
                            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8">
                                Ready to start your journey?
                            </h2>
                            <p className="text-xl text-brand-100 mb-12 max-w-2xl mx-auto">
                                Join thousands of patients who trust TeleCare for their daily
                                healthcare needs.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/signup"
                                    className="px-12 py-5 bg-white text-brand-600 text-lg font-bold rounded-full hover:bg-brand-50 transition-all shadow-xl"
                                >
                                    Create an Account
                                </Link>
                                <Link
                                    href="/doctor/dashboard"
                                    className="px-12 py-5 bg-brand-700 text-white text-lg font-bold rounded-full hover:bg-brand-800 transition-all border border-brand-500"
                                >
                                    Join as a Doctor
                                </Link>
                            </div>
                        </div>
                        {/* Background patterns */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                            <Stethoscope className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">TeleCare</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © 2026 TeleCare Inc. All rights reserved.
                    </p>
                    <div className="flex gap-8">
                        <a
                            href="#"
                            className="text-slate-400 hover:text-brand-500 transition-colors"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="text-slate-400 hover:text-brand-500 transition-colors"
                        >
                            Terms of Service
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
