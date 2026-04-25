"use client";
export default function QuickPrompts({ prompts, onPick }: { prompts: string[]; onPick: (p: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground px-1">Quick questions</p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        {prompts.map((p, i) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            style={{ animationDelay: `${i * 60}ms` }}
            className="fade-up shrink-0 text-xs px-3.5 py-2 rounded-full glass border border-white/10 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all duration-200 text-foreground/80"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
