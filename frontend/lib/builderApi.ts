import { getToken } from "./auth";
import { AtsCheckResult, AiImproveResult, ResumeData, ResumeVersionItem } from "../types/builder";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

export async function generateSummaryApi(payload: {
  self_description: string;
  qualities: string[];
  interest_areas: string;
  target_role: string;
}): Promise<string> {
  const res = await authFetch(`${API_BASE}/builder/generate-summary`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to generate summary with AI");
  }
  const data = await res.json();
  return data.summary;
}

export async function transformBulletsApi(payload: {
  raw_input: string;
  role_title: string;
  section_type: string;
  target_role: string;
}): Promise<string[]> {
  const res = await authFetch(`${API_BASE}/builder/transform-bullets`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to transform bullet points with AI");
  }
  const data = await res.json();
  return data.bullets || [];
}

export async function improveTextApi(payload: {
  current_text: string;
  section_type: string;
  target_role: string;
  context?: string;
}): Promise<AiImproveResult> {
  const res = await authFetch(`${API_BASE}/builder/improve-text`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to improve text with AI");
  }
  return await res.json();
}

export async function organizeSkillsApi(raw_skills: string): Promise<Record<string, string[]>> {
  const res = await authFetch(`${API_BASE}/builder/organize-skills`, {
    method: "POST",
    body: JSON.stringify({ raw_skills }),
  });
  if (!res.ok) {
    throw new Error("Failed to organize skills with AI");
  }
  const data = await res.json();
  return data.skills;
}

export async function checkAtsApi(resume_data: ResumeData): Promise<AtsCheckResult> {
  const res = await authFetch(`${API_BASE}/builder/check-ats`, {
    method: "POST",
    body: JSON.stringify({ resume_data }),
  });
  if (!res.ok) {
    throw new Error("Failed to run ATS check");
  }
  return await res.json();
}

export async function downloadPdfApi(resume_data: ResumeData, filename?: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/builder/pdf`, {
    method: "POST",
    body: JSON.stringify({ resume_data, template: resume_data.template }),
  });
  if (!res.ok) {
    throw new Error("Failed to generate PDF");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `Resumora_Resume_${(resume_data.personal_info.full_name || "Candidate").replace(/\s+/g, "_")}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function saveDraftApi(resume_data: ResumeData, title?: string): Promise<{ id: string; updated_at: string }> {
  const res = await authFetch(`${API_BASE}/builder/draft`, {
    method: "POST",
    body: JSON.stringify({ resume_data, title, template: resume_data.template }),
  });
  if (!res.ok) {
    throw new Error("Failed to save draft");
  }
  return await res.json();
}

export async function getDraftApi(): Promise<ResumeData | null> {
  try {
    const res = await authFetch(`${API_BASE}/builder/draft`, { method: "GET" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.draft?.resume_data || null;
  } catch {
    return null;
  }
}

export async function finalizeResumeApi(resume_data: ResumeData, atsScore: number, title?: string): Promise<{ id: string }> {
  const res = await authFetch(`${API_BASE}/builder/finalize`, {
    method: "POST",
    body: JSON.stringify({
      resume_data,
      ats_score: atsScore,
      title: title || `${resume_data.personal_info.full_name || "Resume"} - ${resume_data.career_goal.target_role || "General"}`,
      template: resume_data.template,
    }),
  });
  if (!res.ok) {
    throw new Error("Failed to finalize resume");
  }
  return await res.json();
}

export async function listVersionsApi(): Promise<ResumeVersionItem[]> {
  try {
    const res = await authFetch(`${API_BASE}/builder/versions`, { method: "GET" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function duplicateVersionApi(id: string): Promise<{ id: string; title: string }> {
  const res = await authFetch(`${API_BASE}/builder/versions/${id}/duplicate`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to duplicate version");
  return await res.json();
}

export async function deleteVersionApi(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE}/builder/versions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete version");
}
