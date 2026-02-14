import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Stethoscope } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
  hideHeader?: boolean;
}

export function Layout({ children, title, showBack, backTo, hideHeader }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-green-50/30 safe-bottom">
      {!hideHeader && (
        <header className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBack && (
                <Link href={backTo || "/"}>
                  <button className="p-2 -ml-2 rounded-full hover:bg-muted/50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-foreground/70" />
                  </button>
                </Link>
              )}
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                {title || "Thea"}
              </h1>
            </div>
            {!title && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
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
