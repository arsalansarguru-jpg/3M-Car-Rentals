"use client";

import React, { useState, useRef, useEffect } from "react";
import { Zap, Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
}

export function CopilotWidget({ initialBriefing }: { initialBriefing?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Good morning. " + (initialBriefing || "I've analyzed today's telemetry. How can I assist you with operations?") }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput("");
    
    // Add user message
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);
    setIsTyping(true);
    
    // Simulate API delay for realism
    setTimeout(() => {
      let responseContent = "I've logged that. Can I help with anything else?";
      const lower = userMsg.toLowerCase();
      
      if (lower.includes("revenue") || lower.includes("sales")) {
        responseContent = "Our current pacing suggests we will hit ₹12,00,000 in gross revenue today. Dynamic Pricing algorithms are currently holding SUV rates at +8% above baseline.";
      } else if (lower.includes("late") || lower.includes("overdue") || lower.includes("delay")) {
        responseContent = "We have 2 delayed drops in the South Hub. I have already flagged them in the Staff Ops panel and routed Rahul to intercept the nearest return.";
      } else if (lower.includes("fleet") || lower.includes("idle")) {
        responseContent = "We have zero idle vehicles today. Fleet utilization is at 100%. We should consider opening up 3 standby units from maintenance to handle overflow.";
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: responseContent }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0 px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-lg shadow-[0_0_15px_rgba(201,168,76,0.4)]">
            <Sparkles className="w-4 h-4 text-[#0f1115] fill-current" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">3M Copilot</h2>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Online</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 custom-scrollbar pb-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-white/10 border border-white/20 text-white' : 'bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-[#3B82F6]'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-white/10 text-white rounded-tr-sm border border-white/5' 
                : 'bg-[#3B82F6]/10 text-white/90 rounded-tl-sm border border-[#3B82F6]/20'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#3B82F6]/20 border border-[#3B82F6]/30 text-[#3B82F6]">
               <Bot className="w-4 h-4" />
             </div>
             <div className="bg-[#3B82F6]/10 rounded-2xl rounded-tl-sm border border-[#3B82F6]/20 px-4 py-3 flex items-center gap-1">
               <div className="w-1.5 h-1.5 bg-[#3B82F6]/50 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-[#3B82F6]/50 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
               <div className="w-1.5 h-1.5 bg-[#3B82F6]/50 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
             </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 bg-white/[0.02] shrink-0 m-2 rounded-xl">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Copilot about revenue, fleet, or ops..."
            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/30 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-1.5 bg-[#3B82F6] text-black rounded-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
