import { useState } from "react";
import { type PlanItem } from "@shared/schema";
import { Check, X, Clock, Pill, Utensils, Moon, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PlanCardProps {
  item: PlanItem;
  onUpdate: (status: "completed" | "skipped") => void;
}

export function PlanCard({ item, onUpdate }: PlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = (type: PlanItem["type"]) => {
    switch (type) {
      case "medication": return <Pill className="w-5 h-5 text-rose-500" />;
      case "meal": return <Utensils className="w-5 h-5 text-orange-500" />;
      case "rest": return <Moon className="w-5 h-5 text-indigo-500" />;
      default: return <Play className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getTypeColor = (type: PlanItem["type"]) => {
    switch (type) {
      case "medication": return "bg-rose-50 border-rose-200 text-rose-700";
      case "meal": return "bg-orange-50 border-orange-200 text-orange-700";
      case "rest": return "bg-indigo-50 border-indigo-200 text-indigo-700";
      default: return "bg-emerald-50 border-emerald-200 text-emerald-700";
    }
  };

  const isPending = item.status === "pending";
  const isCompleted = item.status === "completed";
  const isSkipped = item.status === "skipped";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={cn(
        "relative rounded-2xl border p-4 transition-all duration-300",
        isPending ? "bg-card shadow-sm hover:shadow-md border-border" : "bg-muted/30 border-transparent",
        isCompleted && "opacity-75 grayscale-[0.5]",
        isSkipped && "opacity-50"
      )}
    >
      <div className="flex gap-4">
        {/* Time Column */}
        <div className="flex flex-col items-center min-w-[3.5rem] pt-1">
          <span className="text-sm font-bold text-muted-foreground">{item.time}</span>
          <div className="h-full w-px bg-border my-2" />
        </div>

        {/* Content Column */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{item.emoji}</span>
              <div className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", getTypeColor(item.type))}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </div>
            </div>
            
            {/* Status Indicator */}
            {!isPending && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                isCompleted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {isCompleted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                {isCompleted ? "Done" : "Skipped"}
              </div>
            )}
          </div>

          <h3 className={cn("font-bold text-lg leading-tight", isCompleted && "line-through text-muted-foreground")}>
            {item.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mt-1 mb-3">
            {item.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {item.tags.map((tag) => (
              <span key={tag} className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 rounded-md">
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <AnimatePresence>
            {isPending && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-3 mt-2"
              >
                <button
                  onClick={() => onUpdate("completed")}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  Done
                </button>
                <button
                  onClick={() => onUpdate("skipped")}
                  className="flex-none px-4 flex items-center justify-center bg-muted text-muted-foreground hover:bg-muted/80 py-2.5 rounded-xl font-medium active:scale-95 transition-all"
                >
                  Skip
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
