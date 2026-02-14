import { useEffect, useRef } from "react"

interface StepChildNameProps {
  value: string
  onChange: (value: string) => void
}

export function StepChildName({ value, onChange }: StepChildNameProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h1 data-testid="text-step-title" className="font-serif text-[22px] font-bold leading-[30px] tracking-[0.01em] text-[#2C3E50]">
        {"Let's get to know your little one."}
      </h1>
      <p className="text-[15px] leading-[22px] text-[#4A5568]">
        {"What's their name?"}
      </p>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="First name"
        autoComplete="off"
        data-testid="input-child-name"
        className="mt-1 w-full rounded-xl border-[1.5px] border-[#E2E0DC] bg-[#FEFCFA] px-4 py-3.5 text-[15px] font-medium text-[#2C3E50] placeholder:text-[#B0B8C4] transition-colors hover:border-[#C2D9C1] focus:border-[#7A9E78] focus:outline-none focus:ring-0"
        aria-label="Child's first name"
      />
    </div>
  )
}
