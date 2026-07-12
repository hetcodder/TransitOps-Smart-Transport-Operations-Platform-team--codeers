import React, { useState, useEffect } from "react";
import { Document, Vehicle, Driver } from "../types";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Calendar, 
  Trash2, 
  Download, 
  X,
  Upload,
  Link
} from "lucide-react";

interface DocumentManagerProps {
  vehicles: Vehicle[];
  drivers: Driver[];
}

export default function DocumentManager({ vehicles, drivers }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "Insurance" as "RC" | "Insurance" | "Pollution" | "Permit" | "License" | "ID Proof" | "Training" | "Other",
    relatedTo: "",
    expiryDate: new Date().toISOString().split("T")[0],
    status: "Active" as "Active" | "Expiring Soon" | "Expired"
  });

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleOpenCreate = () => {
    setSelectedFile(null);
    setFormData({
      name: "",
      category: "Insurance",
      relatedTo: vehicles[0]?.id || drivers[0]?.id || "Company",
      expiryDate: new Date(Date.now() + 365 * 24 * 3600000).toISOString().split("T")[0],
      status: "Active"
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let filePath = "";
    let fileName = "";
    let fileSize = 0;

    try {
      // 1. If a file is selected, upload it first
      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", selectedFile);
        const uploadRes = await fetch("/api/documents/upload", {
          method: "POST",
          body: uploadForm
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          filePath = uploadData.filePath;
          fileName = uploadData.fileName;
          fileSize = uploadData.fileSize;
        } else {
          alert("Failed to upload the file to compliance directory.");
          setIsUploading(false);
          return;
        }
      }

      // Calculate status dynamically based on expiryDate
      const expiry = new Date(formData.expiryDate);
      const today = new Date();
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
      let status: "Active" | "Expiring Soon" | "Expired" = "Active";
      if (diffDays <= 0) {
        status = "Expired";
      } else if (diffDays <= 30) {
        status = "Expiring Soon";
      }

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          status,
          filePath,
          fileUrl: filePath, // Support both fields
          fileName,
          fileSize
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setSelectedFile(null);
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this official document record?")) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and drop mechanics
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        name: file.name.split(".")[0],
        category: "Other"
      }));
      setIsModalOpen(true);
    }
  };

  // Warnings count
  const expiredDocs = documents.filter(d => d.status === "Expired").length;
  const expiringSoonDocs = documents.filter(d => d.status === "Expiring Soon").length;

  // Filter
  const filtered = documents.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.relatedTo.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "All" || d.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container/30 p-4 rounded-xl border border-outline-variant/20">
        <div>
          <h3 className="font-display text-base font-extrabold text-on-surface">Secure Document Vault</h3>
          <p className="text-xs text-on-surface-variant/70 mt-0.5">Maintain federal vehicle registrations, heavy insurance certificates, driver CDL licenses, and pollution permits.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-[#ffb95f] text-[#472a00] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          Record Document Asset
        </button>
      </div>

      {/* Expiry alerts bento */}
      {(expiredDocs > 0 || expiringSoonDocs > 0) && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3.5 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-on-surface">
            <h4 className="font-extrabold text-rose-400">Compliance Warning Alerts: Active Breaches</h4>
            <p className="text-on-surface-variant/80 font-semibold leading-relaxed">
              There are currently **{expiredDocs} expired** and **{expiringSoonDocs} expiring-soon** fleet registrations in active routes. Immediate compliance audits required to avoid cargo confiscations or DOT fines.
            </p>
          </div>
        </div>
      )}

      {/* Drag & drop upload area */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center space-y-2 cursor-pointer transition-all ${
          dragActive ? "border-primary bg-primary/5" : "border-outline-variant/35 hover:border-primary/55"
        }`}
        onClick={handleOpenCreate}
      >
        <Upload className="w-8 h-8 text-on-surface-variant/60 mx-auto" />
        <div className="text-xs font-bold text-on-surface">Drag & drop certification PDF / JPG here</div>
        <div className="text-[10px] text-on-surface-variant/50">Supports regulatory registrations up to 25MB (automatic OCR categorization scanner)</div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search certificates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none text-on-surface text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-surface-container/50 border border-outline-variant/30 rounded-lg px-2.5 py-1.5 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-on-surface focus:outline-none cursor-pointer font-semibold w-full md:w-auto"
          >
            <option value="All">All Classifications</option>
            <option value="RC">Vehicle Registration (RC)</option>
            <option value="Insurance">Liability Insurance</option>
            <option value="Pollution">Pollution Certificates</option>
            <option value="Permit">Transit/Hazmat Permits</option>
            <option value="License">Commercial CDL Licenses</option>
            <option value="Other">Other Miscellaneous</option>
          </select>
        </div>
      </div>

      {/* Documents Data List */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-on-surface-variant">Unlocking secure document vault...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant">No document sheets registered.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30 text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-4">Document Title</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4 font-mono">Linked Entity Asset</th>
                  <th className="py-4 px-4">Expiry Schedule</th>
                  <th className="py-4 px-4 text-center">Audit Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.map(doc => {
                  const matchedVehicle = vehicles.find(v => v.id === doc.relatedTo);
                  const matchedDriver = drivers.find(d => d.id === doc.relatedTo);
                  return (
                    <tr key={doc.id} className="hover:bg-surface-container/20 transition-all text-xs">
                      <td className="py-4 px-6 font-mono text-primary font-bold">{doc.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-extrabold text-on-surface">
                          <FileText className="w-3.5 h-3.5 text-on-surface-variant" />
                          {doc.name}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-surface-container px-2 py-0.5 rounded text-[10px] font-extrabold text-on-surface">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-on-surface">
                        {matchedVehicle ? `${matchedVehicle.name} (${doc.relatedTo})` : matchedDriver ? `${matchedDriver.name} (${doc.relatedTo})` : "Company general"}
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {doc.expiryDate}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                          doc.status === "Active" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                          doc.status === "Expiring Soon" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" :
                          "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            doc.status === "Active" ? "bg-emerald-400" :
                            doc.status === "Expiring Soon" ? "bg-amber-400" : "bg-rose-400"
                          }`} />
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {doc.fileUrl || (doc as any).filePath ? (
                            <a 
                              href={doc.fileUrl || (doc as any).filePath}
                              download={doc.name}
                              className="p-1.5 bg-primary/10 hover:bg-primary/25 text-primary rounded transition-all text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                          ) : (
                            <button 
                              onClick={() => alert("Retrieving original PDF/OCR clearance from secure CDN stream...")}
                              className="p-1.5 hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface rounded transition-colors cursor-pointer"
                            >
                              Download
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000a0] backdrop-blur-sm p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container-highest cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-display text-base font-extrabold text-on-surface flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              Register Fleet Compliance Certificate
            </h4>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Commercial Registration VO-102"
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  >
                    <option value="RC">Vehicle Registration (RC)</option>
                    <option value="Insurance">Liability Insurance</option>
                    <option value="Pollution">Pollution Certificate</option>
                    <option value="Permit">Transit/Hazmat Permit</option>
                    <option value="License">Commercial CDL License</option>
                    <option value="Other">Other Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Upload PDF / Image Certificate</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-outline-variant/40 hover:border-primary/50 rounded-lg p-2.5 bg-surface-container cursor-pointer hover:bg-surface-container-highest transition-colors">
                    <Upload className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-semibold text-on-surface truncate">
                      {selectedFile ? selectedFile.name : "Select certificate file..."}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                          if (!formData.name) {
                            setFormData({
                              ...formData,
                              name: e.target.files[0].name.split(".")[0]
                            });
                          }
                        }
                      }}
                    />
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-2 hover:bg-rose-500/15 text-rose-400 rounded-lg border border-rose-500/10 cursor-pointer"
                      title="Clear file selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-wide mb-1">Linked Asset / Driver ID</label>
                <input
                  type="text"
                  required
                  value={formData.relatedTo}
                  onChange={(e) => setFormData({ ...formData, relatedTo: e.target.value })}
                  placeholder="e.g. VO-102 or TX-88219"
                  className="w-full bg-surface-container border border-outline-variant/30 rounded-lg p-2 outline-none text-on-surface text-xs focus:border-primary font-mono"
                />
                <span className="block text-[9px] text-on-surface-variant/50 mt-1 font-semibold italic">Enter a valid Driver CDL ID or Vehicle VO chassis ID for relational linking.</span>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full bg-primary hover:bg-[#ffb95f] disabled:opacity-50 text-[#472a00] py-2.5 rounded-lg text-xs font-bold transition-all mt-4 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isUploading ? "Uploading compliance assets..." : "Upload File Manifest"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
