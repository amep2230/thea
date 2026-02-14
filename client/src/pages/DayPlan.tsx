import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGeneratePlan, useUpdatePlanItem } from "@/hooks/use-plan";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { Layout } from "@/components/Layout";
import { PlanCard } from "@/components/PlanCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, PartyPopper, Thermometer, BatteryLow, Smile, Frown, Mic, MicOff, Loader2, Sparkles, Utensils } from "lucide-react";
import type { PlanResponse, IncidentType } from "@shared/schema";

const INCIDENT_OPTIONS: { type: IncidentType; label: string; icon: any; colorClass: string }[] = [
  { type: "Fever spike", label: "Fever Spike", icon: Thermometer, colorClass: "text-rose-500" },
  { type: "Threw up", label: "Threw up", icon: Frown, colorClass: "text-orange-500" },
  { type: "Energy crashed", label: "Energy Crash", icon: BatteryLow, colorClass: "text-slate-500" },
  { type: "Feeling better", label: "Feeling Better", icon: Smile, colorClass: "text-emerald-500" },
  { type: "Won't eat/drink", label: "Won't eat/drink", icon: Utensils, colorClass: "text-blue-500" },
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

  const voiceRecorder = useVoiceRecorder();

  useEffect(() => {
    if (voiceRecorder.result) {
      setVoiceDescription(voiceRecorder.result.transcription);
      if (voiceRecorder.result.detectedIncident) {
        setSelectedIncident(voiceRecorder.result.detectedIncident);
        setAiHighlighted(voiceRecorder.result.detectedIncident);
        setTimeout(() => setAiHighlighted(null), 3000);
      }
    }
  }, [voiceRecorder.result]);

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

  const handleIncident = async (incident: IncidentType) => {
    setLoading(true);
    setIsSheetOpen(false);
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
        incident
      });
      setPlan(data);
      setLoading(false);
    }
  };

  const handleSubmitIncident = () => {
    if (selectedIncident) {
      handleIncident(selectedIncident);
    }
  };

  const resetSheetState = () => {
    setSelectedIncident(null);
    setVoiceDescription("");
    setAiHighlighted(null);
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
        <div className="space-y-6 pt-10 animate-pulse">
          <div className="h-8 bg-muted rounded-lg w-3/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Today's Care Plan" showBack backTo="/medications">
      <div className="space-y-6 relative">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <p data-testid="text-plan-date" className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <div data-testid="status-plan-progress" className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            In progress
          </div>
        </div>

        <div className="space-y-4" data-testid="container-plan-items">
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
            <SheetContent side="bottom" className="rounded-t-[2rem] px-6 py-8 h-auto max-h-[85vh]">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="text-2xl font-display">What happened?</SheetTitle>
                <SheetDescription>
                  We'll adjust the rest of the day based on this update.
                </SheetDescription>
              </SheetHeader>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span data-testid="text-voice-label" className="text-sm font-medium text-foreground">Voice-to-Action</span>
                </div>
                <div className="flex items-start gap-3">
                  <Textarea
                    data-testid="textarea-voice-description"
                    placeholder="Tap the mic to describe what happened, or type here..."
                    value={voiceDescription}
                    onChange={(e) => setVoiceDescription(e.target.value)}
                    className="flex-1 min-h-[60px] text-sm"
                    rows={2}
                  />
                  <div className="flex flex-col items-center gap-1">
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

                {voiceRecorder.result?.detectedIncident && (
                  <div data-testid="text-ai-detection" className="flex items-center gap-2 mt-3 text-sm text-primary">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      Auto-detected: <span className="font-semibold">{voiceRecorder.result.detectedIncident}</span>
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3" data-testid="container-incident-options">
                {INCIDENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedIncident === option.type;
                  const isAiPick = aiHighlighted === option.type;
                  return (
                    <Button
                      key={option.type}
                      data-testid={`button-incident-${option.type.toLowerCase().replace(/[\s/]+/g, '-')}`}
                      variant="outline"
                      className={`h-auto py-5 flex flex-col gap-2 rounded-xl relative transition-all duration-300
                        ${isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : ''}
                        ${isAiPick ? 'incident-sparkle' : ''}
                        ${option.type === "Won't eat/drink" ? 'col-span-2' : ''}
                      `}
                      onClick={() => setSelectedIncident(option.type)}
                    >
                      {isAiPick && (
                        <span data-testid={`badge-ai-pick-${option.type.toLowerCase().replace(/[\s/]+/g, '-')}`} className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI
                        </span>
                      )}
                      <Icon className={`w-7 h-7 ${option.colorClass}`} />
                      <span data-testid={`text-incident-label-${option.type.toLowerCase().replace(/[\s/]+/g, '-')}`} className="font-medium text-sm">{option.label}</span>
                    </Button>
                  );
                })}
              </div>

              <div className="mt-6">
                <Button
                  data-testid="button-submit-incident"
                  className="w-full"
                  size="lg"
                  disabled={!selectedIncident}
                  onClick={handleSubmitIncident}
                >
                  {selectedIncident ? `Report: ${selectedIncident}` : 'Select an incident type'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Layout>
  );
}
