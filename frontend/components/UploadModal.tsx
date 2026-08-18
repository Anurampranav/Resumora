"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { api, type AnalysisResult, type JobRole } from "@/lib/api";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

type Stage = "idle" | "uploading" | "success" | "error";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (result: AnalysisResult) => void;
  jobRoles: JobRole[];
}

export default function UploadModal({ open, onClose, onSuccess, jobRoles }: UploadModalProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [roleSlug, setRoleSlug] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.has(file.type)) return "Only PDF and DOCX files are accepted.";
    if (file.size > MAX_SIZE_BYTES) return "File exceeds the 10 MB limit.";
    return null;
  }, []);

  const startUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setStage("error");
        return;
      }

      setStage("uploading");
      setProgress(0);
      setError(null);

      try {
        const analysis = await api.uploadResume(file, roleSlug || undefined, setProgress);
        setResult(analysis);
        setStage("success");
        onSuccess?.(analysis);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setStage("error");
      }
    },
    [roleSlug, onSuccess, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) startUpload(file);
    },
    [startUpload]
  );

  function reset() {
    setStage("idle");
    setProgress(0);
    setError(null);
    setResult(null);
  }

  function handleCloseClick() {
    reset();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg rounded-[24px] p-6 relative bg-surface-glass/90">
        <button suppressHydrationWarning
          onClick={handleCloseClick}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-black/5"
        >
          <X size={20} />
        </button>

        <h2 className="font-headline-md text-[18px] font-bold text-on-surface mb-1">Upload Resume</h2>
        <p className="text-[13px] text-on-surface-variant mb-5">PDF or DOCX, up to 10 MB.</p>

        {stage === "idle" && (
          <>
            <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">
              Target role (optional)
            </label>
            <select suppressHydrationWarning
              value={roleSlug}
              onChange={(e) => setRoleSlug(e.target.value)}
              className="w-full mb-4 bg-surface-glass/60 border border-surface-glass/60 text-on-surface rounded-xl py-2.5 px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="" className="bg-surface text-on-surface">No specific role (General ATS scoring)</option>
              {jobRoles.map((r) => (
                <option key={r.slug} value={r.slug} className="bg-surface text-on-surface">
                  {r.name}
                </option>
              ))}
            </select>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-10 px-6 cursor-pointer transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-outline-variant/50 hover:border-primary/50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UploadCloud size={24} />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-on-surface">
                  Drag & drop your resume here
                </p>
                <p className="text-[12px] text-on-surface-variant mt-0.5">or click to browse files</p>
              </div>
            </div>
            <input suppressHydrationWarning
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) startUpload(file);
                e.target.value = "";
              }}
            />
          </>
        )}

        {stage === "uploading" && (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-violet-400" size={36} />
            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-300 mb-1.5 font-medium">
                <span>
                  {progress < 25
                    ? "Uploading resume file..."
                    : progress < 50
                    ? "Parsing text & layout structure..."
                    : progress < 75
                    ? "Extracting skills, experience & education..."
                    : progress < 95
                    ? "Running deterministic ATS scoring engine..."
                    : "Generating AI suggestions & insights..."}
                </span>
                <span className="font-mono font-bold text-violet-400">{progress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {stage === "success" && result && (
          <div className="py-4 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="text-emerald-500" size={40} />
            <p className="font-semibold text-on-surface">Analysis complete</p>
            <div className="flex gap-6 mt-1">
              <div>
                <p className="text-[28px] font-extrabold text-primary leading-none">{result.overall_score}</p>
                <p className="text-[11px] text-on-surface-variant mt-1">ATS Score</p>
              </div>
              <div>
                <p className="text-[28px] font-extrabold text-emerald-600 leading-none">
                  {result.match_percentage}%
                </p>
                <p className="text-[11px] text-on-surface-variant mt-1">Role Match</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4 w-full">
              <button suppressHydrationWarning
                onClick={() => {
                  reset();
                }}
                className="flex-1 bg-surface-glass/70 hover:bg-surface-container-highest text-on-surface border border-outline-variant/30 py-2.5 rounded-xl text-[13px] font-semibold"
              >
                Upload another
              </button>
              <button suppressHydrationWarning
                onClick={handleCloseClick}
                className="flex-1 btn-gradient text-white py-2.5 rounded-xl text-[13px] font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {stage === "error" && (
          <div className="py-4 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertCircle size={24} />
            </div>
            <p className="font-semibold text-on-surface">Upload failed</p>
            <p className="text-[13px] text-on-surface-variant max-w-sm">{error}</p>
            <button suppressHydrationWarning
              onClick={reset}
              className="mt-2 btn-gradient text-white px-6 py-2.5 rounded-xl text-[13px] font-semibold"
            >
              Try again
            </button>
          </div>
        )}

        {stage === "idle" && (
          <p className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mt-4">
            <FileText size={13} /> Your resume is parsed and scored immediately after upload.
          </p>
        )}
      </div>
    </div>
  );
}
