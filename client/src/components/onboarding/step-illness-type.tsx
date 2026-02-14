import { cn } from "@/lib/utils"

interface StepIllnessTypeProps {
  value: string[]
  onChange: (value: string[]) => void
  childName: string
}

const illnesses = [
  { id: "cold", label: "Cold" },
  { id: "flu", label: "Flu" },
  { id: "stomach-bug", label: "Stomach Bug" },
  { id: "fever", label: "Fever" },
  { id: "cough", label: "Cough" },
  { id: "ear-infection", label: "Ear Infection" },
]

export function StepIllnessType({ value, onChange, childName }: StepIllnessTypeProps) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 data-testid="text-step-title" className="font-serif text-[22px] font-bold leading-[30px] tracking-[0.01em] text-[#2C3E50]">
        {`What's going on with ${childName || "your child"}?`}
      </h1>
      <p className="text-[15px] leading-[22px] text-[#4A5568]">
        {"Select all that apply."}
      </p>
      <div
        className="flex flex-wrap gap-2.5 pt-1"
        role="group"
        aria-label="Illness type selection"
      >
        {illnesses.map((illness) => {
          const isSelected = value.includes(illness.id)
          return (
            <button
              key={illness.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggle(illness.id)}
              data-testid={`toggle-illness-${illness.id}`}
              className={cn(
                "rounded-full border-[1.5px] px-4 py-2 text-[15px] font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9E78] focus-visible:ring-offset-2",
                isSelected
                  ? "border-[#7A9E78] bg-[#7A9E78] text-white"
                  : "border-[#E2E0DC] bg-white text-[#4A5568] hover:border-[#C2D9C1]"
              )}
            >
              {illness.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
