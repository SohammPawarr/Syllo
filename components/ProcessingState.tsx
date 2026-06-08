"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface ProcessingStateProps {
  jobId: string;
}

const PHASE_LABELS: Record<string, string> = {
  PENDING: "Queued",
  CHUNKING: "Splitting document into chunks…",
  EMBEDDING: "Generating vector embeddings…",
  READY: "Processing complete!",
  COMPLETED: "Processing complete!",
};

const PHASE_ICONS: Record<string, string> = {
  PENDING: "⏳",
  CHUNKING: "✂️",
  EMBEDDING: "🧬",
  READY: "✅",
  COMPLETED: "✅",
};

export default function ProcessingState({ jobId }: ProcessingStateProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["job-status", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: (query) => {
      // Stop polling once completed
      if (query.state.data?.status === "COMPLETED") return false;
      return 3000;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-brand-deep border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-brand-red text-sm">
        <span className="text-2xl mb-2">⚠️</span>
        <p>Failed to fetch job status</p>
      </div>
    );
  }

  const phase = data?.phase || "PENDING";
  const isComplete = data?.status === "COMPLETED";

  return (
    <div className="space-y-4">
      {/* Current Phase */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${isComplete ? "bg-brand-deep" : "bg-brand-yellow"}`}
        >
          {PHASE_ICONS[phase] || "⏳"}
        </div>
        <div>
          <p className="font-medium text-[var(--foreground)] text-sm">
            {PHASE_LABELS[phase] || phase}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Job: {jobId.slice(0, 8)}…
          </p>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <div className="space-y-2">
        {["PENDING", "CHUNKING", "EMBEDDING", "READY"].map((step) => {
          const stepIndex = [
            "PENDING",
            "CHUNKING",
            "EMBEDDING",
            "READY",
          ].indexOf(step);
          const currentIndex = [
            "PENDING",
            "CHUNKING",
            "EMBEDDING",
            "READY",
          ].indexOf(phase);
          const isDone = stepIndex < currentIndex;
          const isCurrent = stepIndex === currentIndex;

          return (
            <div key={step} className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isDone
                    ? "bg-brand-deep"
                    : isCurrent
                      ? "bg-brand-orange"
                      : "bg-[var(--border)]"
                }`}
              />
              <span
                className={`text-xs ${
                  isDone
                    ? "text-[var(--foreground)]"
                    : isCurrent
                      ? "text-brand-orange font-medium"
                      : "text-[var(--muted-foreground)]"
                }`}
              >
                {PHASE_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
