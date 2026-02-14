import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function Splash() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 safe-bottom">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
        <h1
          data-testid="text-splash-logo"
          className="font-display text-5xl text-foreground tracking-tight mb-6"
        >
          thea
        </h1>

        <p
          data-testid="text-splash-tagline"
          className="text-lg text-muted-foreground text-center leading-relaxed"
        >
          We'll help you care for your little one.
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <Button
          data-testid="button-get-started"
          size="lg"
          className="w-full text-base"
          onClick={() => setLocation("/onboarding")}
        >
          Let's get you started
        </Button>

        <div
          data-testid="text-splash-disclaimer"
          className="w-full rounded-md bg-blue-50 dark:bg-blue-950/30 p-4 flex items-start gap-6"
        >
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-blue-700 dark:text-blue-300" />
          <span className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            All information and suggestions are provided based on the American Pediatric Association guidelines.
          </span>
        </div>
      </div>
    </div>
  );
}
