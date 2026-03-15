import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { AuthBootstrap } from "@/components/AuthBootstrap";

export const metadata: Metadata = {
  title: "TeleCare - Your Health, Our Priority",
  description: "Modern telemedicine platform for remote consultations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Hydrates Zustand from localStorage on every page load */}
        <AuthBootstrap />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
