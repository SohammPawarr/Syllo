"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FileUpload from "@/components/FileUpload";
import ProcessingState from "@/components/ProcessingState";

export default function DashboardPage() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleUploadComplete = (fileUri: string) => {
    setUploadedFile(fileUri);
  };

  const handleJobStarted = (jobId: string) => {
    setActiveJobId(jobId);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Dashboard
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Upload a document to start generating quizzes
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card — spans 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 border border-[var(--border)] rounded-xl p-6 bg-[var(--background)]"
        >
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Upload Document
          </h2>
          <FileUpload
            onUploadComplete={handleUploadComplete}
            onJobStarted={handleJobStarted}
          />
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="border border-[var(--border)] rounded-xl p-6 bg-[var(--background)]"
        >
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Processing Status
          </h2>
          {activeJobId ? (
            <ProcessingState jobId={activeJobId} />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-[var(--muted-foreground)] text-sm text-center">
              <div className="w-12 h-12 bg-[var(--muted)] rounded-xl flex items-center justify-center text-2xl mb-3">
                ⏳
              </div>
              <p>No active processing job</p>
              <p className="text-xs mt-1">Upload a document to begin</p>
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <StatCard
          icon="📄"
          label="Documents"
          value="0"
          color="bg-brand-yellow"
          delay={0.2}
        />
        <StatCard
          icon="📝"
          label="Quizzes Generated"
          value="0"
          color="bg-brand-orange"
          delay={0.25}
        />
        <StatCard
          icon="🧠"
          label="Chunks Embedded"
          value="0"
          color="bg-brand-purple"
          delay={0.3}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="border border-[var(--border)] rounded-xl p-6 bg-[var(--background)]"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-11 h-11 ${color} rounded-lg flex items-center justify-center text-lg`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
