import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useGeneratePlan, useUpdatePlanItem } from "@/hooks/use-plan";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { Layout } from "@/components/Layout";
import { PlanCard } from "@/components/PlanCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, PartyPopper, Thermometer, BatteryLow, Smile, Frown, Mic, MicOff, Loader2, Sparkles, Utensils, Send } from "lucide-react";
import type { PlanResponse, IncidentType } from "@shared/schema";

const INCIDENT_PATTERNS: { incident: IncidentType; keywords: string[] }[] = [
  { incident: "Fever spike", keywords: ["fever", "temperature", "hot", "burning up", "thermometer", "degrees", "high temp"] },
  { incident: "Threw up", keywords: ["threw up", "vomit", "vomiting", "throw up", "throwing up", "puked", "puke", "nauseous", "nausea", "sick to stomach"] },
  { incident: "Energy crashed", keywords: ["tired", "exhausted", "no energy", "energy crashed", "lethargic", "sleepy", "wiped out", "sluggish", "drained"] },
  { incident: "Feeling better", keywords: ["feeling better", "better now", "improved", "getting better", "perked up", "more energy", "doing well", "bouncing back"] },
  { incident: "Won't eat/drink", keywords: ["won't eat", "won't drink", "not eating", "not drinking", "refuses food", "no appetite", "can't eat"] },
];

function detectIncidentFromText(text: string): IncidentType | null {
  const lower = text.toLowerCase();
  let bestMatch: { incident: IncidentType; score: number } | null = null;
  for (const pattern of INCIDENT_PATTERNS) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (lower.includes(keyword)) score += keyword.split(" ").length;
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { incident: pattern.incident, score };
    }
  }
  return bestMatch?.incident ?? null;
}

const INCIDENT_OPTIONS: { type: IncidentType; label: string; icon: any; colorClass: string }[] = [
  { type: "Fever spike", label: "Fever Spike", icon: Thermometer, colorClass: "text-alert" },
  { type: "Threw up", label: "Threw up", icon: Frown, colorClass: "text-activity" },
  { type: "Energy crashed", label: "Energy Crash", icon: BatteryLow, colorClass: "text-rest" },
  { type: "Feeling better", label: "Feeling Better", icon: Smile, colorClass: "text-meal" },
  { type: "Won't eat/drink", label: "Won't eat/drink", icon: Utensils, colorClass: "text-medication" },
];

