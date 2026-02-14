import { cn } from "@/lib/utils"

interface StepChildAgeProps {
  value: number | null
  onChange: (value: number) => void
  childName: string
}

const ages = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function StepChildAge({ value, onChange, childName }: StepChildAgeProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 data-testid="text-step-title" className="font-serif text-[22px] font-bold leading-[30px] tracking-[0.01em] text-[#2C3E50]">
        {`How old is ${childName || "your child"}?`}
      </h1>
      <p className="text-[15px] leading-[22px] text-[#4A5568]">
        {"This helps us pick the right activities and care tips."}
      </p>
      <div
        className="grid grid-cols-4 gap-3 pt-1"
        role="radiogroup"
        aria-label="Child's age"
      >
        {ages.map((age) => (
          <button
            key={age}
            type="button"
            role="radio"
            aria-checked={value === age}
            onClick={() => onChange(age)}
            data-testid={`toggle-age-${age}`}
            className={cn(
              "flex h-14 items-center justify-center rounded-xl text-[17px] font-semibold transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9E78] focus-visible:ring-offset-2",
              value === age
                ? "bg-[#7A9E78] text-white shadow-[0_2px_8px_rgba(122,158,120,0.25)]"
                : "border-[1.5px] border-[#E2E0DC] bg-white text-[#2C3E50] hover:border-[#C2D9C1]"
            )}
          >
            {age === 9 ? "8+" : age}
          </button>
        ))}
      </div>
    </div>
  )
}
