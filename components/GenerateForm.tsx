"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface GenerateFormProps {
  documentId: string;
  onFlashcardsGenerated: (data: any) => void;
  onQuizGenerated: (data: any) => void;
  onImageGenerated: (imageUrl: string) => void;
}

export default function GenerateForm({ documentId, onFlashcardsGenerated, onQuizGenerated, onImageGenerated }: GenerateFormProps) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [questionCount, setQuestionCount] = useState(5);
  const [loadingType, setLoadingType] = useState<"image" | "flashcards" | "quiz" | null>(null);

  const handleGenerateImage = async () => {
    if (!topic.trim()) return;
    setLoadingType("image");
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, topic }),
      });
      const data = await res.json();
      if (res.ok) {
        onImageGenerated(data.imageUrl);
      } else {
        alert(data.error || "Failed to generate image");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating image");
    } finally {
      setLoadingType(null);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!topic.trim()) return;
    setLoadingType("flashcards");
    try {
      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, topic, count: 10 }),
      });
      const data = await res.json();
      if (res.ok) {
        onFlashcardsGenerated(data.flashcards);
      } else {
        alert(data.error || "Failed to generate flashcards");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating flashcards");
    } finally {
      setLoadingType(null);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;
    setLoadingType("quiz");
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, topic, difficulty, question_count: questionCount }),
      });
      const data = await res.json();
      if (res.ok) {
        onQuizGenerated(data.quiz);
      } else {
        alert(data.error || "Failed to generate quiz");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating quiz");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[var(--color-deep-purple)] mb-4">
        What do you want to study?
      </h2>
      <p className="text-[var(--muted-foreground)] mb-6 text-sm">
        Enter a specific topic from your document, and our AI will retrieve the most relevant sections to generate your study materials.
      </p>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="e.g., Photosynthesis, Neural Networks..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full p-4 border-2 border-[var(--border)] rounded-lg focus:border-[var(--color-light-purple)] focus:outline-none transition-colors text-lg"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--muted-foreground)] mb-1">Difficulty</label>
            <select 
              value={difficulty} 
              onChange={e => setDifficulty(e.target.value)}
              className="w-full p-3 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--color-light-purple)]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--muted-foreground)] mb-1">Questions</label>
            <select 
              value={questionCount} 
              onChange={e => setQuestionCount(Number(e.target.value))}
              className="w-full p-3 border-2 border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--color-light-purple)]"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleGenerateQuiz}
            disabled={!topic.trim() || loadingType !== null}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#673AB7] text-white font-bold rounded-lg hover:bg-[#5E35B1] disabled:opacity-50 transition-colors"
          >
            {loadingType === "quiz" ? <Loader2 className="w-5 h-5 animate-spin" /> : "📝 Generate Google Form"}
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleGenerateImage}
              disabled={!topic.trim() || loadingType !== null}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#E91E63] text-white font-bold rounded-lg hover:bg-[#C2185B] disabled:opacity-50 transition-colors"
            >
              {loadingType === "image" ? <Loader2 className="w-5 h-5 animate-spin" /> : "🎨 Image"}
            </button>
            <button
              onClick={handleGenerateFlashcards}
              disabled={!topic.trim() || loadingType !== null}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-orange)] text-white font-bold rounded-lg hover:bg-[#d97a00] disabled:opacity-50 transition-colors"
            >
              {loadingType === "flashcards" ? <Loader2 className="w-5 h-5 animate-spin" /> : "📇 Flashcards"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
