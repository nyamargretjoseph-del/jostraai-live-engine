'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DigitHeatmap } from '@deriv/core';

export interface HeatmapGridProps {
  heatmap: DigitHeatmap | null;
}

export function HeatmapGrid({ heatmap }: HeatmapGridProps) {
  if (!heatmap) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Digit Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Waiting for data...</div>
        </CardContent>
      </Card>
    );
  }

  const getHeatColor = (level: string, heatIndex: number) => {
    if (level === 'hot') {
      return `rgba(239, 68, 68, ${0.3 + (heatIndex / 100) * 0.7})`;
    } else if (level === 'warm') {
      return `rgba(245, 158, 11, ${0.3 + (heatIndex / 100) * 0.5})`;
    } else {
      return `rgba(59, 130, 246, ${0.2 + (heatIndex / 100) * 0.3})`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Digit Frequency Heatmap</CardTitle>
        <p className="text-xs text-muted-foreground mt-2">
          Based on {heatmap.totalSamples} samples
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {heatmap.digits.map((digit) => (
            <div
              key={digit.digit}
              className="flex flex-col items-center p-3 rounded-lg border border-border transition-all"
              style={{
                backgroundColor: getHeatColor(digit.level, digit.heatIndex),
              }}
            >
              <div className="text-2xl font-bold mb-1">{digit.digit}</div>
              <div className="text-xs font-semibold text-muted-foreground">
                {digit.frequency}%
              </div>
              <div
                className={`text-xs capitalize font-medium mt-1 ${
                  digit.level === 'hot'
                    ? 'text-red-600 dark:text-red-400'
                    : digit.level === 'warm'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {digit.level}
              </div>
              <div
                className={`text-xs mt-1 ${
                  digit.trend > 0.1
                    ? 'text-green-600 dark:text-green-400'
                    : digit.trend < -0.1
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {digit.trend > 0.1 ? '↑' : digit.trend < -0.1 ? '↓' : '→'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
