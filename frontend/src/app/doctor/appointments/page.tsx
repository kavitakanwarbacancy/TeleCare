"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar, Clock, Video, MoreVertical,
  CheckCircle2, XCircle, AlertCircle, Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi, type Appointment } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

// ─── Status helpers ───────────────────────────────────────────────────────────

type Tab = "Upcoming" | "Past" | "Cancelled";

function getTab(status: string): Tab {
  if (status === "PENDING" || status === "CONFIRMED") return "Upcoming";
  if (status === "COMPLETED" || status === "NO_SHOW") return "Past";
  return "Cancelled";
}

function StatusBadge({ status }: { status: string }) {
  const tab = getTab(status);
  const label: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
    NO_SHOW: "No Show",
    CANCELLED_BY_PATIENT: "Cancelled by Patient",
    CANCELLED_BY_DOCTOR: "Cancelled",
  };
  const styles: Record<Tab, string> = {
    Upcoming: "text-blue-500",
    Past: "text-green-500",
    Cancelled: "text-red-500",
  };
  const icons: Record<Tab, React.ReactNode> = {
    Upcoming: <AlertCircle className="w-4 h-4" />,
    Past: <CheckCircle2 className="w-4 h-4" />,
    Cancelled: <XCircle className="w-4 h-4" />,
  };
  return (
    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${styles[tab]}`}>
      {icons[tab]} {label[status] ?? status}
    </div>
  );
}

// ─── Appointment card (doctor view — shows patient info) ──────────────────────

function AppointmentCard({
  appt,
  onCancel,
  cancelling,
}: {
  appt: Appointment;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const isUpcoming = getTab(appt.status) === "Upcoming";

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
      {/* Patient info */}
      <div className="flex items-center gap-5">
        <img
          src={`https://picsum.photos/seed/${appt.patient.user.id}/100/100`}
          className="w-16 h-16 rounded-2xl object-cover shadow-sm flex-shrink-0"
          alt={appt.patient.user.name}
          referrerPolicy="no-referrer"
        />
        <div>
          <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
            {appt.patient.user.name}
          </h4>
          <p className="text-sm font-medium text-slate-500 mb-2">{appt.patient.user.email}</p>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full w-fit">
            <Video className="w-3.5 h-3.5" /> Video Consultation
          </div>
        </div>
      </div>

      {/* Date / time / status */}
      <div className="flex flex-wrap items-center gap-8 md:gap-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" /> Date
          </div>
          <p className="text-sm font-bold text-slate-700">
            {format(new Date(appt.scheduledAt), "MMM d, yyyy")}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" /> Time
          </div>
          <p className="text-sm font-bold text-slate-700">
            {format(new Date(appt.scheduledAt), "hh:mm a")}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
          <StatusBadge status={appt.status} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {isUpcoming && (
          <>
            <Link
              href={`/doctor/consultation/${appt.id}`}
              className="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-100 active:scale-95 text-sm flex items-center gap-2"
            >
              <Video className="w-4 h-4" /> Start Call
            </Link>
            <button
              onClick={onCancel}
              disabled={cancelling}
              className="px-4 py-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-bold disabled:opacity-50"
            >
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel"}
            </button>
          </>
        )}
        <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: Tab[] = ["Upcoming", "Past", "Cancelled"];

export default function DoctorAppointments() {
  const { user, token } = useAuth();
  const qClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<Tab>("Upcoming");
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["appointments", user?.id, "all"],
    queryFn: () => appointmentsApi.list({ limit: 100 }),
    enabled: !!token,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.cancel(id),
    onMutate: (id) => setCancellingId(id),
    onSettled: () => setCancellingId(null),
    onSuccess: () => qClient.invalidateQueries({ queryKey: ["appointments", user?.id] }),
    onError: (err: Error) => alert(err.message),
  });

  const filtered = (data?.data ?? []).filter((a) => getTab(a.status) === activeTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Appointments</h2>
        <p className="text-slate-500 font-medium">Manage your patient consultations.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === tab ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="doctorActiveTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-brand-500 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="p-12 bg-red-50 rounded-[40px] text-center">
          <p className="text-red-500 font-bold">Failed to load appointments.</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid gap-6">
          {filtered.length === 0 ? (
            <div className="p-16 bg-white rounded-[40px] border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-medium">No {activeTab.toLowerCase()} appointments.</p>
            </div>
          ) : (
            filtered.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                onCancel={() => cancelMutation.mutate(appt.id)}
                cancelling={cancellingId === appt.id}
              />
            ))
          )}
        </div>
      )}
    </motion.div>
  );
}
