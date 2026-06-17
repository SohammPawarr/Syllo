import Link from "next/link";
import { ArrowRight, Bot, Image as ImageIcon, Zap, BookOpen } from "lucide-react";
import ClientGoogleButton from "../components/ClientGoogleButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-notebook-grid flex flex-col w-full relative overflow-hidden">
        
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between p-6 md:px-12 pt-8 z-10 w-full max-w-[1920px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--brand-blue)] border-4 border-[var(--black)] flex items-center justify-center shadow-solid overflow-hidden">
             <span className="text-xl">🤖</span>
          </div>
          <span className="font-heading text-xl md:text-2xl font-extrabold tracking-widest text-[var(--black)] mt-1">
            SYLLO
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 px-6 py-3 bg-[var(--brand-blue)]/10 border border-[var(--brand-blue)]/20 rounded-full">
          <span className="text-sm"></span>
          <p className="text-xs md:text-sm font-extrabold text-[var(--brand-blue)] uppercase tracking-widest">
            START WITH 10,000 FREE CREDITS
          </p>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-6 relative z-10 w-full max-w-[1920px] mx-auto mt-[-5vh]">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--brand-yellow)] border-2 border-[var(--black)] text-sm font-bold text-[var(--black)] mb-8 shadow-solid transform -rotate-2">
          <span>✨</span> The smarter way to study
        </div>

        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-[var(--black)] mb-6 drop-shadow-sm leading-none max-w-5xl z-10 relative">
          MASTER ANY <br/> 
          <span className="text-[var(--black)]">SUBJECT</span>{" "}
          <span className="text-[var(--brand-yellow)]" style={{ textShadow: "2px 2px 0px var(--black)" }}>
            FASTER
          </span>
        </h1>

        <p className="mt-4 text-lg md:text-xl text-[var(--gray-700)] font-medium max-w-3xl mb-8 leading-relaxed px-4">
          Upload your lecture slides, notes, or textbooks and let Syllo instantly generate <br className="hidden md:block" />
          <strong className="text-[var(--brand-blue)] font-bold">interactive quizzes, flashcards, and visual explanations</strong>.
        </p>

        <div className="flex flex-col items-center gap-5">
          <div className="relative group">
            <ClientGoogleButton />
          </div>
        </div>

        {/* Floating UI Elements (Decorative) */}
        <div className="absolute top-1/4 left-[10%] w-24 h-24 bg-[var(--white)] border-[4px] border-[var(--brand-blue)] rounded-3xl shadow-solid flex items-center justify-center transform -rotate-12 hidden lg:flex animate-pulse-glow">
           <BookOpen className="w-10 h-10 text-[var(--brand-blue)]" />
        </div>
        <div className="absolute bottom-1/4 right-[10%] w-24 h-24 bg-[var(--white)] border-[4px] border-[var(--brand-yellow)] rounded-full shadow-solid flex items-center justify-center transform rotate-12 hidden lg:flex">
           <ImageIcon className="w-10 h-10 text-[var(--gray-900)]" />
        </div>
        <div className="absolute top-1/3 right-[15%] w-16 h-16 bg-[var(--brand-light-blue)] border-4 border-[var(--black)] rounded-full shadow-solid flex items-center justify-center transform rotate-45 hidden lg:flex">
           <Zap className="w-8 h-8 text-[var(--white)]" />
        </div>
      </main>
    </div>
  );
}
