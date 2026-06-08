"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface ChatInterfaceProps {
  documentId: string;
}

export default function ChatInterface({ documentId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          messages: newMessages,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages([...newMessages, { role: "model", content: data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          { role: "model", content: `❌ Error: ${data.error || "Failed to get response"}` },
        ]);
      }
    } catch (e) {
      console.error(e);
      setMessages([...newMessages, { role: "model", content: "❌ Network error connecting to chat server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full h-[600px] border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--background)]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--muted-foreground)]">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg">Start a conversation!</p>
            <p className="text-sm">Ask anything about your document.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "model" && (
                <div className="w-8 h-8 rounded-full bg-[#673AB7] flex items-center justify-center text-white shrink-0 mt-1">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              
              <div
                className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-[var(--color-deep-purple)] text-white rounded-tr-sm"
                    : "bg-white border border-[var(--border)] text-[var(--foreground)] rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-[var(--color-light-purple)] flex items-center justify-center text-white shrink-0 mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#673AB7] flex items-center justify-center text-white shrink-0 mt-1">
              <Bot className="w-5 h-5" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-[var(--border)] text-[var(--foreground)] rounded-tl-sm shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--muted-foreground)]" />
              <span className="text-sm text-[var(--muted-foreground)]">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-[var(--border)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your document..."
            className="flex-1 p-3 border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--color-light-purple)]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-[var(--color-deep-purple)] text-white rounded-lg hover:bg-[var(--color-light-purple)] disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
