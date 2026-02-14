import { useState } from "react"
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MEDICATION_FREQUENCIES, type MedicationData } from "@shared/schema"
import { cn } from "@/lib/utils"
import { MEDICATION_CATEGORIES } from "@/lib/medications"

interface StepMedicationsProps {
  value: MedicationData[]
  onChange: (value: MedicationData[]) => void
  childName: string
}

export function StepMedications({ value, onChange, childName }: StepMedicationsProps) {
  const [isAdding, setIsAdding] = useState(value.length === 0)
  const [formData, setFormData] = useState<MedicationData>({
    name: "",
    dosage: "",
    frequency: "4h",
    timeLastGiven: new Date().toTimeString().slice(0, 5),
  })
  const [open, setOpen] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleMedicationSelect = (medicationValue: string) => {
    if (medicationValue === "Other") {
      setShowCustomInput(true)
      setFormData({ ...formData, name: "" })
      setOpen(false)
    } else {
      setShowCustomInput(false)
      setFormData({ ...formData, name: medicationValue })
      setOpen(false)
    }
  }

  const handleAdd = () => {
    if (formData.name.trim() && formData.dosage.trim()) {
      onChange([...value, formData])
      setFormData({
        name: "",
        dosage: "",
        frequency: "4h",
        timeLastGiven: new Date().toTimeString().slice(0, 5),
      })
      setShowCustomInput(false)
      setIsAdding(false)
    }
  }

  const handleRemove = (index: number) => {
    const newMeds = [...value]
    newMeds.splice(index, 1)
    onChange(newMeds)
    if (newMeds.length === 0) {
      setIsAdding(true)
    }
  }

  const canSkip = true // Medications are optional

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8E9BAA]">
          {"PRESCRIBED MEDICATIONS"}
        </p>
        <h1 data-testid="text-step-title" className="font-serif text-[22px] font-bold leading-[30px] tracking-[0.01em] text-[#2C3E50]">
          {`Any medications for ${childName}?`}
        </h1>
      </div>
      <p className="text-[15px] leading-[22px] text-[#4A5568]">
        {"Add any medications you're managing today. You can skip this step if there are none."}
      </p>

      {/* Existing Medications */}
      {value.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          {value.map((med, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border-[1.5px] border-[#E2E0DC] bg-white p-4"
            >
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-[#2C3E50]">{med.name}</span>
                <span className="text-[13px] text-[#8E9BAA]">
                  {med.dosage} · Every {med.frequency}
                </span>
              </div>
              <Button
                data-testid={`button-remove-medication-${index}`}
                size="icon"
                variant="ghost"
                onClick={() => handleRemove(index)}
                className="h-8 w-8 text-muted-foreground"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Medication Form */}
      {isAdding ? (
        <div className="mt-2 rounded-xl border-[1.5px] border-[#E2E0DC] bg-[#FEFCFA] p-4 space-y-3">
          <div>
            <label className="text-[13px] font-medium text-[#2C3E50] mb-1.5 block">
              Medication Name
            </label>
            {!showCustomInput ? (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between border-[#E2E0DC] bg-white text-left font-normal"
                    data-testid="select-medication-name"
                  >
                    {formData.name || "Search or select medication..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command className="max-h-[300px]">
                    <CommandInput placeholder="Search medications..." />
                    <CommandList>
                      <CommandEmpty>No medication found.</CommandEmpty>
                      {Object.entries(MEDICATION_CATEGORIES).map(([category, medications]) => (
                        <CommandGroup key={category} heading={category}>
                          {medications.map((med) => (
                            <CommandItem
                              key={med.value}
                              value={med.value}
                              onSelect={() => handleMedicationSelect(med.value)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.name === med.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {med.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="space-y-2">
                <Input
                  data-testid="input-custom-medication"
                  placeholder="Enter medication name..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-[#E2E0DC] bg-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCustomInput(false)
                    setFormData({ ...formData, name: "" })
                  }}
                  className="text-xs text-[#8E9BAA] h-auto p-0"
                >
                  ← Back to list
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium text-[#2C3E50] mb-1.5 block">
                Dosage
              </label>
              <Input
                data-testid="input-dosage"
                placeholder="e.g. 5ml"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="border-[#E2E0DC] bg-white"
              />
            </div>

            <div>
              <label className="text-[13px] font-medium text-[#2C3E50] mb-1.5 block">
                Frequency
              </label>
              <Select
                value={formData.frequency}
                onValueChange={(val) => setFormData({ ...formData, frequency: val as any })}
              >
                <SelectTrigger
                  data-testid="select-frequency"
                  className="w-full border-[#E2E0DC] bg-white"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDICATION_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      Every {freq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#2C3E50] mb-1.5 block">
              Time Last Given
            </label>
            <Input
              data-testid="input-time-last-given"
              type="time"
              value={formData.timeLastGiven}
              onChange={(e) => setFormData({ ...formData, timeLastGiven: e.target.value })}
              className="border-[#E2E0DC] bg-white"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              data-testid="button-cancel-medication"
              type="button"
              variant="outline"
              className="flex-1 border-[#E2E0DC]"
              onClick={() => setIsAdding(false)}
            >
              Cancel
            </Button>
            <Button
              data-testid="button-add-medication"
              type="button"
              className="flex-1 bg-[#7A9E78] hover:bg-[#6A8E68] text-white"
              onClick={handleAdd}
              disabled={!formData.name.trim() || !formData.dosage.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      ) : (
        <Button
          data-testid="button-add-another"
          variant="outline"
          className="w-full border-dashed border-2 border-[#E2E0DC] mt-2"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Another Medication
        </Button>
      )}
    </div>
  )
}
