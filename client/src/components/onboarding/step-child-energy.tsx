import { cn } from "@/lib/utils"
import { BatteryLow, BatteryMedium, Battery } from "lucide-react"

interface StepChildEnergyProps {
  value: string | null
  onChange: (value: string) => void
  childName: string
}

const energyLevels = [
  {
    id: "low",
    icon: BatteryLow,
    label: "Low",
    description: "Wants to lie down",
  },
  {
    id: "medium",
    icon: BatteryMedium,
    label: "Medium",
    description: "Awake but slow",
  },
  {
    id: "okay",
    icon: Battery,
    label: "Okay",
    description: "Restless",
  },
]

export function StepChildEnergy({ value, onChange, childName }: StepChildEnergyProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8E9BAA]">
          {"CHILD'S ENERGY LEVEL"}
        </p>
        <h1 data-testid="text-step-title" className="font-serif text-[22px] font-bold leading-[30px] tracking-[0.01em] text-[#2C3E50]">
          {`How's ${childName || "your child"} doing right now?`}
        </h1>
      </div>
      <div
        className="flex flex-col gap-3 pt-1"
        role="radiogroup"
        aria-label="Child's energy level"
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
              data-testid={`toggle-child-energy-${level.id}`}
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
