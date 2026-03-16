"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Calendar,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Users,
  Settings,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const patientNav: NavItem[] = [
  { to: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/patient/doctors", icon: Search, label: "Find Doctors" },
  { to: "/patient/appointments", icon: Calendar, label: "Appointments" },
  { to: "/patient/records", icon: FileText, label: "Medical Records" },
  { to: "/patient/profile", icon: User, label: "Profile" },
];

const doctorNav: NavItem[] = [
  { to: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/doctor/appointments", icon: ClipboardList, label: "Appointments" },
  { to: "/doctor/schedule", icon: Calendar, label: "Schedule" },
  { to: "/doctor/patients", icon: Users, label: "Patient Records" },
  { to: "/doctor/profile", icon: User, label: "Profile" },
];

const adminNav: NavItem[] = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/doctors", icon: Stethoscope, label: "Manage Doctors" },
  { to: "/admin/patients", icon: Users, label: "Manage Patients" },
  { to: "/admin/appointments", icon: Calendar, label: "All Appointments" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

function SidebarItem({
  to,
  icon: Icon,
  label,
  active,
  onClick,
}: NavItem & { active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        active
          ? "bg-brand-500 text-white shadow-md shadow-brand-200"
          : "text-slate-600 hover:bg-brand-50 hover:text-brand-600",
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5",
          active ? "text-white" : "text-slate-400 group-hover:text-brand-500",
        )}
      />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  role: "patient" | "doctor" | "admin";
}

export const Layout = ({ children, role }: LayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = role === "patient" ? patientNav : role === "doctor" ? doctorNav : adminNav;

  const displayName = user?.name ?? "Loading...";
  const avatarSeed = user?.id ?? "default";

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  function handleLogout() {
    setIsMobileMenuOpen(false);
    logout();
    router.push("/login");
  }

  const Sidebar = () => (
    <>
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-100">
          {role === "admin" ? (
            <ShieldCheck className="text-white w-6 h-6" />
          ) : (
            <Stethoscope className="text-white w-6 h-6" />
          )}
        </div>
        <span className="text-2xl font-bold text-slate-900 tracking-tight">TeleCare</span>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => (
          <SidebarItem key={item.to} {...item} active={pathname === item.to} />
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex w-full max-w-full overflow-x-hidden">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 fixed h-full z-40">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
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
              {pathname.split("/").pop()?.replace(/-/g, " ")}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="h-10 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500 capitalize">{role}</p>
              </div>
              <div className="relative w-10 h-10">
                <Image
                  src={`https://picsum.photos/seed/${avatarSeed}/100/100`}
                  alt="Avatar"
                  fill
                  className="rounded-full border-2 border-white shadow-sm object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10 flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
                  {role === "admin" ? (
                    <ShieldCheck className="text-white w-6 h-6" />
                  ) : (
                    <Stethoscope className="text-white w-6 h-6" />
                  )}
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
                  {...item}
                  active={pathname === item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};
