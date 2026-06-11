"use client";

import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

export default function ClientGoogleButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="flex items-center gap-3 px-8 py-5 bg-[var(--brand-blue)] text-[var(--white)] font-bold text-lg rounded-full hover:bg-[var(--brand-light-blue)] hover:-translate-y-1 hover:shadow-[0_12px_24px_-4px_rgba(29,78,216,0.3)] transition-all shadow-solid border-[4px] border-[var(--black)]"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google Logo"
        className="w-6 h-6 bg-white rounded-full p-1 border border-[var(--black)]"
      />
      Continue with Google
      <ArrowRight className="w-6 h-6" />
    </button>
  );
}
