import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Shield, Stethoscope, Thermometer, Pill, Utensils, Moon } from "lucide-react";

const SOURCES = [
  {
    title: "Fever Management",
    icon: Thermometer,
    guidelines: [
      "Fevers below 102\u00b0F (38.9\u00b0C) typically don\u2019t need medication in otherwise healthy children.",
      "Acetaminophen (Tylenol) can be given every 4\u20136 hours; ibuprofen (Advil/Motrin) every 6\u20138 hours. Never give aspirin to children.",
      "Dress the child lightly and encourage fluids. Lukewarm baths may help.",
      "Seek medical attention for fevers above 104\u00b0F (40\u00b0C), fevers lasting more than 3 days, or if the child appears very ill.",
    ],
    source: "American Academy of Pediatrics (AAP) \u2013 Fever and Your Child",
  },
  {
    title: "Medication Safety",
    icon: Pill,
    guidelines: [
      "Always use the measuring device provided with the medication \u2014 kitchen spoons are not accurate.",
      "Follow weight-based dosing when available, not just age-based charts.",
      "Do not give cough and cold medicines to children under 4 years old.",
      "Keep a written log of doses given, including time and amount.",
    ],
    source: "AAP \u2013 Medicine Safety Tips",
  },
  {
    title: "Nutrition During Illness",
    icon: Utensils,
    guidelines: [
      "Offer small, frequent meals rather than three large ones.",
      "The BRAT diet (Bananas, Rice, Applesauce, Toast) can help with upset stomachs.",
      "Push fluids: water, clear broth, electrolyte solutions (like Pedialyte). Avoid sugary drinks.",
      "Don\u2019t force eating \u2014 appetite will return as the child recovers.",
    ],
    source: "AAP \u2013 Feeding Sick Children",
  },
  {
    title: "Rest & Recovery",
    icon: Moon,
    guidelines: [
      "Children need more sleep when fighting illness. Allow extra naps.",
      "Gentle activities like coloring, reading, or audiobooks are ideal for low-energy days.",
      "Screen time limits can be relaxed moderately during illness, but balance with rest.",
      "Keep the room comfortable: 68\u201372\u00b0F, use a humidifier for congestion.",
    ],
    source: "AAP \u2013 Caring for Your Child\u2019s Cold or Flu",
  },
  {
    title: "When to Call the Doctor",
    icon: Stethoscope,
    guidelines: [
      "Difficulty breathing or rapid breathing",
      "Signs of dehydration: no tears when crying, dry mouth, no wet diapers for 6+ hours",
      "Persistent vomiting or inability to keep fluids down",
      "Unusual drowsiness, confusion, or difficulty waking up",
      "Rash that doesn\u2019t fade when pressed, stiff neck, or severe headache",
      "Any fever in infants under 3 months old",
    ],
    source: "AAP \u2013 When to Call the Pediatrician",
  },
];

export default function Information() {
  return (
    <Layout title="Information" showBack backTo="/plan">
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 data-testid="text-info-heading" className="text-base font-display text-foreground mb-1">
              Trusted Guidelines
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All recommendations in Thea are based on publicly available pediatric guidelines. Here are the key sources and principles we follow.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {SOURCES.map((section, i) => {
            const Icon = section.icon;
            return (
              <Card key={i} data-testid={`card-source-${i}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-3">
                    {section.guidelines.map((g, j) => (
                      <li key={j} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                        <span className="text-primary mt-1 shrink-0">&bull;</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 shrink-0" />
                    {section.source}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card data-testid="card-disclaimer">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Disclaimer:</span> Thea is an informational tool, not a substitute for professional medical advice. Always consult your pediatrician or healthcare provider for medical decisions. If your child has a medical emergency, call 911 or go to the nearest emergency room.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
