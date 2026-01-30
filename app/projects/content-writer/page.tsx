"use client";
import { useState } from "react";
import { FileText, Sparkles, Copy, Download, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ContentWriterPage() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("blog");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [keywords, setKeywords] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);

  const contentTypes = [
    { value: "blog", label: "Blog Post" },
    { value: "article", label: "Article" },
    { value: "social", label: "Social Media Post" },
    { value: "product", label: "Product Description" },
    { value: "email", label: "Email Content" },
    { value: "ad", label: "Ad Copy" },
  ];

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly" },
    { value: "persuasive", label: "Persuasive" },
    { value: "informative", label: "Informative" },
    { value: "creative", label: "Creative" },
  ];

  const lengths = [
    { value: "short", label: "Short (100-200 words)" },
    { value: "medium", label: "Medium (300-500 words)" },
    { value: "long", label: "Long (700-1000 words)" },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setLoading(true);
    setGeneratedContent("");

    try {
      const res = await fetch("/api/content-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          contentType,
          tone,
          length,
          keywords,
        }),
      });

      const data = await res.json();
      if (data.content) {
        setGeneratedContent(data.content);
      } else {
        alert(data.error || "Failed to generate content");
      }
    } catch (err) {
      alert("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    alert("Content copied to clipboard!");
  };

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.slice(0, 30)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="text-yellow-500" size={40} />
            <h1 className="text-4xl font-bold text-yellow-500">AI Content Writer</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Generate high-quality content for blogs, articles, social media, and more
          </p>
          <Link href="/projects" className="text-yellow-400 hover:text-yellow-300 text-sm mt-2 inline-block">
            ← Back to AI Tools
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Content Settings</h2>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Topic / Subject</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Benefits of AI in Healthcare"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-yellow-500 focus:outline-none"
              >
                {contentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-yellow-500 focus:outline-none"
              >
                {tones.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Length</label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-yellow-500 focus:outline-none"
              >
                {lengths.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Keywords (optional, comma-separated)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g., AI, machine learning, healthcare"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-yellow-500 focus:outline-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-900 font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Content
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-200">Generated Content</h2>
              {generatedContent && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
                    title="Copy to clipboard"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={downloadContent}
                    className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
                    title="Download as text file"
                  >
                    <Download size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 min-h-[500px] max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p>Crafting your content...</p>
                </div>
              ) : generatedContent ? (
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {generatedContent}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <p>Your generated content will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
