'use client';

import { Layout } from '@/components/Layout';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
    return <Layout role="doctor">{children}</Layout>;
}
