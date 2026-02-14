import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
  hideHeader?: boolean;
}

export function Layout({ children, title, showBack, backTo, hideHeader }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background safe-bottom">
      {!hideHeader && (
        <header className="sticky top-0 z-50 px-6 py-3 bg-[#FAF6F1]/80 backdrop-blur-lg border-b border-thea-border">
          <div className="max-w-md mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {showBack && (
                <Link href={backTo || "/"}>
                  <Button data-testid="button-back" size="icon" variant="ghost">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
              )}
              <h1 data-testid="text-page-title" className="text-xl font-display text-foreground">
                {title || "Thea"}
              </h1>
            </div>
            {!title && (
              <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-500">
                <Stethoscope className="w-5 h-5" />
              </div>
            )}
          </div>
        </header>
      )}
      <main className="max-w-md mx-auto p-4 md:p-6 pb-24">
        {children}
      </main>
    </div>
  );
}
