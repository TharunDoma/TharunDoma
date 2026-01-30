"use client";
import { useState } from "react";
import { Code, Sparkles, Copy, Loader2, FileCode, Bug, Zap, BookOpen } from "lucide-react";
import Link from "next/link";

export default function CodeAssistantPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [action, setAction] = useState("explain");
  const [additionalContext, setAdditionalContext] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
  ];

  const actions = [
    { value: "explain", label: "Explain Code", icon: BookOpen, desc: "Get detailed explanation" },
    { value: "optimize", label: "Optimize", icon: Zap, desc: "Improve performance" },
    { value: "debug", label: "Find Bugs", icon: Bug, desc: "Detect potential issues" },
    { value: "refactor", label: "Refactor", icon: FileCode, desc: "Improve code structure" },
    { value: "complete", label: "Complete Code", icon: Code, desc: "Finish incomplete code" },
    { value: "convert", label: "Convert Language", icon: Sparkles, desc: "Convert to another language" },
  ];

  const handleAnalyze = async () => {
    if (!code.trim()) {
      alert("Please enter some code");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/code-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          action,
          additionalContext,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setResult(data.result);
      } else {
        alert(data.error || "Failed to analyze code");
      }
    } catch (err) {
      alert("Error analyzing code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert("Copied to clipboard!");
  };

  const getCurrentActionIcon = () => {
    const current = actions.find((a) => a.value === action);
    const Icon = current?.icon || Code;
    return <Icon size={20} />;
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Code className="text-cyan-500" size={40} />
            <h1 className="text-4xl font-bold text-cyan-500">AI Code Assistant</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Explain, optimize, debug, and refactor your code with AI
          </p>
          <Link href="/projects" className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 inline-block">
            ← Back to AI Tools
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-slate-800 border border-cyan-500/30 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Code Input</h2>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Programming Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Action</label>
              <div className="grid grid-cols-2 gap-2">
                {actions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.value}
                      onClick={() => setAction(act.value)}
                      className={`p-3 rounded-lg border transition text-left ${
                        action === act.value
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-200"
                          : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} />
                        <span className="font-medium text-sm">{act.label}</span>
                      </div>
                      <p className="text-xs opacity-75">{act.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Your Code</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`Paste your ${language} code here...`}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-sm h-64 resize-none"
                spellCheck={false}
              />
            </div>

            {/* Additional Context */}
            {(action === "complete" || action === "convert") && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {action === "convert" ? "Target Language" : "Additional Instructions"}
                </label>
                <input
                  type="text"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder={
                    action === "convert"
                      ? "e.g., Python, Java, TypeScript"
                      : "e.g., Add error handling, use async/await"
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading || !code.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  {getCurrentActionIcon()}
                  Analyze Code
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-slate-800 border border-cyan-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-200">Result</h2>
              {result && (
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
                  title="Copy to clipboard"
                >
                  <Copy size={18} />
                </button>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 min-h-[500px] max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p>Analyzing your code...</p>
                </div>
              ) : result ? (
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed font-mono text-sm">
                  {result}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <p>Analysis results will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Example Section */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-300 mb-3">Quick Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400">
            <div>
              <strong className="text-cyan-400">Explain:</strong> Understand complex code snippets with detailed explanations
            </div>
            <div>
              <strong className="text-cyan-400">Optimize:</strong> Get performance improvements and best practices
            </div>
            <div>
              <strong className="text-cyan-400">Debug:</strong> Find potential bugs, security issues, and edge cases
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
