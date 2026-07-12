import React, { useState } from "react";
import { 
  HelpCircle, 
  Search, 
  PhoneCall, 
  Mail, 
  Send, 
  CheckCircle,
  BookOpen,
  ArrowRight
} from "lucide-react";

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    priority: "Medium" as "Low" | "Medium" | "High" | "Urgent",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const faqItems = [
    { q: "How do I clear a vehicle from maintenance state?", a: "Once mechanical repairs are finished, edit the maintenance ticket from the Servicing Logs tab and change the status to 'Completed'. The system will automatically clear the vehicle back to an 'Active' state." },
    { q: "What should I do if a cargo trip is Overdue?", a: "Immediately contact the driver through the dispatch terminal. If communication is lost, cross-reference their last known GPS coordinates with local rest station coordinates or dispatch towing support." },
    { q: "How is average fuel efficiency tracked?", a: "TransitOps computes fuel usage dynamically. Each time a driver registers a fuel card transaction, our algorithms compare odometer differences with quantity filled to calculate real-time MPG." },
    { q: "Where can I find CDL license expiry schedules?", a: "Navigate to the Secure Document Vault. All commercial licenses, emissions permits, and liability insurance certificates are tabulated with dynamic countdown clocks." }
  ];

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setTicketForm({ subject: "", priority: "Medium", message: "" });
    }, 4000);
  };

  const filteredFaqs = faqItems.filter(item => 
    item.q.toLowerCase().includes(search.toLowerCase()) || 
    item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-xs text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="font-display text-base font-extrabold text-on-surface">Operations Support Hub</h3>
          <p className="text-xs text-on-surface-variant/70 mt-0.5">Access quick operational workflows, dial roadside dispatch stations, or open official system tickets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left columns: FAQS & Help guides */}
        <div className="lg:col-span-2 space-y-6">
          {/* FAQ list */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-outline-variant/20">
              <h4 className="font-display text-sm font-extrabold text-on-surface flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Frequently Asked Workflows
              </h4>

              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Search FAQ guides..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-1.5 pl-9 pr-4 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-6 text-on-surface-variant/60 italic">No FAQ guides match your search terms.</div>
              ) : (
                filteredFaqs.map((faq, i) => (
                  <div key={i} className="space-y-1.5">
                    <h5 className="font-extrabold text-on-surface flex items-start gap-1.5 leading-snug">
                      <span className="text-primary font-black">Q:</span>
                      {faq.q}
                    </h5>
                    <p className="text-on-surface-variant/80 pl-4 font-semibold leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick instructions list */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-xl space-y-3">
            <h4 className="font-display text-xs font-extrabold text-on-surface uppercase tracking-wide">Standard Dispatch Procedures</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              {[
                { step: "01", title: "Verify License Documents", desc: "Drivers must have active, unexpired CDL credentials logged prior to trailer attachment." },
                { step: "02", title: "Conduct Pre-trip Safety", desc: "Vehicles with active warnings or oil pressure alerts must remain locked at repair stations." },
                { step: "03", title: "Authorize Cargo Route", desc: "Trigger the GPS dispatch card to stream real-time ETA progress to warehouse monitors." },
              ].map((stepObj) => (
                <div key={stepObj.step} className="p-3 bg-surface-container/20 border border-outline-variant/15 rounded-lg space-y-1">
                  <span className="text-primary font-mono font-black text-xs">{stepObj.step}</span>
                  <div className="font-extrabold text-on-surface leading-tight">{stepObj.title}</div>
                  <p className="text-on-surface-variant/70 leading-relaxed font-semibold">{stepObj.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Emergency contact & open ticket form */}
        <div className="space-y-4">
          {/* Emergency support hotlines */}
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 space-y-3">
            <h4 className="font-display text-xs font-extrabold text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4" />
              Roadside Emergency Lines
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between items-center p-2 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-on-surface">
                <span className="font-bold">Truck Towing Dispatch</span>
                <span className="font-mono font-black text-rose-400">1-800-555-TOWS</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-on-surface">
                <span className="font-bold">Emissions / Spill Hotline</span>
                <span className="font-mono font-black text-rose-400">1-800-555-HAZM</span>
              </div>
            </div>
          </div>

          {/* Issue submit Form */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 space-y-3.5">
            <h4 className="font-display text-xs font-extrabold text-on-surface uppercase tracking-wide">Open IT System Ticket</h4>
            
            {formSubmitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-extrabold text-emerald-400">Support Ticket Filed</div>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  IT specialists have been paged. Diagnostics telemetry appended. Response ETA: 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="e.g. GPS sensor delay on route I-5"
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Severity Level</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as any })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    <option value="Low">Low (No route effect)</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Immediate Warning)</option>
                    <option value="Urgent">Urgent (System Stalled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Detailed Explanation</label>
                  <textarea
                    required
                    rows={4}
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="Explain the technical issue or dispatch bug."
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-[#ffb95f] text-[#472a00] py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Ticket
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
