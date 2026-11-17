import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Space_Grotesk,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Galaxy AI — Asisten Astronomi, Studio Gambar Kosmik & 3D Tata Surya",
  description:
    "Platform AI astronomi premium tanpa batas: tanya jawab astrofisika, generator gambar kosmik unlimited, simulasi 3D Game [ALPHA] Tata Surya & rotasi Bumi, serta model 3D Bima Sakti & Andromeda.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${spaceGrotesk.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="bg-[#07090F] text-[#F4F6FB] font-sans antialiased selection:bg-[#7C8CFF]/30 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
