import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Calendar, 
  FileText, 
  User, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  Stethoscope,
  Users,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-brand-500 text-white shadow-md shadow-brand-200" 
        : "text-slate-600 hover:bg-brand-50 hover:text-brand-600"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-white" : "text-slate-400 group-hover:text-brand-500")} />
    <span className="font-medium">{label}</span>
  </Link>
);

interface LayoutProps {
  children: React.ReactNode;
  role: 'patient' | 'doctor' | 'admin';
}

export const Layout = ({ children, role }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const patientNav = [
    { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patient/doctors', icon: Search, label: 'Find Doctors' },
    { to: '/patient/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/patient/records', icon: FileText, label: 'Medical Records' },
    { to: '/patient/profile', icon: User, label: 'Profile' },
  ];

  const doctorNav = [
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/doctor/patients', icon: FileText, label: 'Patient Records' },
    { to: '/doctor/profile', icon: User, label: 'Profile' },
  ];

  const adminNav = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/doctors', icon: Stethoscope, label: 'Manage Doctors' },
    { to: '/admin/patients', icon: Users, label: 'Manage Patients' },
    { to: '/admin/appointments', icon: Calendar, label: 'All Appointments' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const navItems = role === 'patient' ? patientNav : role === 'doctor' ? doctorNav : adminNav;

  const getUserInfo = () => {
    switch(role) {
      case 'patient': return { name: 'John Doe', avatar: 'https://picsum.photos/seed/user/100/100' };
      case 'doctor': return { name: 'Dr. Sarah Johnson', avatar: 'https://picsum.photos/seed/doctor1/100/100' };
      case 'admin': return { name: 'Admin User', avatar: 'https://picsum.photos/seed/admin/100/100' };
      default: return { name: 'User', avatar: 'https://picsum.photos/seed/user/100/100' };
    }
  };

  const userInfo = getUserInfo();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 fixed h-full">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-100">
            {role === 'admin' ? <ShieldCheck className="text-white w-6 h-6" /> : <Stethoscope className="text-white w-6 h-6" />}
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">TeleCare</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to} 
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 hidden lg:block">
            <h1 className="text-xl font-semibold text-slate-800 capitalize">
              {location.pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-brand-500 transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-10 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {userInfo.name}
                </p>
                <p className="text-xs text-slate-500 capitalize">{role}</p>
              </div>
              <img 
                src={userInfo.avatar} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-10 flex-1">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="absolute inset-y-0 left-0 w-72 bg-white p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                  {role === 'admin' ? <ShieldCheck className="text-white w-6 h-6" /> : <Stethoscope className="text-white w-6 h-6" />}
                </div>
                <span className="text-2xl font-bold text-slate-900">TeleCare</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-2">
              {navItems.map((item) => (
                <SidebarItem 
                  key={item.to} 
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={location.pathname === item.to} 
                />
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};
