'use client';

import { useEffect, useState } from 'react';
import { useDerivWSContext } from '@/components/custom/deriv-ws-provider';
import { useLiveSignalEngine } from '@/hooks/use-live-signal-engine';
import { LiveSignalDisplay } from '@/components/live-signal-display';
import { HeatmapGrid } from '@/components/heatmap-grid';
import { PatternAnalysis } from '@/components/pattern-analysis';
import { DerivConnectionStatus } from '@/components/deriv-connection-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Play, Square } from 'lucide-react';

export default function LiveEnginePage() {
  const { ws, isConnected, auth } = useDerivWSContext();
  const [engineStarted, setEngineStarted] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | undefined>();

  const { signal, isRunning, error, start, stop } = useLiveSignalEngine(ws, {
    symbol: 'R_50',
    updateInterval: 5000,
    enableHeatmap: true,
    enablePatterns: true,
    enableDiscipline: true,
    disciplineMode: 'balanced',
  });

  // Update last update time when signal changes
  useEffect(() => {
    if (signal) {
      setLastUpdateTime(signal.timestamp);
    }
  }, [signal]);

  const handleStart = async () => {
    try {
      await start();
      setEngineStarted(true);
    } catch (err) {
      console.error('Failed to start engine:', err);
    }
  };

  const handleStop = () => {
    stop();
    setEngineStarted(false);
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Live Signal Engine</h1>
            <p className="text-muted-foreground mt-1">
              Real-time digit analysis with AI-powered trading signals
            </p>
          </div>
          <div className="flex gap-2">
            {!engineStarted ? (
              <Button
                onClick={handleStart}
                disabled={!isConnected || !auth.authState}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Start Engine
              </Button>
            ) : (
              <Button onClick={handleStop} variant="destructive" className="gap-2">
                <Square className="w-4 h-4" />
                Stop Engine
              </Button>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <DerivConnectionStatus
            isConnected={isConnected}
            isAuthenticated={auth.authState === 'authenticated'}
            lastUpdate={lastUpdateTime}
            error={error}
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Engine Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isRunning
                      ? 'bg-green-500 animate-pulse'
                      : 'bg-gray-400'
                  }`}
                />
                <span className="font-medium">
                  {isRunning ? 'Running' : 'Stopped'}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Signal Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {signal ? '✓' : '—'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-destructive">Error</h3>
                  <p className="text-sm text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {!isConnected ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3 items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h3 className="font-semibold">Deriv Connection Required</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please log in to connect to Deriv and start receiving live signals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Live Signal Display */}
            <div className="lg:col-span-1">
              <LiveSignalDisplay signal={signal} isRunning={isRunning} />
            </div>

            {/* Heatmap and Patterns */}
            <div className="lg:col-span-2 space-y-6">
              <HeatmapGrid heatmap={signal?.heatmap || null} />
              <PatternAnalysis patterns={signal?.patterns || null} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
