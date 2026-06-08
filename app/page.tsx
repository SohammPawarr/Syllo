"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        {/* Logo Mark */}
        <div className="mx-auto mb-8 w-16 h-16 bg-brand-deep rounded-2xl flex items-center justify-center">
          <span className="text-white text-2xl font-bold">S</span>
        </div>

        <h1 className="text-5xl font-bold text-brand-deep tracking-tight mb-4">
          Syllo
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] mb-10 leading-relaxed">
          Upload any document. Get AI-generated quizzes, flashcards, and
          knowledge graphs — then export straight to Google Forms.
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="inline-flex items-center gap-3 bg-brand-deep text-white font-semibold text-base px-8 py-4 rounded-xl hover:bg-brand-purple transition-colors cursor-pointer"
        >
          {/* Google Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full"
      >
        <FeatureCard
          icon="📄"
          title="Upload Documents"
          description="Supports PDFs, slides, and text files"
          color="bg-brand-yellow"
        />
        <FeatureCard
          icon="🧠"
          title="AI Generation"
          description="Powered by Gemini 2.5 Flash"
          color="bg-brand-orange"
        />
        <FeatureCard
          icon="📝"
          title="Export to Forms"
          description="One-click Google Forms export"
          color="bg-brand-red"
        />
      </motion.div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="border border-[var(--border)] rounded-xl p-6">
      <div
        className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center text-lg mb-4`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-[var(--foreground)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  );
}
