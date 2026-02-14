import { useState, useCallback } from "react"
import { useLocation } from "wouter"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { StepIndicator } from "./step-indicator"
import { StepChildName } from "./step-child-name"
import { StepChildAge } from "./step-child-age"
import { StepIllnessType } from "./step-illness-type"
import { StepChildEnergy } from "./step-child-energy"
import { StepParentEnergy } from "./step-parent-energy"
import { StepComplete } from "./step-complete"

const TOTAL_STEPS = 5

const ILLNESS_ID_TO_LABEL: Record<string, string> = {
  "cold": "Cold",
  "flu": "Flu",
  "stomach-bug": "Stomach Bug",
  "fever": "Fever",
  "cough": "Cough",
  "ear-infection": "Ear Infection",
}

const CHILD_ENERGY_MAP: Record<string, string> = {
  "low": "Low",
  "medium": "Medium",
  "okay": "Okay",
}

const PARENT_ENERGY_MAP: Record<string, string> = {
  "empty": "Low",
  "managing": "Medium",
  "got-this": "High",
}

interface FormData {
  childName: string
  childAge: number | null
  illnessTypes: string[]
  childEnergy: string | null
  parentEnergy: string | null
}

export function OnboardingForm() {
  const [, setLocation] = useLocation()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [formData, setFormData] = useState<FormData>({
    childName: "",
    childAge: null,
    illnessTypes: [],
    childEnergy: null,
    parentEnergy: null,
  })

  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return formData.childName.trim().length > 0
      case 2:
        return formData.childAge !== null
      case 3:
        return formData.illnessTypes.length > 0
      case 4:
        return formData.childEnergy !== null
      case 5:
        return formData.parentEnergy !== null
      default:
        return false
    }
  }, [step, formData])

  const saveAndNavigate = () => {
    const onboardingData = {
      childName: formData.childName,
      childAge: formData.childAge,
      illnessTypes: formData.illnessTypes.map((id) => ILLNESS_ID_TO_LABEL[id] || id),
      childEnergyLevel: formData.childEnergy ? (CHILD_ENERGY_MAP[formData.childEnergy] || formData.childEnergy) : "Medium",
      parentEnergyLevel: formData.parentEnergy ? (PARENT_ENERGY_MAP[formData.parentEnergy] || formData.parentEnergy) : "Medium",
    }
    localStorage.setItem("thea_onboarding", JSON.stringify(onboardingData))
    setLocation("/medications")
  }

  const goNext = () => {
    if (step <= TOTAL_STEPS && canProceed()) {
      if (step === TOTAL_STEPS) {
        setDirection("forward")
        setStep((s) => s + 1)
      } else {
        setDirection("forward")
        setStep((s) => s + 1)
      }
    }
  }

  const goBack = () => {
    if (step > 1) {
      setDirection("backward")
      setStep((s) => s - 1)
    }
  }

  const isComplete = step > TOTAL_STEPS

  return (
    <div className="flex min-h-svh flex-col bg-[#FAF6F1]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pb-2 pt-8">
        <div className="w-10">
          {step > 1 && !isComplete && (
            <button
              onClick={goBack}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#8E9BAA] transition-colors hover:text-[#2C3E50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9E78]"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
        </div>
        <span
          className="font-serif text-[22px] font-bold tracking-[0.03em] text-[#2C3E50]"
        >
          thea
        </span>
        <div className="w-10">
          {!isComplete && (
            <span className="flex h-10 items-center justify-end text-[12px] font-medium text-[#8E9BAA]">
              {step}/{TOTAL_STEPS}
            </span>
          )}
        </div>
      </header>

      {/* Progress */}
      {!isComplete && (
        <div className="px-5 py-3">
          <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>
      )}

      {/* Step Content */}
      <main className="flex flex-1 flex-col px-5 pt-6">
        <div
          key={step}
          className={cn(
            "flex-1 animate-in duration-400 fill-mode-both",
            direction === "forward"
              ? "slide-in-from-right-4 fade-in"
              : "slide-in-from-left-4 fade-in"
          )}
        >
          {step === 1 && (
            <StepChildName
              value={formData.childName}
              onChange={(v) => setFormData((d) => ({ ...d, childName: v }))}
            />
          )}
          {step === 2 && (
            <StepChildAge
              value={formData.childAge}
              onChange={(v) => setFormData((d) => ({ ...d, childAge: v }))}
              childName={formData.childName}
            />
          )}
          {step === 3 && (
            <StepIllnessType
              value={formData.illnessTypes}
              onChange={(v) => setFormData((d) => ({ ...d, illnessTypes: v }))}
              childName={formData.childName}
            />
          )}
          {step === 4 && (
            <StepChildEnergy
              value={formData.childEnergy}
              onChange={(v) => setFormData((d) => ({ ...d, childEnergy: v }))}
              childName={formData.childName}
            />
          )}
          {step === 5 && (
            <StepParentEnergy
              value={formData.parentEnergy}
              onChange={(v) => setFormData((d) => ({ ...d, parentEnergy: v }))}
            />
          )}
          {isComplete && <StepComplete childName={formData.childName} />}
        </div>

        {/* Action Button */}
        <div className="sticky bottom-0 bg-[#FAF6F1] pb-8 pt-4">
          {!isComplete ? (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              data-testid="button-continue"
              className={cn(
                "w-full rounded-full py-3.5 text-[15px] font-semibold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9E78] focus-visible:ring-offset-2",
                canProceed()
                  ? "bg-[#7A9E78] text-white hover:bg-[#5F8360] active:bg-[#4A6A4C]"
                  : "bg-[#EEEDEA] text-[#B0B8C4] cursor-not-allowed"
              )}
            >
              {step === TOTAL_STEPS ? "Generate Day Plan" : "Continue"}
            </button>
          ) : (
            <button
              onClick={saveAndNavigate}
              data-testid="button-lets-go"
              className="w-full rounded-full bg-[#7A9E78] py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#5F8360] active:bg-[#4A6A4C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A9E78] focus-visible:ring-offset-2"
            >
              {"Let's go"}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
