"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Video, Upload, Scissors, Download, Play, Pause } from "lucide-react";

export default function VideoEditorPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [duration, setDuration] = useState(10);
  const [filter, setFilter] = useState("none");
  const [speed, setSpeed] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filters = [
    { value: "none", label: "None" },
    { value: "grayscale", label: "Grayscale" },
    { value: "sepia", label: "Sepia" },
    { value: "blur", label: "Blur" },
    { value: "brightness", label: "Bright" },
    { value: "contrast", label: "High Contrast" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    } else {
      alert("Please upload a valid video file");
    }
  };

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.addEventListener("loadedmetadata", () => {
        const dur = videoRef.current?.duration || 10;
        setDuration(dur);
        setEndTime(Math.min(10, dur));
      });
    }
  }, [videoUrl]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const applyFilterToCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.filter = {
      none: "none",
      grayscale: "grayscale(100%)",
      sepia: "sepia(100%)",
      blur: "blur(3px)",
      brightness: "brightness(150%)",
      contrast: "contrast(200%)",
    }[filter] || "none";

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  };

  const downloadVideo = () => {
    alert("Video download with trim/filters requires server-side processing. For now, you can use screen recording to capture the edited preview.");
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Video className="text-pink-500" size={40} />
            <h1 className="text-4xl font-bold text-pink-500">AI Video Editor</h1>
          </div>
          <p className="text-slate-400 text-lg">Upload, trim, and apply filters to your videos.</p>
          <Link href="/projects" className="text-pink-400 hover:text-pink-300 text-sm mt-2 inline-block">
            ← Back to AI Tools
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800 border border-pink-500/30 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-slate-200">Video Preview</h2>
            {!videoUrl ? (
              <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-lg p-12 text-center">
                <Upload className="mx-auto mb-4 text-slate-500" size={48} />
                <p className="text-slate-400 mb-4">Upload a video to get started</p>
                <label className="cursor-pointer inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold transition">
                  <Upload size={18} />
                  Choose Video
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full"
                    style={{ filter: filter !== "none" ? { grayscale: "grayscale(100%)", sepia: "sepia(100%)", blur: "blur(3px)", brightness: "brightness(150%)", contrast: "contrast(200%)" }[filter] : "none" }}
                    onEnded={() => setIsPlaying(false)}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="flex-1 bg-pink-600 hover:bg-pink-500 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={downloadVideo}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-800 border border-pink-500/30 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-slate-200">Edit Controls</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                disabled={!videoUrl}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-pink-500 focus:outline-none disabled:opacity-50"
              >
                {filters.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Speed: {speed}x</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.25"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                disabled={!videoUrl}
                className="w-full disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Trim: {startTime.toFixed(1)}s - {endTime.toFixed(1)}s
              </label>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-slate-400">Start Time</label>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={startTime}
                    onChange={(e) => setStartTime(Math.min(Number(e.target.value), endTime - 1))}
                    disabled={!videoUrl}
                    className="w-full disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">End Time</label>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.1"
                    value={endTime}
                    onChange={(e) => setEndTime(Math.max(Number(e.target.value), startTime + 1))}
                    disabled={!videoUrl}
                    className="w-full disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setVideoFile(null);
                  setVideoUrl(null);
                  setFilter("none");
                  setSpeed(1);
                  setStartTime(0);
                  setEndTime(10);
                }}
                disabled={!videoUrl}
                className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 font-semibold py-2 rounded-lg transition"
              >
                Clear Video
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-400">
          <strong className="text-pink-400">Note:</strong> Video editing is done client-side in your browser. Filters and playback speed are applied in real-time. Trim markers show the playback range.
        </div>
      </div>
    </div>
  );
}
