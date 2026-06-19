'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export interface DerivConnectionStatusProps {
  isConnected: boolean;
  isAuthenticated: boolean;
  lastUpdate?: number;
  error?: string | null;
}

export function DerivConnectionStatus({
  isConnected,
  isAuthenticated,
  lastUpdate,
  error,
}: DerivConnectionStatusProps) {
  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Never';
    const now = Date.now();
    const diff = Math.floor((now - lastUpdate) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Deriv Connection</span>
            <Badge
              variant={isConnected ? 'default' : 'destructive'}
              className="flex items-center gap-1.5"
            >
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Authentication</span>
            <Badge
              variant={isAuthenticated ? 'default' : 'secondary'}
              className="flex items-center gap-1.5"
            >
              {isAuthenticated ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Authenticated
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </>
              )}
            </Badge>
          </div>

          {lastUpdate && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last Update</span>
              <span>{formatLastUpdate()}</span>
            </div>
          )}

          {error && (
            <div className="p-2 bg-destructive/10 rounded border border-destructive/20">
              <div className="text-xs font-medium text-destructive">{error}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
