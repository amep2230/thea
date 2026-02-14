import { cn } from "@/lib/utils";

type CardType = "activity" | "medication" | "meal" | "rest" | "alert";

interface TheaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  type: CardType;
  emoji?: string;
  time?: string;
  title: string;
  description: string;
  tags?: string[];
  actions?: React.ReactNode;
}

const accents: Record<CardType, string> = {
  activity: "bg-activity",
  medication: "bg-medication",
  meal: "bg-meal",
  rest: "bg-rest",
  alert: "bg-alert",
};

export function TheaCard({ type, emoji, time, title, description, tags, actions, className, ...rest }: TheaCardProps) {
  return (
    <div className={cn("flex rounded-xl overflow-hidden bg-card shadow-thea", className)} {...rest}>
      <div className={cn("w-1.5 shrink-0", accents[type])} />

      <div className="p-3.5 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          {emoji && <span className="text-sm">{emoji}</span>}
          {time && <span className="text-xs text-muted-foreground font-medium">{time}</span>}
        </div>

        <h3 className="text-[15px] font-semibold mb-1 text-foreground leading-snug">{title}</h3>
        {description && <p className="text-sm mb-2.5 leading-relaxed text-muted-foreground">{description}</p>}

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {tags?.map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                {tag}
              </span>
            ))}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
