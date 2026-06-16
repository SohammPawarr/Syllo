"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Share } from "lucide-react";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardModalProps {
  flashcards: Flashcard[];
  onClose: () => void;
}

export default function FlashcardModal({ flashcards, onClose }: FlashcardModalProps) {
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
      setCurrentIndex(
        (prev) => (prev - 1 + flashcards.length) % flashcards.length
      );
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
            options: ["True", "False"],
            correct_answer_index: 0,
            explanation: f.back,
          })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.formUrl) window.open(data.formUrl, "_blank");
      } else {
        alert("Failed to export. Ensure you are signed in.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--gray-900)]/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-14 right-0 w-12 h-12 rounded-full bg-[var(--white)] border-2 border-[var(--black)] flex items-center justify-center text-[var(--gray-700)] hover:text-[var(--brand-blue)] hover:bg-[var(--gray-100)] transition-colors z-10 shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Counter Badge */}
        <div className="absolute -top-14 left-0 bg-[var(--brand-yellow)] border-2 border-[var(--black)] px-4 py-2.5 rounded-full shadow-solid z-10">
          <span className="font-heading text-sm font-extrabold tracking-widest text-[var(--black)]">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </div>

        {/* 3D Flip Card */}
        <div
          className="relative w-full aspect-[4/3] cursor-pointer [perspective:1000px]"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="w-full h-full relative [transform-style:preserve-3d]"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            {/* Front */}
            <div className="absolute inset-0 w-full h-full rounded-[40px] bg-[var(--white)] border-[6px] border-[var(--brand-blue)] shadow-solid p-8 md:p-12 flex flex-col items-center justify-center text-center [backface-visibility:hidden]">
              <h3 className="text-2xl md:text-3xl font-extrabold text-[var(--brand-blue)] font-heading leading-tight px-4">
                {currentCard.front}
              </h3>
              <div className="absolute bottom-6 flex items-center gap-2 text-sm font-bold text-[var(--gray-400)] uppercase tracking-widest">
                <span>Tap to flip</span>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 w-full h-full rounded-[40px] bg-[var(--brand-blue)] border-[6px] border-[var(--black)] shadow-solid p-8 md:p-12 flex flex-col items-center justify-center text-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-xl md:text-2xl font-medium text-[var(--white)] leading-relaxed font-body">
                {currentCard.back}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handlePrev}
            className="w-14 h-14 rounded-full bg-[var(--white)] border-2 border-[var(--black)] flex items-center justify-center hover:bg-[var(--gray-100)] active:scale-95 transition-all text-[var(--gray-900)] shadow-solid"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-4 bg-[var(--white)] border-2 border-[var(--black)] text-[var(--gray-900)] text-sm font-bold rounded-full hover:bg-[var(--gray-100)] active:scale-95 transition-all shadow-solid uppercase tracking-wider"
          >
            <Share className="w-5 h-5" />
            Export to Google Forms
          </button>

          <button
            onClick={handleNext}
            className="w-14 h-14 rounded-full bg-[var(--white)] border-2 border-[var(--black)] flex items-center justify-center hover:bg-[var(--gray-100)] active:scale-95 transition-all text-[var(--gray-900)] shadow-solid"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
