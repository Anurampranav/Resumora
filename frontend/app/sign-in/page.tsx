"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import CircularScore from "@/components/CircularScore";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9C16.65 14.2 17.64 11.9 17.64 9.2z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.5 0 12.3c0 5.44 3.44 10.05 8.21 11.68.6.12.82-.27.82-.6v-2.1c-3.34.75-4.04-1.65-4.04-1.65-.55-1.42-1.33-1.8-1.33-1.8-1.09-.77.08-.75.08-.75 1.2.09 1.84 1.26 1.84 1.26 1.07 1.87 2.8 1.33 3.49 1.02.1-.79.42-1.33.76-1.64-2.67-.31-5.47-1.37-5.47-6.1 0-1.35.47-2.45 1.24-3.31-.12-.31-.54-1.57.12-3.28 0 0 1.01-.33 3.3 1.27a11.2 11.2 0 0 1 6 0c2.29-1.6 3.3-1.27 3.3-1.27.66 1.71.24 2.97.12 3.28.77.86 1.24 1.96 1.24 3.31 0 4.74-2.8 5.79-5.48 6.1.43.38.81 1.13.81 2.29v3.39c0 .33.22.72.83.6C20.57 22.34 24 17.74 24 12.3 24 5.5 18.63 0 12 0z" />
    </svg>
  );
}

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"email" | "google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOAuth(strategy: "oauth_google" | "oauth_github") {
    if (!isLoaded) return;
    setError(null);
    setLoading(strategy === "oauth_google" ? "google" : "github");
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — try again.");
      setLoading(null);
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading("email");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Additional verification is required — check your email.");
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? // @ts-expect-error Clerk error shape
            err.errors?.[0]?.message
          : err instanceof Error
            ? err.message
            : "Could not sign in — check your credentials.";
      setError(message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background gradient-mesh relative overflow-hidden">
      {/* Ambient floating glass orbs — the "3D" depth cues */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-tertiary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Left panel — brand storytelling with floating 3D-tilted glass cards */}
      <div className="hidden lg:flex flex-col justify-center flex-1 px-16 relative z-10">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <ScrollText size={26} />
            </div>
            <div>
              <p className="font-headline-md text-headline-md font-bold text-on-surface leading-tight">Resumora</p>
              <p className="text-[12px] text-on-surface-variant">AI Resume Analyzer</p>
            </div>
          </div>

          <h1 className="font-display-lg text-[42px] leading-tight font-extrabold text-on-surface mb-4">
            Land the interview,
            <br />
            not the rejection pile.
          </h1>
          <p className="text-body-lg text-on-surface-variant mb-10 leading-relaxed">
            Upload your resume, get a deterministic ATS score, and let AI show you exactly what to fix —
            before a recruiter ever sees it.
          </p>

          {/* Floating glass stat cards — depth via layered shadows + slight rotation */}
          <div className="relative h-56">
            <div
              className="glass-panel absolute top-0 left-0 w-52 p-4 rounded-2xl flex items-center gap-3 shadow-2xl"
              style={{ transform: "perspective(800px) rotateY(6deg) rotateX(2deg)" }}
            >
              <CircularScore value={87} color="#6C63FF" size={52} />
              <div>
                <p className="text-[11px] text-on-surface-variant">ATS Score</p>
                <p className="text-[13px] font-bold text-on-surface">Excellent</p>
              </div>
            </div>

            <div
              className="glass-panel absolute top-16 right-0 w-56 p-4 rounded-2xl shadow-2xl"
              style={{ transform: "perspective(800px) rotateY(-8deg) rotateX(3deg)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-primary" />
                <p className="text-[12px] font-bold text-on-surface">AI Suggestion</p>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Add quantifiable outcomes to your experience bullets.
              </p>
            </div>

            <div
              className="glass-panel absolute bottom-0 left-10 w-48 p-4 rounded-2xl flex items-center gap-2.5 shadow-2xl"
              style={{ transform: "perspective(800px) rotateY(4deg) rotateX(-2deg)" }}
            >
              <ShieldCheck size={22} className="text-emerald-500 shrink-0" />
              <p className="text-[11px] text-on-surface-variant leading-snug">
                Deterministic scoring — no AI guesswork on your score.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — the actual sign-in card */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[420px]">
          <div
            className="glass-panel rounded-[28px] p-8 shadow-2xl"
            style={{ transform: "perspective(1200px) rotateY(-1deg)" }}
          >
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg">
                <ScrollText size={22} />
              </div>
              <p className="font-headline-md text-headline-md font-bold text-on-surface">Resumora</p>
            </div>

            <h2 className="font-headline-md text-[24px] font-bold text-on-surface mb-1">Welcome back</h2>
            <p className="text-[13px] text-on-surface-variant mb-7">Sign in to check your next resume&apos;s ATS score</p>

            <div className="flex flex-col gap-3 mb-6">
              <button
                suppressHydrationWarning
                onClick={() => handleOAuth("oauth_google")}
                disabled={loading !== null}
                className="flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container-highest/60 transition-colors rounded-xl py-3 text-[14px] font-semibold text-on-surface disabled:opacity-50"
              >
                {loading === "google" ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>
              <button
                suppressHydrationWarning
                onClick={() => handleOAuth("oauth_github")}
                disabled={loading !== null}
                className="flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container-highest/60 transition-colors rounded-xl py-3 text-[14px] font-semibold text-on-surface disabled:opacity-50"
              >
                {loading === "github" ? <Loader2 size={18} className="animate-spin" /> : <GitHubIcon />}
                Continue with GitHub
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-outline-variant/40" />
              <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">or continue with email</span>
              <div className="flex-1 h-px bg-outline-variant/40" />
            </div>

            <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">Email</label>
                <input
                  suppressHydrationWarning
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-2.5 px-4 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[12px] font-semibold text-on-surface-variant">Password</label>
                  <Link href="/sign-in/forgot-password" className="text-[11px] text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    suppressHydrationWarning
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-2.5 px-4 pr-11 text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-[12px] text-error bg-error-container/60 border border-error/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                suppressHydrationWarning
                type="submit"
                disabled={loading !== null}
                className="btn-gradient text-white py-3 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
              >
                {loading === "email" && <Loader2 size={16} className="animate-spin" />}
                Sign In
              </button>
            </form>

            <p className="text-center text-[13px] text-on-surface-variant mt-7">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="font-bold text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
