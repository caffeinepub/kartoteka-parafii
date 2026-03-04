import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type React from "react";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class StartupErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Startup Error Boundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-2xl">
            <div className="bg-card border border-destructive/50 rounded-lg shadow-lg p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Application Error
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    The application encountered an error during startup. Please
                    try reloading the page.
                  </p>
                </div>
              </div>

              {this.state.error && (
                <div className="mb-6 space-y-4">
                  <div className="bg-muted/50 rounded-md p-4">
                    <h2 className="text-sm font-semibold text-foreground mb-2">
                      Error Message:
                    </h2>
                    <p className="text-sm text-destructive font-mono break-words">
                      {this.state.error.message || "Unknown error"}
                    </p>
                  </div>

                  {this.state.error.stack && (
                    <details className="bg-muted/50 rounded-md p-4">
                      <summary className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary">
                        Stack Trace (click to expand)
                      </summary>
                      <pre className="mt-2 text-xs text-muted-foreground font-mono overflow-x-auto whitespace-pre-wrap break-words">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}

                  {this.state.errorInfo?.componentStack && (
                    <details className="bg-muted/50 rounded-md p-4">
                      <summary className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary">
                        Component Stack (click to expand)
                      </summary>
                      <pre className="mt-2 text-xs text-muted-foreground font-mono overflow-x-auto whitespace-pre-wrap break-words">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={this.handleReload} className="flex-1">
                  Reload Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
