"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Plus, BookOpen, Layers } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ChatInterface, { type ChatMessage } from "@/components/ChatInterface";
import ToolsPanel from "@/components/GenerateForm";
import FlashcardModal from "@/components/FlashcardViewer";
import ProcessingState from "@/components/ProcessingState";
import { createPortal } from "react-dom";

interface DocumentEntry {
  id: string;
  name: string;
  status: "processing" | "ready";
}

export default function DashboardPage() {
  /* ── Documents state ── */
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  /* ── Chat state ── */
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /* ── Flashcard modal ── */
  const [flashcardData, setFlashcardData] = useState<any[] | null>(null);

  /* ── Client Portal Targets ── */
  const [leftPortal, setLeftPortal] = useState<HTMLElement | null>(null);
  const [rightPortal, setRightPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setLeftPortal(document.getElementById("mobile-left-panel"));
    setRightPortal(document.getElementById("mobile-right-panel"));
  }, []);

  /* ── Fetch Documents on Mount ── */
  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (data.documents) {
          setDocuments(data.documents);
        }
      })
      .catch(console.error);
  }, []);

  /* ── Upload Handlers ── */
  const handleUploadComplete = useCallback(
    (documentId: string) => {
      const newDoc: DocumentEntry = {
        id: documentId,
        name: `Document ${documents.length + 1}`,
        status: "processing",
      };
      setDocuments((prev) => [newDoc, ...prev]);
      setActiveDocId(documentId);
      setMessages([]);
    },
    [documents.length]
  );

  const handleJobStarted = useCallback((jobId: string) => {
    setActiveJobId(jobId);
  }, []);

  const handleDocReady = useCallback(() => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === activeDocId ? { ...d, status: "ready" as const } : d
      )
    );
    setActiveJobId(null);
    
    // Optionally refetch documents to get the exact name from the DB
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (data.documents) {
          setDocuments(data.documents);
        }
      })
      .catch(console.error);

  }, [activeDocId]);

  const handleSelectDocument = (docId: string) => {
    setActiveDocId(docId);
    setMessages([]);
    setActiveJobId(null);
  };

  const activeDoc = documents.find((d) => d.id === activeDocId);
  const isDocReady = activeDoc?.status === "ready";

  const renderLeftPanel = () => (
    <div className="flex flex-col h-full bg-[var(--gray-50)]">
      <div className="p-4 md:p-6 border-b border-[var(--gray-200)] bg-[var(--white)]">
        <h2 className="font-heading text-xs font-extrabold tracking-[0.1em] text-[var(--gray-500)] uppercase mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Library
        </h2>
        <FileUpload
          onUploadComplete={handleUploadComplete}
          onJobStarted={handleJobStarted}
          compact
        />
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {documents.length === 0 ? (
          <div className="p-8 text-center text-[var(--gray-400)] flex flex-col items-center gap-2">
            <Layers className="w-8 h-8 opacity-50" />
            <p className="text-sm font-medium">No history yet</p>
          </div>
        ) : (
          documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleSelectDocument(doc.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all font-medium text-sm group ${
                doc.id === activeDocId
                  ? "bg-[var(--brand-blue)] text-[var(--white)] shadow-soft"
                  : "bg-[var(--white)] text-[var(--gray-700)] hover:shadow-sm border border-[var(--border-color)]"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                doc.id === activeDocId ? "bg-[var(--white)]/20" : "bg-[var(--brand-light-blue)]/10 text-[var(--brand-blue)]"
              }`}>
                <FileText className="w-4 h-4" />
              </div>
              <span className="truncate flex-1">
                {doc.name}
              </span>
              {doc.status === "processing" && (
                <span className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${
                  doc.id === activeDocId ? "bg-[var(--brand-yellow)]" : "bg-[var(--brand-light-blue)]"
                }`} />
              )}
            </button>
          ))
        )}
      </div>

      {/* Processing status */}
      {activeJobId && activeDocId && (
        <div className="p-4 bg-[var(--white)] border-t border-[var(--gray-200)]">
          <ProcessingState
            jobId={activeJobId}
            documentId={activeDocId}
            onReady={handleDocReady}
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════
          LEFT PANEL — Documents (Desktop)
          ═══════════════════════════════════════════ */}
      <aside className="hidden lg:block w-72 min-w-[280px] border-r border-[var(--gray-200)] bg-[var(--gray-50)] h-full overflow-hidden">
        {renderLeftPanel()}
      </aside>

      {/* Mobile portal for Left Panel */}
      {leftPortal && createPortal(renderLeftPanel(), leftPortal)}

      {/* ═══════════════════════════════════════════
          CENTER — Chat
          ═══════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-w-0 bg-notebook-grid relative z-0 border-r border-[var(--gray-200)]">
        {!activeDocId ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-slide-up">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-24 h-24 rounded-[32px] bg-[var(--white)] border-4 border-[var(--brand-blue)] shadow-solid flex items-center justify-center mb-6 relative"
            >
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--brand-yellow)] border-2 border-[var(--black)] flex items-center justify-center rotate-12">
                <span className="text-xs font-bold">✨</span>
              </div>
              <Plus className="w-10 h-10 text-[var(--brand-blue)]" />
            </motion.div>
            <h2 className="font-heading text-2xl font-extrabold tracking-wide text-[var(--brand-blue)] mb-3 drop-shadow-sm">
              NEW STUDY SESSION
            </h2>
            <p className="text-sm font-medium text-[var(--gray-600)] max-w-sm mb-8">
              Upload a PDF to start analyzing, generating quizzes, and building flashcards.
            </p>

            {/* Main large upload area */}
            <div className="w-full max-w-md bg-[var(--white)] p-2 rounded-3xl border-2 border-[var(--border-color)] shadow-soft">
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onJobStarted={handleJobStarted}
              />
            </div>
          </div>
        ) : !isDocReady ? (
          /* Processing state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="w-20 h-20 rounded-[28px] bg-[var(--white)] border-4 border-[var(--brand-light-blue)] flex items-center justify-center mb-6 shadow-soft animate-pulse">
              <FileText className="w-10 h-10 text-[var(--brand-light-blue)]" />
            </div>
            <h2 className="font-heading text-lg font-extrabold tracking-wider text-[var(--brand-blue)] mb-2">
              READING DOCUMENT...
            </h2>
            <p className="text-sm font-medium text-[var(--gray-500)] mb-6">
              Preparing your study materials.
            </p>
            {activeJobId && (
              <div className="w-64 bg-[var(--white)] p-4 rounded-2xl border border-[var(--gray-200)] shadow-sm">
                <ProcessingState
                  jobId={activeJobId}
                  documentId={activeDocId}
                  onReady={handleDocReady}
                />
              </div>
            )}
          </div>
        ) : (
          /* Chat interface */
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              documentId={activeDocId}
              messages={messages}
              setMessages={setMessages}
              onFlashcardTrigger={(cards) => setFlashcardData(cards)}
            />
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════
          RIGHT PANEL — Tools
          ═══════════════════════════════════════════ */}
      <aside className="hidden lg:block w-[300px] min-w-[300px] bg-[var(--gray-50)] h-full overflow-hidden">
        {activeDocId && isDocReady ? (
          <div className="h-full overflow-y-auto">
            <ToolsPanel
              documentId={activeDocId}
              messages={messages}
              setMessages={setMessages}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <p className="text-sm font-medium text-[var(--gray-400)]">Open a document to access study tools</p>
          </div>
        )}
      </aside>

      {/* Mobile portal for Right Panel */}
      {rightPortal && createPortal(
        activeDocId && isDocReady ? (
          <div className="h-full overflow-y-auto">
            <ToolsPanel
              documentId={activeDocId}
              messages={messages}
              setMessages={setMessages}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <p className="text-sm font-medium text-[var(--gray-400)]">Open a document to access study tools</p>
          </div>
        ),
        rightPortal
      )}

      {/* ═══════════════════════════════════════════
          FLASHCARD MODAL
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {flashcardData && (
          <FlashcardModal
            flashcards={flashcardData}
            onClose={() => setFlashcardData(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
