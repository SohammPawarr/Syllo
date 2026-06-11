"use client";

import { useState } from "react";
import { FileText, Image, Layers, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { ChatMessage } from "./ChatInterface";
import { useCredits } from "@/app/dashboard/layout";

interface ToolsPanelProps {
  documentId: string;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function ToolsPanel({
  documentId,
  messages,
  setMessages,
}: ToolsPanelProps) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [loadingType, setLoadingType] = useState<
    "quiz" | "flashcards" | "image" | null
  >(null);
  const { refreshCredits } = useCredits();

  const handleGenerateQuiz = async () => {
    if (!topic.trim() || loadingType) return;
    setLoadingType("quiz");

    const userMsg: ChatMessage = {
      role: "user",
      content: `📝 Generate a quiz about "${topic}" (${difficulty}, ${questionCount} questions)`,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          topic,
          difficulty,
          question_count: questionCount,
        }),
      });
      const data = await res.json();
      refreshCredits();

      if (res.ok && data.quiz) {
        const exportRes = await fetch("/api/export-forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Syllo Quiz: ${topic}`,
            questions: data.quiz.questions,
          }),
        });

        if (exportRes.ok) {
          const exportData = await exportRes.json();
          const botMsg: ChatMessage = {
            role: "model",
            content: "Google Form created successfully!",
            type: "form-link",
            meta: {
              title: `Syllo Quiz: ${topic}`,
              publishedUrl: exportData.formUrl,
              editUrl: exportData.editUrl,
            },
          };
          setMessages((prev) => [...prev, botMsg]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              content: "Quiz generated but failed to export to Google Forms.",
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: `❌ ${data.error || "Failed to generate quiz"}` },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "❌ Error generating quiz." },
      ]);
    } finally {
      setLoadingType(null);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!topic.trim() || loadingType) return;
    setLoadingType("flashcards");

    const userMsg: ChatMessage = {
      role: "user",
      content: `📇 Generate flashcards about "${topic}"`,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, topic, count: 10 }),
      });
      const data = await res.json();
      refreshCredits();

      if (res.ok && data.flashcards) {
        const botMsg: ChatMessage = {
          role: "model",
          content: "Flashcards generated!",
          type: "flashcard-trigger",
          meta: { flashcards: data.flashcards },
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: `❌ ${data.error || "Failed to generate flashcards"}` },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "❌ Error generating flashcards." },
      ]);
    } finally {
      setLoadingType(null);
    }
  };

  const handleGenerateImage = async () => {
    if (!topic.trim() || loadingType) return;
    setLoadingType("image");

    const userMsg: ChatMessage = {
      role: "user",
      content: `🎨 Generate an image about "${topic}"`,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, topic }),
      });
      const data = await res.json();
      refreshCredits();

      if (res.ok) {
        const imageUrl = data.image_url || data.imageUrl;
        const botMsg: ChatMessage = {
          role: "model",
          content: "Image generated!",
          type: "image",
          meta: { imageUrl },
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: `❌ ${data.error || "Failed to generate image"}` },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "❌ Error generating image." },
      ]);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="p-5 space-y-6">
      
      {/* Target Topic Card */}
      <div className="bg-[var(--white)] rounded-[24px] border border-[var(--gray-200)] shadow-sm p-4 space-y-4">
        <h3 className="font-heading text-sm font-extrabold tracking-wide text-[var(--brand-blue)]">
          TARGET TOPIC
        </h3>
        <input
          type="text"
          placeholder="E.g., Photosynthesis"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-4 py-3 bg-[var(--gray-50)] border-2 border-[var(--gray-200)] rounded-[16px] text-sm text-[var(--gray-900)] font-medium placeholder:text-[var(--gray-400)] focus:outline-none focus:border-[var(--brand-light-blue)] transition-colors"
        />
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[var(--gray-500)] mb-1.5 uppercase tracking-wider">
              Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--gray-50)] border-2 border-[var(--gray-200)] rounded-[12px] text-sm font-medium text-[var(--gray-800)] focus:outline-none focus:border-[var(--brand-light-blue)]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--gray-500)] mb-1.5 uppercase tracking-wider">
              Q's
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-[var(--gray-50)] border-2 border-[var(--gray-200)] rounded-[12px] text-sm font-medium text-[var(--gray-800)] focus:outline-none focus:border-[var(--brand-light-blue)]"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tools Card */}
      <div className="bg-[var(--white)] rounded-[24px] border border-[var(--gray-200)] shadow-sm p-4 space-y-3">
        <h3 className="font-heading text-sm font-extrabold tracking-wide text-[var(--brand-blue)] mb-4">
          GENERATE
        </h3>
        <ToolButton
          icon={<FileText className="w-5 h-5" />}
          label="Quiz Form"
          onClick={handleGenerateQuiz}
          disabled={!topic.trim() || loadingType !== null}
          loading={loadingType === "quiz"}
          color="bg-[var(--brand-blue)]"
          hoverColor="hover:bg-[var(--brand-light-blue)]"
          shadowColor="shadow-[var(--brand-blue)]"
        />
        <ToolButton
          icon={<Layers className="w-5 h-5" />}
          label="Flashcards"
          onClick={handleGenerateFlashcards}
          disabled={!topic.trim() || loadingType !== null}
          loading={loadingType === "flashcards"}
          color="bg-[var(--brand-yellow)]"
          hoverColor="hover:bg-[#E5B800]"
          textColor="text-[var(--gray-900)]"
          shadowColor="shadow-[var(--brand-yellow)]"
        />
        <ToolButton
          icon={<Image className="w-5 h-5" />}
          label="Topic Image"
          onClick={handleGenerateImage}
          disabled={!topic.trim() || loadingType !== null}
          loading={loadingType === "image"}
          color="bg-[var(--brand-light-blue)]"
          hoverColor="hover:bg-[var(--brand-blue)]"
          shadowColor="shadow-[var(--brand-light-blue)]"
        />
      </div>

    </div>
  );
}

function ToolButton({
  icon,
  label,
  onClick,
  disabled,
  loading,
  color,
  hoverColor,
  textColor = "text-white",
  shadowColor,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  color: string;
  hoverColor: string;
  textColor?: string;
  shadowColor: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 font-bold rounded-2xl shadow-sm transition-all disabled:opacity-40 disabled:grayscale cursor-pointer border-2 border-[var(--black)]/5 ${color} ${hoverColor} ${textColor}`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
      {label}
    </motion.button>
  );
}
