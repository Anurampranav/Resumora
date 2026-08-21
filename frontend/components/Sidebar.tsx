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
  { label: "Resume Builder", icon: PenSquare, href: "/builder", badge: "NEW" },
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
    <nav className="fixed left-0 top-0 h-full w-[260px] bg-surface/90 dark:bg-[#0A0A09]/80 backdrop-blur-2xl border-r border-outline-variant/30 shadow-2xl z-50 flex flex-col p-5 text-on-surface transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 dark:from-[#E8E3D7] dark:to-[#BDB8AC] flex items-center justify-center text-white dark:text-[#050505] shadow-lg shadow-primary/20 dark:shadow-black/40 border border-white/20 dark:border-[#F5F3EC]/30">
          <Sparkles size={22} className="text-white dark:text-[#050505]" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-on-surface tracking-tight leading-none">Resumora</h1>
          <p className="text-[11px] text-on-surface-variant font-semibold tracking-wide">AI Resume Analyzer</p>
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
                  ? "bg-primary/10 dark:bg-[#F5F3EC]/12 text-primary dark:text-[#F5F3EC] border border-primary/20 dark:border-[#F5F3EC]/20 shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 dark:hover:bg-[#F5F3EC]/5 border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={clsx(
                    "transition-colors",
                    active ? "text-primary dark:text-[#F5F3EC]" : "text-on-surface-variant/70 group-hover:text-on-surface"
                  )}
                />
                <span>{label}</span>
              </div>
              {badge && (
                <span className="glass-pill text-xs text-primary dark:text-[#F5F3EC] border border-primary/30 dark:border-[#F5F3EC]/30 text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Unlock Premium Card */}
      <div className="mt-4 mb-4 glass-card p-4 rounded-2xl border border-outline-variant/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-500 dark:text-amber-400 mb-2.5">
          <Crown size={16} />
        </div>
        <h3 className="text-sm font-bold text-on-surface mb-1">Unlock Premium</h3>
        <p className="text-[11px] text-on-surface-variant mb-3 leading-relaxed">
          Get ATS-optimized resume and boost your chances!
        </p>
        <button
          suppressHydrationWarning
          onClick={() => router.push("/resumes")}
          className="w-full btn-gradient text-xs font-semibold py-2 px-3 rounded-xl transition-all shadow-md active:scale-95"
        >
          Upgrade Now
        </button>
      </div>

      {/* Footer Navigation & Profile */}
      <div className="border-t border-outline-variant/30 pt-3 space-y-2">
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 rounded-xl transition-all"
        >
          <HelpCircle size={16} className="text-on-surface-variant/70" />
          <span>Help &amp; Support</span>
        </a>
        <div className="flex items-center gap-3 px-2.5 py-2 rounded-xl glass-card border border-outline-variant/30">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={displayName}
              width={34}
              height={34}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-primary/20">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-on-surface truncate">{displayName}</p>
            <p className="text-[10px] text-on-surface-variant truncate">{displayEmail}</p>
          </div>
          <button
            suppressHydrationWarning
            onClick={() => signOut(() => router.push("/sign-in"))}
            title="Sign out"
            className="text-on-surface-variant/70 hover:text-rose-500 transition-colors p-1"
          >
            <ChevronsUpDown size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}

