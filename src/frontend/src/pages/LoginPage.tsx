import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import { useState } from "react";
import DiagnosticsView from "../components/DiagnosticsView";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img
                src="/assets/generated/parish-logo.dim_300x300.png"
                alt="Logo Parafii Świętego Jana Chrzciciela"
                className="w-32 h-32 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Kartoteka Parafii
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              Parafia Świętego Jana Chrzciciela w Zbroszy Dużej
            </p>
            <p className="text-xs italic text-muted-foreground/80 border-t border-border pt-4 mt-4">
              „Ja chrzczę wodą, On zaś chrzcić was będzie Duchem Świętym"
              <span className="block mt-1 text-muted-foreground/60">
                (Mk 1,8)
              </span>
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={login}
              disabled={loginStatus === "logging-in"}
              className="w-full h-12 text-base"
              size="lg"
            >
              {loginStatus === "logging-in" ? "Logowanie..." : "Zaloguj się"}
            </Button>

            <Dialog open={showDiagnostics} onOpenChange={setShowDiagnostics}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Diagnostics
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>System Diagnostics</DialogTitle>
                </DialogHeader>
                <DiagnosticsView />
              </DialogContent>
            </Dialog>

            <p className="text-xs text-center text-muted-foreground">
              System zarządzania parafią dla autoryzowanego personelu
            </p>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          © 2025. Zbudowano z <span className="text-red-500">♥</span> używając{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
