import { useState, useEffect } from 'react';
import { useActor } from '../hooks/useActor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getSecretParameter } from '../utils/urlParams';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

export default function DiagnosticsView() {
  const { actor, isFetching } = useActor();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Check 1: URL Parameters
    try {
      const adminToken = getSecretParameter('caffeineAdminToken');
      const hasAdminToken = adminToken !== null;
      results.push({
        name: 'URL Parameters',
        status: hasAdminToken ? 'success' : 'warning',
        message: hasAdminToken 
          ? 'Admin token parameter detected' 
          : 'No admin token parameter (optional)',
        details: hasAdminToken 
          ? 'Admin initialization token is present in URL' 
          : 'Admin token can be provided via URL parameter if needed',
      });
    } catch (error) {
      results.push({
        name: 'URL Parameters',
        status: 'error',
        message: 'Failed to check URL parameters',
        details: error instanceof Error ? error.message : String(error),
      });
    }

    // Check 2: Actor Initialization
    if (isFetching) {
      results.push({
        name: 'Backend Actor',
        status: 'loading',
        message: 'Initializing backend connection...',
      });
    } else if (!actor) {
      results.push({
        name: 'Backend Actor',
        status: 'error',
        message: 'Backend actor is not available',
        details: 'Actor initialization returned null or undefined',
      });
    } else {
      results.push({
        name: 'Backend Actor',
        status: 'success',
        message: 'Backend actor initialized successfully',
      });

      // Check 3: Backend Connectivity (safe read call)
      try {
        const hasParishioners = await actor.hasParishioners();
        results.push({
          name: 'Backend Connectivity',
          status: 'success',
          message: 'Successfully connected to backend',
          details: `Backend responded: ${hasParishioners ? 'Has parishioners data' : 'No parishioners yet'}`,
        });
      } catch (error) {
        results.push({
          name: 'Backend Connectivity',
          status: 'error',
          message: 'Failed to communicate with backend',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Check 4: Browser Environment
    try {
      const checks = {
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        indexedDB: typeof indexedDB !== 'undefined',
      };
      const allPassed = Object.values(checks).every(Boolean);
      results.push({
        name: 'Browser Environment',
        status: allPassed ? 'success' : 'warning',
        message: allPassed ? 'All browser features available' : 'Some browser features unavailable',
        details: Object.entries(checks)
          .map(([key, value]) => `${key}: ${value ? '✓' : '✗'}`)
          .join(', '),
      });
    } catch (error) {
      results.push({
        name: 'Browser Environment',
        status: 'error',
        message: 'Failed to check browser environment',
        details: error instanceof Error ? error.message : String(error),
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [actor, isFetching]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Warning</Badge>;
      case 'loading':
        return <Badge variant="outline">Loading</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>System Diagnostics</span>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </CardTitle>
        <CardDescription>
          System health checks and configuration status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {diagnostics.map((diagnostic, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(diagnostic.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{diagnostic.name}</h3>
                    {getStatusBadge(diagnostic.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {diagnostic.message}
                  </p>
                  {diagnostic.details && (
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">
                        Details
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap break-words">
                        {diagnostic.details}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
