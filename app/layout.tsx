import type { Metadata } from "next";
import "./globals.css";
import Footer from "../components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Portfolio - Tharun Doma",
  description: "Personal portfolio showcasing AI tools and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-900 font-sans">
        {/* Fixed Topbar Navigation */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 bg-gradient-to-b from-slate-900/95 to-slate-900/80 backdrop-blur border-b border-indigo-500/20">
          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-semibold text-sky-200 hover:text-sky-100 transition"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-sky-200 hover:text-sky-100 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className="text-sm font-semibold text-sky-200 hover:text-sky-100 transition"
            >
              Projects
            </Link>
          </nav>

          {/* Admin Badge */}
          <Link
            href="/admin"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-400/70 bg-slate-800/80 shadow-lg shadow-indigo-900/40 backdrop-blur transition hover:bg-slate-700 hover:border-indigo-300 hover:shadow-indigo-800/60"
            title="Admin Console"
          >
            <span className="relative text-base" aria-hidden>
              <span className="absolute inset-[-6px] rounded-full bg-indigo-400/20 blur-sm animate-pulse" />
              <span className="absolute inset-[-10px] rounded-full border border-indigo-400/40 animate-[pulse_2.4s_ease-in-out_infinite]" />
              🛡️
            </span>
          </Link>
        </div>

        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
