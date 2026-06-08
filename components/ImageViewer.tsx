"use client";

import { Download } from "lucide-react";

interface ImageViewerProps {
  imageUrl: string;
}

export default function ImageViewer({ imageUrl }: ImageViewerProps) {
  const handleDownload = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `syllo-generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-[var(--border)]">
      <div className="w-full max-w-2xl relative rounded-xl overflow-hidden shadow-lg mb-6 group">
        {/* We use standard img tag instead of Next/Image because the URL is dynamic external */}
        <img 
          src={imageUrl} 
          alt="AI Generated Topic" 
          className="w-full h-auto object-cover aspect-square transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-6 py-3 bg-[var(--color-deep-purple)] text-white font-bold rounded-lg hover:bg-[var(--color-light-purple)] transition-colors shadow-md hover:shadow-lg"
      >
        <Download className="w-5 h-5" />
        Download High-Res Image
      </button>
    </div>
  );
}
