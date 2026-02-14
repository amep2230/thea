import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Menu, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
  hideHeader?: boolean;
  showMenu?: boolean;
}

export function Layout({ children, title, showBack, backTo, hideHeader, showMenu }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    setLocation(path);
  };

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
            {showMenu && (
              <Button
                data-testid="button-hamburger-menu"
                size="icon"
                variant="ghost"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>
        </header>
      )}
      <main className="max-w-md mx-auto p-4 md:p-6 pb-24">
        {children}
      </main>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="p-6 pb-4 border-b border-border">
            <SheetTitle className="text-lg font-display text-left">Menu</SheetTitle>
          </SheetHeader>
          <nav className="p-3 space-y-1">
            <Button
              data-testid="menu-link-profile"
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => navigateTo("/profile")}
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button
              data-testid="menu-link-information"
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => navigateTo("/information")}
            >
              <BookOpen className="w-4 h-4" />
              Information & Sources
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
