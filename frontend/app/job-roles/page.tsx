"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Briefcase, TrendingUp, X, Scale } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { api, type JobRole, type JobRoleDetail } from "@/lib/api";

const MAX_COMPARE = 4;

function DemandDots({ level }: { level: number | null }) {
  const n = level ?? 0;
  return (
    <div className="flex gap-0.5" title={`Demand: ${n}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < n ? "bg-emerald-500" : "bg-outline-variant/40"}`}
        />
      ))}
    </div>
  );
}

export default function JobRolesPage() {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<JobRoleDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listJobRoles()
      .then(setRoles)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected.length >= 2) {
      api.compareJobRoles(selected).then(setCompareData).catch(() => setCompareData([]));
    } else {
      setCompareData([]);
    }
  }, [selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => r.name.toLowerCase().includes(q) || r.industry?.toLowerCase().includes(q));
  }, [roles, query]);

  function toggleSelect(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, slug];
    });
  }

  const allSkillNames = useMemo(() => {
    const set = new Set<string>();
    compareData.forEach((role) => {
      role.required_skills.forEach((s) => set.add(s));
      role.preferred_skills.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [compareData]);

  return (
    <>
      <Sidebar />
      <main className="ml-[280px] min-h-screen flex flex-col">
        <TopNav />
        <div className="flex-1 px-container-padding pb-section-margin pt-4 flex flex-col gap-section-margin">
          <section>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Job Roles</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Browse required and preferred skills per role, or select up to {MAX_COMPARE} to compare.
            </p>
          </section>

          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input suppressHydrationWarning
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roles or industries..."
              className="w-full bg-surface-glass/40 border border-surface-glass/50 rounded-xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/30 text-[14px]"
            />
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] text-on-surface-variant flex items-center gap-1">
                <Scale size={14} /> Comparing:
              </span>
              {selected.map((slug) => {
                const role = roles.find((r) => r.slug === slug);
                return (
                  <span
                    key={slug}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary text-[12px] font-semibold px-3 py-1 rounded-full"
                  >
                    {role?.name ?? slug}
                    <button suppressHydrationWarning onClick={() => toggleSelect(slug)}>
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {compareData.length >= 2 && (
            <section className="glass-panel rounded-[24px] overflow-x-auto p-6">
              <h3 className="font-headline-md text-[16px] font-bold text-on-surface mb-4">Role Comparison</h3>
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr>
                    <th className="text-[11px] uppercase text-on-surface-variant pb-3 pr-4">Skill</th>
                    {compareData.map((r) => (
                      <th key={r.slug} className="text-[12px] font-bold text-on-surface pb-3 px-3">
                        {r.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allSkillNames.map((skill) => (
                    <tr key={skill} className="border-t border-surface-glass/40">
                      <td className="text-[13px] text-on-surface-variant py-2 pr-4">{skill}</td>
                      {compareData.map((r) => {
                        const isRequired = r.required_skills.includes(skill);
                        const isPreferred = r.preferred_skills.includes(skill);
                        return (
                          <td key={r.slug} className="py-2 px-3">
                            {isRequired && (
                              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Required
                              </span>
                            )}
                            {isPreferred && (
                              <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full">
                                Preferred
                              </span>
                            )}
                            {!isRequired && !isPreferred && <span className="text-on-surface-variant/30">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">
            {loading ? (
              <p className="text-on-surface-variant text-sm">Loading roles…</p>
            ) : filtered.length === 0 ? (
              <p className="text-on-surface-variant text-sm">No roles match &quot;{query}&quot;.</p>
            ) : (
              filtered.map((role) => (
                <RoleCard
                  key={role.slug}
                  role={role}
                  selected={selected.includes(role.slug)}
                  onToggle={() => toggleSelect(role.slug)}
                />
              ))
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function RoleCard({
  role,
  selected,
  onToggle,
}: {
  role: JobRole;
  selected: boolean;
  onToggle: () => void;
}) {
  const [detail, setDetail] = useState<JobRoleDetail | null>(null);

  useEffect(() => {
    api.getJobRole(role.slug).then(setDetail).catch(() => setDetail(null));
  }, [role.slug]);

  return (
    <div
      className={`glass-panel p-5 rounded-[20px] flex flex-col gap-3 transition-all ${
        selected ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Briefcase size={18} />
          </div>
          <div>
            <p className="text-[14px] font-bold text-on-surface">{role.name}</p>
            <p className="text-[11px] text-on-surface-variant">{role.industry ?? "General"}</p>
          </div>
        </div>
        <label className="flex items-center gap-1.5 text-[11px] text-on-surface-variant cursor-pointer">
          <input suppressHydrationWarning type="checkbox" checked={selected} onChange={onToggle} className="accent-primary" />
          Compare
        </label>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
        <TrendingUp size={13} />
        Demand <DemandDots level={role.demand_level} />
      </div>

      {detail && (
        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Required
            </p>
            <div className="flex flex-wrap gap-1.5">
              {detail.required_skills.map((s) => (
                <span key={s} className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
          {detail.preferred_skills.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Preferred
              </p>
              <div className="flex flex-wrap gap-1.5">
                {detail.preferred_skills.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
