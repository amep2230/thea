import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ToggleCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ToggleCard({ selected, onClick, title, icon, className }: ToggleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 w-full aspect-square",
        selected 
          ? "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.02]" 
          : "border-border bg-card hover:border-primary/30 hover:bg-accent/5",
        className
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
          <Check className="w-3 h-3" />
        </div>
      )}
      {icon && <div className={cn("mb-3 transition-colors", selected ? "text-primary" : "text-muted-foreground")}>{icon}</div>}
      <span className={cn("font-medium text-sm text-center", selected ? "text-primary" : "text-foreground")}>{title}</span>
    </button>
  );
}