export default function DayPlan() {
  const [, setLocation] = useLocation();
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { mutateAsync: generatePlan } = useGeneratePlan();
  const { mutateAsync: updateItem } = useUpdatePlanItem();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [selectedIncident, setSelectedIncident] = useState<IncidentType | null>(null);
  const [voiceDescription, setVoiceDescription] = useState("");
  const [aiHighlighted, setAiHighlighted] = useState<IncidentType | null>(null);
  const [autoDetectedIncident, setAutoDetectedIncident] = useState<IncidentType | null>(null);

  const voiceRecorder = useVoiceRecorder();
  const detectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (voiceRecorder.result) {
      setVoiceDescription(voiceRecorder.result.transcription);
      if (voiceRecorder.result.detectedIncident) {
        setSelectedIncident(voiceRecorder.result.detectedIncident);
        setAiHighlighted(voiceRecorder.result.detectedIncident);
        setAutoDetectedIncident(voiceRecorder.result.detectedIncident);
        setTimeout(() => setAiHighlighted(null), 3000);
      }
    }
  }, [voiceRecorder.result]);

  const handleDescriptionChange = useCallback((text: string) => {
    setVoiceDescription(text);
    if (detectTimeoutRef.current) clearTimeout(detectTimeoutRef.current);
    detectTimeoutRef.current = setTimeout(() => {
      const detected = detectIncidentFromText(text);
      setAutoDetectedIncident(detected);
      if (detected && !selectedIncident) {
        setSelectedIncident(detected);
        setAiHighlighted(detected);
        setTimeout(() => setAiHighlighted(null), 2000);
      }
    }, 400);
  }, [selectedIncident]);

  useEffect(() => {
    const loadPlan = async () => {
      const onboardingStr = localStorage.getItem("thea_onboarding");
      const medicationsStr = localStorage.getItem("thea_medications");

      if (!onboardingStr) {
        setLocation("/");
        return;
      }

      const onboarding = JSON.parse(onboardingStr);
      const medications = medicationsStr ? JSON.parse(medicationsStr) : [];
      
      try {
        const data = await generatePlan({
          onboarding,
          medications,
          currentTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
        });
        setPlan(data);
      } catch (error) {
        console.error("Failed to generate plan", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [generatePlan, setLocation]);

  const handleUpdateItem = async (id: string, status: "completed" | "skipped") => {
    setPlan(prev => prev ? prev.map(item => item.id === id ? { ...item, status } : item) : null);
    
    try {
      await updateItem({ id, status });
    } catch (error) {
      console.error(error);
    }
  };

  const handleIncidentReport = async (incident?: IncidentType, description?: string) => {
    setLoading(true);
    setIsSheetOpen(false);
    const descriptionToSend = description;
    const existingPlanToSend = plan ? [...plan] : undefined;
    resetSheetState();
    
    const onboardingStr = localStorage.getItem("thea_onboarding");
    const medicationsStr = localStorage.getItem("thea_medications");
    
    if (onboardingStr) {
      const onboarding = JSON.parse(onboardingStr);
      const medications = medicationsStr ? JSON.parse(medicationsStr) : [];
      
      const data = await generatePlan({
        onboarding,
        medications,
        currentTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        incident: incident || undefined,
        incidentDescription: descriptionToSend || undefined,
        existingPlan: existingPlanToSend,
      });
      setPlan(data);
      setLoading(false);
    }
  };

  const canSubmit = !!selectedIncident || voiceDescription.trim().length > 0;

  const handleSubmitIncident = () => {
    if (canSubmit) {
      handleIncidentReport(selectedIncident || undefined, voiceDescription.trim() || undefined);
    }
  };

  const resetSheetState = () => {
    setSelectedIncident(null);
    setVoiceDescription("");
    setAiHighlighted(null);
    setAutoDetectedIncident(null);
    voiceRecorder.reset();
  };

  const handleSheetChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      resetSheetState();
    }
  };

  if (loading) {
    return (
      <Layout hideHeader>
        <div className="space-y-4 pt-10">
          <div className="h-8 bg-muted rounded-lg w-3/4 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Today's Care Plan" showBack backTo="/medications">
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <p data-testid="text-plan-date" className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <span data-testid="status-plan-progress" className="text-xs font-semibold text-sage-600 bg-sage-100 px-3 py-1 rounded-full">
            In progress
          </span>
        </div>

        <div data-testid="container-plan-items">
          {plan?.map((item) => (
            <PlanCard 
              key={item.id} 
              item={item} 
              onUpdate={(status) => handleUpdateItem(item.id, status)} 
            />
          ))}
          
          {plan?.length === 0 && (
            <div data-testid="text-empty-plan" className="text-center py-20 text-muted-foreground">
              <PartyPopper className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No plan items for the rest of the day!</p>
            </div>
          )}
        </div>

        <div className="fixed bottom-6 right-6 z-40">
           <Sheet open={isSheetOpen} onOpenChange={handleSheetChange}>
            <SheetTrigger asChild>
              <Button 
                data-testid="button-something-changed"
                size="lg" 
                className="rounded-full shadow-lg"
              >
                <AlertCircle className="w-5 h-5 mr-2" />
                Something changed
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl px-6 py-8 h-auto max-h-[85vh]">
              <SheetHeader className="mb-5 text-left">
                <SheetTitle className="text-2xl font-display">What happened?</SheetTitle>
                <SheetDescription>
                  Tell us what changed and we'll adjust the rest of the day.
                </SheetDescription>
              </SheetHeader>

              <div className="mb-5">
                <div className="flex items-start gap-3">
                  <Textarea
                    data-testid="textarea-voice-description"
                    placeholder="Describe what's going on, e.g. &quot;She threw up after lunch and seems really tired&quot;"
                    value={voiceDescription}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className="flex-1 min-h-[72px] text-sm"
                    rows={3}
                  />
                  <div className="flex flex-col items-center gap-1 pt-1">
                    {voiceRecorder.state === "idle" || voiceRecorder.state === "done" || voiceRecorder.state === "error" ? (
                      <Button
                        data-testid="button-record-incident"
                        size="icon"
                        variant="outline"
                        onClick={voiceRecorder.startRecording}
                        className="rounded-full"
                      >
                        <Mic className="w-5 h-5" />
                      </Button>
                    ) : voiceRecorder.state === "recording" ? (
                      <Button
                        data-testid="button-stop-recording"
                        size="icon"
                        variant="destructive"
                        onClick={voiceRecorder.stopRecording}
                        className="rounded-full voice-pulse"
                      >
                        <MicOff className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button
                        data-testid="button-processing-voice"
                        size="icon"
                        variant="outline"
                        disabled
                        className="rounded-full"
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </Button>
                    )}
                    <span data-testid="text-recording-status" className="text-[10px] text-muted-foreground">
                      {voiceRecorder.state === "recording" ? "Tap to stop" :
                       voiceRecorder.state === "processing" ? "Processing..." :
                       "Record"}
                    </span>
                  </div>
                </div>

                {voiceRecorder.error && (
                  <p data-testid="text-voice-error" className="text-sm text-destructive mt-2">
                    {voiceRecorder.error}
                  </p>
                )}

                {autoDetectedIncident && !selectedIncident && voiceDescription.trim().length > 0 && (
                  <div data-testid="text-auto-detection" className="flex items-center gap-2 mt-3 text-sm text-sage-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      Detected: <span className="font-semibold">{autoDetectedIncident}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p data-testid="text-quick-select-label" className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Or pick a category</p>
                <div className="flex flex-wrap gap-2" data-testid="container-incident-options">
                  {INCIDENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedIncident === option.type;
                    const isAiPick = aiHighlighted === option.type;
                    return (
                      <Button
                        key={option.type}
                        data-testid={`button-incident-${option.type.toLowerCase().replace(/[\s/]+/g, '-')}`}
                        variant="outline"
                        className={`h-auto py-2 px-3 flex items-center gap-2 rounded-lg relative transition-all duration-300
                          ${isSelected ? 'ring-2 ring-sage-400 border-sage-400 bg-sage-50' : ''}
                          ${isAiPick ? 'incident-sparkle' : ''}
                        `}
                        onClick={() => setSelectedIncident(isSelected ? null : option.type)}
                      >
                        {isAiPick && (
                          <span data-testid={`badge-ai-pick-${option.type.toLowerCase().replace(/[\s/]+/g, '-')}`} className="absolute -top-2 -right-2 bg-sage-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            AI
                          </span>
                        )}
                        <Icon className={`w-4 h-4 ${option.colorClass}`} />
                        <span data-testid={`text-incident-label-${option.type.toLowerCase().replace(/[\s/]+/g, '-')}`} className="font-medium text-xs">{option.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Button
                data-testid="button-submit-incident"
                className="w-full"
                size="lg"
                disabled={!canSubmit}
                onClick={handleSubmitIncident}
              >
                <Send className="w-4 h-4 mr-2" />
                {selectedIncident
                  ? `Update plan: ${selectedIncident}`
                  : voiceDescription.trim()
                    ? "Update plan with description"
                    : "Type or select something above"}
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Layout>
  );
}
