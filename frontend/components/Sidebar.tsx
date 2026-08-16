"use client";

import {
  LayoutDashboard,
  FileText,
  BrainCircuit,
  BarChart3,
  Users2,
  PenSquare,
  Download,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronsUpDown,
  Crown,
  ScrollText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import clsx from "clsx";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Resumes", icon: FileText, href: "/resumes" },
  { label: "AI Analysis", icon: BrainCircuit, href: "#", comingSoon: true },
  { label: "ATS Reports", icon: BarChart3, href: "#", comingSoon: true },
  { label: "Job Roles", icon: Users2, href: "/job-roles" },
  { label: "Resume Builder", icon: PenSquare, href: "#", badge: "Premium", comingSoon: true },
  { label: "Downloads", icon: Download, href: "#", comingSoon: true },
  { label: "Payments", icon: CreditCard, href: "#", comingSoon: true },
  { label: "Settings", icon: Settings, href: "#", comingSoon: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress?.split("@")[0] || "Account";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || "";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="fixed left-0 top-0 h-full w-[280px] bg-surface-glass/20 backdrop-blur-[40px] border-r border-surface-glass/20 shadow-sm z-50 flex flex-col p-6 gap-stack-md">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg">
          <ScrollText size={22} />
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface leading-tight">Resumora</h1>
          <p className="font-body-md text-label-md text-on-surface-variant">AI Resume Analyzer</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {NAV_ITEMS.map(({ label, icon: Icon, href, badge, comingSoon }) => {
          const active = href !== "#" && pathname?.startsWith(href);

          const inner = (
            <>
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span className="font-body-md text-body-md">{label}</span>
              </div>
              {badge && (
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {badge}
                </span>
              )}
              {comingSoon && !badge && (
                <span className="text-on-surface-variant/50 text-[10px] font-semibold uppercase tracking-wider">
                  Soon
                </span>
              )}
            </>
          );

          if (comingSoon) {
            return (
              <div
                key={label}
                title="Coming soon"
                className="flex items-center gap-3 px-4 py-3 rounded-xl justify-between text-on-surface-variant/40 cursor-not-allowed select-none"
              >
                {inner}
              </div>
            );
          }

          return (
            <Link
              key={label}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 justify-between",
                active
                  ? "bg-surface-glass/30 text-primary font-bold"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-glass/10"
              )}
            >
              {inner}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto mb-4 bg-gradient-to-br from-surface-glass/60 to-surface-glass/20 p-5 rounded-2xl border border-surface-glass/50 shadow-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 mb-3">
          <Crown size={18} />
        </div>
        <h3 className="font-headline-md text-[16px] font-bold mb-1">Unlock Premium</h3>
        <p className="text-[12px] text-on-surface-variant mb-4 leading-relaxed">
          Get ATS-optimized resume and boost your chances!
        </p>
        <button suppressHydrationWarning className="w-full btn-gradient text-white py-2 rounded-lg font-label-md text-label-md">
          Upgrade Now
        </button>
      </div>

      <div className="border-t border-surface-glass/20 pt-4 space-y-2">
        <a href="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-glass/10 rounded-xl transition-all duration-200">
          <HelpCircle size={20} />
          <span className="font-body-md text-body-md">Help &amp; Support</span>
        </a>
        <div className="flex items-center gap-3 px-4 py-2 mt-2">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={displayName}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-surface"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm border-2 border-surface">
              {initial}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="font-label-md text-label-md truncate">{displayName}</p>
            <p className="text-[11px] text-on-surface-variant truncate">{displayEmail}</p>
          </div>
          <button
            suppressHydrationWarning
            onClick={() => signOut(() => router.push("/sign-in"))}
            title="Sign out"
            className="text-on-surface-variant hover:text-error"
          >
            <ChevronsUpDown size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
