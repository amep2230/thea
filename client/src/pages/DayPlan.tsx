import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGeneratePlan, useUpdatePlanItem } from "@/hooks/use-plan";
import { Layout } from "@/components/Layout";
import { PlanCard } from "@/components/PlanCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, PartyPopper, RefreshCw, Thermometer, BatteryLow, Smile, Frown } from "lucide-react";
import type { PlanResponse, GeneratePlanRequest } from "@shared/schema";

export default function DayPlan() {
  const [, setLocation] = useLocation();
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { mutateAsync: generatePlan } = useGeneratePlan();
  const { mutateAsync: updateItem } = useUpdatePlanItem();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
    // Optimistic update
    setPlan(prev => prev ? prev.map(item => item.id === id ? { ...item, status } : item) : null);
    
    try {
      await updateItem({ id, status });
    } catch (error) {
      // Revert if failed (simplified for this demo)
      console.error(error);
    }
  };

  const handleIncident = async (incident: GeneratePlanRequest["incident"]) => {
    setLoading(true);
    setIsSheetOpen(false);
    
    const onboardingStr = localStorage.getItem("thea_onboarding");
    const medicationsStr = localStorage.getItem("thea_medications");
    
    if (onboardingStr) {
      const onboarding = JSON.parse(onboardingStr);
      const medications = medicationsStr ? JSON.parse(medicationsStr) : [];
      
      // Update plan with new incident logic
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            In progress
          </div>
        </div>

        <div className="space-y-4">
          {plan?.map((item) => (
            <PlanCard 
              key={item.id} 
              item={item} 
              onUpdate={(status) => handleUpdateItem(item.id, status)} 
            />
          ))}
          
          {plan?.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <PartyPopper className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No plan items for the rest of the day!</p>
            </div>
          )}
        </div>

        {/* Floating Action Button for Incidents */}
        <div className="fixed bottom-6 right-6 z-40">
           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                size="lg" 
                className="rounded-full h-14 px-6 shadow-xl shadow-primary/30 animate-in zoom-in duration-300"
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
              
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-6 flex flex-col gap-2 rounded-xl" onClick={() => handleIncident("Fever spike")}>
                  <Thermometer className="w-8 h-8 text-rose-500" />
                  <span className="font-medium">Fever Spike</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-6 flex flex-col gap-2 rounded-xl" onClick={() => handleIncident("Threw up")}>
                  <Frown className="w-8 h-8 text-orange-500" />
                  <span className="font-medium">Threw up</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-6 flex flex-col gap-2 rounded-xl" onClick={() => handleIncident("Energy crashed")}>
                  <BatteryLow className="w-8 h-8 text-slate-500" />
                  <span className="font-medium">Energy Crash</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-6 flex flex-col gap-2 rounded-xl" onClick={() => handleIncident("Feeling better")}>
                  <Smile className="w-8 h-8 text-emerald-500" />
                  <span className="font-medium">Feeling Better</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-6 flex flex-col gap-2 rounded-xl col-span-2" onClick={() => handleIncident("Won't eat/drink")}>
                  <Utensils className="w-8 h-8 text-blue-500" />
                  <span className="font-medium">Won't eat/drink</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </Layout>
  );
}

function Utensils(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  )
}
