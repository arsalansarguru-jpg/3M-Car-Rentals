"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, Play, Image as ImageIcon } from "lucide-react";

interface GalleryProps {
  images: string[];
  brand: string;
  model: string;
  fallbackElement: React.ReactNode;
}

export default function VehicleDetailGallery({ images, brand, model, fallbackElement }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);

  // Prepend a luxury mock video URL if images are defined
  const hasVideo = true;
  const videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-on-a-highway-at-sunset-34304-large.mp4";

  const allMedia = [
    ...(hasVideo ? [{ type: "video", url: videoUrl }] : []),
    ...(images || []).map(img => ({ type: "image", url: img }))
  ];

  if (allMedia.length === 0) {
    return <div className="w-full h-full">{fallbackElement}</div>;
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % allMedia.length);
    setIsPlayingVideo(true);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    setIsPlayingVideo(true);
  };

  const currentMedia = allMedia[activeIndex];

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Active large view */}
      <div className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-black border border-white/10 group">
        
        {currentMedia.type === "video" ? (
          <div className="w-full h-full relative">
            <video
              src={currentMedia.url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Cinematic overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            <span className="absolute top-4 left-4 bg-blue-500/10 border border-blue-500/30 text-[#00e5ff] text-[8px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-current" /> Autoplay Cinematic
            </span>
          </div>
        ) : (
          <img
            src={currentMedia.url}
            alt={`${brand} ${model} - view ${activeIndex + 1}`}
            className={`w-full h-full object-cover transition-all duration-500 ${isZoomed ? "scale-125" : "scale-100"}`}
          />
        )}

        {/* Floating gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Zoom toggler (images only) */}
        {currentMedia.type === "image" && (
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 border border-white/10 p-2 rounded-xl text-white/70 hover:text-white transition-all backdrop-blur"
            title="Zoom View"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        )}

        {/* Slide controls */}
        {allMedia.length > 1 && (
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
          {activeIndex + 1} / {allMedia.length}
        </span>
      </div>

      {/* Thumbnail strip */}
      {allMedia.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {allMedia.map((media, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIndex(idx);
                setIsZoomed(false);
              }}
              className={`w-20 h-14 rounded-xl border-2 overflow-hidden shrink-0 transition-all relative ${
                idx === activeIndex 
                  ? "border-blue-500 scale-95 shadow-md shadow-blue-500/20" 
                  : "border-white/5 opacity-50 hover:opacity-80"
              }`}
            >
              {media.type === "video" ? (
                <div className="w-full h-full bg-[#090a0f] flex items-center justify-center relative">
                  <video src={media.url} className="w-full h-full object-cover opacity-60" />
                  <Play className="w-4 h-4 text-white absolute" />
                </div>
              ) : (
                <img src={media.url} className="w-full h-full object-cover" alt="Thumbnail" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
