'use client';

import { useRef, useState, DragEvent, KeyboardEvent } from 'react';

interface UploadZoneProps {
  onFile: (file: File) => void;
}

export default function UploadZone({ onFile }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleChange() {
    const file = inputRef.current?.files?.[0];
    if (file) onFile(file);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload PDF — click or drag and drop"
      onClick={() => inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        flex flex-col items-center justify-center
        border-2 border-dashed rounded-2xl
        px-8 py-16 cursor-pointer
        transition-colors select-none
        ${isDragging
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      <div className="text-5xl mb-4 select-none" aria-hidden="true">📄</div>
      <p className="text-lg font-semibold text-gray-700 mb-1">
        Drop your PDF here
      </p>
      <p className="text-sm text-gray-400">
        or click to browse — max 20 MB
      </p>
    </div>
  );
}
