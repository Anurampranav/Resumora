"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignUp, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ScrollText } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9C16.65 14.2 17.64 11.9 17.64 9.2z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
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

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"email" | "google" | "github" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isAuthLoaded, isSignedIn, router]);

  async function handleOAuth(strategy: "oauth_google" | "oauth_github") {
    if (!isLoaded) return;
    setError(null);
    setLoading(strategy === "oauth_google" ? "google" : "github");
    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "errors" in err
        ? // @ts-expect-error Clerk error shape
          err.errors?.[0]?.code
        : "";
      const msg = err instanceof Error ? err.message : String(err);
      if (code === "session_already_exists" || msg.toLowerCase().includes("session already exists")) {
        router.push("/dashboard");
        return;
      }
      setError(msg || "Something went wrong — try again.");
      setLoading(null);
    }
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading("email");
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const firstErr = err && typeof err === "object" && "errors" in err
        ? // @ts-expect-error Clerk error shape
          err.errors?.[0]
        : null;
      const code = firstErr?.code;
      const message = firstErr?.message ?? (err instanceof Error ? err.message : "Could not sign up — try again.");

      if (code === "session_already_exists" || message.toLowerCase().includes("session already exists")) {
        router.push("/dashboard");
        return;
      }
      setError(message);
    } finally {
      setLoading(null);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);
    setLoading("email");
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Verification incomplete — check the code and try again.");
      }
    } catch (err: unknown) {
      const firstErr = err && typeof err === "object" && "errors" in err
        ? // @ts-expect-error Clerk error shape
          err.errors?.[0]
        : null;
      const code = firstErr?.code;
      const message = firstErr?.message ?? "Invalid code — try again.";

      if (code === "session_already_exists" || message.toLowerCase().includes("session already exists")) {
        router.push("/dashboard");
        return;
      }
      setError(message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center gradient-mesh relative overflow-hidden p-6 text-on-surface">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-tertiary/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="glass-panel rounded-[28px] p-8 shadow-2xl" style={{ transform: "perspective(1200px) rotateY(1deg)" }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md">
              <ScrollText size={22} />
            </div>
            <p className="font-headline-md text-headline-md font-bold text-on-surface">Resumora</p>
          </div>

          {!pendingVerification ? (
            <>
              <h2 className="font-headline-md text-[24px] font-bold text-on-surface mb-1">Create your account</h2>
              <p className="text-[13px] text-on-surface-variant mb-7">Start scoring your resume in under a minute</p>

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
                <span className="text-[11px] text-on-surface-variant uppercase tracking-wider">or use email</span>
                <div className="flex-1 h-px bg-outline-variant/40" />
              </div>

              <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
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
                  <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      suppressHydrationWarning
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
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

                {/* Mount Clerk CAPTCHA / bot protection widget */}
                <div id="clerk-captcha" />

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
                  Create Account
                </button>
              </form>

              <p className="text-center text-[13px] text-on-surface-variant mt-7">
                Already have an account?{" "}
                <Link href="/sign-in" className="font-bold text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="font-headline-md text-[24px] font-bold text-on-surface mb-1">Check your email</h2>
              <p className="text-[13px] text-on-surface-variant mb-7">
                We sent a verification code to <span className="font-semibold text-on-surface">{email}</span>
              </p>
              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-digit code"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl py-2.5 px-4 text-[14px] text-on-surface text-center tracking-[0.3em] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {error && (
                  <p className="text-[12px] text-error bg-error-container/60 border border-error/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={loading !== null}
                  className="btn-gradient text-white py-3 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading === "email" && <Loader2 size={16} className="animate-spin" />}
                  Verify & Continue
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
