"use client";
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, LogOut, Image as ImageIcon, Upload, RefreshCw, Check, AlertCircle, Trash2, Plus, Edit2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { MessageSquare, X } from "lucide-react";

type ImageRow = {
  id: string;
  title: string | null;
  description: string | null;
  image_data: string | null;
  image_url: string | null;
  image_type: string | null;
};

type ProjectRow = {
  id: string;
  title: string;
  description: string;
  tech_stack: string;
  demo_url: string | null;
  github_url: string | null;
  is_deployed: boolean;
  deploy_status: string;
  display_order: number;
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [galleryTitle, setGalleryTitle] = useState("");

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const [images, setImages] = useState<ImageRow[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [projectForm, setProjectForm] = useState<Partial<ProjectRow>>({});
  const [editingProject, setEditingProject] = useState<string | null>(null);

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentCategory, setDocumentCategory] = useState<string>("general");

  const [chatOpen, setChatOpen] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    if (stored) setToken(stored);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchImages();
    fetchProjects();
  }, [token]);

  const profileImage = useMemo(() => images.find((i) => i.image_type === "profile"), [images]);
  const backgroundImage = useMemo(() => images.find((i) => i.image_type === "background"), [images]);
  const galleryImages = useMemo(() => images.filter((i) => i.image_type === "gallery"), [images]);

  async function fetchImages() {
    const { data, error } = await supabase
      .from("portfolio_images")
      .select("id,title,description,image_data,image_url,image_type")
      .order("created_at", { ascending: false });
    if (!error && data) setImages(data as ImageRow[]);
  }

  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("display_order", { ascending: true });
    if (!error && data) setProjects(data as ProjectRow[]);
  }

  async function saveProject() {
    if (!projectForm.title || !projectForm.description || !projectForm.tech_stack) {
      setStatusMsg("Fill all required fields");
      return;
    }
    setProcessing(true);
    setStatusMsg(null);
    try {
      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update(projectForm)
          .eq("id", editingProject);
        if (error) throw error;
        setStatusMsg("Project updated");
      } else {
        const { error } = await supabase
          .from("projects")
          .insert([projectForm]);
        if (error) throw error;
        setStatusMsg("Project added");
      }
      setProjectForm({});
      setEditingProject(null);
      await fetchProjects();
    } catch (err: any) {
      setStatusMsg(err?.message || "Save failed");
    } finally {
      setProcessing(false);
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    setProcessing(true);
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      setStatusMsg("Project deleted");
      await fetchProjects();
    } catch (err: any) {
      setStatusMsg(err?.message || "Delete failed");
    } finally {
      setProcessing(false);
    }
  }

  function startEdit(project: ProjectRow) {
    setProjectForm(project);
    setEditingProject(project.id);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret })
      });
      const json = await res.json();
      if (!json.success) {
        setLoginError(json.message || "Invalid key");
      } else {
        setToken(json.token);
        if (typeof window !== "undefined") localStorage.setItem("adminToken", json.token);
        fetchImages();
      }
    } catch (err: any) {
      setLoginError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    if (typeof window !== "undefined") localStorage.removeItem("adminToken");
  }

  async function uploadImage(file: File, imageType: "profile" | "background" | "gallery", title?: string) {
    if (!token) return;
    setProcessing(true);
    setStatusMsg(null);
    try {
      // Upload to Supabase Storage
      const fileName = `${imageType}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(fileName, file, { upsert: false });
      
      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("portfolio").getPublicUrl(fileName);
      const imageUrl = data?.publicUrl;

      // Save to database
      const { data: existing } = await supabase
        .from("portfolio_images")
        .select("id")
        .eq("image_type", imageType)
        .limit(1)
        .single();

      if (existing && imageType !== "gallery") {
        await supabase
          .from("portfolio_images")
          .update({ image_url: imageUrl, title: title || imageType })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("portfolio_images")
          .insert([{
            image_url: imageUrl,
            image_data: null,
            title: title || imageType,
            description: imageType === "gallery" ? "gallery" : "",
            image_type: imageType,
            is_active: true
          }]);
      }

      setStatusMsg("Image saved");
      // Clear the file input after upload
      if (imageType === "profile") setProfileFile(null);
      if (imageType === "background") setBgFile(null);
      if (imageType === "gallery") {
        setGalleryFile(null);
        setGalleryTitle("");
      }
      await fetchImages();
    } catch (err: any) {
      setStatusMsg(err?.message || "Upload failed");
    } finally {
      setProcessing(false);
    }
  }

  async function uploadDocument() {
    if (!token || !documentFile) return;
    setProcessing(true);
    setStatusMsg(null);
    try {
      // Read file as base64
      const dataUrl = await fileToDataUrl(documentFile);
      
      const res = await fetch("/api/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: documentFile.name,
          fileType: documentFile.type,
          fileData: dataUrl,
          category: documentCategory,
          token: token
        }),
      });
      
      const json = await res.json();
      setStatusMsg(json.reply || (json.success ? "Document uploaded" : "Upload failed"));
      
      if (json.success) {
        setDocumentFile(null);
        setDocumentCategory("general");
      }
    } catch (err: any) {
      setStatusMsg(err?.message || "Upload failed");
    } finally {
      setProcessing(false);
    }
  }

  async function updateText(kind: "headline" | "bio") {
    if (!token) return;
    const value = kind === "headline" ? headline.trim() : bio.trim();
    if (!value) return;
    setProcessing(true);
    setStatusMsg(null);
    const message = kind === "headline" ? `hero headline to "${value}"` : `bio to "${value}"`;
    try {
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, token }),
      });
      const json = await res.json();
      setStatusMsg(json.reply || (json.success ? "Updated" : "Error"));
    } catch (err: any) {
      setStatusMsg(err?.message || "Update failed");
    } finally {
      setProcessing(false);
    }
  }

  async function handleProcessDocs() {
    if (!token) return;
    setProcessing(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/process-training-docs", { method: "POST" });
      const json = await res.json();
      setStatusMsg(json.success ? `Processed ${json.processed} docs` : json.message || "Processing failed");
    } catch (err: any) {
      setStatusMsg(err?.message || "Processing failed");
    } finally {
      setProcessing(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="text-sky-500" size={22} />
            <h1 className="text-xl font-semibold text-slate-100">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Security key"
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100"
            />
            {loginError && <p className="text-red-400 text-sm flex items-center gap-1"><AlertCircle size={14} /> {loginError}</p>}
            <button
              type="submit"
              disabled={loading || !secret.trim()}
              className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-sky-500" size={22} />
            <div>
              <h1 className="text-2xl font-bold">Admin Console</h1>
              <p className="text-slate-400 text-sm">Manage public-facing assets and text</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-500">
            <LogOut size={16} /> Logout
          </button>
        </div>

        {statusMsg && (
          <div className="flex items-center gap-2 text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
            <Check size={14} className="text-emerald-400" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Profile Picture" preview={profileImage?.image_data}>
            <FileInput onChange={(file) => setProfileFile(file)} label="Select image" />
            <ActionButton
              disabled={!profileFile || processing}
              onClick={() => profileFile && uploadImage(profileFile, "profile", "Profile")}
              text={processing ? "Saving..." : "Save Profile"}
            />
          </Card>

          <Card title="Background Image" preview={backgroundImage?.image_data}>
            <FileInput onChange={(file) => setBgFile(file)} label="Select image" />
            <ActionButton
              disabled={!bgFile || processing}
              onClick={() => bgFile && uploadImage(bgFile, "background", "Background")}
              text={processing ? "Saving..." : "Save Background"}
            />
          </Card>
        </div>

        <Card title="Gallery">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {galleryImages.map((img) => (
              <div key={img.id} className="aspect-square rounded-lg border border-slate-700 overflow-hidden bg-slate-800">
                {img.image_data ? (
                  <img src={img.image_data} alt={img.title || "Gallery"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500 text-sm">No image</div>
                )}
              </div>
            ))}
            {galleryImages.length === 0 && <p className="text-slate-500 text-sm">No images yet.</p>}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              value={galleryTitle}
              onChange={(e) => setGalleryTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
            />
            <FileInput onChange={(file) => setGalleryFile(file)} label="Select gallery image" />
          </div>
          <div className="mt-3">
            <ActionButton
              disabled={!galleryFile || processing}
              onClick={() => galleryFile && uploadImage(galleryFile, "gallery", galleryTitle || "Gallery")}
              text={processing ? "Uploading..." : "Add to Gallery"}
            />
          </div>
        </Card>

        <Card title="Public Text">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">Hero headline</label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g., Building AI experiences"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
              />
              <div className="mt-2">
                <ActionButton
                  disabled={!headline.trim() || processing}
                  onClick={() => updateText("headline")}
                  text={processing ? "Saving..." : "Save Headline"}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-300">Short bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="One or two sentences about you"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 h-24"
              />
              <div className="mt-2">
                <ActionButton
                  disabled={!bio.trim() || processing}
                  onClick={() => updateText("bio")}
                  text={processing ? "Saving..." : "Save Bio"}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="AI Docs (private)">
          <p className="text-slate-400 text-sm mb-3">Run the server-side processor after uploads.</p>
          <ActionButton
            disabled={processing}
            onClick={handleProcessDocs}
            text={processing ? "Processing..." : "Process Training Docs"}
            icon={<RefreshCw size={16} />}
          />
        </Card>

        <Card title="Training Documents Upload">
          <p className="text-slate-400 text-sm mb-3">
            Upload project reports, resume, certifications, or any text files. 
            AI will extract and use this info when answering questions.
          </p>
          
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={documentCategory}
                onChange={(e) => setDocumentCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
              >
                <option value="general">General</option>
                <option value="resume">Resume / CV</option>
                <option value="project">Project Documentation</option>
                <option value="certification">Certification</option>
                <option value="achievement">Achievement</option>
              </select>
              
              <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg hover:border-slate-500 w-full">
                  <Upload size={16} />
                  <span>{documentFile ? documentFile.name : "Select file (PDF, DOC, TXT)"}</span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            
            <ActionButton
              disabled={!documentFile || processing}
              onClick={uploadDocument}
              text={processing ? "Uploading..." : "Upload Training Document"}
              icon={<Upload size={16} />}
            />
            
            {documentFile && (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Check size={12} className="text-emerald-400" />
                Selected: {documentFile.name} ({(documentFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
        </Card>

        <Card title="Projects Management">
          <div className="space-y-4">
            <div className="grid gap-3">
              <input
                type="text"
                value={projectForm.title || ""}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                placeholder="Project title"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
              />
              <textarea
                value={projectForm.description || ""}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Project description"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 h-20"
              />
              <input
                type="text"
                value={projectForm.tech_stack || ""}
                onChange={(e) => setProjectForm({ ...projectForm, tech_stack: e.target.value })}
                placeholder="Tech stack (comma-separated, e.g., React, Python, TensorFlow)"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="url"
                  value={projectForm.demo_url || ""}
                  onChange={(e) => setProjectForm({ ...projectForm, demo_url: e.target.value })}
                  placeholder="Demo URL (optional)"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                />
                <input
                  type="url"
                  value={projectForm.github_url || ""}
                  onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                  placeholder="GitHub URL (optional)"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  value={projectForm.deploy_status || ""}
                  onChange={(e) => setProjectForm({ ...projectForm, deploy_status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                >
                  <option value="">Select status</option>
                  <option value="Live">Live</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
                <input
                  type="number"
                  value={projectForm.display_order || ""}
                  onChange={(e) => setProjectForm({ ...projectForm, display_order: parseInt(e.target.value) })}
                  placeholder="Display order"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                />
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={projectForm.is_deployed || false}
                    onChange={(e) => setProjectForm({ ...projectForm, is_deployed: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Deployed</span>
                </label>
              </div>
              <div className="flex gap-2">
                <ActionButton
                  disabled={processing}
                  onClick={saveProject}
                  text={processing ? "Saving..." : editingProject ? "Update Project" : "Add Project"}
                  icon={<Plus size={16} />}
                />
                {editingProject && (
                  <button
                    onClick={() => { setProjectForm({}); setEditingProject(null); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-700 pt-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Projects List</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {projects.length === 0 ? (
                  <p className="text-slate-500 text-sm">No projects yet.</p>
                ) : (
                  projects.map((proj) => (
                    <div key={proj.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-100 truncate">{proj.title}</p>
                        <p className="text-xs text-slate-400">{proj.deploy_status}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(proj)}
                          className="p-2 hover:bg-slate-700 rounded text-sky-400"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteProject(proj.id)}
                          className="p-2 hover:bg-slate-700 rounded text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {token && (
        <AdminAssistantChat
          token={token}
          open={chatOpen}
          onToggle={() => setChatOpen((v) => !v)}
        />
      )}
    </div>
  );
}

function FileInput({ onChange, label }: { onChange: (file: File | null) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
      <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg hover:border-slate-500">
        <Upload size={16} />
        <span>{label}</span>
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </label>
  );
}

function Card({ title, children, preview }: { title: string; children: React.ReactNode; preview?: string | null }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-slate-200 font-semibold">
        <ImageIcon size={18} className="text-sky-400" />
        <span>{title}</span>
      </div>
      {preview && (
        <div className="h-40 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
          <img src={preview} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
      {children}
    </div>
  );
}

function ActionButton({ disabled, onClick, text, icon }: { disabled?: boolean; onClick: () => void; text: string; icon?: React.ReactNode }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
    >
      {icon}
      {text}
    </button>
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type ChatMessage = { role: "user" | "assistant"; content: string };

function AdminAssistantChat({ token, open, onToggle }: { token: string; open: boolean; onToggle: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "assistant",
    content: "I'm your personal operations manager. Ask me about recent recruiter chats or tell me updates to apply."
  }]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    const nextHistory = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextHistory);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token
        },
        body: JSON.stringify({
          message: trimmed,
          mode: "ADMIN",
          conversationHistory: nextHistory.map((m) => ({ type: m.role === "user" ? "user" : "assistant", content: m.content }))
        })
      });
      const json = await res.json();
      const reply = json.reply || "No response";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: err?.message || "Request failed" }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="flex justify-end mb-2">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-slate-100 shadow-lg"
        >
          {open ? <X size={16} /> : <MessageSquare size={16} />}
          <span>{open ? "Hide Ops Assistant" : "Ops Assistant"}</span>
        </button>
      </div>

      {open && (
        <div className="w-80 h-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800 text-sm text-slate-300">Personal Ops Assistant (Admin)</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, idx) => (
              <div key={idx} className={`text-sm leading-relaxed ${m.role === "assistant" ? "text-slate-100" : "text-sky-200"}`}>
                <span className="font-semibold mr-1">{m.role === "assistant" ? "Assistant" : "You"}:</span>
                {m.content}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-800 bg-slate-900">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Ask about recruiter chats..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 text-sm"
              />
              <button
                onClick={send}
                disabled={sending}
                className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
