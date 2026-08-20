"use client";

import { Search, Bell, UploadCloud, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type JobRole, type ResumeListItem } from "@/lib/api";
import UploadModal from "./UploadModal";
import ThemeToggle from "./ThemeToggle";

export default function TopNav({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.listJobRoles().then(setJobRoles).catch(() => setJobRoles([]));
    api.listResumes().then(setResumes).catch(() => setResumes([]));
  }, []);

  // Keyboard shortcut Cmd/Ctrl + K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredRoles = jobRoles.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  const filteredResumes = resumes.filter((r) => r.file_name.toLowerCase().includes(query.toLowerCase()));

  const notifications = [
    { id: "n-1", title: "Resume analysis completed", time: "5m ago", type: "success" },
    { id: "n-2", title: "New AI suggestions ready", time: "1h ago", type: "info" },
    { id: "n-3", title: "Target job match updated to 91%", time: "3h ago", type: "success" },
  ];

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 bg-[#050505]/75 backdrop-blur-xl border-b border-[#F5F3EC]/10 z-40 sticky top-0 shadow-sm">
      {/* Global Search Bar Trigger */}
      <div className="relative w-80 md:w-96 group">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#96938B] group-focus-within:text-[#F5F3EC] transition-colors"
        />
        <input
          suppressHydrationWarning
          type="text"
          readOnly
          onClick={() => setSearchOpen(true)}
          placeholder="Search anything..."
          className="w-full glass-input rounded-xl py-2 pl-10 pr-12 text-xs font-medium text-[#F5F3EC] placeholder:text-[#96938B] cursor-pointer shadow-sm"
        />
        <div
          onClick={() => setSearchOpen(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 glass-pill px-1.5 py-0.5 rounded text-[10px] font-bold text-[#BDB8AC] shadow-sm cursor-pointer"
        >
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* Notifications Dropdown Trigger */}
        <div className="relative">
          <button
            suppressHydrationWarning
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-[#BDB8AC] hover:text-[#F5F3EC] transition-colors hover:bg-[#F5F3EC]/10 rounded-full"
            title="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-[#050505]" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-4 shadow-2xl z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-[#F5F3EC]/10 pb-2">
                <h4 className="text-xs font-bold text-[#F5F3EC]">Notifications</h4>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-[#96938B] hover:text-[#F5F3EC] p-0.5"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-2.5 p-2 rounded-xl glass-card text-xs text-[#F5F3EC]"
                  >
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium leading-tight">{n.title}</p>
                      <span className="text-[10px] text-[#BDB8AC]">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upload Resume Button */}
        <button
          suppressHydrationWarning
          onClick={() => setModalOpen(true)}
          className="btn-gradient text-[#050505] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <UploadCloud size={16} />
          Upload Resume
        </button>
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4">
          <div className="bg-white dark:bg-[#121324] border border-gray-200 dark:border-violet-500/30 rounded-2xl max-w-xl w-full p-4 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-white/10 pb-3">
              <Search size={18} className="text-violet-600 dark:text-violet-400" />
              <input
                suppressHydrationWarning
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resumes, job roles, skills, or reports..."
                className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {/* Job Roles */}
              <div>
                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider block mb-2">
                  Job Roles ({filteredRoles.length})
                </span>
                <div className="space-y-1">
                  {filteredRoles.slice(0, 4).map((role) => (
                    <div
                      key={role.slug}
                      onClick={() => {
                        setSearchOpen(false);
                        router.push(`/job-roles`);
                      }}
                      className="p-2 rounded-xl bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.06] cursor-pointer text-xs text-gray-800 dark:text-gray-200 flex items-center justify-between"
                    >
                      <span className="font-semibold">{role.name}</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{role.industry || "Technology"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumes */}
              <div>
                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider block mb-2">
                  My Resumes ({filteredResumes.length})
                </span>
                <div className="space-y-1">
                  {filteredResumes.slice(0, 4).map((res) => (
                    <div
                      key={res.id}
                      onClick={() => {
                        setSearchOpen(false);
                        router.push(`/resumes/${res.id}`);
                      }}
                      className="p-2 rounded-xl bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.06] cursor-pointer text-xs text-gray-800 dark:text-gray-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-rose-500 dark:text-rose-400" />
                        <span className="font-medium truncate">{res.file_name}</span>
                      </div>
                      <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold">{res.overall_score ?? 35} ATS</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        jobRoles={jobRoles}
        onSuccess={(res) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("resumeUploaded", { detail: res }));
          }
          onUploadSuccess?.();
          router.refresh();
        }}
      />
    </header>
  );
}

