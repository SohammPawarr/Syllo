"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import useDrivePicker from "react-google-drive-picker";

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
            const token = authResponse?.access_token; // The token might be in the higher scope or data
            
            if (!token) {
              setUploadError("Missing OAuth token to download the file.");
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

            const triggerRes = await fetch("/api/jobs/trigger", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ documentId, fileUrl: fileUri }),
            });

            if (triggerRes.ok) {
              onJobStarted(documentId);
            }
          } catch (error) {
            console.error(error);
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

      const { fileUri, documentId } = await uploadRes.json();
      onUploadComplete(documentId); // We pass the documentId so StudyDashboard can use it

      // Trigger processing
      const triggerRes = await fetch("/api/jobs/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: documentId,
          fileUrl: fileUri,
        }),
      });

      if (triggerRes.ok) {
        // We use the documentId as the jobId for polling status
        onJobStarted(documentId);
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
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              or click to browse
            </p>
          </div>
        )}
      </div>

      {!file && (
        <div className="mt-4">
          <div className="flex items-center gap-4 mb-4">
            <hr className="flex-1 border-[var(--border)]" />
            <span className="text-sm text-[var(--muted-foreground)] font-medium">OR</span>
            <hr className="flex-1 border-[var(--border)]" />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleOpenPicker();
            }}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#ea4335] text-[#ea4335] font-bold py-3 px-6 rounded-xl hover:bg-[#ea4335]/5 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 10.59L19.05 3.54l1.41 1.41L13.41 12l7.05 7.05-1.41 1.41L12 13.41l-7.05 7.05-1.41-1.41L10.59 12 3.54 4.95l1.41-1.41L12 10.59z" opacity="0" />
              <path d="M7 3h10v2H7zm0 16h10v2H7zM3 7h2v10H3zm16 0h2v10h-2z" opacity="0"/>
              <path d="M20.222 17.514L14.73 7.999a2.002 2.002 0 00-3.46 0L5.778 17.514a2.002 2.002 0 001.73 3.001h10.984a2.002 2.002 0 001.73-3.001zm-3.46 1.001H9.238l-2.02-3.5 3.5-6.062 2.02 3.5-3.5 6.062h3.46l3.5 6.062-3.5-6.062 2.02-3.5z" />
            </svg>
            Import from Google Drive / Classroom
          </button>
        </div>
      )}

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
