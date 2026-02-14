import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, ShieldCheck } from "lucide-react";

export default function Splash() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-6 py-12 safe-bottom">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <Heart className="w-10 h-10 text-primary" />
        </div>

        <h1
          data-testid="text-splash-logo"
          className="font-display text-5xl text-foreground tracking-tight mb-4"
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
          className="flex items-start gap-2.5 text-xs text-muted-foreground/70 text-center leading-relaxed"
        >
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            All information and suggestions are provided based on the American Pediatric Association guidelines.
          </span>
        </div>
      </div>
    </div>
  );
}
