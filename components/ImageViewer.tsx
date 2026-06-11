"use client";

import { Download, Image as ImageIcon } from "lucide-react";

interface ImageViewerProps {
  imageUrl: string;
}

export default function ImageViewer({ imageUrl }: ImageViewerProps) {
  const handleDownload = () => {
    window.location.href = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[var(--white)] rounded-[32px] border-4 border-[var(--brand-blue)] shadow-solid">
      <div className="flex items-center gap-3 mb-6 w-full">
        <div className="w-12 h-12 rounded-full bg-[var(--brand-light-blue)] border-2 border-[var(--black)] flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-[var(--white)]" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-extrabold text-[var(--brand-blue)]">Topic Image</h3>
          <p className="text-xs font-bold text-[var(--gray-500)] uppercase tracking-widest">AI Generated</p>
        </div>
      </div>

      <div className="w-full max-w-2xl relative rounded-[24px] overflow-hidden border-2 border-[var(--black)] mb-6 group bg-[var(--gray-50)]">
        <img
          src={imageUrl}
          alt="AI Generated Topic"
          className="w-full h-auto object-cover aspect-square transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--brand-yellow)] text-[var(--gray-900)] font-bold text-sm rounded-2xl hover:bg-[#E5B800] transition-colors shadow-sm border-2 border-[var(--black)]/5"
      >
        <Download className="w-5 h-5" />
        Download Image
      </button>
    </div>
  );
}
