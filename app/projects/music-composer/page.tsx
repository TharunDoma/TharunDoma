"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Music, Play, Square, Download, Sparkles } from "lucide-react";

type Note = { frequency: number; duration: number; time: number };

export default function MusicComposerPage() {
  const [mood, setMood] = useState("happy");
  const [genre, setGenre] = useState("electronic");
  const [tempo, setTempo] = useState(120);
  const [duration, setDuration] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generated, setGenerated] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const notesRef = useRef<Note[]>([]);

  const moods = [
    { value: "happy", label: "Happy" },
    { value: "calm", label: "Calm" },
    { value: "energetic", label: "Energetic" },
    { value: "melancholic", label: "Melancholic" },
    { value: "mysterious", label: "Mysterious" },
  ];

  const genres = [
    { value: "electronic", label: "Electronic" },
    { value: "ambient", label: "Ambient" },
    { value: "classical", label: "Classical" },
    { value: "jazz", label: "Jazz" },
  ];

  const scales: Record<string, number[]> = {
    happy: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88], // C major
    calm: [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00], // A minor
    energetic: [293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 554.37], // D major
    melancholic: [164.81, 185.00, 196.00, 220.00, 246.94, 261.63, 293.66], // E minor
    mysterious: [261.63, 277.18, 311.13, 349.23, 369.99, 415.30, 466.16], // C harmonic minor
  };

  const generateMelody = () => {
    const scale = scales[mood] || scales.happy;
    const notes: Note[] = [];
    const beatDuration = 60 / tempo;
    const totalBeats = duration * (tempo / 60);

    for (let i = 0; i < totalBeats; i++) {
      const randomNote = scale[Math.floor(Math.random() * scale.length)];
      const noteDuration = [0.25, 0.5, 1, 2][Math.floor(Math.random() * 4)] * beatDuration;
      notes.push({
        frequency: randomNote,
        duration: noteDuration,
        time: i * beatDuration,
      });
    }

    notesRef.current = notes;
    setGenerated(true);
  };

  const playMusic = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    setIsPlaying(true);

    notesRef.current.forEach((note) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = note.frequency;
      oscillator.type = genre === "electronic" ? "square" : genre === "ambient" ? "sine" : "triangle";

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime + note.time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + note.time + note.duration);

      oscillator.start(ctx.currentTime + note.time);
      oscillator.stop(ctx.currentTime + note.time + note.duration);
    });

    setTimeout(() => setIsPlaying(false), duration * 1000);
  };

  const stopMusic = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  const downloadMIDI = () => {
    alert("MIDI export coming soon! For now, use the play button to enjoy your composition.");
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="text-purple-500" size={40} />
            <h1 className="text-4xl font-bold text-purple-500">AI Music Composer</h1>
          </div>
          <p className="text-slate-400 text-lg">Generate melodies based on mood and genre.</p>
          <Link href="/projects" className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block">
            ← Back to AI Tools
          </Link>
        </div>

        <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold text-slate-200">Composition Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-purple-500 focus:outline-none"
              >
                {moods.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-purple-500 focus:outline-none"
              >
                {genres.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tempo (BPM): {tempo}</label>
              <input
                type="range"
                min="60"
                max="180"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duration: {duration}s</label>
              <input
                type="range"
                min="5"
                max="30"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <button
            onClick={generateMelody}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-slate-900 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            Generate Melody
          </button>

          {generated && (
            <div className="border-t border-slate-700 pt-6 space-y-3">
              <h3 className="text-lg font-semibold text-slate-200">Playback Controls</h3>
              <div className="flex gap-3">
                <button
                  onClick={playMusic}
                  disabled={isPlaying}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Play size={18} />
                  {isPlaying ? "Playing..." : "Play"}
                </button>
                <button
                  onClick={stopMusic}
                  disabled={!isPlaying}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Square size={18} />
                  Stop
                </button>
                <button
                  onClick={downloadMIDI}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-400">
          <strong className="text-purple-400">Note:</strong> Music is generated using Web Audio API. Each composition is unique based on your selected mood and genre.
        </div>
      </div>
    </div>
  );
}
