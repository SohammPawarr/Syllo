"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  type?: "text" | "image" | "form-link" | "flashcard-trigger";
  meta?: any;
}

interface ChatInterfaceProps {
  documentId: string;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onFlashcardTrigger?: (data: any) => void;
}

export default function ChatInterface({
  documentId,
  messages,
  setMessages,
  onFlashcardTrigger,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: input.trim() },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, messages: newMessages }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages([
          ...newMessages,
          { role: "model", content: data.reply },
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "model",
            content: `❌ ${data.error || "Failed to get response"}`,
          },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "model", content: "❌ Network error connecting to server." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (msg: ChatMessage, idx: number) => {
    const isUser = msg.role === "user";

    // Special: image type
    if (msg.type === "image" && msg.meta?.imageUrl) {
      return (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 justify-start max-w-[85%]"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--white)] border-2 border-[var(--black)] flex items-center justify-center shrink-0 mt-1 shadow-sm overflow-hidden">
             <span className="text-sm">🤖</span>
          </div>
          <div className="rounded-3xl rounded-tl-sm overflow-hidden border-2 border-[var(--gray-200)] bg-[var(--white)] shadow-soft">
            <img
              src={msg.meta.imageUrl}
              alt="AI Generated"
              className="w-full max-w-md aspect-square object-cover"
            />
            <div className="p-4 flex justify-between items-center border-t border-[var(--gray-100)] bg-[var(--gray-50)]">
              <span className="text-xs font-bold text-[var(--gray-500)] uppercase tracking-wider">AI Generated</span>
              <a
                href={`/api/proxy-image?url=${encodeURIComponent(msg.meta.imageUrl)}`}
                className="flex items-center gap-1 text-xs text-[var(--brand-blue)] hover:text-[var(--brand-light-blue)] font-bold bg-[var(--brand-blue)]/10 px-3 py-1.5 rounded-full transition-colors"
              >
                <Download className="w-3 h-3" /> Download
              </a>
            </div>
          </div>
        </motion.div>
      );
    }

    // Special: form link
    if (msg.type === "form-link" && msg.meta?.publishedUrl) {
      return (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 justify-start max-w-[85%]"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--white)] border-2 border-[var(--black)] flex items-center justify-center shrink-0 mt-1 shadow-sm overflow-hidden">
             <span className="text-sm">🤖</span>
          </div>
          <div className="rounded-3xl rounded-tl-sm border-2 border-[var(--gray-200)] bg-[var(--white)] p-5 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--brand-yellow)] border border-[var(--black)]/10 flex items-center justify-center text-sm shadow-sm">
                📝
              </div>
              <p className="text-sm text-[var(--brand-blue)] font-bold">Quiz Generated!</p>
            </div>
            <p className="text-sm text-[var(--gray-600)] font-medium leading-relaxed">{msg.meta.title}</p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={msg.meta.publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2.5 bg-[var(--brand-blue)] text-[var(--white)] text-sm font-bold rounded-xl hover:bg-[var(--brand-light-blue)] shadow-sm transition-colors"
              >
                Take Quiz
              </a>
              {msg.meta.editUrl && (
                <a
                  href={msg.meta.editUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center py-2.5 bg-[var(--gray-100)] text-[var(--gray-700)] text-sm font-bold rounded-xl hover:bg-[var(--gray-200)] transition-colors"
                >
                  Edit Form
                </a>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    // Special: flashcard trigger
    if (msg.type === "flashcard-trigger" && msg.meta?.flashcards) {
      return (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 justify-start max-w-[85%]"
        >
          <div className="w-8 h-8 rounded-full bg-[var(--white)] border-2 border-[var(--black)] flex items-center justify-center shrink-0 mt-1 shadow-sm overflow-hidden">
             <span className="text-sm">🤖</span>
          </div>
          <button
            onClick={() => onFlashcardTrigger?.(msg.meta.flashcards)}
            className="rounded-3xl rounded-tl-sm border-2 border-[var(--gray-200)] bg-[var(--white)] p-5 text-left hover:border-[var(--brand-light-blue)] shadow-soft transition-all cursor-pointer group flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-yellow)]/20 border border-[var(--brand-yellow)] flex items-center justify-center text-lg shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              📇
            </div>
            <div>
              <p className="text-sm text-[var(--brand-blue)] font-bold mb-1">{msg.meta.flashcards.length} Flashcards Ready!</p>
              <p className="text-sm text-[var(--gray-500)] font-medium group-hover:text-[var(--brand-light-blue)] transition-colors">Click to flip through cards →</p>
            </div>
          </button>
        </motion.div>
      );
    }

    // Standard text message
    return (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`flex gap-3 w-full ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-[var(--white)] border-2 border-[var(--black)] flex items-center justify-center shrink-0 mt-1 shadow-sm overflow-hidden">
            <span className="text-sm">🤖</span>
          </div>
        )}

        <div
          className={`px-5 py-3.5 rounded-[24px] max-w-[85%] sm:max-w-[75%] shadow-sm ${
            isUser
              ? "bg-[var(--brand-light-blue)] text-[var(--white)] rounded-tr-sm"
              : "bg-[var(--white)] border border-[var(--gray-200)] text-[var(--gray-800)] rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm font-medium">{msg.content}</p>
          ) : (
            <div className="light-prose text-sm font-medium leading-relaxed">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full relative bg-[var(--white)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--gray-400)] animate-fade-in">
            <div className="w-16 h-16 rounded-[24px] bg-[var(--white)] border-2 border-[var(--gray-200)] flex items-center justify-center mb-4 shadow-sm">
              <Bot className="w-8 h-8 text-[var(--gray-300)]" />
            </div>
            <p className="font-heading text-sm font-extrabold tracking-wider text-[var(--gray-400)] mb-1">
              ASK A QUESTION
            </p>
            <p className="text-xs font-medium">
              Start chatting about your document
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => renderMessage(msg, idx))}
          </AnimatePresence>
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-[var(--white)] border-2 border-[var(--black)] flex items-center justify-center shrink-0 mt-1 shadow-sm">
              <span className="text-sm">🤖</span>
            </div>
            <div className="px-5 py-4 rounded-[24px] bg-[var(--white)] border border-[var(--gray-200)] rounded-tl-sm flex items-center gap-1.5 shadow-sm">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 pb-6 md:pb-8 bg-gradient-to-t from-[var(--white)] via-[var(--white)] to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 p-2 bg-[var(--white)] border-2 border-[var(--gray-200)] rounded-[32px] shadow-soft transition-shadow focus-within:shadow-md focus-within:border-[var(--brand-light-blue)]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 px-4 py-2 bg-transparent text-sm font-medium text-[var(--gray-900)] placeholder:text-[var(--gray-400)] focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--brand-light-blue)] text-[var(--white)] hover:bg-[var(--brand-blue)] shadow-sm disabled:opacity-40 disabled:hover:bg-[var(--brand-light-blue)] transition-colors cursor-pointer shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
