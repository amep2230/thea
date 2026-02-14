import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
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
import { getDeviceId } from "@/lib/device-id";

function Router() {
  const [location, setLocation] = useLocation();
  const deviceId = getDeviceId();
  const session = useQuery(api.queries.getSession, { deviceId });

  useEffect(() => {
    if (session === undefined) return;
    if (!session && (location === "/medications" || location === "/plan")) {
      setLocation("/");
    }
  }, [location, setLocation, session]);

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
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
