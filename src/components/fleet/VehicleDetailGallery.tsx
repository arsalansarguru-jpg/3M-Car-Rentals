"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface GalleryProps {
  images: string[];
  brand: string;
  model: string;
  fallbackElement: React.ReactNode;
}

export default function VehicleDetailGallery({ images, brand, model, fallbackElement }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return <div className="w-full h-full">{fallbackElement}</div>;
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Active large view */}
      <div className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-black border border-white/10 group">
        <img
          src={images[activeIndex]}
          alt={`${brand} ${model} - view ${activeIndex + 1}`}
          className={`w-full h-full object-cover transition-all duration-500 ${isZoomed ? "scale-125" : "scale-100"}`}
        />

        {/* Floating gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Zoom toggler */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 border border-white/10 p-2 rounded-xl text-white/70 hover:text-white transition-all backdrop-blur"
          title="Zoom View"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Slide controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all backdrop-blur opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all backdrop-blur opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Photo Index Indicator */}
        <span className="absolute bottom-4 left-4 text-xs font-semibold font-mono bg-black/50 border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur text-white/70">
          {activeIndex + 1} / {images.length}
        </span>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={img}
              onClick={() => {
                setActiveIndex(idx);
                setIsZoomed(false);
              }}
              className={`w-20 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                idx === activeIndex 
                  ? "border-[#3B82F6] scale-95 shadow-md shadow-[#3B82F6]/20" 
                  : "border-white/5 opacity-50 hover:opacity-80"
              }`}
            >
              <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
