import { cn } from "@/lib/utils"
import { BatteryLow, BatteryMedium, Zap } from "lucide-react"

interface StepParentEnergyProps {
  value: string | null
  onChange: (value: string) => void
}

const energyLevels = [
  {
    id: "empty",
    icon: BatteryLow,
    label: "Empty",
    description: "Running on fumes",
  },
  {
    id: "managing",
    icon: BatteryMedium,
    label: "Managing",
    description: "Holding it together",
  },
  {
    id: "got-this",
    icon: Zap,
    label: "Got This",
    description: "Just need a plan",
  },
]

export function StepParentEnergy({ value, onChange }: StepParentEnergyProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8E9BAA]">
          {"YOUR ENERGY LEVEL"}
        </p>
        <h1 data-testid="text-step-title" className="font-serif text-[22px] font-bold leading-[30px] tracking-[0.01em] text-[#2C3E50]">
          {"And how are you holding up?"}
        </h1>
      </div>
      <p className="text-[15px] leading-[22px] text-[#4A5568]">
        {"No judgment. This helps Thea calibrate."}
      </p>
      <div
        className="flex flex-col gap-3 pt-1"
        role="radiogroup"
        aria-label="Your energy level"
      >
        {energyLevels.map((level) => {
          const Icon = level.icon
          return (
            <button
              key={level.id}
              type="button"
              role="radio"
              aria-checked={value === level.id}
              onClick={() => onChange(level.id)}
              data-testid={`toggle-parent-energy-${level.id}`}
              className={cn(
                "flex items-center gap-4 rounded-xl border-[1.5px] p-4 text-left transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9E78] focus-visible:ring-offset-2",
                value === level.id
                  ? "border-[#7A9E78] bg-[#7A9E78] shadow-[0_2px_8px_rgba(122,158,120,0.25)]"
                  : "border-[#E2E0DC] bg-white hover:border-[#C2D9C1]"
              )}
            >
              <Icon className={cn("h-6 w-6", value === level.id ? "text-white" : "text-[#8E9BAA]")} aria-hidden="true" />
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-[15px] font-semibold",
                    value === level.id ? "text-white" : "text-[#2C3E50]"
                  )}
                >
                  {level.label}
                </span>
                <span
                  className={cn(
                    "text-[13px]",
                    value === level.id ? "text-white" : "text-[#8E9BAA]"
                  )}
                >
                  {level.description}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
