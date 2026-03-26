import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, RefreshCw } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { useCallback, useState } from "react";
import MainLayout from "./components/MainLayout";
import ProfileSetupModal from "./components/ProfileSetupModal";
import StartupErrorBoundary from "./components/StartupErrorBoundary";
import UnhandledErrorListener from "./components/UnhandledErrorListener";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile, useIsAuthorized } from "./hooks/useQueries";
import LoginPage from "./pages/LoginPage";

function AccessDeniedScreen() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await queryClient.invalidateQueries();
    await queryClient.refetchQueries();
    setTimeout(() => setRetrying(false), 2000);
  };

  return (
    <div
      className="flex h-screen items-center justify-center"
      style={{ background: "oklch(0.18 0.06 265)" }}
      data-ocid="access_denied.page"
    >
      <div
        className="text-center max-w-md mx-auto px-8 py-12 rounded-2xl"
        style={{
          background: "oklch(0.22 0.07 265)",
          border: "1px solid oklch(0.75 0.12 80 / 0.3)",
        }}
      >
        <div
          className="flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-6"
          style={{
            background: "oklch(0.75 0.12 80 / 0.15)",
            border: "2px solid oklch(0.75 0.12 80 / 0.5)",
          }}
        >
          <Lock size={36} style={{ color: "oklch(0.75 0.12 80)" }} />
        </div>
        <h1
          className="text-3xl font-light mb-4 tracking-tight"
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            color: "oklch(0.75 0.12 80)",
          }}
        >
          Brak dostępu
        </h1>
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: "oklch(0.75 0.05 265)" }}
        >
          Nie masz uprawnień do korzystania z tej aplikacji. Skontaktuj się z
          administratorem.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="px-6 py-3 rounded-lg text-sm font-medium transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{
              background: "oklch(0.75 0.12 80)",
              color: "oklch(0.18 0.06 265)",
              fontFamily: "'Fraunces', Georgia, serif",
            }}
          >
            <RefreshCw size={16} className={retrying ? "animate-spin" : ""} />
            {retrying ? "Sprawdzam..." : "Spróbuj ponownie"}
          </button>
          <button
            type="button"
            onClick={() => clear()}
            className="px-6 py-3 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{
              background: "transparent",
              color: "oklch(0.65 0.05 265)",
              border: "1px solid oklch(0.65 0.05 265 / 0.4)",
              fontFamily: "'Fraunces', Georgia, serif",
            }}
            data-ocid="access_denied.button"
          >
            Wyloguj się
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { identity, loginStatus } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const {
    isAuthorized,
    isLoading: authLoading,
    isFetched: authFetched,
  } = useIsAuthorized();
  const [unhandledError, setUnhandledError] = useState<Error | null>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated &&
    isAuthorized &&
    !profileLoading &&
    isFetched &&
    userProfile === null;

  const handleUnhandledError = useCallback((error: Error) => {
    setUnhandledError(error);
  }, []);

  if (unhandledError) {
    throw unhandledError;
  }

  if (
    loginStatus === "initializing" ||
    (isAuthenticated && (profileLoading || authLoading))
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <UnhandledErrorListener onError={handleUnhandledError} />
        <LoginPage />
      </>
    );
  }

  if (authFetched && !isAuthorized) {
    return (
      <>
        <UnhandledErrorListener onError={handleUnhandledError} />
        <AccessDeniedScreen />
      </>
    );
  }

  return (
    <>
      <UnhandledErrorListener onError={handleUnhandledError} />
      {showProfileSetup && <ProfileSetupModal />}
      <MainLayout />
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="parish-theme"
    >
      <StartupErrorBoundary>
        <AppContent />
      </StartupErrorBoundary>
    </ThemeProvider>
  );
}
