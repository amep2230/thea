"use client"

interface StepCompleteProps {
  childName: string
}

export function StepComplete({ childName }: StepCompleteProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F2F7F2]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M20 6L9 17L4 12" stroke="#7A9E78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-[22px] font-bold leading-[30px] tracking-[0.01em] text-[#2C3E50]">
          {"Here's your plan."}
        </h1>
        <p className="font-serif text-[22px] font-bold leading-[30px] tracking-[0.01em] text-[#2C3E50]">
          {"You've got this."}
        </p>
        <p className="text-[15px] leading-[22px] text-[#4A5568]">
          {`Thea has everything she needs for ${childName || "your little one"}.`}
        </p>
        <p className="text-[15px] leading-[22px] text-[#4A5568]">
          {"Ready when you are."}
        </p>
      </div>
    </div>
  )
}
