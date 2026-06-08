"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface FileUploadProps {
  onUploadComplete: (fileUri: string) => void;
  onJobStarted: (jobId: string) => void;
}

export default function FileUpload({
  onUploadComplete,
  onJobStarted,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setUploadError("");
    } else {
      setUploadError("Please upload a PDF file.");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const { fileUri } = await uploadRes.json();
      onUploadComplete(fileUri);

      // Trigger processing
      const triggerRes = await fetch("/api/jobs/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: "temp-" + Date.now(),
          fileUrl: fileUri,
        }),
      });

      if (triggerRes.ok) {
        const { task_id } = await triggerRes.json();
        onJobStarted(task_id);
      }
    } catch {
      setUploadError("Failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${
            isDragging
              ? "border-brand-purple bg-brand-purple/5"
              : file
                ? "border-brand-deep bg-brand-deep/5"
                : "border-[var(--border)] hover:border-brand-purple"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-brand-deep rounded-xl flex items-center justify-center text-white text-xl">
              📄
            </div>
            <p className="font-medium text-[var(--foreground)]">{file.name}</p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-[var(--muted)] rounded-xl flex items-center justify-center text-2xl">
              ☁️
            </div>
            <p className="font-medium text-[var(--foreground)]">
              Drag & drop your PDF here
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              or click to browse
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {uploadError && (
        <p className="text-brand-red text-sm mt-3">{uploadError}</p>
      )}

      {/* Upload Button */}
      {file && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleUpload}
          disabled={isUploading}
          className="mt-4 w-full bg-brand-deep text-white font-semibold py-3 px-6 rounded-xl hover:bg-brand-purple transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            "Upload & Process"
          )}
        </motion.button>
      )}
    </div>
  );
}
