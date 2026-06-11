"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

interface ProcessingStateProps {
  jobId: string;
  documentId: string;
  onReady?: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  PENDING: "Queued",
  CHUNKING: "Reading pages…",
  EMBEDDING: "Memorizing facts…",
  READY: "Ready!",
  COMPLETED: "Ready!",
};

export default function ProcessingState({
  jobId,
  documentId,
  onReady,
}: ProcessingStateProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["job-status", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "COMPLETED") {
        onReady?.();
        return false;
      }
      return 3000;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-light-blue)]" />
        <span className="text-xs font-bold text-[var(--gray-500)] uppercase tracking-wider">Checking status…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-xs font-bold text-[var(--gray-900)] py-1 bg-[var(--brand-yellow)] px-2 rounded-md inline-block border border-[var(--black)]/10">Failed to get status</p>
    );
  }

  const phase = data?.phase || "PENDING";
  const isComplete = data?.status === "COMPLETED";
  const phases = ["PENDING", "CHUNKING", "EMBEDDING", "READY"];
  const currentIdx = phases.indexOf(phase);

  return (
    <div className="space-y-3 py-1">
      {/* Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle className="w-4 h-4 text-[var(--brand-blue)]" />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-light-blue)]" />
          )}
          <span className="text-xs font-bold text-[var(--gray-700)] uppercase tracking-wider">
            {PHASE_LABELS[phase] || phase}
          </span>
        </div>
        {!isComplete && (
          <span className="text-xs font-bold text-[var(--gray-400)]">
            {Math.round(((currentIdx + 1) / phases.length) * 100)}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-[var(--gray-200)] rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-[var(--brand-light-blue)] rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width: isComplete
              ? "100%"
              : `${((currentIdx + 1) / phases.length) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
