"use client";

import {
  LayoutDashboard,
  FileText,
  BrainCircuit,
  BarChart3,
  Users2,
  PenSquare,
  Download,
  Settings,
  HelpCircle,
  ChevronsUpDown,
  Crown,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import clsx from "clsx";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Resumes", icon: FileText, href: "/resumes" },
  { label: "AI Analysis", icon: BrainCircuit, href: "/ai-analysis" },
  { label: "Job Match", icon: Users2, href: "/job-roles" },
  { label: "ATS Reports", icon: BarChart3, href: "/ats-reports" },
  { label: "Resume Builder", icon: PenSquare, href: "/resumes", badge: "PREMIUM" },
  { label: "Downloads", icon: Download, href: "/ats-reports" },
  { label: "Settings", icon: Settings, href: "/resumes" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Anuram Pranav";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || "anurampranav07@gmail.com";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="fixed left-0 top-0 h-full w-[260px] bg-white/70 dark:bg-[#080914]/75 backdrop-blur-2xl border-r border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-[0_12px_40px_0_rgba(0,0,0,0.5)] z-50 flex flex-col p-5 text-gray-800 dark:text-gray-200">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 border border-white/30">
          <Sparkles size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight leading-none">Resumora</h1>
          <p className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold tracking-wide">AI Resume Analyzer</p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
        {NAV_ITEMS.map(({ label, icon: Icon, href, badge }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

          return (
            <Link
              key={label}
              href={href}
              className={clsx(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
                active
                  ? "bg-violet-600/15 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 shadow-[0_4px_16px_rgba(124,58,237,0.15)] dark:shadow-[0_4px_16px_rgba(139,92,246,0.2)]"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5 border border-transparent hover:border-white/40 dark:hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={clsx(
                    "transition-colors",
                    active ? "text-violet-600 dark:text-violet-400" : "text-gray-400 group-hover:text-violet-500 dark:group-hover:text-violet-400"
                  )}
                />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="glass-pill text-violet-700 dark:text-violet-300 border border-violet-500/40 text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Unlock Premium Card */}
      <div className="mt-4 mb-4 glass-card bg-gradient-to-b from-violet-600/10 via-indigo-600/10 to-purple-600/10 dark:from-violet-950/40 dark:to-indigo-950/20 p-4 rounded-2xl border border-violet-500/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/20 rounded-full blur-xl group-hover:bg-violet-600/35 transition-all" />
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 dark:text-amber-400 mb-2.5">
          <Crown size={16} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Unlock Premium</h3>
        <p className="text-[11px] text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
          Get ATS-optimized resume and boost your chances!
        </p>
        <button
          suppressHydrationWarning
          onClick={() => router.push("/resumes")}
          className="w-full btn-gradient text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all shadow-md active:scale-95"
        >
          Upgrade Now
        </button>
      </div>

      {/* Footer Navigation & Profile */}
      <div className="border-t border-gray-200 dark:border-white/10 pt-3 space-y-2">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 rounded-xl transition-all"
        >
          <HelpCircle size={16} className="text-gray-400" />
          <span>Help &amp; Support</span>
        </a>
        <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl glass-card border border-white/50 dark:border-white/10">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={displayName}
              width={34}
              height={34}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/40"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-violet-500/40">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{displayEmail}</p>
          </div>
          <button
            suppressHydrationWarning
            onClick={() => signOut(() => router.push("/sign-in"))}
            title="Sign out"
            className="text-gray-400 hover:text-rose-500 transition-colors p-1"
          >
            <ChevronsUpDown size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}

