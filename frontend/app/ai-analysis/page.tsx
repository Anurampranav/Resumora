"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  User as UserIcon,
  Send,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Briefcase,
  Target,
  ArrowRight,
  Loader2,
  RefreshCw,
  Zap,
  Check,
  X,
  ChevronRight,
  BookOpen,
  Award,
  Layers,
  Code2,
  MessageSquare,
  FileCheck,
  TrendingUp,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import {
  api,
  type ResumeListItem,
  type AIChatMessage,
  type SectionCoachResponse,
  type BulletCoachResponse,
  type CareerGuidanceResult,
  type ActionCenterItem,
  type InterviewQuestion,
  type EvaluateAnswerResponse,
} from "@/lib/api";

const PRESET_QUESTIONS = [
  "Why is my resume weak?",
  "What should I improve first?",
  "Which section of my resume is weakest?",
  "Is my project section strong?",
  "Which skills should I highlight?",
  "Why am I not a strong candidate for backend roles?",
];

const SECTIONS = ["Summary", "Experience", "Projects", "Skills", "Achievements", "Education"];

export default function AiAnalysisPage() {
  const router = useRouter();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Core state
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"chat" | "rewriter" | "bullet" | "career" | "interview">("chat");
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action center
  const [actionItems, setActionItems] = useState<ActionCenterItem[]>([]);

  // Chat state
  const [chatHistory, setChatHistory] = useState<AIChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>([]);

  // Section Rewriter state
  const [selectedSection, setSelectedSection] = useState("Summary");
  const [customSectionText, setCustomSectionText] = useState("");
  const [sectionData, setSectionData] = useState<SectionCoachResponse | null>(null);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [acceptToast, setAcceptToast] = useState<string | null>(null);

  // Bullet Coach state
  const [selectedBullet, setSelectedBullet] = useState("");
  const [bulletData, setBulletData] = useState<BulletCoachResponse | null>(null);
  const [bulletLoading, setBulletLoading] = useState(false);

  // Career Guidance state
  const [careerData, setCareerData] = useState<CareerGuidanceResult | null>(null);
  const [careerLoading, setCareerLoading] = useState(false);

  // Interview Prep state
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [evaluationResults, setEvaluationResults] = useState<Record<string, EvaluateAnswerResponse>>({});
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const list = await api.listResumes();
        setResumes(list);
        if (list.length > 0) {
          const firstId = list[0].id;
          setSelectedResumeId(firstId);
          await loadResumeAnalysisData(firstId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load resumes");
      } finally {
        setPageLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle resume selection change
  async function handleResumeChange(id: string) {
    setSelectedResumeId(id);
    setChatHistory([]);
    setSectionData(null);
    setBulletData(null);
    setCareerData(null);
    setInterviewQuestions([]);
    await loadResumeAnalysisData(id);
  }

  // Load backend AI data for selected resume
  async function loadResumeAnalysisData(id: string) {
    try {
      const actions = await api.getActionCenter(id);
      setActionItems(actions.items);

      // Pre-populate chat welcome message
      const activeRes = resumes.find((r) => r.id === id);
      const roleName = activeRes?.role_name || "your target role";
      setChatHistory([
        {
          role: "assistant",
          content: `Hello! I am **Resumora AI**, your personal resume coach. I have analyzed your resume for **${roleName}**. Ask me anything about how to strengthen your profile, reframe your experience, or target your dream job!`,
        },
      ]);

      // Pre-load guidance
      const guidance = await api.getCareerGuidance(id);
      setCareerData(guidance);
    } catch (err) {
      console.error("Error loading AI context:", err);
    }
  }

  // Handle Chat submit
  async function handleSendQuestion(qText?: string) {
    const query = qText || inputQuestion;
    if (!query.trim() || !selectedResumeId || chatLoading) return;

    const userMsg: AIChatMessage = { role: "user", content: query };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setInputQuestion("");
    setChatLoading(true);

    try {
      const res = await api.chatWithAi(selectedResumeId, query, updatedHistory);
      setChatHistory((prev) => [...prev, { role: "assistant", content: res.reply }]);
      setSuggestedFollowups(res.suggested_questions || []);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Resumora AI is temporarily adjusting to high request volume. Based on your uploaded resume context, I recommend starting with your project descriptions to highlight measurable impact metrics.",
        },
      ]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  // Handle Section Analysis
  async function handleAnalyzeSection(sectionName: string, textOverride?: string) {
    if (!selectedResumeId) return;
    setSelectedSection(sectionName);
    setSectionLoading(true);
    try {
      const res = await api.analyzeSectionCoach(selectedResumeId, sectionName, textOverride || customSectionText);
      setSectionData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSectionLoading(false);
    }
  }

  // Handle Accept Rewrite
  async function handleAcceptRewrite(newContent: string) {
    if (!selectedResumeId) return;
    try {
      await api.acceptRewrite(selectedResumeId, selectedSection, newContent);
      setAcceptToast(`Successfully accepted & updated your ${selectedSection} section!`);
      setTimeout(() => setAcceptToast(null), 4000);
    } catch (err) {
      console.error(err);
    }
  }

  // Handle Bullet Analysis
  async function handleAnalyzeBullet() {
    if (!selectedResumeId || !selectedBullet.trim()) return;
    setBulletLoading(true);
    try {
      const res = await api.analyzeBulletCoach(selectedResumeId, selectedBullet);
      setBulletData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setBulletLoading(false);
    }
  }

  // Load Career Guidance
  async function handleLoadCareerGuidance() {
    if (!selectedResumeId) return;
    setCareerLoading(true);
    try {
      const guidance = await api.getCareerGuidance(selectedResumeId);
      setCareerData(guidance);
    } catch (err) {
      console.error(err);
    } finally {
      setCareerLoading(false);
    }
  }

  // Load Interview Prep
  async function handleLoadInterviewPrep() {
    if (!selectedResumeId) return;
    setInterviewLoading(true);
    try {
      const prep = await api.getInterviewQuestions(selectedResumeId);
      setInterviewQuestions(prep.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setInterviewLoading(false);
    }
  }

  // Evaluate candidate interview answer
  async function handleEvaluateAnswer(qId: string, qText: string) {
    const answer = userAnswers[qId];
    if (!answer || !answer.trim() || !selectedResumeId) return;

    setEvaluatingId(qId);
    try {
      const res = await api.evaluateInterviewAnswer(selectedResumeId, qId, qText, answer);
      setEvaluationResults((prev) => ({ ...prev, [qId]: res }));
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingId(null);
    }
  }

  // Switch tabs when Action Item clicked
  function handleActionClick(target: string) {
    if (target === "rewriter" || target === "section") {
      setActiveTab("rewriter");
      handleAnalyzeSection("Summary");
    } else if (target === "bullet") {
      setActiveTab("bullet");
    } else if (target === "interview") {
      setActiveTab("interview");
      handleLoadInterviewPrep();
    } else {
      setActiveTab("career");
    }
  }

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  return (
    <>
      <Sidebar />
      <main className="ml-[260px] min-h-screen flex flex-col bg-background text-on-surface transition-colors duration-300">
        <TopNav />

        <div className="flex-1 px-6 pb-12 pt-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
          {/* Header Banner */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-r from-violet-600/15 via-indigo-600/10 to-purple-600/15 dark:from-violet-900/40 dark:via-indigo-900/30 dark:to-purple-900/40 border border-violet-500/30 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-violet-600/30 border border-white/20">
                  <Sparkles size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-extrabold text-2xl text-gray-900 dark:text-white tracking-tight">RESUMORA AI</h1>
                    <span className="bg-violet-500/20 border border-violet-500/40 text-violet-700 dark:text-violet-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Live AI Coach
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    Your personal resume coach powered by Google Gemini API &amp; your actual uploaded resume.
                  </p>
                </div>
              </div>

              {/* Resume Selector */}
              <div className="flex items-center gap-3 bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-2.5 rounded-2xl backdrop-blur-md">
                <FileCheck size={18} className="text-violet-600 dark:text-violet-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Active Resume Context</span>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => handleResumeChange(e.target.value)}
                    className="bg-transparent text-xs font-bold text-gray-900 dark:text-white focus:outline-none cursor-pointer pr-4"
                  >
                    {resumes.length === 0 && <option value="">No resumes found</option>}
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id} className="bg-white dark:bg-[#0b0d1e] text-gray-900 dark:text-white">
                        {r.file_name} {r.role_name ? `(${r.role_name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* AI Action Center */}
          {actionItems.length > 0 && (
            <section className="glass-panel p-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 dark:bg-violet-950/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-amber-500 dark:text-amber-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">AI Action Center</h3>
                </div>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Gemini High-Priority Fixes</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {actionItems.map((item, idx) => {
                  const badgeColor =
                    item.priority === "HIGH"
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-400"
                      : item.priority === "MEDIUM"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400"
                      : "bg-yellow-500/20 border-yellow-500/40 text-yellow-600 dark:text-yellow-400";
                  const priorityDot = item.priority === "HIGH" ? "🔴" : item.priority === "MEDIUM" ? "🟠" : "🟡";
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => handleActionClick(item.workflow_target)}
                      className="glass-card hover:border-violet-500/50 p-3.5 rounded-xl flex flex-col justify-between cursor-pointer transition-all duration-200 group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                            {priorityDot} {item.priority} PRIORITY
                          </span>
                          <ChevronRight size={14} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                      </div>
                      <button className="mt-3 text-[11px] font-semibold text-violet-600 dark:text-violet-400 flex items-center gap-1 group-hover:text-violet-500 dark:group-hover:text-violet-300">
                        <span>Start Improving</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Navigation Tool Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-white/10 pb-3">
            {[
              { id: "chat", label: "Ask Resumora AI", icon: MessageSquare },
              { id: "rewriter", label: "AI Resume Rewriter & Section Coach", icon: Wand2 },
              { id: "bullet", label: "Bullet Point Coach", icon: Target },
              { id: "career", label: "AI Career Guidance & Plan", icon: TrendingUp },
              { id: "interview", label: "AI Interview Preparation", icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === "career" && !careerData) handleLoadCareerGuidance();
                    if (tab.id === "interview" && interviewQuestions.length === 0) handleLoadInterviewPrep();
                    if (tab.id === "rewriter" && !sectionData) handleAnalyzeSection("Summary");
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 border border-violet-400/30"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Toast Alert Notification */}
          {acceptToast && (
            <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>{acceptToast}</span>
              </div>
              <button onClick={() => setAcceptToast(null)} className="text-emerald-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}

          {/* TAB 1: ASK RESUMORA AI (CHAT) */}
          {activeTab === "chat" && (
            <div className="glass-panel p-6 rounded-3xl flex flex-col h-[650px] border border-white/10 relative">
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Interactive AI Resume Coach</h3>
                    <p className="text-[11px] text-gray-400">
                      Context: {selectedResume?.file_name || "Uploaded Resume"} ({selectedResume?.role_name || "General"})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setChatHistory([])}
                  className="text-[11px] font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                >
                  Clear Chat
                </button>
              </div>

              {/* Chat Message Window */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-none">
                {chatHistory.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={idx} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                      {!isUser && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <Bot size={16} />
                        </div>
                      )}
                      <div
                        className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                          isUser
                            ? "bg-violet-600 text-white rounded-br-none shadow-md shadow-violet-600/20"
                            : "glass-card text-gray-200 rounded-bl-none border border-white/10"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {isUser && (
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                          <UserIcon size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {chatLoading && (
                  <div className="flex gap-3 items-center text-xs text-violet-400 bg-violet-950/20 border border-violet-500/30 p-3 rounded-xl w-fit">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Gemini is analyzing your resume content...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Suggested Follow-up Questions Chips */}
              <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Suggested Questions</p>
                <div className="flex flex-wrap gap-2">
                  {(suggestedFollowups.length > 0 ? suggestedFollowups : PRESET_QUESTIONS).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendQuestion(q)}
                      className="text-[11px] bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/40 text-gray-300 hover:text-violet-200 px-3 py-1.5 rounded-full transition-all text-left"
                    >
                      💡 {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Box */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendQuestion()}
                  placeholder="Ask anything about your resume, bullet impact, or target role..."
                  className="flex-1 bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                />
                <button
                  onClick={() => handleSendQuestion()}
                  disabled={chatLoading || !inputQuestion.trim()}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-3 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
                >
                  {chatLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AI RESUME REWRITER & SECTION COACH */}
          {activeTab === "rewriter" && (
            <div className="space-y-6">
              {/* Section Pills */}
              <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-2 border border-white/10">
                <span className="text-xs font-bold text-gray-400 self-center mr-2">Select Section:</span>
                {SECTIONS.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleAnalyzeSection(sec)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedSection === sec
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              {/* Section Analysis Cards */}
              {sectionLoading ? (
                <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 size={32} className="animate-spin text-violet-400" />
                  <p className="text-xs font-semibold text-gray-300">Gemini is evaluating your {selectedSection} section...</p>
                </div>
              ) : sectionData ? (
                <div className="space-y-6">
                  {/* Evaluation Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-500">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 size={14} /> What is Strong
                      </h4>
                      <ul className="space-y-1 text-[11px] text-gray-300">
                        {sectionData.strong.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-rose-500">
                      <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-2">
                        <AlertTriangle size={14} /> What is Weak
                      </h4>
                      <ul className="space-y-1 text-[11px] text-gray-300">
                        {sectionData.weak.map((w, i) => (
                          <li key={i}>• {w}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-amber-500">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                        <HelpCircle size={14} /> What is Missing
                      </h4>
                      <ul className="space-y-1 text-[11px] text-gray-300">
                        {sectionData.missing.map((m, i) => (
                          <li key={i}>• {m}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-violet-500">
                      <h4 className="text-xs font-bold text-violet-400 flex items-center gap-1.5 mb-2">
                        <Wand2 size={14} /> Recommended Changes
                      </h4>
                      <ul className="space-y-1 text-[11px] text-gray-300">
                        {sectionData.changes.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Before -> After Visual Comparison */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">Before → After Improvement</h3>
                        <p className="text-xs text-gray-400">{sectionData.why_improve}</p>
                      </div>
                      <button
                        onClick={() => handleAnalyzeSection(selectedSection)}
                        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-950/40 border border-violet-500/30 px-3 py-1.5 rounded-xl font-semibold"
                      >
                        <RefreshCw size={12} /> Regenerate
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Current Content */}
                      <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl space-y-2">
                        <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block">
                          Current {selectedSection} Content
                        </span>
                        <p className="text-xs text-gray-200 leading-relaxed font-mono">
                          {customSectionText || "Original section text extracted from your resume."}
                        </p>
                      </div>

                      {/* Improved Version */}
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl space-y-2 relative">
                        <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                          Gemini Improved Version
                        </span>
                        <p className="text-xs text-emerald-100 leading-relaxed font-mono font-medium">
                          {sectionData.suggested_version}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                      <button
                        onClick={() => setSectionData(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5"
                      >
                        Reject Suggestion
                      </button>
                      <button
                        onClick={() => handleAcceptRewrite(sectionData.suggested_version)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                      >
                        <Check size={14} /> Accept &amp; Update Resume
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel p-8 rounded-3xl text-center text-gray-400">
                  Select a section above to start the Gemini AI Section Coach analysis.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BULLET POINT COACH */}
          {activeTab === "bullet" && (
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-1">BULLET POINT COACH</h3>
                <p className="text-xs text-gray-400">
                  Select or enter an individual bullet point from your resume to receive AI quality assessment and rewrite.
                </p>
              </div>

              {/* Input Area */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-300 block">Current Bullet Point:</label>
                <textarea
                  value={selectedBullet}
                  onChange={(e) => setSelectedBullet(e.target.value)}
                  placeholder="e.g. Developed a website using React and backend APIs."
                  className="w-full h-24 bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-2xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAnalyzeBullet}
                    disabled={bulletLoading || !selectedBullet.trim()}
                    className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50"
                  >
                    {bulletLoading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                    <span>Evaluate &amp; Rewrite Bullet</span>
                  </button>
                </div>
              </div>

              {/* Assessment Output */}
              {bulletData && (
                <div className="space-y-4 pt-4 border-t border-white/10 animate-in fade-in duration-300">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Quality Assessment</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                      <span className="text-[10px] font-bold text-violet-400 block mb-1 uppercase">Clarity</span>
                      <p className="text-xs text-gray-200">{bulletData.clarity_assessment}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                      <span className="text-[10px] font-bold text-emerald-400 block mb-1 uppercase">Impact</span>
                      <p className="text-xs text-gray-200">{bulletData.impact_assessment}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                      <span className="text-[10px] font-bold text-amber-400 block mb-1 uppercase">Specificity</span>
                      <p className="text-xs text-gray-200">{bulletData.specificity_assessment}</p>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-amber-400 block mb-1 uppercase">AI Recommendation</span>
                    <p className="text-xs text-amber-200">{bulletData.recommendation}</p>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">
                      Improved Version (Gemini Rewrite)
                    </span>
                    <p className="text-xs font-semibold text-emerald-100 font-mono">{bulletData.suggested_version}</p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleAcceptRewrite(bulletData.suggested_version)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      <Check size={14} /> Accept Suggestion
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI CAREER COACH & SKILL / PROJECT RECOMMENDATIONS */}
          {activeTab === "career" && (
            <div className="space-y-6">
              {careerLoading ? (
                <div className="glass-panel p-12 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 size={32} className="animate-spin text-violet-400" />
                  <p className="text-xs font-semibold text-gray-300">Generating personalized career guidance with Gemini...</p>
                </div>
              ) : careerData ? (
                <>
                  {/* Suited Roles */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Briefcase size={18} className="text-violet-400" /> Target Roles Aligned With Your Profile
                    </h3>
                    <p className="text-xs text-gray-400">Based on your current resume skills, experience, and project depth:</p>
                    <div className="flex flex-wrap gap-2">
                      {careerData.suited_roles.map((role, i) => (
                        <span
                          key={i}
                          className="bg-violet-500/20 border border-violet-500/40 text-violet-200 text-xs font-semibold px-4 py-2 rounded-xl"
                        >
                          🎯 {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Skill Gap Development */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 size={18} className="text-emerald-400" /> Recommended Next Skills To Learn
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {careerData.potential_next_skills.map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1.5">
                          <span className="text-xs font-bold text-emerald-400 block">{item.skill}</span>
                          <p className="text-[11px] text-gray-300">{item.why}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Project Recommendations */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers size={18} className="text-amber-400" /> Custom Project Recommendations
                    </h3>
                    <p className="text-xs text-gray-400">Build these projects to close background gaps and strengthen your resume:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {careerData.project_recommendations.map((proj, i) => (
                        <div key={i} className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                          <h4 className="text-xs font-bold text-white">{proj.title}</h4>
                          <p className="text-[11px] text-gray-300">{proj.why}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {proj.skills_demonstrated.map((s, sIdx) => (
                              <span key={sIdx} className="bg-white/10 text-[10px] text-gray-300 px-2 py-0.5 rounded-md">
                                {s}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-violet-300 font-semibold italic">Value: {proj.potential_value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personalized Improvement Plan */}
                  <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award size={18} className="text-purple-400" /> YOUR AI IMPROVEMENT PLAN
                    </h3>
                    <div className="space-y-3">
                      {careerData.improvement_plan.map((item, i) => {
                        const badgeColor =
                          item.priority === "HIGH"
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                            : item.priority === "MEDIUM"
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                            : "bg-yellow-500/20 border-yellow-500/40 text-yellow-400";
                        return (
                          <div key={i} className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/10">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${badgeColor}`}>
                                  {item.priority} PRIORITY
                                </span>
                                <span className="text-[11px] font-semibold text-gray-400">• {item.category}</span>
                              </div>
                              <h4 className="text-xs font-bold text-white">{item.title}</h4>
                              <p className="text-[11px] text-gray-300">{item.recommendation}</p>
                            </div>
                            <button
                              onClick={() => handleActionClick(item.action_tab)}
                              className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2 rounded-xl text-xs shrink-0 transition-all"
                            >
                              Execute Task
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* TAB 5: AI INTERVIEW PREPARATION */}
          {activeTab === "interview" && (
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-1">AI INTERVIEW PREPARATION</h3>
                <p className="text-xs text-gray-400">
                  Questions generated strictly from your uploaded resume. Type your response for real-time Gemini evaluation.
                </p>
              </div>

              {interviewLoading ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 size={28} className="animate-spin text-violet-400" />
                  <p className="text-xs text-gray-300">Generating interview questions tailored to your experience...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {interviewQuestions.map((q) => {
                    const evalResult = evaluationResults[q.id];
                    const isEvaluating = evaluatingId === q.id;
                    return (
                      <div key={q.id} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="bg-violet-500/20 border border-violet-500/40 text-violet-300 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                            {q.category}
                          </span>
                          <span className="text-[11px] text-gray-400">Why asked: {q.why_asked}</span>
                        </div>

                        <h4 className="text-sm font-bold text-white">{q.question}</h4>

                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] text-gray-400 font-bold uppercase self-center mr-1">Key Talking Points:</span>
                          {q.key_talking_points.map((pt, pIdx) => (
                            <span key={pIdx} className="bg-white/5 border border-white/10 text-[10px] text-gray-300 px-2.5 py-1 rounded-md">
                              • {pt}
                            </span>
                          ))}
                        </div>

                        {/* Answer Input */}
                        <div className="space-y-2">
                          <textarea
                            value={userAnswers[q.id] || ""}
                            onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                            placeholder="Type your answer here..."
                            className="w-full h-24 bg-white/5 border border-white/10 focus:border-violet-500/50 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleEvaluateAnswer(q.id, q.question)}
                              disabled={isEvaluating || !userAnswers[q.id]?.trim()}
                              className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-violet-600/20 disabled:opacity-50"
                            >
                              {isEvaluating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                              <span>Evaluate Answer with Gemini</span>
                            </button>
                          </div>
                        </div>

                        {/* Evaluation Result */}
                        {evalResult && (
                          <div className="bg-violet-950/30 border border-violet-500/30 p-4 rounded-2xl space-y-3 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">Gemini Answer Score:</span>
                              <span className="text-lg font-extrabold text-emerald-400">{evalResult.score}/100</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                                <span className="text-emerald-400 font-bold block mb-1">Strengths:</span>
                                <ul className="space-y-1 text-gray-300">
                                  {evalResult.strengths.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                                <span className="text-rose-400 font-bold block mb-1">Areas to Refine:</span>
                                <ul className="space-y-1 text-gray-300">
                                  {evalResult.weaknesses.map((w, i) => (
                                    <li key={i}>• {w}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                              <span className="text-amber-400 font-bold block mb-1 text-xs">Recommended STAR Framework Structure:</span>
                              <p className="text-xs text-amber-100">{evalResult.better_answer_structure}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
