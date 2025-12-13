import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold">Unsaid Thoughts</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A digital space for thoughts that linger in the periphery—too quiet for noise, too heavy for air.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Navigate
            </h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                data-testid="link-footer-home"
              >
                Home
              </Link>
              <Link
                href="/thoughts"
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                data-testid="link-footer-thoughts"
              >
                All Thoughts
              </Link>
              <Link
                href="/about"
                className="text-sm text-foreground/80 hover:text-foreground transition-colors"
                data-testid="link-footer-about"
              >
                About
              </Link>
            </nav>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Philosophy
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No algorithms. No engagement metrics. No comments section. Just words that needed to exist somewhere.
            </p>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {currentYear} Unsaid Thoughts. All thoughts belong to their authors.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Built for contemplation
          </p>
        </div>
      </div>
    </footer>
  );
}
