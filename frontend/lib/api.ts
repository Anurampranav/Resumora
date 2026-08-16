import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * fetch() throws a bare `TypeError: Failed to fetch` for any network-level
 * failure — backend not running, wrong port, CORS rejection, DNS failure —
 * with zero detail about which. Left as-is, that error crashes straight to
 * the Next.js error overlay as an unhandled exception, which is far less
 * useful than a message that at least names the likely causes.
 */
function describeNetworkError(err: unknown): Error {
  if (err instanceof TypeError) {
    return new Error(
      `Could not reach the backend at ${API_BASE}. Most likely causes: the ` +
        `backend isn't running (start it with "uvicorn app.main:app --reload"), ` +
        `it's on a different port than NEXT_PUBLIC_API_URL points to, or its ` +
        `ALLOWED_ORIGINS setting doesn't include this frontend's origin (CORS).`
    );
  }
  return err instanceof Error ? err : new Error(String(err));
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body && !(options.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    throw describeNetworkError(err);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface DashboardSummary {
  overall_ats_score: number;
  resume_match_percent: number;
  missing_skills_count: number;
  resumes_analyzed_this_month: number;
  latest_resume_id: string | null;
  latest_breakdown: ScoreBreakdown | null;
  latest_ai_summary: string | null;
}

export interface ScoreBreakdown {
  formatting: number;
  skills: number;
  projects: number;
  experience: number;
  grammar: number;
  readability: number;
  education: number;
  achievements: number;
  overall: number;
}

export interface WeakBullet {
  original: string;
  suggested: string;
}

export interface AnalysisResult {
  resume_id: string;
  overall_score: number;
  match_percentage: number;
  target_role: string;
  breakdown: ScoreBreakdown;
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  formatting_issues: string[];
  weak_bullet_points: WeakBullet[];
  ai_summary: string;
  ai_suggestions: string[];
}

export interface ResumeListItem {
  id: string;
  file_name: string;
  file_type: string;
  role_name: string | null;
  status: "uploaded" | "parsing" | "analyzed" | "failed";
  overall_score: number | null;
  match_percentage: number | null;
  created_at: string;
}

export interface ResumeDetail {
  id: string;
  file_name: string;
  file_type: string;
  role_name: string | null;
  status: string;
  created_at: string;
  latest_analysis: AnalysisResult | null;
}

export interface JobRole {
  id: string;
  slug: string;
  name: string;
  industry: string | null;
  demand_level: number | null;
}

export interface JobRoleDetail extends JobRole {
  description: string | null;
  required_skills: string[];
  preferred_skills: string[];
}

export const api = {
  getDashboardSummary: () => request<DashboardSummary>("/dashboard/summary"),
  listResumes: () => request<ResumeListItem[]>("/resumes"),
  getResume: (id: string) => request<ResumeDetail>(`/resumes/${id}`),
  listJobRoles: () => request<JobRole[]>("/job-roles"),
  getJobRole: (slug: string) => request<JobRoleDetail>(`/job-roles/${slug}`),
  compareJobRoles: (slugs: string[]) =>
    request<JobRoleDetail[]>(`/job-roles/compare/by-slugs?slugs=${slugs.join(",")}`),
  reanalyzeResume: (id: string) =>
    request<AnalysisResult>(`/resumes/${id}/reanalyze`, { method: "POST" }),
  rewriteBullet: (resumeId: string, original: string) =>
    request<WeakBullet>(`/resumes/${resumeId}/rewrite-bullet?original=${encodeURIComponent(original)}`, {
      method: "POST",
    }),
  deleteResume: (id: string) => request<void>(`/resumes/${id}`, { method: "DELETE" }),

  /** Downloads the original uploaded file by triggering a browser save. */
  downloadResume: async (id: string, fileName: string) => {
    const token = await getToken();
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/resumes/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      throw describeNetworkError(err);
    }
    if (!res.ok) throw new Error(`Download failed: ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  /**
   * Uploads + analyzes in one request (the backend now does both together).
   * Uses XHR instead of fetch so we get real upload progress for the bar.
   */
  uploadResume: async (
    file: File,
    jobRoleSlug: string | undefined,
    onProgress: (percent: number) => void
  ): Promise<AnalysisResult> => {
    const token = await getToken();
    return new Promise((resolve, reject) => {
      const qs = jobRoleSlug ? `?job_role_slug=${encodeURIComponent(jobRoleSlug)}` : "";
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}/resumes/upload${qs}`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          let detail = xhr.responseText;
          try {
            detail = JSON.parse(xhr.responseText).detail ?? detail;
          } catch {
            /* leave raw text */
          }
          reject(new Error(detail || `Upload failed: ${xhr.status}`));
        }
      };
      xhr.onerror = () => reject(describeNetworkError(new TypeError("Failed to fetch")));

      const form = new FormData();
      form.append("file", file);
      xhr.send(form);
    });
  },
};
