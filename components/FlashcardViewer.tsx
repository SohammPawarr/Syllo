"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Share } from "lucide-react";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
}

export default function FlashcardViewer({ flashcards }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const handleExport = async () => {
    try {
      const res = await fetch("/api/export-forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Syllo Study Flashcards",
          questions: flashcards.map((f) => ({
            question: f.front,
            options: ["True", "False"], // Placeholder for simple export
            correct_answer_index: 0,
            explanation: f.back,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.formUrl) window.open(data.formUrl, "_blank");
      } else {
        alert("Failed to export to Google Forms. Ensure you are signed in.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-8">
      {/* 3D Flip Card Container */}
      <div 
        className="relative w-full aspect-[3/2] cursor-pointer [perspective:1000px]"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        >
          {/* Front */}
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-white border-2 border-[var(--color-light-purple)] p-8 flex items-center justify-center text-center [backface-visibility:hidden] shadow-lg">
            <h3 className="text-3xl font-bold text-[var(--color-deep-purple)]">
              {currentCard.front}
            </h3>
            <div className="absolute bottom-4 text-sm text-[var(--muted-foreground)]">
              Click to flip
            </div>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl bg-[var(--color-deep-purple)] border-2 border-[var(--color-deep-purple)] p-8 flex items-center justify-center text-center shadow-lg"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-2xl font-medium text-white leading-relaxed">
              {currentCard.back}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={handlePrev}
          className="p-3 rounded-full bg-[var(--muted)] hover:bg-[var(--color-yellow)] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-lg font-semibold text-[var(--foreground)]">
          {currentIndex + 1} / {flashcards.length}
        </div>
        <button
          onClick={handleNext}
          className="p-3 rounded-full bg-[var(--muted)] hover:bg-[var(--color-yellow)] hover:text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Export Action */}
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-6 py-3 bg-[var(--color-red-orange)] text-white font-bold rounded-lg hover:bg-[var(--color-orange)] transition-colors shadow-md"
      >
        <Share className="w-5 h-5" />
        Export to Google Forms
      </button>
    </div>
  );
}
