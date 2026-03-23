import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { useCallback, useState } from "react";
import MainLayout from "./components/MainLayout";
import ProfileSetupModal from "./components/ProfileSetupModal";
import StartupErrorBoundary from "./components/StartupErrorBoundary";
import UnhandledErrorListener from "./components/UnhandledErrorListener";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import LoginPage from "./pages/LoginPage";

function AppContent() {
  const { identity, loginStatus } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const [unhandledError, setUnhandledError] = useState<Error | null>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleUnhandledError = useCallback((error: Error) => {
    setUnhandledError(error);
  }, []);

  // If we caught an unhandled error, throw it to be caught by the error boundary
  if (unhandledError) {
    throw unhandledError;
  }

  if (loginStatus === "initializing" || (isAuthenticated && profileLoading)) {
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
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <StartupErrorBoundary>
        <AppContent />
      </StartupErrorBoundary>
    </ThemeProvider>
  );
}
