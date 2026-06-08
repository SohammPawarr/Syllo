"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { type ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-3 border-brand-deep border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--muted)] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--border)]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-deep rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg text-[var(--foreground)]">
              Syllo
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/dashboard" icon="📊" label="Dashboard" />
          <NavItem href="/dashboard/documents" icon="📁" label="Documents" />
          <NavItem href="/dashboard/quizzes" icon="📝" label="Quizzes" />
          <NavItem href="/dashboard/knowledge" icon="🧠" label="Knowledge Graph" />
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 mb-3">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-brand-purple rounded-full flex items-center justify-center text-white text-xs font-bold">
                {session.user?.name?.[0] || "U"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left text-sm text-[var(--muted-foreground)] hover:text-brand-red transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}
