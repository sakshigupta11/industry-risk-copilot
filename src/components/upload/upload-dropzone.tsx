"use client";

import { useRef, useState } from "react";

type UploadDropzoneProps = {
  onFileSelected: (file: File) => void;
};

function UploadIcon() {
  return <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 15V4m0 0L7.8 8.2M12 4l4.2 4.2M5 14.5v4A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function UploadDropzone({ onFileSelected }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFile = (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF document.");
      return;
    }
    setError(null);
    onFileSelected(file);
  };

  return <div>
    <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0])} />
    <div onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files[0]); }} className={`flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center transition ${isDragging ? "border-accent bg-[#f6f9ff]" : "border-[#cfd6e1] bg-[#fbfcfe] hover:border-[#9daabc]"}`}>
      <div className="flex size-12 items-center justify-center rounded-full bg-[#edf3fe] text-accent"><UploadIcon /></div>
      <h3 className="mt-4 text-sm font-semibold text-foreground">Drop your company PDF here</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">Drag and drop a document, or browse your files to select one.</p>
      <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 inline-flex h-9 items-center rounded-md border border-border bg-surface px-3 text-sm font-semibold text-navy shadow-sm transition hover:bg-surface-muted">Browse files</button>
      <p className="mt-4 text-xs text-muted">PDF only · Maximum recommended size 25 MB</p>
    </div>
    {error && <p role="alert" className="mt-2 text-sm text-[#a1322b]">{error}</p>}
  </div>;
}
