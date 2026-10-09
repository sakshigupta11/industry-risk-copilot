type SelectedFileProps = {
  file: File;
  onRemove: () => void;
};

function DocumentIcon() {
  return <svg className="size-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6.5 3.5h7l4 4v13h-11z" strokeLinejoin="round" /><path d="M13.5 3.5v4h4M8.5 12h7M8.5 15.5h7" strokeLinecap="round" /></svg>;
}

export function SelectedFile({ file, onRemove }: SelectedFileProps) {
  const size = file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  return <div className="flex items-center justify-between gap-4 rounded-lg border border-[#cddbf3] bg-[#f6f9ff] p-4">
    <div className="flex min-w-0 items-center gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white"><DocumentIcon /></div><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{file.name}</p><p className="mt-0.5 text-xs text-muted">PDF document · {size}</p></div></div>
    <button type="button" onClick={onRemove} className="shrink-0 text-sm font-semibold text-accent transition hover:text-navy">Remove</button>
  </div>;
}
