import type { ReactNode } from "react";
import { DM_Sans, DM_Serif_Display } from "next/font/google";

const fontAdminSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin-sans",
  display: "swap",
});

const fontAdminSerif = DM_Serif_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  variable: "--font-admin-serif",
  display: "swap",
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${fontAdminSans.variable} ${fontAdminSerif.variable} font-admin text-zinc-800 antialiased [&_.font-heading]:font-admin-heading [&_h1]:font-admin-heading [&_h2]:font-admin-heading`}
    >
      {children}
    </div>
  );
}
