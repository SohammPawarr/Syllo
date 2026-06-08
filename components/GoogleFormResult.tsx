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
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto space-y-8 h-full">
      <div className="w-20 h-20 bg-[#F3E5F5] rounded-full flex items-center justify-center">
        <span className="text-4xl">📝</span>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-[var(--color-deep-purple)] mb-2">Google Form Created!</h2>
        <p className="text-[var(--muted-foreground)]">
          Your quiz "{title}" has been successfully generated and published as a Google Form.
        </p>
      </div>

      <div className="w-full space-y-4">
        {publishedUrl ? (
          <div className="bg-white border-2 border-[#673AB7] rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Shareable Quiz Link</h3>
              <p className="text-sm text-gray-500">Send this link to students so they can take the quiz.</p>
            </div>
            <div className="flex gap-2">
              <input 
                readOnly
                value={publishedUrl}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 focus:outline-none"
              />
              <button 
                onClick={() => copyToClipboard(publishedUrl)}
                className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                title="Copy Link"
              >
                {copiedUrl === publishedUrl ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
              <a 
                href={publishedUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-2 bg-[#673AB7] hover:bg-[#5E35B1] text-white font-bold rounded-lg transition-colors"
              >
                Open Form <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            Google Form URL is missing. Did you add the Apps Script URL to your environment variables?
          </div>
        )}

        {editUrl && (
          <div className="text-sm">
            <a 
              href={editUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-[#673AB7] hover:underline flex items-center justify-center gap-1"
            >
              Open in Google Forms Editor <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
