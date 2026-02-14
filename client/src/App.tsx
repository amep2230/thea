import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Splash from "@/pages/Splash";
import Onboarding from "@/pages/OnboardingNew";
import Medications from "@/pages/Medications";
import DayPlan from "@/pages/DayPlan";
import Profile from "@/pages/Profile";
import Information from "@/pages/Information";
import { useEffect } from "react";

function Router() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const hasOnboarding = localStorage.getItem("thea_onboarding");
    if (!hasOnboarding && (location === "/medications" || location === "/plan")) {
      setLocation("/");
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Splash} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/medications" component={Medications} />
      <Route path="/plan" component={DayPlan} />
      <Route path="/profile" component={Profile} />
      <Route path="/information" component={Information} />
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
