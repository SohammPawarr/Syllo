"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { type ReactNode, useEffect, useState, createContext, useContext, useCallback } from "react";
import { X, Menu, Zap, LogOut, BookOpen } from "lucide-react";

/* ── Credits context so children can read/refresh credits ── */
interface CreditsContextType {
  credits: number | null;
  refreshCredits: () => void;
}
const CreditsContext = createContext<CreditsContextType>({ credits: null, refreshCredits: () => {} });
export const useCredits = () => useContext(CreditsContext);

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const refreshCredits = useCallback(() => {
    fetch("/api/user/credits")
      .then((res) => res.json())
      .then((data) => {
        if (data.credits !== undefined) setCredits(data.credits);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (session) refreshCredits();
  }, [session, refreshCredits]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-notebook-grid">
        <div className="w-8 h-8 border-4 border-[var(--brand-blue)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect("/");
  }

  return (
    <CreditsContext.Provider value={{ credits, refreshCredits }}>
      {/* Edge-to-edge container */}
      <div className="h-screen w-full flex flex-col bg-[var(--white)] overflow-hidden">
        
        {/* ═══ HEADER BAR ═══ */}
        <div className="w-full bg-[var(--white)] border-b border-[var(--gray-200)] pb-2 px-2 md:px-4 pt-2 shadow-sm z-50">
          <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 rounded-full bg-[var(--white)] border-2 border-[var(--black)] shadow-sm max-w-[1920px] mx-auto w-full">
            
            {/* Left: Hamburger (mobile) + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLeftOpen(!leftOpen)}
                className="lg:hidden p-1.5 rounded-full hover:bg-[var(--gray-100)] transition-colors text-[var(--black)]"
                aria-label="Toggle documents panel"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--brand-yellow)] border-2 border-[var(--black)] flex items-center justify-center shadow-solid overflow-hidden shrink-0">
                  <span className="text-lg">🤖</span>
                </div>
                <span className="font-heading text-lg md:text-xl font-extrabold tracking-widest text-[var(--black)] select-none mt-1">
                  SYLLO
                </span>
              </div>
            </div>

            {/* Right: Credits, User, Tools toggle */}
            <div className="flex items-center gap-3">
              {credits !== null && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--white)] border border-[var(--black)]/10 rounded-full text-xs font-bold text-[var(--brand-blue)] shadow-sm">
                  <Zap className="w-3.5 h-3.5 fill-[var(--brand-yellow)] text-[var(--brand-blue)]" />
                  <span className="hidden sm:inline">{credits.toLocaleString()} pts</span>
                </div>
              )}

              <button
                onClick={() => setRightOpen(!rightOpen)}
                className="lg:hidden p-1.5 rounded-full bg-[var(--white)] border border-[var(--black)]/10 shadow-sm text-[var(--brand-blue)] hover:bg-[var(--gray-50)] transition-colors"
                aria-label="Toggle tools panel"
              >
                <BookOpen className="w-5 h-5" />
              </button>

              {/* User Info (Desktop) */}
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <span className="text-xs font-bold text-[var(--black)]">{session.user?.name?.split(" ")[0]}</span>
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-8 h-8 rounded-full border-2 border-[var(--black)] shadow-sm object-cover bg-[var(--white)]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--black)] bg-[var(--brand-blue)] text-[var(--white)] flex items-center justify-center text-xs font-bold shadow-sm">
                    {session.user?.name?.[0] || "U"}
                  </div>
                )}
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1.5 rounded-full hover:bg-[var(--gray-100)] transition-colors text-[var(--gray-700)] hover:text-[var(--black)]"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </header>
        </div>

        {/* ═══ BODY: 3-column workspace ═══ */}
        <div className="flex-1 flex overflow-hidden relative w-full bg-[var(--white)]">
          {children}
        </div>

        {/* ═══ MOBILE OVERLAY DRAWERS ═══ */}
        {/* Backdrop */}
        {(leftOpen || rightOpen) && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => {
              setLeftOpen(false);
              setRightOpen(false);
            }}
          />
        )}

        {/* Left drawer (documents) */}
        {leftOpen && (
          <div className="lg:hidden fixed inset-y-0 left-0 w-72 z-[60] bg-[var(--white)] animate-slide-in-left border-r-4 border-[var(--black)] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--gray-200)] bg-[var(--gray-50)]">
              <span className="font-heading text-sm font-extrabold tracking-wider text-[var(--brand-blue)]">DOCUMENTS</span>
              <button onClick={() => setLeftOpen(false)} className="p-2 rounded-full hover:bg-[var(--gray-200)] text-[var(--gray-600)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div id="mobile-left-panel" className="overflow-y-auto flex-1 pb-6" />
          </div>
        )}

        {/* Right drawer (tools) */}
        {rightOpen && (
          <div className="lg:hidden fixed inset-y-0 right-0 w-72 z-[60] bg-[var(--white)] animate-slide-in-right border-l-4 border-[var(--black)] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--gray-200)] bg-[var(--gray-50)]">
              <span className="font-heading text-sm font-extrabold tracking-wider text-[var(--brand-blue)]">STUDY TOOLS</span>
              <button onClick={() => setRightOpen(false)} className="p-2 rounded-full hover:bg-[var(--gray-200)] text-[var(--gray-600)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div id="mobile-right-panel" className="overflow-y-auto flex-1 pb-6" />
          </div>
        )}
      </div>
    </CreditsContext.Provider>
  );
}
