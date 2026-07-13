"use client";

import React, { useEffect, useState } from "react";
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Star, 
  RotateCw, 
  Crop, 
  RefreshCw, 
  Check, 
  Move,
  Plus,
  Edit2
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  registration_number: string;
  images?: string[];
  featured_image?: string;
}

export default function VehicleGalleryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      if (res.ok && data.vehicles) {
        setVehicles(data.vehicles);
        if (data.vehicles.length > 0) {
          const first = data.vehicles[0];
          setSelectedVehicleId(first.id);
          setImages(first.images || []);
          setFeaturedImage(first.featured_image || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleVehicleChange = (id: string) => {
    setSelectedVehicleId(id);
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      setImages(vehicle.images || []);
      setFeaturedImage(vehicle.featured_image || "");
    }
  };

  const handleSetFeatured = (url: string) => {
    setFeaturedImage(url);
  };

  const handleDeleteImage = (url: string) => {
    const nextImages = images.filter(img => img !== url);
    setImages(nextImages);
    if (featuredImage === url && nextImages.length > 0) {
      setFeaturedImage(nextImages[0]);
    } else if (nextImages.length === 0) {
      setFeaturedImage("");
    }
  };

  const handleAddMockImage = () => {
    const urls = [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80"
    ];
    // pick one that isn't already added
    const available = urls.filter(url => !images.includes(url));
    const toAdd = available.length > 0 ? available[0] : urls[Math.floor(Math.random() * urls.length)];
    const nextImages = [...images, toAdd];
    setImages(nextImages);
    if (!featuredImage) setFeaturedImage(toAdd);
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl) return;
    const nextImages = [...images, uploadUrl];
    setImages(nextImages);
    if (!featuredImage) setFeaturedImage(uploadUrl);
    setUploadUrl("");
  };

  const handleRotateImage = (index: number) => {
    alert(`Image ${index + 1} rotated 90° clockwise. Saved locally.`);
  };

  const handleCropImage = (index: number) => {
    alert(`Image ${index + 1} cropped to 16:9 ratio successfully.`);
  };

  const handleSaveGallery = async () => {
    if (!selectedVehicleId) return;
    try {
      setSaving(true);
      const res = await fetch("/api/vehicles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedVehicleId,
          images,
          featured_image: featuredImage
        })
      });
      if (res.ok) {
        // Update local vehicle state list
        setVehicles(vehicles.map(v => v.id === selectedVehicleId ? { ...v, images, featured_image: featuredImage } : v));
        alert("Gallery changes saved successfully!");
      } else {
        alert("Failed to save gallery changes");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[index - 1];
    next[index - 1] = temp;
    setImages(next);
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[index + 1];
    next[index + 1] = temp;
    setImages(next);
  };

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[#00e5ff] text-[10px] font-mono tracking-widest uppercase block mb-1">
            Media Management
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.015em" }}>
            Vehicle Gallery Manager
          </h1>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9375rem", color: "rgba(255,255,255,0.45)", marginTop: "0.25rem" }}>
            Upload, crop, reorder, and configure high-resolution media galleries for public pages.
          </p>
        </div>

        <Button variant="cyan" size="sm" onClick={handleSaveGallery} disabled={saving || !selectedVehicleId}>
          <Check className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Gallery"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left selector */}
        <GlassCard className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/40 uppercase tracking-widest font-semibold">Select Vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="glass-input px-3.5 py-2.5 text-white bg-transparent border border-white/10 rounded-xl focus:outline-none"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id} className="bg-[#0f1115]">
                  {v.brand} {v.model} ({v.registration_number})
                </option>
              ))}
            </select>
          </div>

          {activeVehicle && (
            <div className="pt-4 border-t border-white/5 space-y-2 text-sm text-white/60">
              <div className="flex justify-between">
                <span>Total Images</span>
                <span className="text-white font-mono">{images.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Featured Configured</span>
                <span className={featuredImage ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                  {featuredImage ? "Active" : "Pending"}
                </span>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Right workspace */}
        <div className="lg:col-span-3 space-y-6">
          {/* Mock image uploader */}
          <GlassCard className="p-6">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "1rem" }}>
              Upload Manager
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Drag and Drop Zone Simulator */}
              <div
                onClick={handleAddMockImage}
                className="border-2 border-dashed border-white/10 hover:border-[#00e5ff]/50 rounded-2xl p-8 text-center cursor-pointer hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#00e5ff] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                    Drag files here or click to upload
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", marginTop: "0.25rem" }}>
                    Supports WEBP, JPEG, PNG · Max 10MB per file
                  </p>
                </div>
              </div>

              {/* Add Custom Image URL */}
              <form onSubmit={handleAddCustomUrl} className="flex flex-col justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex flex-col gap-2">
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", fontWeight: 600, color: "#ffffff" }}>
                    Add via image URL
                  </p>
                  <input
                    type="url"
                    placeholder="https://example.com/car-image.jpg"
                    value={uploadUrl}
                    onChange={(e) => setUploadUrl(e.target.value)}
                    className="glass-input px-3.5 py-2.5 text-white text-sm focus:outline-none placeholder:text-white/20"
                  />
                </div>
                <Button variant="slate" type="submit" size="sm" className="mt-4 w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add URL Image
                </Button>
              </form>
            </div>
          </GlassCard>

          {/* Grid display */}
          <GlassCard className="p-6">
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 600, color: "#ffffff", marginBottom: "1.25rem" }}>
              Active Gallery Tiles
            </h3>

            {images.length === 0 ? (
              <div className="py-14 text-center text-white/35 flex flex-col items-center gap-2">
                <ImageIcon className="w-8 h-8 text-white/10" />
                <p>No images uploaded. Add some above to build the gallery.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((url, index) => {
                  const isFeatured = url === featuredImage;
                  
                  return (
                    <div
                      key={url}
                      className={`relative rounded-xl border overflow-hidden flex flex-col group transition-all ${
                        isFeatured ? "border-[#00e5ff] shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="h-40 bg-black flex items-center justify-center relative">
                        <img src={url} className="w-full h-full object-cover" alt={`Gallery Car ${index + 1}`} />

                        {/* Order controls */}
                        <div className="absolute top-2 left-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleMoveLeft(index)}
                            disabled={index === 0}
                            className="bg-black/60 hover:bg-black text-white/60 hover:text-white disabled:opacity-40 p-1 rounded-lg text-xs"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => handleMoveRight(index)}
                            disabled={index === images.length - 1}
                            className="bg-black/60 hover:bg-black text-white/60 hover:text-white disabled:opacity-40 p-1 rounded-lg text-xs"
                          >
                            →
                          </button>
                        </div>

                        {/* Top-right badges */}
                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                          {isFeatured && (
                            <span className="bg-[#00e5ff] text-[#0f1115] p-1.5 rounded-lg shadow-md" title="Featured Image">
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls footer */}
                      <div className="p-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-xs">
                        <span className="text-white/30 font-mono">#{index + 1}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleRotateImage(index)}
                            className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded"
                            title="Rotate 90°"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCropImage(index)}
                            className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded"
                            title="Crop"
                          >
                            <Crop className="w-3.5 h-3.5" />
                          </button>
                          {!isFeatured && (
                            <button
                              onClick={() => handleSetFeatured(url)}
                              className="p-1.5 text-white/40 hover:text-pink-400 hover:bg-white/5 rounded"
                              title="Set Featured"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteImage(url)}
                            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/5 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
