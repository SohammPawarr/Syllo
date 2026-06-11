"use client";

import { ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";

interface GoogleFormResultProps {
  title: string;
  publishedUrl?: string;
  editUrl?: string;
}

export default function GoogleFormResult({ title, publishedUrl, editUrl }: GoogleFormResultProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto space-y-6 bg-[var(--white)] rounded-[32px] border-4 border-[var(--brand-blue)] shadow-solid">
      <div className="w-20 h-20 bg-[var(--brand-yellow)] border-4 border-[var(--black)] rounded-full flex items-center justify-center shadow-sm">
        <span className="text-4xl">📝</span>
      </div>

      <div>
        <h2 className="text-2xl font-heading font-extrabold text-[var(--brand-blue)] mb-2">
          QUIZ CREATED
        </h2>
        <p className="text-sm font-medium text-[var(--gray-600)]">
          &ldquo;{title}&rdquo; is ready on Google Forms!
        </p>
      </div>

      {publishedUrl ? (
        <div className="w-full bg-[var(--gray-50)] border-2 border-[var(--gray-200)] rounded-[24px] p-5 space-y-4">
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="flex flex-1 items-center bg-[var(--white)] border-2 border-[var(--gray-200)] rounded-2xl overflow-hidden">
              <input
                readOnly
                value={publishedUrl}
                className="flex-1 bg-transparent px-4 py-3 text-xs font-medium text-[var(--gray-600)] focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(publishedUrl)}
                className="p-3 bg-[var(--gray-100)] hover:bg-[var(--brand-light-blue)] hover:text-[var(--white)] text-[var(--gray-500)] transition-colors border-l-2 border-[var(--gray-200)]"
                title="Copy Link"
              >
                {copiedUrl === publishedUrl ? (
                  <Check className="w-5 h-5 text-[var(--brand-blue)]" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <a
              href={publishedUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--brand-light-blue)] text-[var(--white)] text-sm font-bold rounded-2xl hover:bg-[var(--brand-blue)] transition-colors border-2 border-[var(--black)]/5 shadow-sm whitespace-nowrap"
            >
              Take Quiz <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--brand-yellow)]/10 border-2 border-[var(--brand-yellow)] text-[var(--gray-900)] p-4 rounded-2xl text-sm font-bold">
          Form URL is missing. Check your setup.
        </div>
      )}

      {editUrl && (
        <a
          href={editUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold text-[var(--gray-500)] hover:text-[var(--brand-blue)] uppercase tracking-widest flex items-center gap-1 transition-colors"
        >
          Open Editor <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
