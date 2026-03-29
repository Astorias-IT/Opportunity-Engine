import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="max-w-md w-full p-8 text-center bg-card rounded-2xl border border-border shadow-xl">
        <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-3">404</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved to another quadrant of the system.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
