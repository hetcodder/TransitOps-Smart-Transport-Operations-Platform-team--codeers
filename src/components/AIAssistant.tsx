import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  Send, 
  HelpCircle, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Lightbulb,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  category: string;
  priority: string;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "### TransitOps Smart AI Operations Copilot\n\nWelcome, Dispatcher. I am connected to your live fleet databases, vehicle diagnostic systems, and CDL safety records.\n\nAsk me queries regarding vehicle downtimes, route delay logs, or general variable cost-savings strategies.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Recommendations data
  const [recs, setRecs] = useState<AIRecommendation[]>([]);
  const [savingsSummary, setSavingsSummary] = useState({
    potentialSavings: "₹1,37,500/month",
    efficiencyGain: "+12.4% Fleet",
    optimizedRoutes: "4 active paths"
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchAIDashboard = async () => {
    try {
      const res = await fetch("/api/ai/dashboard");
      if (res.ok) {
        const data = await res.json();
        setRecs(data.recommendations || []);
        if (data.savingsSummary) setSavingsSummary(data.savingsSummary);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAIDashboard();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || userInput;
    if (!promptToSend.trim()) return;

    // Add user message to state
    const userMsg: ChatMessage = {
      sender: "user",
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setUserInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToSend })
      });
      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          sender: "ai",
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error("API Route failure");
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        sender: "ai",
        text: "🚨 *Network Interruption:* I was unable to access the local neural gateway. Please verify that your dev server is active and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Pre-made quick action buttons
  const speedQuestions = [
    { label: "Check delayed routes today", query: "What is causing route delays today?" },
    { label: "Diagnose vehicle repairs", query: "Which vehicles need urgent maintenance?" },
    { label: "Summarize top fuel spend", query: "Which driver has the highest fuel consumption?" }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-xs text-on-surface">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="font-display text-base font-extrabold text-on-surface">AI Operations Copilot</h3>
          <p className="text-xs text-on-surface-variant/70 mt-0.5">Automated route audits, vehicle repair prognosis, and dynamic carbon credit balancing.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-extrabold bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Gemini-3.5-Flash Active
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Live conversational Chat interface */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xl flex flex-col justify-between h-[520px]">
          {/* Conversation list */}
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 mb-4">
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex flex-col max-w-[85%] ${m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div 
                  className={`p-3.5 rounded-xl text-xs leading-relaxed space-y-2 border ${
                    m.sender === "user" 
                      ? "bg-primary/10 border-primary/25 text-on-surface" 
                      : "bg-surface-container-low border-outline-variant/20 text-on-surface"
                  }`}
                >
                  {/* Simplistic custom markdown text formatter */}
                  <div className="whitespace-pre-line font-medium">
                    {m.text.split("\n").map((line, j) => {
                      if (line.startsWith("### ")) {
                        return <h4 key={j} className="font-display text-xs font-black text-primary mt-2">{line.replace("### ", "")}</h4>;
                      }
                      if (line.startsWith("- ")) {
                        return <div key={j} className="pl-3.5 relative before:content-['•'] before:absolute before:left-1 before:text-primary font-semibold">{line.replace("- ", "")}</div>;
                      }
                      if (line.startsWith("* ")) {
                        return <div key={j} className="italic text-on-surface-variant/80 font-medium pl-1">{line.replace("* ", "")}</div>;
                      }
                      return <p key={j} className="leading-relaxed">{line}</p>;
                    })}
                  </div>
                </div>
                <span className="text-[8px] text-on-surface-variant/40 mt-1 font-mono">{m.timestamp}</span>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold pl-2 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                TransitOps Copilot analyzing live route matrix...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Form Area */}
          <div className="space-y-3 pt-3 border-t border-outline-variant/20">
            {/* Speed questions */}
            <div className="flex flex-wrap gap-2">
              {speedQuestions.map((sq, i) => (
                <button
                  key={i}
                  disabled={isSending}
                  onClick={() => handleSend(sq.query)}
                  className="bg-surface-container hover:bg-surface-container-highest border border-outline-variant/15 text-on-surface px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-40"
                >
                  {sq.label}
                </button>
              ))}
            </div>

            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2 relative"
            >
              <input
                type="text"
                disabled={isSending}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask TransitOps AI Assistant..."
                className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2.5 pl-4 pr-12 outline-none focus:ring-1 focus:ring-primary text-on-surface text-xs disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={isSending || !userInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary disabled:bg-surface-container text-[#472a00] disabled:text-on-surface-variant/40 rounded-md transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Proactive strategic bento suggestions */}
        <div className="space-y-4">
          {/* Estimated monthly savings summary bento */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Strategic Cash Outflow optimization</span>
                <h4 className="text-xl font-extrabold text-[#FFB951] mt-1 font-display">
                  {savingsSummary.potentialSavings} Potential
                </h4>
              </div>
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div className="flex justify-between text-[10px] text-on-surface-variant font-semibold border-t border-outline-variant/15 pt-2 mt-2">
              <span>{savingsSummary.efficiencyGain}</span>
              <span>{savingsSummary.optimizedRoutes}</span>
            </div>
          </div>

          {/* Strategic cards */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest block">Proactive Strategic Interventions</span>
            {recs.map((rec) => (
              <div 
                key={rec.id} 
                className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 space-y-2.5 hover:border-primary/45 transition-all"
              >
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    rec.priority === "Critical" ? "bg-rose-500/15 text-rose-400 border border-rose-500/20" : "bg-primary/15 text-primary"
                  }`}>
                    {rec.category}
                  </span>
                  <span className="text-[9px] text-[#FFB951] font-extrabold font-mono">{rec.impact}</span>
                </div>

                <div>
                  <h5 className="font-extrabold text-on-surface leading-tight text-xs">{rec.title}</h5>
                  <p className="text-[10px] text-on-surface-variant/70 leading-relaxed mt-1 font-medium">
                    {rec.description}
                  </p>
                </div>

                <button 
                  onClick={() => handleSend(`Can you elaborate on recommendation ${rec.id}: "${rec.title}"?`)}
                  className="text-primary hover:underline font-extrabold text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  Explore optimization details
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
