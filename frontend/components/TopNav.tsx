"use client";

import { Search, Bell, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type JobRole } from "@/lib/api";
import UploadModal from "./UploadModal";
import ThemeToggle from "./ThemeToggle";

export default function TopNav({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.listJobRoles().then(setJobRoles).catch(() => setJobRoles([]));
  }, []);

  return (
    <header className="flex justify-between items-center w-full px-container-padding py-stack-md bg-transparent z-40 sticky top-0 backdrop-blur-md">
      <div className="relative w-96 group">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors"
        />
        <input suppressHydrationWarning
          type="text"
          placeholder="Search anything..."
          className="w-full bg-surface-glass/40 border border-surface-glass/50 rounded-xl py-2.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-glass/60 transition-all font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 shadow-sm backdrop-blur-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-surface-glass/50 px-1.5 py-0.5 rounded text-[10px] font-bold text-on-surface-variant border border-surface-glass/60 shadow-sm">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <ThemeToggle />
        <button suppressHydrationWarning className="relative p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-glass/20 rounded-full">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface" />
        </button>
        <button suppressHydrationWarning
          onClick={() => setModalOpen(true)}
          className="btn-gradient text-white px-6 py-2.5 rounded-xl font-label-md text-label-md flex items-center gap-2 shadow-md"
        >
          <UploadCloud size={18} />
          Upload Resume
        </button>
      </div>

      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        jobRoles={jobRoles}
        onSuccess={(result) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("resumeUploaded", { detail: result }));
          }
          onUploadSuccess?.();
          router.refresh();
        }}
      />
    </header>
  );
}
