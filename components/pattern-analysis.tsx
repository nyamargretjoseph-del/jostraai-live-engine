'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { PatternDetection } from '@deriv/core';

export interface PatternAnalysisProps {
  patterns: PatternDetection | null;
}

export function PatternAnalysis({ patterns }: PatternAnalysisProps) {
  if (!patterns) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pattern Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Waiting for data...</div>
        </CardContent>
      </Card>
    );
  }

  const { evenOdd, matchDiffer, combinedScore, recommendation, alignment } =
    patterns;

  return (
    <div className="space-y-3">
      {/* Even/Odd Pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Even/Odd Pattern</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Dominant</div>
              <div className="text-lg font-bold capitalize">
                {evenOdd.dominantPattern}
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Consistency</div>
              <div className="text-lg font-bold">{evenOdd.consistency}%</div>
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Confidence</div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${evenOdd.confidence}%` }}
              />
            </div>
            <div className="text-sm font-bold mt-2">{evenOdd.confidence}%</div>
          </div>
        </CardContent>
      </Card>

      {/* Match/Differ Pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Match/Differ Pattern</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Direction</div>
              <div className="text-lg font-bold capitalize">
                {matchDiffer.direction}
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Strength</div>
              <div className="text-lg font-bold">{matchDiffer.strength}%</div>
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Momentum</span>
              {matchDiffer.momentum > 0.1 ? (
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : matchDiffer.momentum < -0.1 ? (
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              ) : (
                <div className="text-muted-foreground">→</div>
              )}
            </div>
            <div className="text-sm font-bold">\n              {(matchDiffer.momentum * 100).toFixed(1)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combined Analysis */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm">Combined Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                Combined Score
              </div>
              <div className="text-2xl font-bold">{combinedScore}%</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Alignment</div>
              <div className="text-2xl font-bold">{(alignment * 100).toFixed(0)}%</div>
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-2">Recommendation</div>
            <Badge
              className={`capitalize ${
                recommendation === 'strong'
                  ? 'bg-green-500 hover:bg-green-600'
                  : recommendation === 'weak'
                  ? 'bg-yellow-500 hover:bg-yellow-600'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {recommendation}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
