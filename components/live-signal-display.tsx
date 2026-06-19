'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import type { LiveSignalUpdate } from '@deriv/core';

export interface LiveSignalDisplayProps {
  signal: LiveSignalUpdate | null;
  isRunning: boolean;
}

export function LiveSignalDisplay({ signal, isRunning }: LiveSignalDisplayProps) {
  if (!signal) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Live Signal Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            {isRunning ? 'Initializing...' : 'Waiting for signal data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { signal: signalData, heatmap, patterns } = signal;
  const decisionColors = {
    STRONG: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400',
    WATCH: 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-400',
    BLOCK: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400',
  };

  const decisionIcons = {
    STRONG: <CheckCircle2 className="w-4 h-4" />,
    WATCH: <AlertTriangle className="w-4 h-4" />,
    BLOCK: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <div className="space-y-4">
      {/* Main Signal Card */}
      <Card className="w-full border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Live Signal Engine</CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Decision Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Signal Decision</span>
            <Badge className={`${decisionColors[signalData.decision]} border`}>
              <div className="flex items-center gap-2">
                {decisionIcons[signalData.decision]}
                {signalData.decision}
              </div>
            </Badge>
          </div>

          {/* Overall Confidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Confidence</span>
              <span className="text-lg font-bold">{signalData.overall}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all"
                style={{ width: `${signalData.overall}%` }}
              />
            </div>
          </div>

          {/* Probability Distribution */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/20">
              <div className="text-xs text-muted-foreground mb-1">Strong Signal</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {Math.round(signalData.strong * 100)}%
              </div>
            </div>
            <div className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
              <div className="text-xs text-muted-foreground mb-1">Watch Signal</div>
              <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                {Math.round(signalData.watch * 100)}%
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <div className="text-xs text-muted-foreground mb-1">Reason</div>
            <div className="text-sm font-medium">{signalData.reason}</div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Summary */}
      {heatmap && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Digit Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <div className="text-xs text-muted-foreground">Hot Digits</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {heatmap.hotDigitCount}
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <div className="text-xs text-muted-foreground">Cold Digits</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {heatmap.coldDigitCount}
                </div>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Dominant Digit</div>
              <div className="text-lg font-bold">
                {heatmap.dominantDigit !== undefined ? heatmap.dominantDigit : 'N/A'}
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Trend Direction</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium capitalize">
                  {heatmap.trendDirection}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pattern Detection Summary */}
      {patterns && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pattern Detection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Even/Odd</div>
                <div className="text-sm font-bold">
                  {patterns.evenOdd.dominantPattern.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Confidence: {patterns.evenOdd.confidence}%
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">Match/Differ</div>
                <div className="text-sm font-bold">
                  {patterns.matchDiffer.direction.toUpperCase()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Strength: {patterns.matchDiffer.strength}%
                </div>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Recommendation</span>
                <Badge
                  variant="outline"
                  className={`capitalize ${
                    patterns.recommendation === 'strong'
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                      : patterns.recommendation === 'weak'
                      ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-500/10 text-red-700 dark:text-red-400'
                  }`}
                >
                  {patterns.recommendation}
                </Badge>
              </div>
              <div className="text-sm">Combined Score: {patterns.combinedScore}%</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
