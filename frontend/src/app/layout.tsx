import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeleCare - Your Health, Our Priority",
  description: "Modern telemedicine platform for remote consultations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
