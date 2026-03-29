import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  let colorClass = "bg-gray-500/10 text-gray-400 border-gray-500/20";
  
  if (score >= 80) {
    colorClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
  } else if (score >= 50) {
    colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center w-12 h-12 rounded-xl border",
      colorClass,
      className
    )}>
      <span className="text-xs opacity-70 font-medium leading-none mb-0.5">SCORE</span>
      <span className="text-lg font-display font-bold leading-none">{score}</span>
    </div>
  );
}
