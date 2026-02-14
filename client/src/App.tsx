import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/Onboarding";
import Medications from "@/pages/Medications";
import DayPlan from "@/pages/DayPlan";
import { useEffect } from "react";

function Router() {
  const [location, setLocation] = useLocation();

  // Simple redirect if trying to access protected routes without onboarding
  useEffect(() => {
    const hasOnboarding = localStorage.getItem("thea_onboarding");
    if (!hasOnboarding && (location === "/medications" || location === "/plan")) {
      setLocation("/");
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/medications" component={Medications} />
      <Route path="/plan" component={DayPlan} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
