import { type PlanItem } from "@shared/schema";
import { TheaCard } from "@/components/ui/theaCard";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  item: PlanItem;
  onUpdate: (status: "completed" | "skipped") => void;
}

export function PlanCard({ item, onUpdate }: PlanCardProps) {
  const isPending = item.status === "pending";
  const isCompleted = item.status === "completed";
  const isSkipped = item.status === "skipped";

  const cardType = item.type === "activity" ? "activity"
    : item.type === "medication" ? "medication"
    : item.type === "meal" ? "meal"
    : "rest";

  return (
    <TheaCard
      type={cardType}
      emoji={item.emoji}
      time={item.time}
      title={item.title}
      description={item.description || ""}
      tags={item.tags}
      className={cn(
        isCompleted && "opacity-60",
        isSkipped && "opacity-40"
      )}
      actions={
        <>
          {!isPending && (
            <span
              data-testid={`status-item-${item.id}`}
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                isCompleted ? "bg-sage-100 text-sage-600" : "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              {isCompleted ? "Done" : "Skipped"}
            </span>
          )}
          {isPending && (
            <div className="flex gap-2">
              <Button
                data-testid={`button-done-${item.id}`}
                size="sm"
                onClick={() => onUpdate("completed")}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Done
              </Button>
              <Button
                data-testid={`button-skip-${item.id}`}
                size="sm"
                variant="outline"
                onClick={() => onUpdate("skipped")}
              >
                Skip
              </Button>
            </div>
          )}
        </>
      }
    />
  );
}
