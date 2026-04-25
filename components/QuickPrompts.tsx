"use client";
export default function QuickPrompts({ prompts, onPick }: { prompts: string[]; onPick: (p: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      {prompts.map(p => (
        <button key={p} onClick={() => onPick(p)}
          className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-surface border border-border hover:border-primary hover:text-primary transition">
          {p}
        </button>
      ))}
    </div>
  );
}
