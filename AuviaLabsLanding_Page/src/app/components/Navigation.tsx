import { Button } from "./ui/button";

interface NavigationProps {
  onOpenForm: () => void;
}

export function Navigation({ onOpenForm }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-green-600">
              <span className="text-base font-bold text-white">A</span>
            </div>
            <span className="text-xl font-bold text-foreground">Auvia Labs</span>
          </div>

          {/* Center Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Product
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Solutions
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Docs
            </a>
          </div>

          {/* Right */}
          <div className="hidden items-center gap-4 md:flex">
            <a
              href="http://localhost:3002/authentication"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </a>
            <Button onClick={onOpenForm} className="rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}