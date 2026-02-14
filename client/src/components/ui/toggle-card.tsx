import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ToggleCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  onClick: () => void;
  title: string;
  icon?: React.ReactNode;
}

export function ToggleCard({ selected, onClick, title, icon, className, ...rest }: ToggleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 w-full aspect-square",
        selected 
          ? "border-sage-400 bg-sage-50 shadow-sm" 
          : "border-thea-border bg-card",
        className
      )}
      {...rest}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-sage-400 rounded-full flex items-center justify-center text-white">
          <Check className="w-3 h-3" />
        </div>
      )}
      {icon && <div className={cn("mb-3 transition-colors", selected ? "text-sage-500" : "text-muted-foreground")}>{icon}</div>}
      <span className={cn("font-medium text-sm text-center", selected ? "text-sage-600" : "text-foreground")}>{title}</span>
    </button>
  );
}
