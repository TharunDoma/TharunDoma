'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type GalleryImage = {
  id: string;
  image_data: string;
  title: string;
  description: string | null;
  display_order: number;
};

interface ImageGalleryProps {
  images: GalleryImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [fade, setFade] = useState(true);

  const hasImages = !!images && images.length > 0;

  const currentImage = images[currentIndex];

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setFade(true);
    }, 800);
    setAutoPlay(false);
  };

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setFade(true);
    }, 800);
    setAutoPlay(false);
  };

  // Auto-advance slideshow
  useEffect(() => {
    if (!autoPlay || !hasImages) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setFade(true);
      }, 800);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoPlay, hasImages, images.length]);

  if (!hasImages) {
    return null;
  }

  return (
    <section className="w-full mt-16 mb-8">
      <div className="max-w-4xl mx-auto">
        {/* Slideshow Container */}
        <div className="relative group">
          {/* Image */}
          <div className="relative overflow-hidden rounded-xl shadow-2xl aspect-video">
            <img
              src={currentImage.image_data}
              alt={currentImage.title}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${
                fade ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold text-emerald-400 mb-2">
                {currentImage.title}
              </h3>
              {currentImage.description && (
                <p className="text-slate-300 text-sm md:text-base">
                  {currentImage.description}
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-emerald-500/80 hover:bg-emerald-600 text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-500/80 hover:bg-emerald-600 text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100 z-10"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>

            {/* Slide Counter */}
            <div className="absolute top-4 right-4 bg-slate-900/70 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail Navigation */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((image, idx) => (
              <button
                key={image.id}
                onClick={() => {
                  setFade(false);
                  setTimeout(() => {
                    setCurrentIndex(idx);
                    setFade(true);
                  }, 800);
                  setAutoPlay(false);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                  idx === currentIndex
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/50'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <img
                  src={image.image_data}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Auto-play indicator */}
          <div className="text-center mt-4">
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="text-sm text-slate-400 hover:text-emerald-400 transition"
            >
              {autoPlay ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
