'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { DerivWS } from '@deriv/core';
import {
  LiveSignalEngine,
  LiveSignalUpdate,
  LiveSignalConfig,
} from '@deriv/core';

export interface UseLiveSignalEngineReturn {
  signal: LiveSignalUpdate | null;
  isRunning: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  updateConfig: (config: Partial<LiveSignalConfig>) => void;
}

export function useLiveSignalEngine(
  ws: DerivWS | null,
  config: Partial<LiveSignalConfig> = {}
): UseLiveSignalEngineReturn {
  const [signal, setSignal] = useState<LiveSignalUpdate | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<LiveSignalEngine | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize engine
  useEffect(() => {
    if (!ws) return;

    try {
      const engine = new LiveSignalEngine(ws, {
        symbol: 'R_50',
        updateInterval: 5000,
        enableHeatmap: true,
        enablePatterns: true,
        enableDiscipline: true,
        disciplineMode: 'balanced',
        ...config,
      });

      engineRef.current = engine;
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize engine');
    }
  }, [ws, config]);

  // Start engine
  const start = useCallback(async () => {
    if (!engineRef.current) {
      setError('Engine not initialized');
      return;
    }

    try {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = engineRef.current.onSignal((update) => {
        setSignal(update);
      });

      await engineRef.current.start();
      setIsRunning(true);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start engine';
      setError(errorMsg);
      setIsRunning(false);
    }
  }, []);

  // Stop engine
  const stop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Update config
  const updateConfig = useCallback((newConfig: Partial<LiveSignalConfig>) => {
    if (engineRef.current) {
      // Recreate engine with new config
      stop();
      if (ws) {
        const engine = new LiveSignalEngine(ws, {
          symbol: 'R_50',
          updateInterval: 5000,
          enableHeatmap: true,
          enablePatterns: true,
          enableDiscipline: true,
          disciplineMode: 'balanced',
          ...config,
          ...newConfig,
        });
        engineRef.current = engine;
      }
    }
  }, [ws, config, stop]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  return {
    signal,
    isRunning,
    error,
    start,
    stop,
    updateConfig,
  };
}
