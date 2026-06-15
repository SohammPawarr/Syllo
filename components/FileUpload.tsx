"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDrivePicker from "react-google-drive-picker";
import { useCredits } from "@/app/dashboard/layout";

interface FileUploadProps {
  onUploadComplete: (documentId: string) => void;
  onJobStarted: (jobId: string) => void;
  compact?: boolean;
}

export default function FileUpload({
  onUploadComplete,
  onJobStarted,
  compact = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refreshCredits } = useCredits();

  const [openPicker, authResponse] = useDrivePicker();

  const handleOpenPicker = () => {
    openPicker({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
      viewId: "DOCS",
      appId: process.env.NEXT_PUBLIC_GOOGLE_APP_ID || "",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: false,
      callbackFunction: async (data: any) => {
        if (data.action === "picked") {
          setIsUploading(true);
          setUploadError("");
          try {
            const pickedFile = data.docs[0];
            const token = authResponse?.access_token;

            if (!token) {
              setUploadError("Missing OAuth token.");
              setIsUploading(false);
              return;
            }

            const res = await fetch("/api/upload-drive", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileId: pickedFile.id,
                fileName: pickedFile.name,
                accessToken: token,
              }),
            });

            if (!res.ok) throw new Error("Failed to process Drive file");

            const { fileUri, documentId } = await res.json();
            onUploadComplete(documentId);
            refreshCredits();

            const triggerRes = await fetch("/api/jobs/trigger", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ documentId, fileUrl: fileUri }),
            });

            if (triggerRes.ok) onJobStarted(documentId);
          } catch {
            setUploadError("Failed to import from Google Drive.");
          } finally {
            setIsUploading(false);
          }
        }
      },
    });
  };

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
      if (droppedFile.size > 10 * 1024 * 1024) {
        setUploadError("File exceeds 10MB limit.");
        setFile(null);
      } else {
        setFile(droppedFile);
        setUploadError("");
      }
    } else {
      setUploadError("Please upload a PDF file.");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setUploadError("File exceeds 10MB limit.");
        setFile(null);
      } else {
        setFile(selectedFile);
        setUploadError("");
      }
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

      const resData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(resData.error || "Upload failed");
      }

      const { fileUri, documentId } = resData;
      onUploadComplete(documentId);
      refreshCredits();
      setFile(null);

      const triggerRes = await fetch("/api/jobs/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, fileUrl: fileUri }),
      });

      if (triggerRes.ok) onJobStarted(documentId);
    } catch (err: any) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 rounded-2xl ${compact ? "p-4 border-solid" : "p-8 border-dashed"} text-center cursor-pointer transition-all duration-200 shadow-sm
          ${
            isDragging
              ? "border-[var(--brand-blue)] bg-[var(--brand-blue)]/5 scale-[1.02]"
              : file
                ? "border-[var(--brand-light-blue)] bg-[var(--gray-50)]"
                : compact
                  ? "border-[var(--brand-blue)] bg-[var(--brand-yellow)] hover:bg-[#EAB308] shadow-solid hover:translate-y-[-2px]"
                  : "border-[var(--gray-300)] hover:border-[var(--brand-light-blue)] bg-[var(--white)]"
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
          <div className="flex items-center gap-3 bg-[var(--white)] p-2 rounded-xl border border-[var(--gray-200)] shadow-sm">
            <div className="w-10 h-10 bg-[var(--brand-yellow)] rounded-lg border border-[var(--black)]/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[var(--gray-900)]" />
            </div>
            <div className="min-w-0 text-left flex-1">
              <p className="text-sm font-bold text-[var(--gray-900)] truncate">{file.name}</p>
              <p className="text-xs font-medium text-[var(--gray-500)]">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="p-1.5 rounded-full hover:bg-[var(--gray-100)] text-[var(--gray-500)] hover:text-[var(--black)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${compact ? "bg-[var(--white)] border-2 border-[var(--brand-blue)] shadow-sm" : "bg-[var(--brand-light-blue)]/10"}`}>
              <Upload className={`w-6 h-6 ${compact ? "text-[var(--brand-blue)]" : "text-[var(--brand-light-blue)]"}`} />
            </div>
            <div>
              <p className={`text-sm font-bold ${compact ? "text-[var(--brand-blue)]" : "text-[var(--gray-700)]"}`}>
                Drop PDF or Browse
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${compact ? "text-[var(--brand-blue)]/70" : "text-[var(--gray-400)]"}`}>
                Max 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Google Drive & Classroom import (Sidebar Only) */}
      {!file && compact && (
        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              handleOpenPicker();
            }}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[var(--brand-blue)] text-[var(--brand-blue)] text-sm font-bold rounded-xl hover:bg-[var(--brand-blue)] hover:text-[var(--white)] transition-all shadow-sm"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png" className="w-5 h-5 opacity-90" alt="Drive" />
            Drive
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              handleOpenPicker();
            }}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[var(--brand-blue)] text-[var(--brand-blue)] text-sm font-bold rounded-xl hover:bg-[var(--brand-blue)] hover:text-[var(--white)] transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/classroom_32dp.png" className="w-5 h-5 opacity-90" alt="Classroom" />
            Classroom
          </button>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {uploadError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[var(--white)] text-xs font-bold text-center bg-red-500 py-2 rounded-lg"
          >
            {uploadError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {file && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--brand-blue)] text-[var(--white)] font-bold text-sm rounded-2xl hover:bg-[var(--brand-light-blue)] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Start Study Session
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}
