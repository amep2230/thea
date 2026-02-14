// Comprehensive medication list organized by category for medical applications
// Based on common pediatric medications with proper categorization

export interface MedicationOption {
  value: string
  label: string
  common?: boolean // Mark commonly used medications
}

export const MEDICATION_CATEGORIES: Record<string, MedicationOption[]> = {
  "Fever & Pain Relief": [
    { value: "Acetaminophen (Tylenol)", label: "Acetaminophen (Tylenol)", common: true },
    { value: "Children's Tylenol", label: "Children's Tylenol", common: true },
    { value: "Infant Tylenol", label: "Infant Tylenol", common: false },
    { value: "Ibuprofen (Advil, Motrin)", label: "Ibuprofen (Advil, Motrin)", common: true },
    { value: "Children's Motrin", label: "Children's Motrin", common: true },
    { value: "Children's Advil", label: "Children's Advil", common: true },
    { value: "Infant Motrin", label: "Infant Motrin", common: false },
  ],
  "Antibiotics": [
    { value: "Amoxicillin", label: "Amoxicillin", common: true },
    { value: "Amoxicillin-Clavulanate (Augmentin)", label: "Amoxicillin-Clavulanate (Augmentin)", common: false },
    { value: "Azithromycin (Zithromax)", label: "Azithromycin (Zithromax)", common: false },
    { value: "Cefdinir", label: "Cefdinir", common: false },
    { value: "Cephalexin (Keflex)", label: "Cephalexin (Keflex)", common: false },
  ],
  "Cough & Cold": [
    { value: "Children's Delsym", label: "Children's Delsym", common: false },
    { value: "Children's Robitussin", label: "Children's Robitussin", common: false },
    { value: "Children's Mucinex", label: "Children's Mucinex", common: false },
  ],
  "Allergy & Antihistamines": [
    { value: "Children's Claritin", label: "Children's Claritin", common: false },
    { value: "Children's Zyrtec", label: "Children's Zyrtec", common: false },
    { value: "Children's Benadryl", label: "Children's Benadryl", common: false },
  ],
  "Other Medications": [
    { value: "Prescription Medication", label: "Prescription Medication", common: false },
    { value: "Other", label: "Other (specify)", common: false },
  ],
}

// Get all medications flattened for search
export const getAllMedications = (): MedicationOption[] => {
  return Object.values(MEDICATION_CATEGORIES).flat()
}
