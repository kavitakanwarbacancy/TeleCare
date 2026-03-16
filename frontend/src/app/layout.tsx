import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
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
        <NextTopLoader color="#0ea5e9" height={3} showSpinner={false} shadow="0 0 10px #0ea5e9,0 0 5px #0ea5e9" />
        {/* Hydrates Zustand from localStorage on every page load */}
        <AuthBootstrap />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
