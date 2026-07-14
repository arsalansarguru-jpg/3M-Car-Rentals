"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { Search, SlidersHorizontal, UploadCloud, File, X, Calendar } from "lucide-react";
import { Input } from "./Input";

// ─── SearchBox Component ──────────────────────────────────────────────────────

export interface SearchBoxProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = "Search inventory, plates, profiles...",
  className
}) => {
  return (
    <div className={clsx("relative w-full", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4 py-2"
      />
    </div>
  );
};

// ─── FilterBar Component ──────────────────────────────────────────────────────

export interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, className }) => {
  return (
    <div className={clsx("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2", className)}>
      {children}
    </div>
  );
};

// ─── DatePicker Component ─────────────────────────────────────────────────────

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-[9px] uppercase font-bold text-white/40">{label}</label>}
      <div className="relative">
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={clsx(
            "bg-[#090a0f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 w-full appearance-none",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
};

// ─── FormField Component ──────────────────────────────────────────────────────

export interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  error,
  children,
  className
}) => {
  return (
    <div className={clsx("flex flex-col gap-1.5 w-full text-left", className)}>
      <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
        {label}
      </label>
      {children}
      {description && !error && (
        <span className="text-[9px] text-white/30 leading-normal">{description}</span>
      )}
      {error && (
        <span className="text-[9px] text-red-400 font-semibold">{error}</span>
      )}
    </div>
  );
};

// ─── FileUploader Component ───────────────────────────────────────────────────

export interface FileUploaderProps {
  label: string;
  value?: string; // URL of uploaded file
  onChange: (fileUrl: string | null) => void;
  accept?: string;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  value,
  onChange,
  accept = "image/*,application/pdf",
  className
}) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(value ? "Uploaded Document" : null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setFileName(file.name);
    try {
      // Simulate file upload with progress
      await new Promise((res) => setTimeout(res, 1500));
      const simulatedUrl = `https://mock-storage.3mrentals.com/${Date.now()}_${file.name}`;
      onChange(simulatedUrl);
    } catch (err) {
      console.error("Document upload failed:", err);
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setFileName(null);
  };

  return (
    <div className={clsx("flex flex-col gap-1.5 w-full", className)}>
      <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
        {label}
      </label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          "border border-dashed rounded-[20px] p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer min-h-[120px] backdrop-blur-md",
          dragging 
            ? "border-blue-500 bg-blue-500/5" 
            : value 
              ? "border-emerald-500/30 bg-emerald-500/5" 
              : "border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          id={`uploader-${label.replace(/\s+/g, "-")}`}
          disabled={uploading}
        />
        
        <label
          htmlFor={`uploader-${label.replace(/\s+/g, "-")}`}
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
        >
          {uploading ? (
            <div className="space-y-2">
              <UploadCloud className="w-8 h-8 text-blue-400 animate-bounce mx-auto" />
              <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest block">Uploading File…</span>
            </div>
          ) : value ? (
            <div className="flex items-center gap-3 w-full justify-between px-2">
              <div className="flex items-center gap-2 text-left min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <File className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-white font-bold block truncate">{fileName}</span>
                  <span className="text-[8px] text-white/30 uppercase font-bold block">Upload Verified</span>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0 focus:outline-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <UploadCloud className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <span className="text-[10px] text-white font-bold block">Drag & drop files or <span className="text-blue-400">browse</span></span>
              <span className="text-[8px] text-white/30 uppercase font-mono tracking-wider block">Max 10MB (PDF, PNG, JPG)</span>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};
