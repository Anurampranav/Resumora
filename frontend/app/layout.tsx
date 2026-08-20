import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeProvider from "@/components/ThemeProvider";
import AnimatedAsciiBackground from "@/components/AnimatedAsciiBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resumora — AI Resume Analyzer",
  description: "Get an ATS score, a skill-gap breakdown, and AI suggestions for your resume.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning className="dark">
        <body
          suppressHydrationWarning
          className="bg-[#050505] text-[#F5F3EC] font-body-md overflow-x-hidden antialiased min-h-screen relative"
        >
          <AnimatedAsciiBackground />
          <div className="relative z-10">
            <ThemeProvider>{children}</ThemeProvider>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
