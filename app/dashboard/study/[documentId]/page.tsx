"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import GenerateForm from "@/components/GenerateForm";
import ChatInterface from "@/components/ChatInterface";
import ImageViewer from "@/components/ImageViewer";
import FlashcardViewer from "@/components/FlashcardViewer";
import GoogleFormResult from "@/components/GoogleFormResult";

export default function StudyDashboard() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;

  const [activeTab, setActiveTab] = useState<"chat" | "image" | "flashcards" | "quiz">("chat");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [flashcardData, setFlashcardData] = useState<any>(null);
  const [quizData, setQuizData] = useState<any>(null);

  const handleFlashcardsGenerated = (data: any) => {
    setFlashcardData(data.flashcards);
    setActiveTab("flashcards");
  };

  const handleImageGenerated = (url: string) => {
    setImageUrl(url);
    setActiveTab("image");
  };

  const handleQuizGenerated = (data: any) => {
    setQuizData(data);
    setActiveTab("quiz");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      {/* Header */}
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-[var(--color-deep-purple)] hover:text-[var(--color-light-purple)] font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-1 space-y-6">
          <GenerateForm
            documentId={documentId}
            onFlashcardsGenerated={handleFlashcardsGenerated}
            onQuizGenerated={handleQuizGenerated}
            onImageGenerated={handleImageGenerated}
          />
        </div>

        {/* Right Column: Viewer */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm min-h-[700px] flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-[var(--border)] mb-6">
              <button
                className={`pb-4 px-6 font-bold text-lg border-b-4 transition-colors ${
                  activeTab === "chat"
                    ? "border-[var(--color-deep-purple)] text-[var(--color-deep-purple)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
              <button
                className={`pb-4 px-6 font-bold text-lg border-b-4 transition-colors ${
                  activeTab === "image"
                    ? "border-[#E91E63] text-[#E91E63]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                onClick={() => setActiveTab("image")}
              >
                Generated Image
              </button>
              <button
                className={`pb-4 px-6 font-bold text-lg border-b-4 transition-colors ${
                  activeTab === "flashcards"
                    ? "border-[#FF9800] text-[#FF9800]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                onClick={() => setActiveTab("flashcards")}
              >
                Flashcards
              </button>
              <button
                className={`pb-4 px-6 font-bold text-lg border-b-4 transition-colors ${
                  activeTab === "quiz"
                    ? "border-[#4CAF50] text-[#4CAF50]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
                onClick={() => setActiveTab("quiz")}
              >
                Quiz
              </button>
            </div>

            <div className="flex-1">
              {activeTab === "chat" && (
                <ChatInterface documentId={documentId} />
              )}

              {activeTab === "image" && (
                imageUrl ? (
                  <ImageViewer imageUrl={imageUrl} />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                    <div className="text-4xl mb-4">🎨</div>
                    <p className="text-lg">No image generated yet.</p>
                    <p className="text-sm">Use the form on the left to generate an image from a topic.</p>
                  </div>
                )
              )}

              {activeTab === "flashcards" && (
                flashcardData ? (
                  <div className="mt-8">
                    <FlashcardViewer flashcards={flashcardData} />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                    <div className="text-4xl mb-4">📇</div>
                    <p className="text-lg">No flashcards generated yet.</p>
                    <p className="text-sm">Use the form on the left to create a study set.</p>
                  </div>
                )
              )}

              {activeTab === "quiz" && (
                quizData ? (
                  <GoogleFormResult 
                    title={quizData.quiz_title}
                    publishedUrl={quizData.google_form_url}
                    editUrl={quizData.google_form_edit_url}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-lg">No Google Form generated yet.</p>
                    <p className="text-sm">Use the form on the left to create a new quiz form.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
